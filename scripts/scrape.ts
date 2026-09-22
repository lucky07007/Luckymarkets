import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, "lib", "data");
const IPO_DIR = path.join(DATA_ROOT, "ipos");
const MF_DIR = path.join(DATA_ROOT, "mf");
const STOCK_DIR = path.join(DATA_ROOT, "stocks");

const USER_AGENT =
  "LuckymarketsDataBot/1.0 (+https://luckymarkets.in; educational market-data refresh)";

type Subscription = { retail: number; sni: number; bni: number };
type LatestIpo = {
  gmp?: number;
  subscription?: Subscription;
  failed: { gmp: boolean; subscription: boolean };
};
type LatestMf = { nav?: number };
type LatestStock = { marketCap?: number };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url: string, init: RequestInit = {}, retries = 2): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,text/plain,application/json;q=0.9,*/*;q=0.8",
          ...(init.headers || {}),
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(750 * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function fetchJson<T>(url: string, init: RequestInit = {}, retries = 2): Promise<T> {
  const text = await fetchText(url, {
    ...init,
    headers: { accept: "application/json,text/plain;q=0.9,*/*;q=0.8", ...(init.headers || {}) },
  }, retries);
  return JSON.parse(text) as T;
}

function numberFromText(input: string): number | undefined {
  const cleaned = input.replace(/,/g, "").replace(/₹/g, "").trim();
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : undefined;
}

function findNearLabel(html: string, labels: string[]): number | undefined {
  const plain = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");
  for (const label of labels) {
    const index = plain.toLowerCase().indexOf(label.toLowerCase());
    if (index < 0) continue;
    const window = plain.slice(index, index + 180);
    const value = window.match(/(?:₹\s*)?(-?\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:x|times|%|₹)?/i);
    if (value) {
      const parsed = numberFromText(value[1]);
      if (parsed !== undefined) return parsed;
    }
  }
  return undefined;
}

async function fetchIpoFromNse(slug: string, companyName: string): Promise<LatestIpo> {
  const result: LatestIpo = {
    failed: { gmp: false, subscription: false },
  };
  const current = await fetchJson<unknown>(
    "https://www.nseindia.com/api/ipo-current-issue",
    { headers: { referer: "https://www.nseindia.com/" } },
  );

  const raw = JSON.stringify(current);
  const companyNeedles = [companyName.toLowerCase(), slug.replace(/-/g, " ").toLowerCase()];
  if (!companyNeedles.some((needle) => raw.toLowerCase().includes(needle))) {
    throw new Error(`NSE current-issue response does not contain ${companyName}`);
  }

  const records = Array.isArray(current)
    ? current
    : typeof current === "object" && current !== null
      ? Object.values(current as Record<string, unknown>).flatMap((value) =>
          Array.isArray(value) ? value : [value],
        )
      : [];

  const record = records.find((item) => {
    const text = JSON.stringify(item).toLowerCase();
    return companyNeedles.some((needle) => text.includes(needle));
  });

  if (!record || typeof record !== "object") return result;

  const text = JSON.stringify(record);
  const retail = findNearLabel(text, ["retail", "retailinvestor", "retail category"]);
  const sni = findNearLabel(text, ["s-hni", "sni", "nii"]);
  const bni = findNearLabel(text, ["b-hni", "bni"]);
  if (retail !== undefined && sni !== undefined && bni !== undefined) {
    result.subscription = { retail, sni, bni };
  }
  return result;
}

async function fetchGmpFromChittorgarh(slug: string): Promise<number> {
  const url = `https://www.chittorgarh.com/ipo/${encodeURIComponent(slug)}/`;
  const html = await fetchText(url, { headers: { referer: "https://www.chittorgarh.com/" } });
  const value =
    findNearLabel(html, ["GMP", "Grey Market Premium", "IPO GMP"]) ??
    findNearLabel(html, ["GMP Today"]);
  if (value === undefined) throw new Error(`Could not parse GMP from ${url}`);
  return value;
}

async function fetchLatestForSlug(slug: string, companyName: string): Promise<LatestIpo> {
  const result: LatestIpo = {
    failed: { gmp: false, subscription: false },
  };

  const [nse, gmp] = await Promise.allSettled([
    fetchIpoFromNse(slug, companyName),
    fetchGmpFromChittorgarh(slug),
  ]);

  if (nse.status === "fulfilled") {
    Object.assign(result, nse.value);
    if (!result.subscription) result.failed.subscription = true;
  } else {
    result.failed.subscription = true;
    console.error(`[scrape][ipo][nse] ${slug}:`, nse.reason);
  }

  if (gmp.status === "fulfilled") {
    result.gmp = gmp.value;
  } else {
    result.failed.gmp = true;
    console.error(`[scrape][ipo][gmp] ${slug}:`, gmp.reason);
  }

  return result;
}

async function fetchAmfiNav(fundName: string): Promise<number> {
  const text = await fetchText("https://www.amfiindia.com/spages/NAVAll.txt", {
    headers: { accept: "text/plain,*/*;q=0.8", referer: "https://www.amfiindia.com/" },
  });
  const target = fundName.trim().toLowerCase();
  for (const line of text.split(/\r?\n/)) {
    const parts = line.split(";");
    if (parts.length < 6) continue;
    const name = parts[3]?.trim().toLowerCase();
    const nav = numberFromText(parts[4] || "");
    if (name === target && nav !== undefined) return nav;
  }
  throw new Error(`AMFI NAVAll.txt did not contain exact scheme name: ${fundName}`);
}

async function fetchNseStockMarketCap(ticker: string): Promise<number> {
  const url = `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(ticker)}`;
  const data = await fetchJson<any>(url, { headers: { referer: "https://www.nseindia.com/get-quotes/equity?symbol=" + encodeURIComponent(ticker) } });
  const candidates = [
    data?.marketDeptOrderBook?.tradeInfo?.totalMarketCap,
    data?.securityInfo?.marketCap,
    data?.marketCap,
  ];
  const value = candidates
    .map((candidate) => {
      if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
      return typeof candidate === "string" ? numberFromText(candidate) : undefined;
    })
    .find((candidate): candidate is number => candidate !== undefined);
  if (value === undefined) throw new Error(`NSE quote response has no market cap for ${ticker}`);
  return value;
}

function readDataFile(file: string): string {
  return fs.readFileSync(file, "utf8");
}

function trackedNumberPattern(field: string): RegExp {
  return new RegExp(
    `(${field}\\s*:\\s*\\{\\s*value:\\s*)(-?\\d+(?:\\.\\d+)?)(\\s*,\\s*asOf:\\s*["'][^"']+["'](?:\\s*,\\s*stale:\\s*(?:true|false))?\\s*,?\\s*\\})`,
    "m",
  );
}

function updateTrackedNumber(source: string, field: string, value: number, asOf: string): string {
  const pattern = trackedNumberPattern(field);
  if (!pattern.test(source)) throw new Error(`Tracked numeric field '${field}' not found`);
  return source.replace(pattern, (_full, prefix: string) => `${prefix}${value}, asOf: "${asOf}" }`);
}

function markTrackedNumberStale(source: string, field: string): string {
  const pattern = trackedNumberPattern(field);
  if (!pattern.test(source)) throw new Error(`Tracked numeric field '${field}' not found`);
  return source.replace(pattern, (full) => {
    const withoutStale = full.replace(/,\s*stale:\s*(?:true|false)/, "");
    return withoutStale.replace(/\s*\}$/, ", stale: true }");
  });
}

function trackedObjectPattern(field: string): RegExp {
  return new RegExp(
    `(${field}\\s*:\\s*\\{\\s*value:\\s*\\{)([\\s\\S]*?)(\\}\\s*,\\s*asOf:\\s*["'][^"']+["'](?:\\s*,\\s*stale:\\s*(?:true|false))?\\s*,?\\s*\\})`,
    "m",
  );
}

function updateSubscription(source: string, value: Subscription, asOf: string): string {
  const pattern = trackedObjectPattern("subscription");
  if (!pattern.test(source)) throw new Error("Tracked subscription field not found");
  return source.replace(
    pattern,
    (_full, prefix: string) =>
      `${prefix} retail: ${value.retail}, sni: ${value.sni}, bni: ${value.bni} }, asOf: "${asOf}" }`,
  );
}

function markTrackedObjectStale(source: string, field: string): string {
  const pattern = trackedObjectPattern(field);
  if (!pattern.test(source)) throw new Error(`Tracked object field '${field}' not found`);
  return source.replace(pattern, (full) => {
    const withoutStale = full.replace(/,\s*stale:\s*(?:true|false)/, "");
    return withoutStale.replace(/\s*\}$/, ", stale: true }");
  });
}

function updateIpoFile(file: string, fresh: LatestIpo, asOf: string) {
  let source = readDataFile(file);
  let changed = false;

  if (fresh.gmp !== undefined) {
    source = updateTrackedNumber(source, "gmp", fresh.gmp, asOf);
    changed = true;
  } else if (fresh.failed.gmp) {
    source = markTrackedNumberStale(source, "gmp");
    changed = true;
  }

  if (fresh.subscription) {
    source = updateSubscription(source, fresh.subscription, asOf);
    changed = true;
  } else if (fresh.failed.subscription) {
    source = markTrackedObjectStale(source, "subscription");
    changed = true;
  }

  // There is no reliable public formula for individual allotment probability.
  // Keep the last confirmed editorial value and explicitly mark it stale until
  // a source that publishes a category-specific probability is available.
  source = markTrackedObjectStale(source, "allotmentChance");
  changed = true;

  if (changed) fs.writeFileSync(file, source);
}

async function scrapeIpos(now: string) {
  const files = fs.readdirSync(IPO_DIR).filter((file: string) => file.endsWith(".ts"));

  for (const file of files) {
    const filePath = path.join(IPO_DIR, file);
    const source = readDataFile(filePath);
    const companyName = source.match(/companyName:\s*"([^"]+)"/)?.[1];

    if (!companyName) {
      console.error(`[scrape][ipo] ${file}: companyName missing`);
      continue;
    }

    const slug = file.replace(/\.ts$/, "");

    try {
      const fresh = await fetchLatestForSlug(slug, companyName);
      updateIpoFile(filePath, fresh, now);
      console.log(
        `[scrape][ipo] ${slug}: ${fresh.gmp !== undefined ? "GMP refreshed" : "GMP stale"}, ` +
          `${fresh.subscription ? "subscription refreshed" : "subscription stale"}, allotment probability retained as stale`,
      );
    } catch (error) {
      console.error(`[scrape][ipo] ${slug}:`, error);
      let staleSource = readDataFile(filePath);
      staleSource = markTrackedNumberStale(staleSource, "gmp");
      staleSource = markTrackedObjectStale(staleSource, "subscription");
      staleSource = markTrackedObjectStale(staleSource, "allotmentChance");
      fs.writeFileSync(filePath, staleSource);
    }
  }
}

async function scrapeMfs(now: string) {
  for (const file of fs.readdirSync(MF_DIR).filter((name) => name.endsWith(".ts"))) {
    const filePath = path.join(MF_DIR, file);
    const source = readDataFile(filePath);
    const fundName = source.match(/fundName:\s*"([^"]+)"/)?.[1];
    if (!fundName) continue;
    try {
      const nav = await fetchAmfiNav(fundName);
      fs.writeFileSync(filePath, updateTrackedNumber(source, "nav", nav, now));
      console.log(`[scrape][mf] refreshed ${file.replace(/\.ts$/, "")}`);
    } catch (error) {
      console.error(`[scrape][mf] ${file}:`, error);
      fs.writeFileSync(filePath, markTrackedNumberStale(source, "nav"));
    }
  }
}

async function scrapeStocks(now: string) {
  for (const file of fs.readdirSync(STOCK_DIR).filter((name) => name.endsWith(".ts"))) {
    const filePath = path.join(STOCK_DIR, file);
    const source = readDataFile(filePath);
    const ticker = source.match(/ticker:\s*"([^"]+)"/)?.[1];
    if (!ticker) continue;
    try {
      const marketCap = await fetchNseStockMarketCap(ticker);
      fs.writeFileSync(filePath, updateTrackedNumber(source, "marketCap", marketCap, now));
      console.log(`[scrape][stock] refreshed ${ticker}`);
    } catch (error) {
      console.error(`[scrape][stock] ${ticker}:`, error);
      fs.writeFileSync(filePath, markTrackedNumberStale(source, "marketCap"));
    }
  }
}

async function run() {
  const now = new Date().toISOString();
  console.log(`[scrape] starting ${now}`);
  await scrapeIpos(now);
  await scrapeMfs(now);
  await scrapeStocks(now);
  console.log("[scrape] finished");
}

run().catch((error) => {
  console.error("[scrape] fatal:", error);
  process.exitCode = 1;
});
