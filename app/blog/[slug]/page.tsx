import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";
import { DisclaimerBanner } from "@/components/Disclaimer";

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};
  return { title: `${post.title} | Luckymarkets`, description: post.description };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="container page-shell article">
      <p className="eyebrow">Education · {post.publishedAt}</p>
      <h1>{post.title}</h1>
      <p className="lede">{post.description}</p>
      <DisclaimerBanner />
      {post.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </article>
  );
}
