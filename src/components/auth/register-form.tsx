"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FloatingInput } from "@/components/auth/floating-input";
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
          message: "Este e-mail já está cadastrado. Use a página de entrar.",
        });
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
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
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FloatingInput
        label="Seu nome"
        type="text"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <FloatingInput
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register("email")}
      />
      <FloatingInput
        label="Senha (mínimo 8 caracteres)"
        type="password"
        autoComplete="new-password"
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
        className="bg-amber text-carbon hover:bg-amber-soft mt-2 w-full py-4 font-mono text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.state === "submitting" ? "Cadastrando…" : "Criar conta"}
      </button>

      <p className="text-paper-600 pt-2 text-xs leading-relaxed">
        Ao criar conta você concorda com os{" "}
        <Link
          href="/termos"
          className="text-paper-700 hover:text-paper underline-offset-2 hover:underline"
        >
          Termos
        </Link>{" "}
        e a{" "}
        <Link
          href="/privacidade"
          className="text-paper-700 hover:text-paper underline-offset-2 hover:underline"
        >
          Política de Privacidade
        </Link>
        .
      </p>
    </form>
  );
}
