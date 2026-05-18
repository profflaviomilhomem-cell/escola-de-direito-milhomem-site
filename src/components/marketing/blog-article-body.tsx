import { splitBlogLeadVideo } from "@/lib/blog/split-body-media";

const HTML_PROSE =
  "wp-migrated-html prose-juridica text-paper-800 text-[18px] leading-[1.8] [&_a]:text-amber [&_a:hover]:underline [&_blockquote]:border-paper-200 [&_blockquote]:text-paper-700 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_h1]:text-paper [&_h2]:text-paper [&_h3]:text-paper [&_img]:h-auto [&_img]:max-w-full [&_li]:marker:text-amber [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:text-paper [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6";

const LEAD_VIDEO =
  "wp-migrated-html blog-lead-video border-paper-100 overflow-hidden rounded-sm border bg-carbon/40 [&_.wp-block-embed__wrapper]:w-full [&_figure]:m-0 [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:max-w-full";

type BlogArticleBodyProps = {
  body: string;
  isHtml: boolean;
};

export function BlogArticleBody({ body, isHtml }: BlogArticleBodyProps) {
  if (!isHtml) {
    return (
      <div className="prose-juridica space-y-6 text-[18px] leading-[1.8]">
        {body.split(/\n\n+/).map((paragraph, i) => (
          <p
            key={i}
            className="text-paper-800"
            dangerouslySetInnerHTML={{
              __html: paragraph
                .replace(
                  /\*\*(.+?)\*\*/g,
                  '<strong class="text-paper">$1</strong>',
                )
                .replace(/\*(.+?)\*/g, '<em class="text-amber italic">$1</em>'),
            }}
          />
        ))}
      </div>
    );
  }

  const { leadMedia, bodyHtml } = splitBlogLeadVideo(body);

  return (
    <>
      {leadMedia.length > 0 ? (
        <div className="blog-article-lead mb-8 space-y-6">
          {leadMedia.map((chunk, i) => (
            <div
              key={i}
              className={LEAD_VIDEO}
              dangerouslySetInnerHTML={{ __html: chunk }}
            />
          ))}
        </div>
      ) : null}

      <div className={HTML_PROSE} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
