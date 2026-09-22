export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  content: string[];
};

const posts: BlogPost[] = [
  {
    slug: "how-to-read-ipo-subscription-data",
    title: "How to read IPO subscription data",
    description:
      "A practical guide to retail, S-HNI and B-HNI subscription figures and what those numbers do and do not tell you.",
    publishedAt: "2026-09-22",
    content: [
      "IPO subscription data shows how many times different investor categories collectively bid for the shares available to them. Retail, S-HNI and B-HNI are reported separately because their allocation rules and application sizes differ.",
      "A figure such as 5x means applications were received for roughly five times the shares available in that category. It does not mean an individual applicant has a guaranteed or proportional chance of receiving shares.",
      "Subscription data is a snapshot of demand during the issue period. It should be read alongside the offer document, financial statements, issue structure and the risks disclosed by the issuer.",
      "Luckymarkets presents market data for education. It does not turn subscription figures or grey-market observations into a buy or sell recommendation.",
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return posts;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
