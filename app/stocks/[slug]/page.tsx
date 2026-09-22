import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllStocks, getStockBySlug } from "@/lib/getStocks";
import { DisclaimerBanner } from "@/components/Disclaimer";
import { VideoEmbed } from "@/components/VideoEmbed";
import { TrackedStat } from "@/components/TrackedStat";

export function generateStaticParams() {
  return getAllStocks().map((stock) => ({ slug: stock.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const stock = getStockBySlug(params.slug);
  if (!stock) return {};
  return {
    title: `${stock.companyName} (${stock.ticker}) — Market Cap & Business Context | Luckymarkets`,
    description: `${stock.companyName} (${stock.ticker}): market capitalisation reference data and educational business context.`,
  };
}

export default function StockPage({ params }: { params: { slug: string } }) {
  const stock = getStockBySlug(params.slug);
  if (!stock) notFound();

  const pageUrl = `https://luckymarkets.in/stocks/${stock.slug}`;
  const imageUrl = "https://luckymarkets.in/og.png";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${stock.companyName} (${stock.ticker}) — Market Cap & Business Context`,
    description: stock.editorialNote,
    datePublished: stock.marketCap.asOf,
    dateModified: stock.marketCap.asOf,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    image: [imageUrl],
    author: { "@type": "Organization", name: "Luckymarkets" },
    publisher: {
      "@type": "Organization",
      name: "Luckymarkets",
      logo: { "@type": "ImageObject", url: imageUrl },
    },
  };

  return (
    <article className="container page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="eyebrow">Stock data</p>
      <h1>{stock.companyName}</h1>
      <p className="lede">{stock.ticker} · {stock.sector}</p>
      <DisclaimerBanner />
      <div className="data-grid section-gap">
        <TrackedStat label="Market capitalisation" data={stock.marketCap} suffix=" ₹ crore" />
      </div>
      <section>
        <h2>Business context</h2>
        <p>{stock.editorialNote}</p>
      </section>
      <VideoEmbed videoId={stock.videoId} />
    </article>
  );
}
