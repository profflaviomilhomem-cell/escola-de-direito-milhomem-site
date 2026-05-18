"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { copy } from "@/config/copy";
import { contactSchema, type ContactInput } from "@/schemas/contact";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; message: string };

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const c = copy.contato;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: { website: "" },
  });

  const onSubmit = handleSubmit(async (input) => {
    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/contact", {
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
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setStatus({
          state: "error",
          message: body?.error ?? "Falha ao enviar. Tente novamente.",
        });
        return;
      }
      setStatus({ state: "success" });
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
        className="border-amber/40 bg-amber/5 mt-stack flex flex-col gap-2 border-l-2 px-6 py-5"
      >
        <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
          Enviado
        </p>
        <p className="text-paper-800 text-sm leading-relaxed">{c.formSuccess}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-px w-px opacity-0"
        aria-hidden
        {...register("website")}
      />
      <div>
        <label htmlFor="contact-name" className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
          Nome
        </label>
        <input
          id="contact-name"
          type="text"
          className="border-paper-200 bg-carbon-elevated/50 text-paper mt-2 w-full border px-4 py-3 text-base"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-alerta-400 mt-1 text-sm">{errors.name.message}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="contact-email" className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
          E-mail
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          className="border-paper-200 bg-carbon-elevated/50 text-paper mt-2 w-full border px-4 py-3 text-base"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-alerta-400 mt-1 text-sm">{errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="contact-message" className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
          Mensagem
        </label>
        <textarea
          id="contact-message"
          rows={5}
          className="border-paper-200 bg-carbon-elevated/50 text-paper mt-2 w-full resize-y border px-4 py-3 text-base"
          {...register("message")}
        />
        {errors.message ? (
          <p className="text-alerta-400 mt-1 text-sm">{errors.message.message}</p>
        ) : null}
      </div>
      {status.state === "error" ? (
        <p className="text-alerta-400 text-sm" role="alert">
          {status.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status.state === "submitting"}
        className="bg-amber text-paper hover:bg-amber-soft disabled:opacity-60 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] transition-colors"
      >
        {status.state === "submitting" ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
