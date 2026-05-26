"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FloatingInput } from "@/components/auth/floating-input";
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

      const data = (await res.json()) as {
        redirectTo?: string;
        user?: { role?: string };
      };

      const destination =
        redirectTo !== "/aluno/dashboard"
          ? redirectTo
          : (data.redirectTo ??
            (data.user?.role === "admin"
              ? "/professor/dashboard"
              : "/aluno/dashboard"));

      router.push(destination);
      router.refresh();
    } catch {
      setStatus({
        state: "error",
        message: "Sem conexão. Tente de novo daqui a pouco.",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FloatingInput
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register("email")}
      />
      <FloatingInput
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register("password")}
      />

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
        className="bg-amber text-carbon hover:bg-amber-soft mt-2 w-full font-mono text-[12px] font-semibold uppercase tracking-[0.2em] py-4 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.state === "submitting" ? "Entrando…" : "Entrar"}
      </button>

      <div className="flex items-center justify-between gap-3 pt-2 text-[13px]">
        <label className="text-paper-700 flex cursor-pointer items-center gap-2 select-none">
          <input
            type="checkbox"
            defaultChecked
            className="border-paper-400 accent-amber h-4 w-4 cursor-pointer"
          />
          Lembrar de mim
        </label>
        <Link
          href="/esqueci-senha"
          className="text-paper-700 hover:text-paper transition-colors"
        >
          Esqueci minha senha
        </Link>
      </div>
    </form>
  );
}
