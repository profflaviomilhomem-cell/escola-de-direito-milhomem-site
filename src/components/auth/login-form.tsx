"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginInput } from "@/schemas/auth";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "error"; message: string };

type Props = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo = "/aluno/dashboard" }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (input) => {
    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/auth/login", {
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
      if (res.status === 401) {
        setStatus({ state: "error", message: "E-mail ou senha incorretos." });
        return;
      }
      if (!res.ok) {
        setStatus({
          state: "error",
          message: "Falha ao entrar. Tente novamente.",
        });
        return;
      }
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
    <form onSubmit={onSubmit} noValidate className="mt-stack flex flex-col gap-5">
      <label className="block">
        <span className="text-paper-800 font-mono text-[11px] uppercase tracking-[0.2em]">
          E-mail
        </span>
        <input
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(errors.email) || undefined}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...register("email")}
          className="border-paper-200 focus:border-amber bg-paper-50 text-paper mt-2 block w-full border-b px-2 py-3 outline-none transition-colors"
          placeholder="voce@exemplo.com"
        />
        {errors.email?.message && (
          <span
            id="login-email-error"
            className="text-alerta-400 mt-1 block text-sm"
          >
            {errors.email.message}
          </span>
        )}
      </label>

      <label className="block">
        <span className="text-paper-800 font-mono text-[11px] uppercase tracking-[0.2em]">
          Senha
        </span>
        <input
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(errors.password) || undefined}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          {...register("password")}
          className="border-paper-200 focus:border-amber bg-paper-50 text-paper mt-2 block w-full border-b px-2 py-3 outline-none transition-colors"
        />
        {errors.password?.message && (
          <span
            id="login-password-error"
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
        {status.state === "submitting" ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
