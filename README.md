# Luckymarkets

Luckymarkets is a financial-literacy website covering IPOs, mutual funds and stocks with data-first educational pages. The site is a fully static Next.js 14 App Router export: Cloudflare Pages serves the generated `out/` directory and no Node server runs in production. A GitHub Actions cron fetches fresh market data, updates only the tracked values in `lib/data/`, commits changes, and the resulting push triggers a Cloudflare Pages rebuild. The site is educational only and does not provide buy/sell recommendations.

## Architecture

- **Next.js 14 + TypeScript + App Router:** every IPO, mutual fund and stock entry is a typed source file.
- **Static export:** `next.config.js` uses `output: "export"`. There is no production API or backend server.
- **Scheduled refresh:** `.github/workflows/scrape.yml` runs every 30 minutes, refreshes supported tracked fields, commits changed data, and lets Cloudflare rebuild the static site.
- **Thin-content guardrails:** `isIpoComplete`, `isMfComplete` and `isStockComplete` are required before a page is generated or included in the sitemap.

## Local setup

Requirements: Node.js 20.x and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For a production static build:

```bash
npm run build
```

The generated static site is written to `out/`.

To run the market-data scraper locally:

```bash
npm run scrape
```

The scraper makes real HTTP requests to AMFI, NSE and the configured GMP reference source. Network failures never invent values: the existing tracked value is retained and marked `stale: true`.

## Cloudflare Pages settings

Create a Cloudflare Pages project from the GitHub repository.

Enter these exact settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node.js version | `20.x` |
| Framework preset | Next.js (or none if Cloudflare's UI does not offer the preset) |

### Environment variables

The static site and scraper do not require API keys or application secrets.

For the Cloudflare Pages build, no environment variable is required for the default production domain.

Optional:

```text
SITE_URL=https://luckymarkets.in
```

If `SITE_URL` is supplied in the Cloudflare Pages production environment, it is used by `app/sitemap.ts` and `app/robots.ts`. If it is omitted, both use `https://luckymarkets.in`.

The GitHub Actions scraper currently needs **no repository secrets**. It uses public AMFI and NSE endpoints plus the configured public GMP reference page.

## GitHub → Cloudflare Pages connection

1. Push this repository to GitHub.
2. In Cloudflare, open **Workers & Pages** and create a new Pages project.
3. Choose **Connect to Git**.
4. Authorize GitHub and select the Luckymarkets repository.
5. Select the `main` branch for production.
6. Set the build command to `npm run build`.
7. Set the output directory to `out`.
8. Set Node.js to 20.x.
9. Deploy the project.
10. Leave automatic deployments enabled. Every push to `main`, including a data-refresh commit from GitHub Actions, triggers a new static Cloudflare build.

There is deliberately no Node/Express/API server to deploy.

## Hostinger DNS → Cloudflare Pages

The safest setup is to move DNS authority from Hostinger to Cloudflare:

1. In Cloudflare, add `luckymarkets.in` as a site.
2. Cloudflare will show two assigned nameservers.
3. In Hostinger, open the domain's DNS/nameserver settings.
4. Replace the Hostinger nameservers with the two Cloudflare nameservers shown for your account.
5. Wait for nameserver propagation.
6. In Cloudflare Pages, open the Luckymarkets project and choose **Custom domains**.
7. Add `luckymarkets.in`.
8. Add `www.luckymarkets.in` if you want the `www` hostname.
9. Let Cloudflare create or verify the required Pages DNS records.
10. Confirm HTTPS is active before launch.

Do not create an arbitrary A record pointing at a guessed Cloudflare IP. Pages custom-domain setup supplies the correct DNS target for the project.

## GitHub Actions scraper

`.github/workflows/scrape.yml` runs every 30 minutes and can also be started manually from the GitHub Actions tab.

The workflow:

1. Checks out `main`.
2. Installs Node 20 and dependencies with `npm ci`.
3. Runs `npm run scrape`.
4. Updates only tracked data fields in `lib/data/`.
5. Keeps the previous value and marks it stale when a source fails.
6. Commits only when files changed.
7. Pushes the commit to `main`, which triggers the Cloudflare Pages rebuild.

### Current data sources

- **Mutual funds:** AMFI's public `NAVAll.txt` daily NAV file. This is the official AMFI source used for the NAV field.
- **Stocks:** NSE's public quote-equity endpoint is used for market-cap data when the response exposes the field.
- **IPO subscription:** NSE's public current-issue endpoint is queried and matched against the existing company's name/slug.
- **IPO GMP:** there is no official exchange GMP feed. Luckymarkets therefore uses one explicitly isolated public reference source, Chittorgarh's IPO page, for this market-observed field only. GMP is not an official exchange figure and should be treated as such.

The scraper uses two retries with exponential backoff before marking a field stale. Errors are printed to the GitHub Actions log.

If a future source requires an API key, add it under **GitHub → Settings → Secrets and variables → Actions → New repository secret**, then reference it in `.github/workflows/scrape.yml` as an environment variable and read that variable from `scripts/scrape.ts`. The current implementation does not require one.

## Thin-content guardrails

Every data-driven page must pass its completeness function in `lib/types.ts`.

- `isIpoComplete` guards IPO pages.
- `isMfComplete` guards mutual-fund pages.
- `isStockComplete` guards stock pages.

Do not weaken these checks to make incomplete pages build. An incomplete entry is excluded from `generateStaticParams`, the homepage listings and the sitemap.

Every tracked value has:

```ts
{
  value: ...,
  asOf: "...",
  stale?: true
}
```

A failed refresh never replaces a good value with an empty value, fake value or new timestamp. The old timestamp remains the timestamp of the last confirmed value and the UI labels it **Last confirmed**.

## Adding a new IPO, mutual fund or stock

The pattern is intentionally explicit and copy-pasteable.

### New IPO

1. Copy an existing complete file in `lib/data/ipos/`.
2. Rename it to the desired slug, for example:

```text
lib/data/ipos/acme-limited.ts
```

3. Replace every field with verified information.
4. Add one import and one entry to `lib/getIpos.ts`:

```ts
import acme from "@/lib/data/ipos/acme-limited";

const allIpos: IPOEntry[] = [
  bajajHousingFinance,
  acme,
];
```

5. Run:

```bash
npm run build
```

6. Commit and push.

The page will be `/ipo/acme-limited`, and the sitemap entry is generated automatically.

### New mutual fund

1. Copy a complete file in `lib/data/mf/`.
2. Rename it, for example:

```text
lib/data/mf/acme-flexi-cap.ts
```

3. Fill every field, including a valid tracked NAV and expense ratio.
4. Add one import and one entry to `lib/getMFs.ts`.
5. Run `npm run build`.
6. Commit and push.

The page will be `/mutual-fund/acme-flexi-cap`.

### New stock

1. Copy a complete file in `lib/data/stocks/`.
2. Rename it, for example:

```text
lib/data/stocks/acme.ts
```

3. Fill every field, including ticker and tracked market cap.
4. Add one import and one entry to `lib/getStocks.ts`.
5. Run `npm run build`.
6. Commit and push.

The page will be `/stocks/acme`.

## Adding a blog post

Blog posts are intentionally simple and do not require a database.

1. Open `lib/blog.ts`.
2. Add a complete object to the `posts` array:

```ts
{
  slug: "understanding-mutual-fund-nav",
  title: "Understanding mutual fund NAV",
  description: "A plain-language explanation of NAV and what it represents.",
  publishedAt: "2026-09-22",
  content: [
    "First complete paragraph...",
    "Second complete paragraph...",
  ],
}
```

3. Run `npm run build`.
4. Commit and push.

The post will be available at `/blog/understanding-mutual-fund-nav`, and the index plus sitemap update automatically.

## Adding a video to an existing entry

Open the relevant data file and add the YouTube video ID:

```ts
videoId: "VIDEO_ID",
```

For example:

```ts
videoId: "dQw4w9WgXcQ",
```

Commit and push. The existing page automatically renders the responsive YouTube embed. No page-file edit is required.

## Production launch checklist

- [ ] Set `SITE_URL` to the real production domain if it differs from `https://luckymarkets.in`.
- [ ] Confirm the same production domain is used by `app/sitemap.ts`, `app/robots.ts` and the metadata/structured-data URLs.
- [ ] Review the disclaimer copy in `components/Disclaimer.tsx` with the appropriate legal/compliance reviewer.
- [ ] Verify `/sitemap.xml` is reachable after deployment.
- [ ] Verify `/robots.txt` is reachable after deployment.
- [ ] Run `npm install` and `npm run build` locally with zero build errors.
- [ ] Confirm the Cloudflare Pages build output directory is exactly `out`.
- [ ] Confirm GitHub Actions can run `Refresh market data` manually.
- [ ] Confirm a successful scraper commit triggers a Cloudflare deployment.
- [ ] Confirm stale values display their original `asOf` time and the `Last confirmed` label.
- [ ] Test the homepage, IPO, mutual-fund, stock and blog routes at 375px width.
- [ ] Keyboard-test the navigation and links and confirm visible focus rings.
- [ ] Verify Open Graph previews use `/og.svg`.
- [ ] Review the structured data after deployment using Google's Rich Results Test.
