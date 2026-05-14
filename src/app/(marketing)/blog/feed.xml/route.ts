import { prisma } from "@/lib/prisma";
import { publishedBlogPosts } from "@/data/mock-blog";

/**
 * RSS Feed do blog.
 * Gera XML compatível com leitores de feed.
 */
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://escolaflaviomilhomem.com.br";
  
  let posts: any[] = [];
  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 20,
    });

    if (dbPosts.length > 0) {
      posts = dbPosts.map(p => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        publishedAt: p.publishedAt,
      }));
    } else {
      posts = publishedBlogPosts().map(p => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        publishedAt: new Date(p.publishedAt),
      }));
    }
  } catch {
    posts = publishedBlogPosts().map(p => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      publishedAt: new Date(p.publishedAt),
    }));
  }

  const feedItems = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog — Escola Flávio Milhomem</title>
    <link>${siteUrl}/blog</link>
    <description>O penal pelo ângulo da acusação.</description>
    <language>pt-br</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml" />
    ${feedItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
