"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updatePasswordSchema, type UpdatePasswordInput } from "@/schemas/auth";

export function UpdatePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Falha ao trocar senha.");
      }

      toast.success("Senha alterada com sucesso!");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block">
        <span className="text-paper-700 fm-mono">Senha atual</span>
        <input
          {...register("currentPassword")}
          type="password"
          className="border-paper-200 focus:border-amber bg-carbon text-paper mt-2 block w-full border-b px-2 py-3 transition-colors outline-none"
        />
        {errors.currentPassword && (
          <p className="text-alerta-400 mt-1 text-xs">
            {errors.currentPassword.message}
          </p>
        )}
      </label>

      <label className="block">
        <span className="text-paper-700 fm-mono">Nova senha</span>
        <input
          {...register("newPassword")}
          type="password"
          className="border-paper-200 focus:border-amber bg-carbon text-paper mt-2 block w-full border-b px-2 py-3 transition-colors outline-none"
        />
        {errors.newPassword && (
          <p className="text-alerta-400 mt-1 text-xs">
            {errors.newPassword.message}
          </p>
        )}
        <p className="text-paper-600 mt-2 text-xs">
          Mínimo 8 caracteres, máximo 72 bytes (acentos e emoji pesam mais).
        </p>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono border px-6 py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Trocando…" : "Trocar senha"}
      </button>
    </form>
  );
}
