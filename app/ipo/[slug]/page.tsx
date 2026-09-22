import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllIpos, getIpoBySlug } from "@/lib/getIpos";
import { DisclaimerBanner } from "@/components/Disclaimer";
import { VideoEmbed } from "@/components/VideoEmbed";
import { TrackedStat } from "@/components/TrackedStat";

export function generateStaticParams() {
  return getAllIpos().map((ipo) => ({ slug: ipo.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const ipo = getIpoBySlug(params.slug);
  if (!ipo) return {};
  return {
    title: `${ipo.companyName} IPO — GMP & Subscription | Luckymarkets`,
    description: `${ipo.companyName} IPO: GMP, subscription status, allotment figures and a plain-language business overview. Educational only.`,
  };
}

export default function IpoPage({ params }: { params: { slug: string } }) {
  const ipo = getIpoBySlug(params.slug);
  if (!ipo) notFound();

  const pageUrl = `https://luckymarkets.in/ipo/${ipo.slug}`;
  const imageUrl = "https://luckymarkets.in/og.png";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${ipo.companyName} IPO — GMP & Subscription`,
    description: ipo.marketPosition,
    datePublished: ipo.gmp.asOf,
    dateModified: ipo.gmp.asOf,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="eyebrow">IPO data</p>
      <h1>{ipo.companyName} IPO</h1>
      <p className="lede">
        {ipo.sector} · {ipo.industry} · Listed {ipo.listingDate} · Price band{" "}
        {ipo.priceBand}
      </p>
      <DisclaimerBanner />
      <div className="data-grid section-gap">
        <TrackedStat label="GMP" data={ipo.gmp} suffix=" ₹" />
        <TrackedStat label="Retail allotment chance" data={{ ...ipo.allotmentChance, value: ipo.allotmentChance.value.retail }} suffix="%" />
        <TrackedStat label="S-HNI allotment chance" data={{ ...ipo.allotmentChance, value: ipo.allotmentChance.value.sni }} suffix="%" />
        <TrackedStat label="B-HNI allotment chance" data={{ ...ipo.allotmentChance, value: ipo.allotmentChance.value.bni }} suffix="%" />
        <TrackedStat label="Retail subscription" data={{ ...ipo.subscription, value: ipo.subscription.value.retail }} suffix="x" />
      </div>
      <section>
        <h2>Where it stands</h2>
        <p>{ipo.marketPosition}</p>
      </section>
      <section>
        <h2>Leadership and business context</h2>
        <p>{ipo.leadership}</p>
      </section>
      <section>
        <h2>What the DRHP says</h2>
        <p>{ipo.drhpSummary}</p>
      </section>
      <VideoEmbed videoId={ipo.videoId} />
    </article>
  );
}
