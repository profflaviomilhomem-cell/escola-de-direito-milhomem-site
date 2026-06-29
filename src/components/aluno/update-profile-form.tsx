"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateProfileSchema, type UpdateProfileInput } from "@/schemas/auth";

type Props = {
  initialName?: string;
  initialEmail: string;
};

export function UpdateProfileForm({ initialName, initialEmail }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialName,
      email: initialEmail,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Falha ao atualizar perfil.");
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block">
        <span className="text-paper-700 fm-mono">Nome completo</span>
        <input
          {...register("name")}
          className="border-paper-200 focus:border-amber bg-carbon text-paper mt-2 block w-full border-b px-2 py-3 transition-colors outline-none"
        />
        {errors.name && (
          <p className="text-alerta-400 mt-1 text-xs">{errors.name.message}</p>
        )}
      </label>

      <label className="block">
        <span className="text-paper-700 fm-mono">E-mail</span>
        <input
          {...register("email")}
          type="email"
          className="border-paper-200 focus:border-amber bg-carbon text-paper mt-2 block w-full border-b px-2 py-3 transition-colors outline-none"
        />
        {errors.email && (
          <p className="text-alerta-400 mt-1 text-xs">{errors.email.message}</p>
        )}
      </label>

      <p className="text-paper-600 fm-mono text-xs">
        Nota: Mudanças de e-mail podem exigir novo login.
      </p>

      <button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className="bg-amber text-carbon hover:bg-amber-soft fm-mono px-6 py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
