"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import {
  EditorField,
  editorInputClass,
} from "@/components/professor/editor-field";

type Props = {
  label: string;
  hint: string;
  value: string;
  onChange: (url: string) => void;
  aspect: "video" | "banner";
  uploadKind: string;
  previewLabel: string;
};

export function ImageMediaField({
  label,
  hint,
  value,
  onChange,
  aspect,
  uploadKind,
  previewLabel,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onFilePick(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("kind", uploadKind);
    try {
      const res = await fetch("/api/professor/upload", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Falha no upload.");
        return;
      }
      onChange(data.url);
    } catch {
      setUploadError("Não foi possível enviar o arquivo.");
    } finally {
      setUploading(false);
    }
  }

  const aspectClass = aspect === "banner" ? "aspect-[21/9]" : "aspect-[4/3]";

  return (
    <EditorField label={label} hint={hint}>
      <div className="space-y-3">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/cursos/capa.jpg ou https://…"
          className={`${editorInputClass} font-mono text-[13px]`}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber border px-3 py-2 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors disabled:opacity-50"
          >
            {uploading ? "Enviando…" : "Enviar arquivo"}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="border-paper-200 text-paper-600 hover:text-alerta-400 border px-3 py-2 font-mono text-[10px] tracking-[0.16em] uppercase"
            >
              Remover
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            void onFilePick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {uploadError ? (
          <p className="text-alerta-400 text-xs">{uploadError}</p>
        ) : null}
        <div
          className={`border-paper-100 bg-carbon-elevated relative overflow-hidden border ${aspectClass}`}
        >
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
              unoptimized={value.startsWith("/")}
            />
          ) : (
            <div className="text-paper-600 flex h-full items-center justify-center p-6 text-center text-xs">
              {previewLabel}
            </div>
          )}
          <span className="bg-carbon/80 text-paper-600 absolute bottom-2 left-2 px-2 py-1 font-mono text-[9px] tracking-widest uppercase">
            Preview · {aspect === "banner" ? "banner" : "capa"}
          </span>
        </div>
      </div>
    </EditorField>
  );
}
