type YoutubeEmbedProps = {
  videoId: string;
  title: string;
  className?: string;
};

/** Player YouTube (nocookie) para landings de marketing. */
export function YoutubeEmbed({
  videoId,
  title,
  className = "",
}: YoutubeEmbedProps) {
  return (
    <div
      className={`border-paper-100 bg-carbon-elevated/40 aspect-video overflow-hidden rounded-lg border ${className}`.trim()}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
        loading="lazy"
      />
    </div>
  );
}
