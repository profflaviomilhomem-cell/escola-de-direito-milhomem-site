import { get } from "@vercel/blob";
import { NextResponse, type NextRequest } from "next/server";

import { getSessionFromCookies } from "@/lib/auth/session";
import { userHasAccess } from "@/lib/enrollment";
import {
  caminhoNoBlob,
  isSlugSeguro,
  isTipoMaterial,
  nomeParaDownload,
  TIPOS_MATERIAL,
} from "@/lib/materiais/catalogo";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/upstash/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/aluno/material/[produto]/[aula]/[tipo]
 *
 * Entrega um material do curso — slides, apostila — só para quem tem acesso.
 *
 * POR QUE A ROTA TRANSMITE EM VEZ DE REDIRECIONAR. O Blob sabe emitir URL
 * assinada, e seria mais barato em banda. Mas URL assinada continua válida
 * depois de sair daqui: basta o aluno colar no grupo do WhatsApp da turma para
 * o material circular por todo o prazo do token. Transmitindo, a checagem
 * acontece a cada requisição e não existe endereço para vazar. Para arquivos de
 * alguns MB — os slides têm 4,6 MB — o custo é irrelevante. VÍDEO NÃO PASSA POR
 * AQUI: os 17 GB do acervo vão para o Cloudflare Stream, que faz entrega
 * adaptativa; uma função serverless não é lugar para servir vídeo.
 *
 * Respostas: 401 sem sessão · 403 sem matrícula · 404 material inexistente ·
 * 429 excesso · 503 Blob não configurado.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ produto: string; aula: string; tipo: string }> },
) {
  const { produto, aula, tipo } = await ctx.params;

  // Validação antes de qualquer trabalho: os três compõem um caminho no Blob,
  // então nada que venha da URL pode conter barra, ponto-ponto ou maiúscula.
  if (!isSlugSeguro(produto) || !isSlugSeguro(aula) || !isTipoMaterial(tipo)) {
    return NextResponse.json(
      { ok: false, error: "Material não encontrado." },
      { status: 404 },
    );
  }

  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Faça login para baixar o material." },
      { status: 401 },
    );
  }

  // Teto por usuário: baixar material é legítimo, varrer o catálogo inteiro
  // não. 60 downloads em 10 minutos cobre folgado uma turma estudando.
  const rl = await rateLimit({
    prefix: "aluno:material",
    max: 60,
    window: "10 m",
    key: session.sub,
  });
  if (!rl.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Muitos downloads seguidos. Aguarde alguns minutos.",
      },
      { status: 429 },
    );
  }

  if (!(await userHasAccess(session.sub, produto))) {
    return NextResponse.json(
      {
        ok: false,
        error: "Este material é do curso e você ainda não tem acesso.",
      },
      { status: 403 },
    );
  }

  // A aula precisa existir E pertencer ao produto pedido — sem isto, quem tem
  // acesso a um curso baixaria material de outro trocando o slug na URL.
  const aulaNoBanco = await prisma.lesson.findFirst({
    where: { slug: aula, product: { slug: produto } },
    select: { id: true },
  });
  if (!aulaNoBanco) {
    return NextResponse.json(
      { ok: false, error: "Material não encontrado." },
      { status: 404 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Armazenamento de materiais não configurado." },
      { status: 503 },
    );
  }

  let blob;
  try {
    blob = await get(caminhoNoBlob(produto, aula, tipo), { access: "private" });
  } catch (err) {
    console.error("[aluno/material] falha ao ler do Blob:", err);
    return NextResponse.json(
      { ok: false, error: "Não foi possível abrir o material agora." },
      { status: 502 },
    );
  }

  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return NextResponse.json(
      { ok: false, error: "Material não encontrado." },
      { status: 404 },
    );
  }

  const nome = nomeParaDownload(aula, tipo);
  return new NextResponse(blob.stream, {
    status: 200,
    headers: {
      "Content-Type": blob.blob.contentType || TIPOS_MATERIAL[tipo].contentType,
      "Content-Length": String(blob.blob.size),
      // `attachment` para o navegador salvar em vez de tentar abrir o .pptx.
      // O nome vai nas duas formas: ASCII para clientes antigos, UTF-8 para os
      // que entendem — o rótulo tem travessão e acento.
      "Content-Disposition": `attachment; filename="${nome.replace(/[^\x20-\x7e]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(nome)}`,
      // Material pago: nunca em cache compartilhado, nunca no CDN.
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
