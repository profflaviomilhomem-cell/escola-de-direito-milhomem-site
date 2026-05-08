"use client";

import { useState, type ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
};

type Props = {
  tabs: Tab[];
  initial?: string;
};

/**
 * Tabs com aria roles. Variante editorial: a tab ativa marca uma linha
 * mostarda na parte de baixo (não preenchimento). Inativas são paper a
 * 60%, hover sobe para 100%.
 */
export function LessonTabs({ tabs, initial }: Props) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Conteúdo da aula"
        className="border-paper-100 flex gap-8 border-b"
      >
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`tab-panel-${t.id}`}
              id={`tab-trigger-${t.id}`}
              onClick={() => setActive(t.id)}
              className={`fm-mono relative -mb-px py-3 transition-colors ${
                isActive
                  ? "text-amber"
                  : "text-paper-600 hover:text-paper"
              }`}
            >
              {t.label}
              {typeof t.count === "number" && (
                <span className="ml-2 opacity-70">({t.count})</span>
              )}
              {isActive && (
                <span
                  aria-hidden
                  className="bg-amber absolute inset-x-0 bottom-0 h-[2px]"
                />
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`tab-panel-${t.id}`}
          aria-labelledby={`tab-trigger-${t.id}`}
          hidden={t.id !== active}
          className="pt-8"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
