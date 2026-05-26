type Props = {
  title: string;
  description?: string;
  className?: string;
};

export function AreaEmptyState({ title, description, className = "" }: Props) {
  return (
    <div
      className={`border-paper-100 bg-carbon-elevated/60 border px-6 py-10 text-center ${className}`.trim()}
    >
      <p className="text-paper font-serif text-lg">{title}</p>
      {description ? (
        <p className="text-paper-600 mx-auto mt-3 max-w-md text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
