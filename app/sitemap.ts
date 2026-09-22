import type { MetadataRoute } from "next";
import { getAllIpos } from "@/lib/getIpos";
import { getAllMFs } from "@/lib/getMFs";
import { getAllStocks } from "@/lib/getStocks";
import { getAllBlogPosts } from "@/lib/blog";

const SITE_URL = process.env.SITE_URL || "https://luckymarkets.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/blog`, priority: 0.7 },
    ...getAllIpos().map((ipo) => ({ url: `${SITE_URL}/ipo/${ipo.slug}`, lastModified: ipo.gmp.asOf, priority: 0.8 })),
    ...getAllMFs().map((fund) => ({ url: `${SITE_URL}/mutual-fund/${fund.slug}`, lastModified: fund.nav.asOf, priority: 0.8 })),
    ...getAllStocks().map((stock) => ({ url: `${SITE_URL}/stocks/${stock.slug}`, lastModified: stock.marketCap.asOf, priority: 0.8 })),
    ...getAllBlogPosts().map((post) => ({ url: `${SITE_URL}/blog/${post.slug}`, lastModified: post.publishedAt, priority: 0.6 })),
  ];
}
