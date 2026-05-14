import Link from "next/link";
import Image from "next/image";

interface BlogCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    publishedAt?: string;
    readingMin: number;
    coverImage?: string;
    cover: { from: string; to: string };
    author: {
      name: string;
      avatarSrc?: string;
    };
  };
  categoryLabel?: string;
}

export function BlogCard({ post, categoryLabel }: BlogCardProps) {
  const label = categoryLabel || post.category;
  
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block no-underline">
        <div
          className="border-paper-100 group-hover:border-amber relative aspect-[16/9] overflow-hidden border transition-colors bg-carbon"
          style={{
            backgroundImage: !post.coverImage ? `linear-gradient(135deg, ${post.cover.from}, ${post.cover.to})` : undefined,
          }}
        >
          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
              {label}
            </p>
          </div>
        </div>
        <h3 className="text-paper group-hover:text-amber mt-4 font-serif text-xl leading-tight transition-colors">
          {post.title}
        </h3>
        <p className="text-paper-700 mt-3 line-clamp-3 text-sm leading-relaxed">
          {post.excerpt}
        </p>
        <div className="text-paper-600 mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em]">
          {post.author.avatarSrc && (
            <Image
              src={post.author.avatarSrc}
              alt={post.author.name}
              width={20}
              height={20}
              className="border-amber/60 h-5 w-5 rounded-full border object-cover"
            />
          )}
          <span>{post.author.name.split(" ")[0]}</span>
          <span aria-hidden>·</span>
          <span>
            {post.publishedAt &&
              new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
          </span>
          <span aria-hidden>·</span>
          <span>{post.readingMin} min</span>
        </div>
      </Link>
    </article>
  );
}
