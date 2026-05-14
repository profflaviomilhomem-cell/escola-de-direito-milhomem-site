"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FloatingInput } from "@/components/auth/floating-input";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; message: string };

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (input) => {
    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      
      if (res.status === 429) {
        setStatus({
          state: "error",
          message: "Muitas tentativas. Tente novamente mais tarde.",
        });
        return;
      }

      if (!res.ok) {
        setStatus({
          state: "error",
          message: "Falha ao processar pedido. Tente novamente.",
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
      <div className="space-y-6">
        <div className="border-amber/30 bg-amber/5 border-l-2 px-4 py-3">
          <p className="text-paper text-sm leading-relaxed">
            Se o e-mail informado estiver cadastrado, você receberá um link para
            redefinir sua senha em instantes.
          </p>
          <p className="text-paper-600 mt-2 text-xs">
            Verifique também sua caixa de spam.
          </p>
        </div>
        <Link
          href="/entrar"
          className="bg-amber text-carbon hover:bg-amber-soft block w-full font-mono text-[12px] font-semibold uppercase tracking-[0.2em] py-4 text-center transition-colors"
        >
          Voltar para login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <p className="text-paper-700 text-sm leading-relaxed">
        Informe seu e-mail de cadastro. Enviaremos um link de recuperação com
        validade de 1 hora.
      </p>
      
      <FloatingInput
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register("email")}
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
        {status.state === "submitting" ? "Enviando…" : "Enviar link"}
      </button>

      <div className="pt-2 text-center">
        <Link
          href="/entrar"
          className="text-paper-700 hover:text-paper text-xs transition-colors"
        >
          Lembrei a senha? Fazer login
        </Link>
      </div>
    </form>
  );
}
