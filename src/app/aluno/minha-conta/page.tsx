import type { Metadata } from "next";

import { UpdatePasswordForm } from "@/components/aluno/update-password-form";
import { UpdateProfileForm } from "@/components/aluno/update-profile-form";
import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { initialsFromName } from "@/lib/course/format";
import { getSessionFromCookies } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Minha conta — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

export default async function MinhaContaPage() {
  const session = await getSessionFromCookies();
  const name = session?.name ?? "Aluno";
  const email = session?.email ?? "";
  const initials = initialsFromName(name);

  return (
    <section className="fm-site-page py-20">
      <p className="text-amber fm-mono">Conta</p>
      <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
        Minha conta
      </h1>

      <div className="border-paper-100 bg-carbon-elevated mt-10 flex items-center gap-5 border p-6">
        <span className="bg-amber text-carbon grid h-14 w-14 place-items-center rounded-full font-mono text-lg font-bold">
          {initials}
        </span>
        <div>
          <p className="text-paper font-semibold">{name}</p>
          <p className="text-paper-600 mt-1 text-sm">{email}</p>
        </div>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="text-paper fm-mono text-[11px] uppercase tracking-[0.2em]">
            Dados pessoais
          </h2>
          <div className="border-paper-100 bg-carbon-elevated mt-6 border p-6">
            <UpdateProfileForm initialName={session?.name ?? ""} initialEmail={email} />
          </div>
        </section>
        <section>
          <h2 className="text-paper fm-mono text-[11px] uppercase tracking-[0.2em]">
            Segurança
          </h2>
          <div className="border-paper-100 bg-carbon-elevated mt-6 border p-6">
            <UpdatePasswordForm />
          </div>
        </section>
      </div>

      <h2 className="text-paper fm-mono mt-14 text-[11px] uppercase tracking-[0.2em]">
        Pedidos
      </h2>
      <div className="mt-6">
        <AreaEmptyState
          title="Nenhum pedido registrado"
          description="Suas compras e comprovantes de pagamento aparecerão aqui quando o checkout estiver integrado."
        />
      </div>
    </section>
  );
}
