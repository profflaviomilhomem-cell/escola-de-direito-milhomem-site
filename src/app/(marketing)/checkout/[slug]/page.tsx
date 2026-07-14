import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CheckoutForm } from "@/components/marketing/checkout-form";
import { getSessionFromCookies } from "@/lib/auth/session";
import { userHasAccess } from "@/lib/enrollment";
import { resolveCheckoutProductSlug } from "@/lib/orders/checkout-slugs";
import { getPublishedProductBySlug } from "@/lib/marketing/catalog";
import { isPagarmeConfigured } from "@/lib/pagarme/config";
import { formatBRLFromCents } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return { title: "Checkout" };
  return {
    title: `Checkout — ${product.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = resolveCheckoutProductSlug(rawSlug);
  const product = await getPublishedProductBySlug(slug);
  if (!product || product.priceCents <= 0) notFound();

  const session = await getSessionFromCookies();
  if (!session) {
    redirect(`/entrar?from=${encodeURIComponent(`/checkout/${slug}`)}`);
  }

  const hasAccess = await userHasAccess(session.sub, slug);
  if (hasAccess) {
    redirect(`/aluno/cursos/${slug}`);
  }

  const pagarmeReady = isPagarmeConfigured();

  return (
    <section className="fm-site-page py-page max-w-2xl">
      <p className="text-amber fm-mono text-[11px] tracking-[0.22em] uppercase">
        Checkout
      </p>
      <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
        Finalizar matrícula
      </h1>
      <p className="text-paper-700 mt-4 text-base leading-relaxed">
        Escolha PIX ou boleto. Após a confirmação do pagamento, o acesso ao
        curso é liberado automaticamente na área do aluno.
      </p>

      {!pagarmeReady ? (
        <div className="border-amber/30 bg-amber/10 mt-8 border p-5 text-sm leading-relaxed">
          <p className="text-paper font-medium">
            Pagamento online temporariamente indisponível.
          </p>
          <p className="text-paper-700 mt-2">
            A integração Pagar.me ainda não está configurada neste ambiente.
            Entre em contato ou use a lista de espera enquanto finalizamos a
            chave de API.
          </p>
          <Link
            href={`/cursos/${slug}`}
            className="text-amber mt-4 inline-block underline-offset-2 hover:underline"
          >
            ← Voltar ao curso
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <CheckoutForm
            productSlug={product.slug}
            productName={product.name}
            priceLabel={formatBRLFromCents(product.priceCents)}
            userName={session.name ?? "Aluno"}
            userEmail={session.email ?? ""}
          />
        </div>
      )}
    </section>
  );
}
