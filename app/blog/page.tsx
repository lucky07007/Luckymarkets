import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Market Education Blog | Luckymarkets",
  description: "Plain-language educational guides to IPO, mutual fund and stock market data.",
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();
  return (
    <div className="container page-shell">
      <p className="eyebrow">Education</p>
      <h1>Luckymarkets blog</h1>
      <p className="lede">Plain-language explainers for understanding public market data.</p>
      <div className="card-list section-gap">
        {posts.map((post) => (
          <a className="stat-block card-link" href={`/blog/${post.slug}`} key={post.slug}>
            <div>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
            </div>
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
          </a>
        ))}
      </div>
    </div>
  );
}
