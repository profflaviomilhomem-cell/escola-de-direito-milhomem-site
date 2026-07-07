"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { newsletterSchema, type NewsletterInput } from "@/schemas/newsletter";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; message: string };

type Props = {
  source?: string;
  leadMagnetSlug?: string;
  /** Versão compacta para modal / popup */
  compact?: boolean;
  onSuccess?: () => void;
};

export function NewsletterForm({
  source = "newsletter",
  leadMagnetSlug,
  compact = false,
  onSuccess,
}: Props) {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    mode: "onBlur",
    defaultValues: { source, leadMagnetSlug, website: "" },
  });

  const onSubmit = handleSubmit(async (input) => {
    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.status === 429) {
        setStatus({
          state: "error",
          message: "Muitas tentativas. Tente novamente em alguns minutos.",
        });
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setStatus({
          state: "error",
          message: body?.error ?? "Falha ao registrar. Tente novamente.",
        });
        return;
      }
      // lead_capture_source (guia 8.5) viaja como dimensão: `source` + `lead_magnet`.
      track(ANALYTICS_EVENTS.LEAD_CAPTURE, {
        source: input.source ?? source,
        lead_magnet: input.leadMagnetSlug ?? leadMagnetSlug ?? null,
      });
      setStatus({ state: "success" });
      onSuccess?.();
    } catch {
      setStatus({
        state: "error",
        message: "Sem conexão. Tente de novo daqui a pouco.",
      });
    }
  });

  if (status.state === "success") {
    return (
      <div
        role="status"
        className={
          compact
            ? "border-amber/30 bg-amber/5 flex flex-col gap-1.5 rounded-md border px-3 py-3"
            : "border-amber/40 bg-amber/5 mt-stack flex flex-col gap-2 border-l-2 px-6 py-5"
        }
      >
        <p
          className={
            compact
              ? "text-amber font-mono text-[9px] tracking-[0.16em] uppercase"
              : "text-amber font-mono text-[11px] tracking-[0.2em] uppercase"
          }
        >
          Inscrição registrada
        </p>
        <p
          className={
            compact
              ? "text-paper-700 text-[12px] leading-snug"
              : "text-paper-800 text-base"
          }
        >
          {compact
            ? "Confirme pelo e-mail que enviamos (LGPD). Veja o spam se não chegar."
            : "Enviamos um e-mail para confirmar sua assinatura. Sem confirmação a inscrição não é válida (LGPD). Verifique também a caixa de spam."}
        </p>
      </div>
    );
  }

  const labelClass = compact
    ? "text-paper-700 font-mono text-[9px] uppercase tracking-[0.14em]"
    : "text-paper-800 font-mono text-[11px] uppercase tracking-[0.2em]";

  const inputClass = compact
    ? "border-paper-200 focus:border-amber bg-paper-50/80 text-paper mt-1.5 block w-full rounded border px-2.5 py-2 text-sm outline-none transition-colors"
    : "border-paper-200 focus:border-amber bg-paper-50 text-paper mt-2 block w-full border-b px-2 py-3 outline-none transition-colors";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={
        compact ? "flex flex-col gap-3" : "mt-stack flex flex-col gap-5"
      }
    >
      {/* Honeypot — deve permanecer vazio. tabIndex=-1 e aria-hidden
          evitam que leitores de tela ou usuários de teclado parem aqui. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-auto -left-[10000px] h-px w-px overflow-hidden"
      >
        <label>
          Não preencha este campo:
          <input
            type="text"
            autoComplete="off"
            tabIndex={-1}
            {...register("website")}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Seu nome</span>
        <input
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name) || undefined}
          aria-describedby={errors.name ? "newsletter-name-error" : undefined}
          {...register("name")}
          className={inputClass}
          placeholder="Como devemos te chamar"
        />
        {errors.name?.message && (
          <span
            id="newsletter-name-error"
            className="text-alerta-400 mt-1 block text-sm"
          >
            {errors.name.message}
          </span>
        )}
      </label>

      <label className="block">
        <span className={labelClass}>E-mail*</span>
        <input
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(errors.email) || undefined}
          aria-describedby={errors.email ? "newsletter-email-error" : undefined}
          {...register("email")}
          className={inputClass}
          placeholder="voce@exemplo.com"
        />
        {errors.email?.message && (
          <span
            id="newsletter-email-error"
            className="text-alerta-400 mt-1 block text-sm"
          >
            {errors.email.message}
          </span>
        )}
      </label>

      <input type="hidden" {...register("source")} />
      <input type="hidden" {...register("leadMagnetSlug")} />

      {status.state === "error" && (
        <p
          role="alert"
          className="text-alerta-400 border-alerta-400/30 bg-alerta-400/5 border-l-2 px-4 py-3 text-sm"
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || status.state === "submitting"}
        className={
          compact
            ? "bg-amber text-carbon hover:bg-amber-soft inline-flex w-full items-center justify-center rounded px-4 py-2.5 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            : "bg-amber text-carbon hover:bg-amber-soft mt-2 inline-flex items-center justify-center gap-2 self-start px-7 py-4 font-mono text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {status.state === "submitting" ? "Enviando…" : "Quero receber"}
      </button>

      {!compact && (
        <p className="text-paper-600 mt-2 text-sm leading-relaxed">
          Você receberá um e-mail de confirmação. Sem confirmação não há
          inscrição (LGPD). Pode cancelar a qualquer momento clicando no rodapé
          de qualquer envio.
        </p>
      )}
    </form>
  );
}
