export function EditorField({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-paper-600 mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
        {label}
        {required && <span className="text-amber">*</span>}
      </span>
      {children}
      {hint && (
        <span className="text-paper-600 mt-2 block text-[12px] leading-relaxed">
          {hint}
        </span>
      )}
    </label>
  );
}

export const editorInputClass =
  "border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 text-sm outline-none";
