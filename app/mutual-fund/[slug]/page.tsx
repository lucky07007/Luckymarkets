import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllMFs, getMFBySlug } from "@/lib/getMFs";
import { DisclaimerBanner } from "@/components/Disclaimer";
import { VideoEmbed } from "@/components/VideoEmbed";
import { TrackedStat } from "@/components/TrackedStat";

export function generateStaticParams() {
  return getAllMFs().map((fund) => ({ slug: fund.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const fund = getMFBySlug(params.slug);
  if (!fund) return {};
  return {
    title: `${fund.fundName} — NAV & Expense Ratio | Luckymarkets`,
    description: `${fund.fundName}: latest published NAV, expense ratio and plain-language educational context.`,
  };
}

export default function MutualFundPage({ params }: { params: { slug: string } }) {
  const fund = getMFBySlug(params.slug);
  if (!fund) notFound();

  const pageUrl = `https://luckymarkets.in/mutual-fund/${fund.slug}`;
  const imageUrl = "https://luckymarkets.in/og.png";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${fund.fundName} — NAV & Expense Ratio`,
    description: fund.editorialNote,
    datePublished: fund.nav.asOf,
    dateModified: fund.nav.asOf,
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
      <p className="eyebrow">Mutual fund data</p>
      <h1>{fund.fundName}</h1>
      <p className="lede">{fund.category} · {fund.amc} · Manager: {fund.fundManager}</p>
      <DisclaimerBanner />
      <div className="data-grid section-gap">
        <TrackedStat label="NAV" data={fund.nav} suffix=" ₹" />
        <TrackedStat label="Expense ratio" data={fund.expenseRatio} suffix="%" />
      </div>
      <section>
        <h2>Fund context</h2>
        <p>{fund.editorialNote}</p>
      </section>
      <VideoEmbed videoId={fund.videoId} />
    </article>
  );
}
