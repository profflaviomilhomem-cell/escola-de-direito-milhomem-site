/**
 * Sanitização de texto livre vindo do usuário (comentários do fórum, etc.).
 *
 * O conteúdo é tratado como TEXTO PURO: não há HTML permitido. No render,
 * React já escapa `{conteudo}` em nó de texto — esta função é a defesa de
 * profundidade no INPUT, garantindo que o que persiste no banco esteja limpo
 * para qualquer contexto futuro (e-mail, export, ou render via innerHTML).
 *
 * Faz:
 *  - remove tags HTML (`<script>...`, `<img onerror=...>`, etc.);
 *  - neutraliza caracteres de controle invisíveis (exceto TAB e LF);
 *  - remove zero-width e overrides bidirecionais (defesa Trojan Source / spoof);
 *  - normaliza quebras de linha e colapsa linhas em branco excessivas;
 *  - apara espaços nas bordas.
 *
 * As classes de caracteres são montadas a partir de code points (sem literais
 * invisíveis no fonte) para manter o arquivo legível e auditável.
 */

// Blocos cujo CONTEÚDO também deve sumir (não só as tags): script/style.
const RAW_BLOCKS = /<(script|style)\b[\s\S]*?<\/\1\s*>/gi;

// Tags HTML: `<`/`</` + nome de tag real + atributos (sem `<`/`>` internos).
// Antes usava `[\s\S]*?`, que casava `<` seguido de QUALQUER letra e engolia
// o texto até o próximo `>` (ex.: "a<b>c" → "ac"; comparações "x<y ... z>w").
// Agora exige nome de tag (`[a-z][a-z0-9]*`) e limita o corpo a não-`<>`, o
// que remove tags reais sem atravessar outros sinais. Resíduo conhecido: um
// trecho "<palavra outra>" ainda parece uma tag e é removido — inerente ao
// strip de texto puro; é raro em prosa (exige `<` colado a uma letra).
const HTML_TAG = /<\/?[a-z][a-z0-9]*(?:\s[^<>]*)?>/gi;

// Controle C0 (U+0000–U+001F) e C1 (U+007F–U+009F), preservando TAB e LF.
const CONTROL_CHARS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F-\\u009F]",
  "g",
);

// Zero-width, BOM e marcas/overrides bidirecionais (Trojan Source / spoofing).
const INVISIBLE = new RegExp(
  "[\\u200B-\\u200F\\u202A-\\u202E\\u2060-\\u2064\\u2066-\\u206F\\uFEFF]",
  "g",
);

export function sanitizePlainText(input: string): string {
  return input
    .replace(RAW_BLOCKS, "")
    .replace(HTML_TAG, "")
    .replace(INVISIBLE, "")
    .replace(CONTROL_CHARS, "")
    .replace(/\r\n?/g, "\n") // CRLF/CR -> LF
    .replace(/\n{3,}/g, "\n\n") // no máx. uma linha em branco
    .replace(/[ \t]+\n/g, "\n") // tira espaço no fim de cada linha
    .trim();
}
