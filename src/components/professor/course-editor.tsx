"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductPublishStatus, ProductType } from "@prisma/client";

import { EditorField, editorInputClass } from "@/components/professor/editor-field";
import { ImageMediaField } from "@/components/professor/image-media-field";
import {
  PRODUCT_PUBLISH_LABEL,
  PRODUCT_TYPE_LABEL,
  slugifyCourseName,
  type ProfessorCourse,
} from "@/lib/professor/product-types";

type Props = {
  course?: ProfessorCourse;
};

const PUBLISH_OPTIONS = (
  Object.keys(PRODUCT_PUBLISH_LABEL) as ProductPublishStatus[]
).map((value) => ({
  value,
  label: PRODUCT_PUBLISH_LABEL[value].label,
}));

const TYPE_OPTIONS = (
  Object.keys(PRODUCT_TYPE_LABEL) as ProductType[]
).map((value) => ({
  value,
  label: PRODUCT_TYPE_LABEL[value],
}));

type Tab = "geral" | "imagens" | "publicacao";

export function CourseEditor({ course }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("geral");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(course?.name ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  const [tagline, setTagline] = useState(course?.tagline ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [type, setType] = useState<ProductType>(course?.type ?? "COHORT");
  const [priceReais, setPriceReais] = useState(
    course ? (course.priceCents / 100).toFixed(2).replace(".", ",") : "0,00",
  );
  const [coverImage, setCoverImage] = useState(course?.coverImage ?? "");
  const [bannerImage, setBannerImage] = useState(course?.bannerImage ?? "");
  const [publishStatus, setPublishStatus] = useState<ProductPublishStatus>(
    course?.publishStatus ?? "DRAFT",
  );
  const [publishedAt, setPublishedAt] = useState(
    course?.publishedAt
      ? course.publishedAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [active, setActive] = useState(course?.active ?? true);

  const priceCents = Math.round(
    parseFloat(priceReais.replace(/\./g, "").replace(",", ".")) * 100,
  ) || 0;

  async function save() {
    setSaving(true);
    setError(null);
    const payload = {
      slug: slug.trim(),
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      type,
      priceCents,
      coverImage: coverImage || null,
      bannerImage: bannerImage || null,
      publishStatus,
      publishedAt: publishedAt || null,
      active,
    };

    const url = course
      ? `/api/professor/products/${encodeURIComponent(course.slug)}`
      : "/api/professor/products";
    const method = course ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        course?: ProfessorCourse;
        error?: string;
      };
      if (!res.ok || !data.course) {
        setError(data.error ?? "Erro ao salvar.");
        return;
      }
      router.push(`/professor/cursos/${data.course.slug}/editar`);
      router.refresh();
    } catch {
      setError("Falha de rede ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="grid gap-8 lg:grid-cols-[1.2fr_1fr]"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <div className="space-y-6">
        <nav
          className="border-paper-100 flex flex-wrap gap-2 border-b pb-4"
          aria-label="Seções do editor"
        >
          {(
            [
              ["geral", "Geral"],
              ["imagens", "Capa e banner"],
              ["publicacao", "Publicação"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                tab === id
                  ? "bg-amber text-carbon"
                  : "text-paper-600 hover:text-paper border-paper-200 border"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "geral" && (
          <div className="space-y-5">
            <EditorField label="Nome do curso" required>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!course && !slug) {
                    setSlug(slugifyCourseName(e.target.value));
                  }
                }}
                className={editorInputClass}
                placeholder="Edição Lançamento — direito criminal pela acusação"
              />
            </EditorField>
            <EditorField
              label="Slug (URL)"
              hint="Vitrine: /cursos/{slug} · Área do aluno usa o mesmo identificador"
            >
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={`${editorInputClass} font-mono`}
              />
            </EditorField>
            <EditorField label="Tagline" hint="Uma linha no card e no hero do aluno">
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={editorInputClass}
                placeholder="Cohort de 12 semanas · perspectiva da acusação"
              />
            </EditorField>
            <EditorField label="Descrição completa" required>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={10}
                className={`${editorInputClass} leading-relaxed`}
                placeholder="O que o aluno aprende, para quem é, como funciona a trilha…"
              />
            </EditorField>
            <div className="grid gap-5 md:grid-cols-2">
              <EditorField label="Tipo de produto">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ProductType)}
                  className={editorInputClass}
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </EditorField>
              <EditorField label="Preço (R$)">
                <input
                  type="text"
                  inputMode="decimal"
                  value={priceReais}
                  onChange={(e) => setPriceReais(e.target.value)}
                  className={editorInputClass}
                />
              </EditorField>
            </div>
          </div>
        )}

        {tab === "imagens" && (
          <div className="space-y-8">
            <ImageMediaField
              label="Foto de capa"
              hint="Card do curso na área do aluno (proporção 4:3). Envie arquivo ou cole URL em /images/cursos/…"
              value={coverImage}
              onChange={setCoverImage}
              aspect="video"
              uploadKind="capa"
              previewLabel="Capa no grid de cursos"
            />
            <ImageMediaField
              label="Banner"
              hint="Faixa larga no topo do curso / hero do dashboard (21:9)."
              value={bannerImage}
              onChange={setBannerImage}
              aspect="banner"
              uploadKind="banner"
              previewLabel="Banner no painel do aluno"
            />
          </div>
        )}

        {tab === "publicacao" && (
          <div className="space-y-5">
            <EditorField label="Status editorial">
              <select
                value={publishStatus}
                onChange={(e) =>
                  setPublishStatus(e.target.value as ProductPublishStatus)
                }
                className={editorInputClass}
              >
                {PUBLISH_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </EditorField>
            <EditorField label="Data de publicação">
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className={editorInputClass}
              />
            </EditorField>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="border-paper-200 accent-amber h-4 w-4"
              />
              <span className="text-paper text-sm">
                Curso ativo (visível para matrículas quando publicado)
              </span>
            </label>
          </div>
        )}

        {error ? <p className="text-alerta-400 text-sm">{error}</p> : null}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="border-paper-100 bg-carbon-elevated overflow-hidden border">
          <div className="relative aspect-[21/9] bg-carbon">
            {bannerImage ? (
              <Image
                src={bannerImage}
                alt=""
                fill
                className="object-cover"
                sizes="400px"
                unoptimized={bannerImage.startsWith("/")}
              />
            ) : (
              <div className="from-amber/20 to-carbon flex h-full items-center justify-center bg-gradient-to-br text-xs text-paper-600">
                Banner
              </div>
            )}
          </div>
          <div className="flex gap-4 p-4">
            <div className="border-paper-100 relative h-20 w-16 shrink-0 overflow-hidden border">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={coverImage.startsWith("/")}
                />
              ) : (
                <div className="bg-paper-100 h-full w-full" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-amber font-mono text-[9px] uppercase tracking-widest">
                {PRODUCT_TYPE_LABEL[type]}
              </p>
              <h2 className="text-paper font-serif text-lg leading-tight">
                {name || "Nome do curso"}
              </h2>
              <p className="text-paper-600 mt-1 line-clamp-2 text-xs">
                {tagline || "Tagline"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-paper-100 bg-carbon-elevated border p-6">
          <h3 className="text-amber font-mono text-[10px] uppercase tracking-[0.2em] mb-4">
            Ações
          </h3>
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber text-carbon hover:bg-amber-soft w-full px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
            >
              {saving
                ? "Salvando…"
                : publishStatus === "PUBLISHED"
                  ? "Salvar e publicar"
                  : "Salvar rascunho"}
            </button>
            {course ? (
              <a
                href={`/professor/aulas?curso=${course.slug}`}
                className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber block w-full border px-4 py-3 text-center font-mono text-[11px] uppercase tracking-[0.2em]"
              >
                Gerenciar aulas ({course.lessonCount})
              </a>
            ) : null}
            <button
              type="button"
              className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber w-full border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em]"
              onClick={() => router.push("/professor/cursos")}
            >
              Voltar à lista
            </button>
          </div>
        </div>
      </aside>
    </form>
  );
}
