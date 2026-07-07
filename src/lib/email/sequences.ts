/**
 * Motor de sequências de e-mail — guia 6.13.
 *
 * Definição declarativa das quatro sequências (passo → template + offset de
 * tempo a partir do início da inscrição) e as três operações do ciclo de vida:
 *   - enrollLead()      inscreve um lead (idempotente por (email, sequência));
 *   - advanceDueSends() drena os envios vencidos (chamado pelo cron horário);
 *   - cancelSequence()  cancela sequências ativas (descadastro / abandono).
 *
 * Regras invioláveis:
 *   - nunca envia para lead com `unsubscribedAt` setado (LGPD);
 *   - todo envio passa por `sendEmail` (no-op sem RESEND_API_KEY);
 *   - o relógio é INJETÁVEL (`opts.now`) — o motor nunca depende de Date.now
 *     internamente para agendar, o que torna os testes determinísticos.
 *
 * Idempotência de envio: semântica at-least-once. Enviamos e só então
 * avançamos o passo; se o avanço falhar, o próximo ciclo reenvia o mesmo
 * passo (preferimos reenviar a pular um e-mail).
 */

import type { EmailSequence } from "@prisma/client";

import { signUnsubscribeToken } from "@/lib/auth/unsubscribe-token";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/client";
import type { EmailTrackContext } from "@/lib/resend/templates/layout";
import type { SequenceTemplate } from "@/lib/resend/templates/types";
import { ABANDONED_CART_TEMPLATES } from "@/lib/resend/templates/abandoned-cart";
import { LAUNCH_TEMPLATES } from "@/lib/resend/templates/launch";
import { POST_PURCHASE_TEMPLATES } from "@/lib/resend/templates/post-purchase";
import { WELCOME_TEMPLATES } from "@/lib/resend/templates/welcome";

type SequenceStep = {
  template: SequenceTemplate;
  /** Offset em horas a partir do início (createdAt) da inscrição. */
  offsetHours: number;
};

type SequenceDefinition = {
  /** Slug curto usado no tracking (`s=`). */
  param: string;
  steps: SequenceStep[];
};

function buildSteps(
  templates: SequenceTemplate[],
  offsets: number[],
): SequenceStep[] {
  return templates.map((template, i) => ({
    template,
    offsetHours: offsets[i] ?? 0,
  }));
}

/**
 * Cadências do guia 6.13:
 *   WELCOME        dias 0/2/4/7/10           → horas 0/48/96/168/240
 *   LAUNCH         dias 0..6                 → horas 0/24/48/72/96/120/144
 *   ABANDONED_CART +1h/+12h/+36h             → horas 1/12/36
 *   POST_PURCHASE  dias 0/2/6                → horas 0/48/144
 */
export const SEQUENCES: Record<EmailSequence, SequenceDefinition> = {
  WELCOME: {
    param: "welcome",
    steps: buildSteps(WELCOME_TEMPLATES, [0, 48, 96, 168, 240]),
  },
  LAUNCH: {
    param: "launch",
    steps: buildSteps(LAUNCH_TEMPLATES, [0, 24, 48, 72, 96, 120, 144]),
  },
  // GATILHO DE ENTRADA PENDENTE: o guia pede o sinal `cart_initiated`, que
  // hoje é um evento de analytics client-side, sem persistência confiável no
  // servidor. `enrollLead("ABANDONED_CART", email)` já funciona — falta só
  // decidir a fonte de entrada (o pedido PENDING do checkout é candidato, mas
  // conflita com pagamento por PIX/boleto legitimamente em aberto). A saída
  // já está ligada: a compra concluída cancela esta sequência (webhook PAID).
  ABANDONED_CART: {
    param: "cart",
    steps: buildSteps(ABANDONED_CART_TEMPLATES, [1, 12, 36]),
  },
  POST_PURCHASE: {
    param: "post",
    steps: buildSteps(POST_PURCHASE_TEMPLATES, [0, 48, 144]),
  },
};

function addHours(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * 3_600_000);
}

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url).replace(
    /\/$/,
    "",
  );
}

/** True se QUALQUER registro de lead com este e-mail está descadastrado. */
async function isUnsubscribed(email: string): Promise<boolean> {
  const row = await prisma.lead.findFirst({
    where: { email, unsubscribedAt: { not: null } },
    select: { id: true },
  });
  return row !== null;
}

/** URL de descadastro assinada (LGPD) para o rodapé do e-mail. */
export async function buildUnsubscribeUrl(
  baseUrl: string,
  email: string,
): Promise<string> {
  const token = await signUnsubscribeToken({ email });
  return `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
}

export type EnrollResult = {
  enrolled: boolean;
  reason?: "already-active" | "unsubscribed" | "empty-sequence";
};

/**
 * Inscreve um lead numa sequência. Idempotente: se já existe inscrição ATIVA
 * na mesma sequência, não faz nada. Inscrições COMPLETED/CANCELED são
 * re-armadas do passo 0 (ex.: novo pedido reabre pós-compra).
 */
export async function enrollLead(
  sequence: EmailSequence,
  email: string,
  opts: { now?: Date; orderId?: string } = {},
): Promise<EnrollResult> {
  const now = opts.now ?? new Date();
  const def = SEQUENCES[sequence];
  if (!def || def.steps.length === 0) {
    return { enrolled: false, reason: "empty-sequence" };
  }

  if (await isUnsubscribed(email)) {
    return { enrolled: false, reason: "unsubscribed" };
  }

  const firstSendAt = addHours(now, def.steps[0].offsetHours);

  const existing = await prisma.emailSequenceEnrollment.findUnique({
    where: { leadEmail_sequence: { leadEmail: email, sequence } },
    select: { id: true, status: true },
  });

  if (existing?.status === "ACTIVE") {
    return { enrolled: false, reason: "already-active" };
  }

  if (!existing) {
    await prisma.emailSequenceEnrollment.create({
      data: {
        leadEmail: email,
        sequence,
        currentStep: 0,
        status: "ACTIVE",
        nextSendAt: firstSendAt,
        orderId: opts.orderId ?? null,
        createdAt: now,
      },
    });
  } else {
    // Re-arma a inscrição encerrada: createdAt vira a nova âncora de tempo.
    await prisma.emailSequenceEnrollment.update({
      where: { id: existing.id },
      data: {
        currentStep: 0,
        status: "ACTIVE",
        nextSendAt: firstSendAt,
        orderId: opts.orderId ?? null,
        createdAt: now,
      },
    });
  }

  return { enrolled: true };
}

export type AdvanceSummary = {
  processed: number;
  sent: number;
  completed: number;
  canceled: number;
  failed: number;
};

/**
 * Drena todos os envios vencidos (status ACTIVE, nextSendAt <= agora).
 * Envia UM passo por inscrição a cada chamada; o próximo passo é agendado
 * relativo ao createdAt (âncora), o que dá catch-up automático se um ciclo
 * for perdido.
 */
export async function advanceDueSends(
  opts: { now?: Date; limit?: number } = {},
): Promise<AdvanceSummary> {
  const now = opts.now ?? new Date();
  const limit = opts.limit ?? 100;
  const baseUrl = getBaseUrl();

  const due = await prisma.emailSequenceEnrollment.findMany({
    where: { status: "ACTIVE", nextSendAt: { not: null, lte: now } },
    orderBy: { nextSendAt: "asc" },
    take: limit,
  });

  const summary: AdvanceSummary = {
    processed: due.length,
    sent: 0,
    completed: 0,
    canceled: 0,
    failed: 0,
  };

  for (const enrollment of due) {
    const def = SEQUENCES[enrollment.sequence];
    const step = def?.steps[enrollment.currentStep];

    // Passo fora do intervalo → conclui a inscrição.
    if (!step) {
      await prisma.emailSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED", nextSendAt: null },
      });
      summary.completed += 1;
      continue;
    }

    // Guarda LGPD: descadastrado → cancela sem enviar.
    if (await isUnsubscribed(enrollment.leadEmail)) {
      await prisma.emailSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "CANCELED", nextSendAt: null },
      });
      summary.canceled += 1;
      continue;
    }

    const lead = await prisma.lead.findFirst({
      where: { email: enrollment.leadEmail },
      select: { name: true },
    });

    const ctx: EmailTrackContext = {
      baseUrl,
      email: enrollment.leadEmail,
      sequence: def.param,
      step: enrollment.currentStep,
    };
    const unsubscribeUrl = await buildUnsubscribeUrl(
      baseUrl,
      enrollment.leadEmail,
    );
    const rendered = step.template({
      ctx,
      name: lead?.name ?? undefined,
      unsubscribeUrl,
    });

    const result = await sendEmail({
      to: enrollment.leadEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    if (!result.ok) {
      // Não avança: o passo será tentado de novo no próximo ciclo.
      summary.failed += 1;
      continue;
    }

    const nextStep = enrollment.currentStep + 1;
    if (nextStep >= def.steps.length) {
      await prisma.emailSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { currentStep: nextStep, status: "COMPLETED", nextSendAt: null },
      });
      summary.completed += 1;
    } else {
      await prisma.emailSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          currentStep: nextStep,
          nextSendAt: addHours(
            enrollment.createdAt,
            def.steps[nextStep].offsetHours,
          ),
        },
      });
    }
    summary.sent += 1;
  }

  return summary;
}

/**
 * Cancela sequências ativas de um e-mail. Sem `sequence`, cancela todas
 * (usado no descadastro). Idempotente.
 */
export async function cancelSequence(
  email: string,
  sequence?: EmailSequence,
): Promise<number> {
  const result = await prisma.emailSequenceEnrollment.updateMany({
    where: {
      leadEmail: email,
      status: "ACTIVE",
      ...(sequence ? { sequence } : {}),
    },
    data: { status: "CANCELED", nextSendAt: null },
  });
  return result.count;
}
