"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { track } from "@/lib/analytics/track";
import { registerSchema, type RegisterInput } from "@/schemas/auth";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "error"; message: string };

type Props = {
  redirectTo?: string;
};

export function RegisterForm({ redirectTo = "/aluno/dashboard" }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (input) => {
    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/auth/register", {
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
      if (res.status === 409) {
        setStatus({
          state: "error",
          message:
            "Este e-mail já está cadastrado. Use a página de entrar.",
        });
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setStatus({
          state: "error",
          message: body?.error ?? "Falha ao cadastrar. Tente novamente.",
        });
        return;
      }
      track("sign_up", { method: "password" });
      router.push(redirectTo);
      router.refresh();
    } catch {
      setStatus({
        state: "error",
        message: "Sem conexão. Tente de novo daqui a pouco.",
      });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-stack flex flex-col gap-5"
    >
      <label className="block">
        <span className="text-paper-800 font-mono text-[11px] uppercase tracking-[0.2em]">
          Seu nome
        </span>
        <input
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name) || undefined}
          aria-describedby={errors.name ? "register-name-error" : undefined}
          {...register("name")}
          className="border-paper-200 focus:border-amber bg-paper-50 text-paper mt-2 block w-full border-b px-2 py-3 outline-none transition-colors"
          placeholder="Como devemos te chamar"
        />
        {errors.name?.message && (
          <span
            id="register-name-error"
            className="text-alerta-400 mt-1 block text-sm"
          >
            {errors.name.message}
          </span>
        )}
      </label>

      <label className="block">
        <span className="text-paper-800 font-mono text-[11px] uppercase tracking-[0.2em]">
          E-mail*
        </span>
        <input
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(errors.email) || undefined}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          {...register("email")}
          className="border-paper-200 focus:border-amber bg-paper-50 text-paper mt-2 block w-full border-b px-2 py-3 outline-none transition-colors"
          placeholder="voce@exemplo.com"
        />
        {errors.email?.message && (
          <span
            id="register-email-error"
            className="text-alerta-400 mt-1 block text-sm"
          >
            {errors.email.message}
          </span>
        )}
      </label>

      <label className="block">
        <span className="text-paper-800 font-mono text-[11px] uppercase tracking-[0.2em]">
          Senha* — mínimo 8 caracteres
        </span>
        <input
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(errors.password) || undefined}
          aria-describedby={
            errors.password ? "register-password-error" : undefined
          }
          {...register("password")}
          className="border-paper-200 focus:border-amber bg-paper-50 text-paper mt-2 block w-full border-b px-2 py-3 outline-none transition-colors"
        />
        {errors.password?.message && (
          <span
            id="register-password-error"
            className="text-alerta-400 mt-1 block text-sm"
          >
            {errors.password.message}
          </span>
        )}
      </label>

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
        className="bg-amber text-carbon hover:bg-amber-soft mt-2 inline-flex items-center justify-center gap-2 self-start px-7 py-4 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.state === "submitting" ? "Cadastrando…" : "Criar conta"}
      </button>

      <p className="text-paper-600 mt-2 text-sm leading-relaxed">
        Ao criar conta você concorda com nossos{" "}
        <a className="border-amber border-b" href="/termos">
          Termos
        </a>{" "}
        e a{" "}
        <a className="border-amber border-b" href="/privacidade">
          Política de Privacidade
        </a>
        .
      </p>
    </form>
  );
}
