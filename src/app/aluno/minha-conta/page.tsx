import type { Metadata } from "next";

import { UpdatePasswordForm } from "@/components/aluno/update-password-form";
import { UpdateProfileForm } from "@/components/aluno/update-profile-form";
import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { initialsFromName } from "@/lib/course/format";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/enrollment";

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false, follow: false },
};

export default async function MinhaContaPage() {
  const session = await getSessionFromCookies();
  const name = session?.name ?? "Aluno";
  const email = session?.email ?? "";
  const initials = initialsFromName(name);
  const orders = session?.sub ? await getUserOrders(session.sub) : [];

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

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
          <h2 className="text-paper fm-mono text-[11px] tracking-[0.2em] uppercase">
            Dados pessoais
          </h2>
          <div className="border-paper-100 bg-carbon-elevated mt-6 border p-6">
            <UpdateProfileForm
              initialName={session?.name ?? ""}
              initialEmail={email}
            />
          </div>
        </section>
        <section>
          <h2 className="text-paper fm-mono text-[11px] tracking-[0.2em] uppercase">
            Segurança
          </h2>
          <div className="border-paper-100 bg-carbon-elevated mt-6 border p-6">
            <UpdatePasswordForm />
          </div>
        </section>
      </div>

      <h2 className="text-paper fm-mono mt-14 text-[11px] tracking-[0.2em] uppercase">
        Pedidos
      </h2>
      <div className="mt-6">
        {orders.length === 0 ? (
          <AreaEmptyState
            title="Nenhum pedido registrado"
            description="Suas compras e comprovantes de pagamento aparecerão aqui após a matrícula."
          />
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 10).map((o) => (
              <div
                key={o.id}
                className="border-paper-100 bg-carbon-elevated border p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-paper truncate font-semibold">
                      {o.product?.name ?? o.product?.slug ?? "Produto"}
                    </p>
                    <p className="text-paper-600 fm-mono mt-1 text-sm">
                      {o.product?.slug ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-paper fm-mono text-sm">
                      {formatMoney(o.amountCents)}
                    </p>
                    <p className="text-paper-600 fm-mono mt-1 text-xs">
                      status: {o.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
