export type AllotmentChances = {
  retail: number;
  sni: number;
  bni: number;
};

export type Tracked<T> = {
  value: T;
  asOf: string;
  stale?: boolean;
};

export type IPOEntry = {
  slug: string;
  companyName: string;
  sector: string;
  industry: string;
  leadership: string;
  listingDate: string;
  priceBand: string;
  gmp: Tracked<number>;
  subscription: Tracked<{ retail: number; sni: number; bni: number }>;
  allotmentChance: Tracked<AllotmentChances>;
  marketPosition: string;
  drhpSummary: string;
  videoId?: string;
};

export type MFEntry = {
  slug: string;
  fundName: string;
  category: string;
  amc: string;
  fundManager: string;
  expenseRatio: Tracked<number>;
  nav: Tracked<number>;
  editorialNote: string;
  videoId?: string;
};

export type StockEntry = {
  slug: string;
  companyName: string;
  ticker: string;
  sector: string;
  marketCap: Tracked<number>;
  editorialNote: string;
  videoId?: string;
};

function hasTrackedNumber(value: Tracked<number>): boolean {
  return Boolean(
    value &&
      Number.isFinite(value.value) &&
      Number.isFinite(Date.parse(value.asOf))
  );
}

function hasTrackedObject<T extends object>(value: Tracked<T>): boolean {
  return Boolean(
    value &&
      value.value &&
      Number.isFinite(Date.parse(value.asOf))
  );
}

export function isIpoComplete(e: IPOEntry): boolean {
  return Boolean(
    e.slug &&
      e.companyName &&
      e.sector &&
      e.industry &&
      e.leadership &&
      e.listingDate &&
      e.priceBand &&
      e.marketPosition &&
      e.drhpSummary &&
      hasTrackedNumber(e.gmp) &&
      hasTrackedObject(e.subscription) &&
      hasTrackedObject(e.allotmentChance) &&
      Number.isFinite(e.subscription.value.retail) &&
      Number.isFinite(e.subscription.value.sni) &&
      Number.isFinite(e.subscription.value.bni) &&
      Number.isFinite(e.allotmentChance.value.retail) &&
      Number.isFinite(e.allotmentChance.value.sni) &&
      Number.isFinite(e.allotmentChance.value.bni)
  );
}

export function isMfComplete(e: MFEntry): boolean {
  return Boolean(
    e.slug &&
      e.fundName &&
      e.category &&
      e.amc &&
      e.fundManager &&
      e.editorialNote &&
      hasTrackedNumber(e.expenseRatio) &&
      hasTrackedNumber(e.nav)
  );
}

export function isStockComplete(e: StockEntry): boolean {
  return Boolean(
    e.slug &&
      e.companyName &&
      e.ticker &&
      e.sector &&
      e.editorialNote &&
      hasTrackedNumber(e.marketCap)
  );
}
