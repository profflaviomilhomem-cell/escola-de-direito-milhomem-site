import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar acesso",
  description: "Peça um link de recuperação para sua conta de aluno.",
  robots: { index: false, follow: false },
};

export default function EsqueciSenhaPage() {
  return (
    <div className="w-full max-w-[450px]">
      <header className="mb-10 text-center">
        <p className="text-amber fm-mono mb-3 text-sm tracking-widest uppercase">
          Acesso
        </p>
        <h1 className="font-serif text-[42px] leading-[1.1] md:text-[52px]">
          Esqueci a <br />
          <em className="text-amber italic">minha senha</em>.
        </h1>
      </header>

      <div className="bg-carbon-elevated/40 border-paper-100/10 backdrop-blur-xl border p-8 md:p-10">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
