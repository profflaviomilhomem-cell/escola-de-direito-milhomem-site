"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FloatingInput } from "@/components/auth/floating-input";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; message: string };

type Props = {
  token: string;
};

export function ResetPasswordForm({ token }: Props) {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (input) => {
    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });

      if (res.status === 401) {
        setStatus({
          state: "error",
          message: "Este link expirou ou é inválido. Peça um novo.",
        });
        return;
      }

      if (!res.ok) {
        setStatus({
          state: "error",
          message: "Falha ao redefinir senha. Tente novamente.",
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
      <div className="space-y-6 text-center">
        <div className="border-amber/30 bg-amber/5 border-l-2 px-4 py-3 text-left">
          <p className="text-paper font-serif text-sm leading-relaxed">
            Sua senha foi atualizada com sucesso.
          </p>
          <p className="text-paper-600 mt-2 text-xs">
            Você já pode entrar na plataforma com a nova senha.
          </p>
        </div>
        <Link
          href="/entrar"
          className="bg-amber text-carbon hover:bg-amber-soft block w-full py-4 font-mono text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors"
        >
          Ir para Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <p className="text-paper-700 text-sm leading-relaxed">
        Escolha uma nova senha forte de pelo menos 8 caracteres.
      </p>

      <input type="hidden" {...register("token")} />

      <FloatingInput
        label="Nova senha"
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
        {status.state === "submitting" ? "Redefinindo…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
