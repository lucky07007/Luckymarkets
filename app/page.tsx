import { getAllIpos } from "@/lib/getIpos";
import { getAllMFs } from "@/lib/getMFs";
import { getAllStocks } from "@/lib/getStocks";

export default function HomePage() {
  const ipos = getAllIpos();
  const funds = getAllMFs();
  const stocks = getAllStocks();

  return (
    <div className="container page-shell">
      <p className="eyebrow">Financial literacy</p>
      <h1>Market data, without the noise.</h1>
      <p className="lede">
        IPO, mutual fund and stock reference data explained plainly. No tips,
        targets or buy/sell recommendations — just educational information and
        the source timestamps behind tracked figures.
      </p>

      <div className="hero-grid section-gap">
        <a className="feature-card" href="/ipo/bajaj-housing-finance">
          <span className="eyebrow">Explore</span>
          <strong>IPO data</strong>
          <span>GMP, subscription figures and issue context.</span>
        </a>
        <a className="feature-card" href="/mutual-fund/parag-parikh-flexi-cap">
          <span className="eyebrow">Explore</span>
          <strong>Mutual funds</strong>
          <span>NAV, expense ratio and scheme context.</span>
        </a>
        <a className="feature-card" href="/stocks/tcs">
          <span className="eyebrow">Explore</span>
          <strong>Stocks</strong>
          <span>Market-cap reference data and business context.</span>
        </a>
      </div>

      <section>
        <div className="section-heading"><h2>Latest IPOs</h2><a href="/ipo/bajaj-housing-finance">View all</a></div>
        <div className="card-list">
          {ipos.map((ipo) => (
            <a className="stat-block card-link" href={`/ipo/${ipo.slug}`} key={ipo.slug}>
              <strong>{ipo.companyName}</strong>
              <span>GMP ₹{ipo.gmp.value} · Listed {ipo.listingDate}</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading"><h2>Mutual funds</h2><a href="/mutual-fund/parag-parikh-flexi-cap">Explore fund</a></div>
        <div className="card-list">
          {funds.map((fund) => (
            <a className="stat-block card-link" href={`/mutual-fund/${fund.slug}`} key={fund.slug}>
              <strong>{fund.fundName}</strong>
              <span>NAV ₹{fund.nav.value} · Expense ratio {fund.expenseRatio.value}%</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading"><h2>Stocks</h2><a href="/stocks/tcs">Explore stock</a></div>
        <div className="card-list">
          {stocks.map((stock) => (
            <a className="stat-block card-link" href={`/stocks/${stock.slug}`} key={stock.slug}>
              <strong>{stock.companyName}</strong>
              <span>{stock.ticker} · ₹{stock.marketCap.value.toLocaleString("en-IN")} crore reference market cap</span>
            </a>
          ))}
        </div>
      </section>

      <section className="blog-callout">
        <div>
          <p className="eyebrow">Learn</p>
          <h2>Understand the numbers before using them.</h2>
          <p>Read short, practical explainers about IPOs and market data.</p>
        </div>
        <a className="button-link" href="/blog">Read the blog</a>
      </section>
    </div>
  );
}
