import type { MockAnnouncement } from "@/data/mock-aluno";

type Props = {
  announcement: MockAnnouncement;
};

export function AnnouncementCard({ announcement }: Props) {
  const date = new Date(announcement.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });

  return (
    <article className="border-paper-100 hover:border-amber bg-carbon-elevated relative flex w-[320px] flex-shrink-0 flex-col gap-3 border p-6 transition-colors md:w-[380px]">
      <header className="flex items-center justify-between">
        <span className="text-amber fm-mono">{announcement.eyebrow}</span>
        <span className="text-paper-600 fm-mono">{date}</span>
      </header>
      <h3 className="text-paper font-serif text-xl leading-tight">
        {announcement.title}
      </h3>
      <p className="text-paper-700 text-sm leading-relaxed">
        {announcement.body}
      </p>
      {announcement.cta && (
        <a
          href={announcement.cta.href}
          className="border-amber text-paper hover:text-amber fm-mono mt-auto self-start border-b transition-colors"
        >
          {announcement.cta.label} →
        </a>
      )}
    </article>
  );
}
