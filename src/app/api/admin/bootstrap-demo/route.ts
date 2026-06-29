import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCT = {
  id: "prod_prova_digital",
  slug: "prova-digital-no-processo-penal",
  name: "Prova Digital no Processo Penal",
  tagline: "Prova digital e cadeia de custódia — perspectiva da acusação.",
  description:
    "Curso gravado com 10 aulas (vídeo editado e slides). " +
    "Módulo I: cadeia de custódia. Módulo II: prova digital no processo penal.",
  type: "COHORT" as const,
  priceCents: 29700,
  publishStatus: "PUBLISHED" as const,
};

const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "EscolaFM2026!";

function authorized(req: Request) {
  const token = req.headers.get("x-bootstrap-token")?.trim();
  const secret = process.env.BOOTSTRAP_DEMO_TOKEN ?? process.env.AUTH_SECRET;
  return Boolean(secret && token && token === secret);
}

/** POST idempotente — curso publicado + contas demo + matrícula do aluno. */
export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const manifestPath = resolve(
      process.cwd(),
      "src/data/provas-digitais-manifest.json",
    );
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      lessons: Array<{
        number: number;
        slug: string;
        title: string;
        video?: { poster?: { path?: string } };
      }>;
    };
    const lessons = manifest.lessons.filter((l) => l.number <= 10);

    await prisma.product.upsert({
      where: { slug: PRODUCT.slug },
      create: {
        id: PRODUCT.id,
        slug: PRODUCT.slug,
        name: PRODUCT.name,
        tagline: PRODUCT.tagline,
        description: PRODUCT.description,
        type: PRODUCT.type,
        priceCents: PRODUCT.priceCents,
        publishStatus: PRODUCT.publishStatus,
        publishedAt: new Date(),
        active: true,
      },
      update: {
        name: PRODUCT.name,
        publishStatus: PRODUCT.publishStatus,
        publishedAt: new Date(),
        active: true,
      },
    });

    for (const entry of lessons) {
      await prisma.lesson.upsert({
        where: {
          productId_slug: {
            productId: PRODUCT.id,
            slug: entry.slug,
          },
        },
        create: {
          productId: PRODUCT.id,
          slug: entry.slug,
          title: entry.title,
          description: entry.title,
          coverImage: entry.video?.poster?.path ?? null,
          position: entry.number,
          durationSec: 50 * 60,
          publishedAt: entry.video ? new Date() : null,
        },
        update: {
          title: entry.title,
          position: entry.number,
        },
      });
    }

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    const users = [
      {
        email: "aluno@escolaflaviomilhomem.com.br",
        name: "Aluno Demonstração",
        role: "ALUNO" as const,
      },
      {
        email: "professor@escolaflaviomilhomem.com.br",
        name: "Professor Demonstração",
        role: "ADMIN" as const,
      },
    ];

    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        create: { ...u, passwordHash },
        update: { name: u.name, role: u.role, passwordHash },
      });
    }

    const aluno = await prisma.user.findUniqueOrThrow({
      where: { email: "aluno@escolaflaviomilhomem.com.br" },
      select: { id: true },
    });

    const product = await prisma.product.findUniqueOrThrow({
      where: { slug: PRODUCT.slug },
      select: { id: true, priceCents: true },
    });

    const existing = await prisma.order.findFirst({
      where: { userId: aluno.id, productId: product.id },
      select: { id: true },
    });

    const orderData = {
      status: "PAID" as const,
      amountCents: product.priceCents,
      paymentMethod: "MANUAL" as const,
      paymentPayload: {
        source: "bootstrap_demo_api",
        grantedAt: new Date().toISOString(),
      },
    };

    if (existing) {
      await prisma.order.update({
        where: { id: existing.id },
        data: orderData,
      });
    } else {
      await prisma.order.create({
        data: { userId: aluno.id, productId: product.id, ...orderData },
      });
    }

    return NextResponse.json({
      ok: true,
      course: PRODUCT.slug,
      lessons: lessons.length,
      accounts: users.map((u) => ({
        email: u.email,
        role: u.role,
        name: u.name,
      })),
      password: DEMO_PASSWORD,
      urls: {
        aluno: "/aluno/dashboard",
        professor: "/professor/dashboard",
        curso: `/aluno/cursos/${PRODUCT.slug}`,
      },
    });
  } catch (error) {
    console.error("[bootstrap-demo]", error);
    return NextResponse.json(
      { error: "Falha ao preparar ambiente demo" },
      { status: 500 },
    );
  }
}
