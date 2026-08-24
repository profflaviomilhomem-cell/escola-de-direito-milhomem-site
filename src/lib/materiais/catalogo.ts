/**
 * Catálogo dos materiais que o aluno baixa — slides, apostilas e o que vier.
 *
 * POR QUE ISTO EXISTE. Até 24/08/2026 os materiais moravam em `public/`, que é
 * a pasta que o Next serve para QUALQUER pessoa, sem sessão: os dez
 * `slides.pptx` do curso pago respondiam 200 a quem soubesse o endereço, e
 * ainda estavam versionados num repositório público. Material que o aluno paga
 * R$ 297 para receber não pode viver ali.
 *
 * O DESENHO. O arquivo vai para o Vercel Blob com `access: "private"` — sem URL
 * pública. Quem entrega é `/api/aluno/material/[produto]/[aula]/[tipo]`, que
 * confere sessão e matrícula antes de transmitir o conteúdo. O banco continua
 * guardando só a referência (título, tamanho), nunca o arquivo: 17 GB de acervo
 * em Postgres não é caro, é impraticável.
 *
 * A CHAVE NO BLOB é derivada por convenção, não guardada em coluna nova:
 *   curso/<produto>/<aula>/<tipo>.<ext>
 * Foi escolha deliberada — migration neste projeto exige procedimento próprio
 * (banco baselined, sem shadow database), e convenção resolve sem tocar no
 * schema. Se um dia um material fugir do padrão, aí sim entra coluna.
 */

/** Tipos de material que a rota sabe entregar. */
export const TIPOS_MATERIAL = {
  slides: {
    ext: "pptx",
    contentType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    rotulo: "Slides",
  },
  apostila: {
    ext: "pdf",
    contentType: "application/pdf",
    rotulo: "Apostila",
  },
} as const;

export type TipoMaterial = keyof typeof TIPOS_MATERIAL;

export function isTipoMaterial(v: string): v is TipoMaterial {
  return Object.hasOwn(TIPOS_MATERIAL, v);
}

/** Slug seguro: só o que compõe caminho previsível, nada de `..` ou barra. */
const SLUG_OK = /^[a-z0-9][a-z0-9-]{0,79}$/;

export function isSlugSeguro(v: string): boolean {
  return SLUG_OK.test(v);
}

/**
 * Caminho do material dentro do Blob. Não recebe entrada crua: os slugs são
 * validados antes por `isSlugSeguro`, para que nada do que vem da URL possa
 * escapar do prefixo `curso/`.
 */
export function caminhoNoBlob(
  produtoSlug: string,
  aulaSlug: string,
  tipo: TipoMaterial,
): string {
  return `curso/${produtoSlug}/${aulaSlug}/${tipo}.${TIPOS_MATERIAL[tipo].ext}`;
}

/** Nome do arquivo que o aluno vê ao salvar. */
export function nomeParaDownload(aulaSlug: string, tipo: TipoMaterial): string {
  const numero = aulaSlug.match(/(\d+)/)?.[1];
  const parte = numero ? `Aula ${numero}` : aulaSlug;
  return `${TIPOS_MATERIAL[tipo].rotulo} — ${parte}.${TIPOS_MATERIAL[tipo].ext}`;
}

/** Endereço público da rota — é isto que vai no `slidesUrl` da aula. */
export function urlDoMaterial(
  produtoSlug: string,
  aulaSlug: string,
  tipo: TipoMaterial,
): string {
  return `/api/aluno/material/${produtoSlug}/${aulaSlug}/${tipo}`;
}

/**
 * Token da store onde vivem os materiais.
 *
 * O projeto tem DUAS stores de Blob, e a diferença importa:
 *
 * - `escola-milhomem-uploads` — PÚBLICA, criada em jul/2026 para capa de blog.
 *   Capa deve mesmo ser pública: é imagem de página, vem do CDN, cacheada.
 * - `materiais-curso` — PRIVADA, criada em 24/08/2026 para material pago.
 *
 * Não é escolha de estilo: o Vercel recusa `access: "private"` numa store
 * pública, e o modo de acesso é definido na CRIAÇÃO, sem endpoint para alterar
 * depois — o próprio endereço carrega (`…public.blob…` × `…private.blob…`).
 * A primeira tentativa de migração parou nisso.
 *
 * O nome da variável vem da conexão feita no painel, com prefixo `MATERIAIS`:
 * a Vercel SUBSTITUI o "BLOB" pelo prefixo, então saiu
 * `MATERIAIS_READ_WRITE_TOKEN` e não `MATERIAIS_BLOB_READ_WRITE_TOKEN`.
 *
 * Sem essa variável, NÃO cai no token geral de propósito: apontar para a store
 * pública entregaria material pago do lugar errado. Melhor a rota responder
 * 503 e alguém notar.
 */
export function tokenDosMateriais(): string | undefined {
  return process.env.MATERIAIS_READ_WRITE_TOKEN;
}
