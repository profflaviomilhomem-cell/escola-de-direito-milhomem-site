import type { Metadata } from "next";

import { mockOrders, mockUser } from "@/data/mock-aluno";
import { getSessionFromCookies } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Minha conta — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

const PAYMENT_LABEL: Record<typeof mockOrders[number]["paymentMethod"], string> = {
  cartao: "Cartão de crédito",
  pix: "PIX",
  boleto: "Boleto",
};

const STATUS_LABEL: Record<typeof mockOrders[number]["status"], { text: string; tone: string }> = {
  pago: { text: "Pago", tone: "text-amber" },
  pendente: { text: "Pendente", tone: "text-paper-700" },
  cancelado: { text: "Cancelado", tone: "text-alerta-400" },
};

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function MinhaContaPage() {
  const session = await getSessionFromCookies();
  const name = session?.name ?? mockUser.name;
  const email = session?.email ?? mockUser.email;

  return (
    <section className="px-gutter mx-auto max-w-3xl py-20 lg:px-12">
      <p className="text-amber fm-mono">Sua conta</p>
      <h1
        className="mt-3 font-serif leading-[1.05]"
        style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
      >
        {name}.
      </h1>
      <p className="text-paper-700 mt-4 max-w-xl text-base leading-relaxed md:text-lg">
        Dados pessoais, segurança, histórico de pedidos e preferências de
        notificação. Seu acesso é vitalício; cancelamento é por aqui.
      </p>

      {/* Perfil */}
      <Section title="Perfil" eyebrow="01">
        <form className="space-y-6">
          <Field label="Nome completo" defaultValue={name} />
          <Field label="E-mail" defaultValue={email} type="email" />
          <Field
            label="Telefone (WhatsApp)"
            defaultValue=""
            placeholder="+55 (61) 9XXXX-XXXX"
          />
          <p className="text-paper-600 fm-mono">
            Mudança de e-mail dispara confirmação por link.
          </p>
          <button
            type="button"
            className="bg-amber text-carbon hover:bg-amber-soft fm-mono px-6 py-3 transition-colors"
          >
            Salvar alterações
          </button>
        </form>
      </Section>

      {/* Segurança */}
      <Section title="Segurança" eyebrow="02">
        <form className="space-y-6">
          <Field label="Senha atual" type="password" />
          <Field
            label="Nova senha"
            type="password"
            help="Mínimo 8 caracteres, máximo 72 bytes (acentos e emoji pesam mais)."
          />
          <Field label="Repetir nova senha" type="password" />
          <button
            type="button"
            className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono border px-6 py-3 transition-colors"
          >
            Trocar senha
          </button>
        </form>
        <hr className="border-paper-100 my-8" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-paper font-serif text-base">Sessões ativas</p>
            <p className="text-paper-600 mt-1 text-sm">
              1 dispositivo · este navegador · DF/Brasília
            </p>
          </div>
          <button
            type="button"
            className="border-alerta-400 text-alerta-400 hover:bg-alerta-400 hover:text-carbon fm-mono border px-4 py-2 transition-colors"
          >
            Encerrar outras sessões
          </button>
        </div>
      </Section>

      {/* Histórico de pedidos */}
      <Section title="Histórico de pedidos" eyebrow="03">
        {mockOrders.length === 0 ? (
          <p className="text-paper-600 italic">Nenhum pedido até agora.</p>
        ) : (
          <ul className="border-paper-100 divide-paper-100 divide-y border">
            {mockOrders.map((order) => {
              const status = STATUS_LABEL[order.status];
              return (
                <li
                  key={order.id}
                  className="bg-carbon-elevated flex flex-wrap items-center justify-between gap-4 p-4 md:p-5"
                >
                  <div className="min-w-0">
                    <p className="text-paper truncate font-serif">
                      {order.productName}
                    </p>
                    <p className="text-paper-600 fm-mono mt-1">
                      {new Date(order.paidAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      · {PAYMENT_LABEL[order.paymentMethod]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-paper font-mono">
                      {formatBRL(order.amountCents)}
                    </p>
                    <p className={`fm-mono mt-1 ${status.tone}`}>
                      {status.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Preferências */}
      <Section title="Notificações" eyebrow="04">
        <ul className="border-paper-100 divide-paper-100 bg-carbon-elevated divide-y border">
          <Toggle
            label="Resposta do professor no fórum"
            help="Avisos diretos quando Flávio responder o seu comentário."
            defaultOn
          />
          <Toggle
            label="Novas aulas liberadas"
            help="E-mail toda quarta às 8h, quando o módulo da semana abrir."
            defaultOn
          />
          <Toggle
            label="Boletim quinzenal externo"
            help="Newsletter Bastidor da Acusação. Você pode descadastrar pelo rodapé do e-mail."
          />
          <Toggle
            label="Lembrete de sessão ao vivo"
            help="Ping 30 minutos antes do Q&A da semana."
            defaultOn
          />
        </ul>
      </Section>

      {/* Cancelamento */}
      <Section title="Encerrar conta" eyebrow="05" tone="danger">
        <p className="text-paper-700 leading-relaxed">
          O cohort em curso continua acessível mesmo após cancelar a conta.
          Anonimizamos dados pessoais conforme LGPD; histórico financeiro é
          retido por 5 anos por exigência fiscal.
        </p>
        <button
          type="button"
          className="border-alerta-400 text-alerta-400 hover:bg-alerta-400 hover:text-carbon fm-mono mt-6 border px-6 py-3 transition-colors"
        >
          Iniciar pedido de exclusão
        </button>
      </Section>
    </section>
  );
}

function Section({
  title,
  eyebrow,
  children,
  tone,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  tone?: "danger";
}) {
  return (
    <section className="border-paper-100 mt-12 border-t pt-10">
      <header className="mb-6 flex items-end gap-4">
        <span
          className={`fm-mono ${tone === "danger" ? "text-alerta-400" : "text-amber"}`}
        >
          {eyebrow}
        </span>
        <h2 className="text-paper font-serif text-2xl leading-tight">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
  placeholder,
  help,
}: {
  label: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  help?: string;
}) {
  const id = `mc-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={id} className="block">
      <span className="text-paper-700 fm-mono">{label}</span>
      <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="border-paper-200 focus:border-amber bg-carbon text-paper mt-2 block w-full border-b px-2 py-3 outline-none transition-colors"
      />
      {help && <p className="text-paper-600 mt-2 text-xs">{help}</p>}
    </label>
  );
}

function Toggle({
  label,
  help,
  defaultOn,
}: {
  label: string;
  help: string;
  defaultOn?: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="text-paper font-serif text-base">{label}</p>
        <p className="text-paper-600 mt-1 text-sm leading-relaxed">{help}</p>
      </div>
      {/* Toggle visual estático — interatividade entra com o "wiring" */}
      <span
        aria-hidden
        className={`relative mt-1 inline-block h-6 w-11 rounded-full transition-colors ${
          defaultOn ? "bg-amber" : "bg-paper-200"
        }`}
      >
        <span
          className={`bg-paper absolute top-0.5 h-5 w-5 rounded-full transition-transform ${
            defaultOn ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </li>
  );
}
