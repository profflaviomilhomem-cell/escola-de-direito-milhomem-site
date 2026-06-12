import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Nova senha",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function RecuperarSenhaPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/esqueci-senha");
  }

  return (
    <div className="w-full max-w-[450px]">
      <header className="mb-10 text-center">
        <p className="text-amber fm-mono mb-3 text-sm tracking-widest uppercase">
          Segurança
        </p>
        <h1 className="font-serif text-[42px] leading-[1.1] md:text-[52px]">
          Escolha sua <br />
          <em className="text-amber italic">nova senha</em>.
        </h1>
      </header>

      <div className="bg-carbon-elevated/40 border-paper-100/10 backdrop-blur-xl border p-8 md:p-10">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
