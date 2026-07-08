# PROMPT — Gerador de Organograma / Checklist Mestre (genérico, espelho de projeto)

> Cole este prompt num LLM **junto com o material do seu projeto** (briefing, PRD, plano, transcrições, repositório, documentos). Substitua os `{{PLACEHOLDERS}}`. O resultado é **um único arquivo HTML auto-contido** — um organograma navegável + checklist mestre de execução, granular ao ponto de mapear cada gap, pendência e credencial faltante.

---

## PRINCÍPIO ZERO — ESTE ARTEFATO É UM ESPELHO

Tudo que é **conteúdo, rótulo, vocabulário e identidade visual deve ser herdado do PROJETO onde o prompt for usado** — não deste documento. Os exemplos abaixo são **ilustrativos**; descarte-os e adote o que o projeto realmente usa:

- **Nomenclatura:** se o projeto chama as etapas de "Sprints", "Marcos", "Ondas" ou "Fases", use o termo dele. Se agrupa por "Épicos", "Áreas" ou "Módulos", use o dele.
- **Referências:** se a fonte cita capítulos (`Cap 4.2`), use isso; se usa tickets (`JIRA-123`), arquivos (`src/x.ts`) ou números de seção, use isso.
- **Identidade visual:** adote as cores, a tipografia e o tom do projeto (design tokens, logo, paleta). Sem identidade definida → use um neutro sóbrio. **Não imponha nenhum estilo deste prompt.**
- **Título e textos da interface:** derivados do projeto.

O prompt define **a mecânica** (estrutura em árvore, modelo de status, persistência honesta, regras de progresso). O **conteúdo e a pele** vêm do projeto.

---

## CONTEXTO DO PROJETO (preencher)

- **Nome / título do artefato:** {{NOME}}
- **Subtítulo / 1 frase do que é:** {{SUBTITULO}}
- **Domínio / setor:** {{DOMINIO}}
- **Material-fonte anexado:** {{LISTA_DE_FONTES}}
- **Estado atual real (o que já existe vs. não):** {{ESTADO_ATUAL}}
- **Identidade visual a espelhar:** {{CORES / FONTES / TOM — ou "neutro"}}
- **Vocabulário do projeto:** {{como chama etapas, grupos, referências}}
- **Idioma de saída:** {{ex.: pt-BR}}

---

## TAREFA

Gere **UM ÚNICO arquivo `.html` auto-contido** (CSS e JS inline; sem build; idealmente sem dependência de rede para abrir offline) que renderize um **organograma em árvore navegável** funcionando como **checklist mestre de execução granular** do projeto.

**Regra de ouro da granularidade:** cada decisão, requisito, gap, pendência, credencial e dependência presente no material-fonte vira um nó. Prefira **muitos nós atômicos** a poucos nós amplos. Se o material tem ~300 micro-decisões, gere ~300 nós.

---

## ARQUITETURA DA ÁRVORE (4 níveis)

1. **RAIZ (L1):** o projeto — banner central.
2. **GRUPOS (L2):** 3 a 6 grandes eixos do projeto (use o agrupamento real do projeto). Cada um com número, ícone, cor-tema e título curto.
3. **SUBGRUPOS (L3):** 2+ por grupo, cada um com a referência à fonte (no esquema do projeto).
4. **NÓS-FOLHA (L4):** os itens atômicos do checklist. Injetados sob o subgrupo pai e clicáveis para abrir o **drawer de detalhe**.

> Os nomes dos níveis ("Grupos", "Subgrupos"…) são funcionais — exiba os que o projeto usa.

---

## MODELO DE STATUS (4 estados + 1 marcador)

| Status           | Significado                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| **CONCLUÍDO**    | Executado, **verificável** E com **todos os dados/credenciais preenchidos e funcionando ponta-a-ponta**. |
| **EM PROGRESSO** | Iniciado / parcial.                                                                                      |
| **ROADMAP**      | Especificado, build futuro planejado.                                                                    |
| **PENDENTE**     | Não iniciado / externo / bloqueado.                                                                      |

Cores: defina conforme a identidade do projeto (sugestão neutra: concluído=verde, progresso=âmbar, roadmap=azul/roxo, pendente=cinza/vermelho).

### Regra dura de "CONCLUÍDO" (honestidade)

- Só marque **CONCLUÍDO** o que for comprovável pela realidade do projeto. Na dúvida → `EM PROGRESSO` (ou marque `[status?]` no `rich`). **Nunca infle progresso.**
- **Código/entrega pronto MAS travado por chave de API, credencial, asset, dado externo ou integração ainda não preenchida NÃO é CONCLUÍDO.** Fica **EM PROGRESSO** com a marca **`AGUARDA CHAVE: <NOME>`** no `rich` (ver marcador 🔑 abaixo).
- Exceção: integração explicitamente **opcional / com no-op gracioso** sem a credencial não impede concluir um nó cujos entregáveis principais não dependem dela (registre a ressalva no `rich`).

### Marcador 🔑 "Aguarda chave" (NÃO é um 5º status)

É um **badge sobreposto** a nós EM PROGRESSO/PENDENTE — distingue _"pronto, só falta a credencial"_ de _"precisa de trabalho real"_, sem afetar a contagem de progresso.

- **Detecção automática:** qualquer nó cujo `rich` contenha `AGUARDA CHAVE: <NOME>` ganha o badge; o `<NOME>` aparece no tooltip/pílula.
- **Renderiza em 3 lugares:** entrada na legenda; badge no nó da árvore (com o nome da credencial no title); pílula no drawer ao lado do status.
- **Some sozinho** quando a credencial é preenchida e o nó concluído — basta remover a marca do `rich`. Sem manutenção manual de listas.

---

## LINHA DO TEMPO / ETAPAS

Defina de 3 a 6 **etapas sequenciais** com o nome que o projeto usa (Fases, Sprints, Marcos, Ondas…), cada uma com rótulo e cor. Todo nó-folha recebe uma etapa. Exiba a legenda de etapas no topo.

---

## SCHEMA DE CADA NÓ-FOLHA (objeto JS)

```js
{
  "id": "slug-unico-kebab",          // identificador único
  "parent": "id-do-subgrupo-L3",     // a qual subgrupo pertence
  "title": "Ação atômica e específica",
  "sub": "rótulo curto de categoria",
  "theme": "var(--color-N)",         // herda a cor do grupo pai
  "ref": "referência à fonte",       // no esquema do projeto (cap / ticket / arquivo)
  "status": "EM PROGRESSO",          // um dos 4 status
  "phase": 0,                        // índice da etapa
  "order": 1,                        // ordem dentro do subgrupo
  "dependsOn": ["id-de-outro-no"],   // dependências (cronologia)
  "desc": "Descrição objetiva em 1 frase.",
  "rich": "Detalhe + foco. SEMPRE explicitar gaps, pendências e credenciais faltantes."
}
```

### Convenção do campo `rich` (é AQUI que cada gap/pendência aparece)

- `GAP: ...` → o que falta, está incompleto ou não verificado.
- `RESOLVIDO: ...` → decisão fechada / item entregue (com evidência).
- `AGUARDA CHAVE: <NOME>` → código pronto, travado só por credencial/dado externo (dispara o badge 🔑).
- `BLOQUEIO: ...` → depende de algo externo não-credencial (asset, terceiro, decisão).
- `[status?]` → o status precisa de confirmação humana.

Todo nó que **não** estiver 100% concluído deve conter ao menos um `GAP:`, `AGUARDA CHAVE:` ou `BLOQUEIO:` dizendo exatamente o que falta.

---

## FONTE ÚNICA DE VERDADE + ANTI-DESATUALIZAÇÃO (crítico)

**O arquivo é a única fonte de verdade.** Garanta:

1. **Um só artefato por projeto.** Nada de cópias paralelas nem gerador concorrente que sobrescreva o arquivo. Nome de arquivo **sem espaços** (espaço quebra `file://` e ferramentas).
2. **`localStorage` serve só para overrides interativos do usuário — NUNCA pode mascarar o arquivo.** Implemente auto-invalidação:
   - No load, **antes** de aplicar qualquer coisa salva, calcule uma **impressão digital** dos status **como escritos no arquivo** (ex.: `dataItems.map(i => i.id + ':' + i.status).join('|')`).
   - Salve snapshots como envelope `{ fingerprint, items }`.
   - Ao carregar: se `snapshot.fingerprint !== fingerprintAtual` (= o arquivo foi editado desde o save) **ou** o formato é antigo/ inválido → **descarte e limpe a chave**; só aplique se baterem.
   - **Versione a chave** (`..._vN`) para invalidar formatos legados de imediato.
   - Consequência: **toda edição do arquivo invalida overrides velhos → o organograma sempre reflete o arquivo.** Os cliques do usuário só persistem enquanto o arquivo não muda.
3. **Atenção (armadilha real):** `localStorage` é indexado por **origem do navegador + chave**, **não** pelo nome do arquivo — renomear o `.html` **não** limpa estado velho. Por isso a impressão digital é obrigatória.

---

## FÓRMULA DE PROGRESSO

```
% = round( ( Σ(CONCLUÍDO) × 100  +  Σ(EM PROGRESSO) × 50 ) / ( total × 100 ) )
```

EM PROGRESSO conta **metade**; ROADMAP e PENDENTE contam **zero**. Recalculado em runtime a partir dos dados (nunca hard-coded).

---

## INTERFACE (reproduzir todos os elementos)

**Barra superior:**

- Título + subtítulo (do projeto).
- Legenda dos 4 status + a entrada **🔑 Aguarda chave (código pronto · falta credencial)**.
- Legenda das etapas (injetada via JS a partir do array de etapas).
- **Barra de progresso geral** com `%` dinâmico (fórmula acima).
- Controles: **Resetar**, **Zoom +**, **Zoom −**, **100%**.

**Canvas:** árvore com **pan (arrastar)** e **zoom**; conectores entre níveis; cada grupo com sua cor-tema.

**Drawer de detalhe** (abre ao clicar num nó):

1. Categoria · Título · badges (Status, **🔑 quando houver**, Etapa, Ref).
2. **Descrição** (`desc`).
3. **Detalhes / Foco** (`rich`, exibindo os marcadores GAP/RESOLVIDO/AGUARDA CHAVE/etc.).
4. **Cronologia & Dependências** (de `dependsOn`; opcionalmente "Desbloqueia").
5. **Mudar status** — 4 botões que atualizam o nó (e salvam via o mecanismo anti-staleness acima).
6. **Código / Referência técnica** (opcional, só exibe se houver).

---

## RENDERIZAÇÃO (JS)

- A árvore L1→L3 pode ser HTML estático; os **nós-folha L4 são injetados via JS** a partir do array de dados, agrupados por `parent` e ordenados por `order`.
- `%` de progresso, legenda de etapas, badges de status e o badge 🔑 são calculados em runtime.
- O badge 🔑 é derivado do `rich` (`AGUARDA CHAVE`), não do status — portanto **persiste** quando o usuário troca o status manualmente.
- Sem frameworks. Vanilla JS + CSS custom properties para as cores de grupos/status/etapas.

---

## CRITÉRIOS DE ACEITE

- [ ] Abre offline com duplo-clique; **um único arquivo**, nome sem espaços.
- [ ] **Espelha o projeto** — nomenclatura, referências e identidade visual são do projeto, não deste prompt.
- [ ] Cobre **exaustivamente** o material-fonte — nenhuma decisão/pendência de fora.
- [ ] Cada nó incompleto declara `GAP:` / `AGUARDA CHAVE:` / `BLOQUEIO:` explícito.
- [ ] **Nenhum** nó travado por credencial está como CONCLUÍDO (estão EM PROGRESSO + badge 🔑).
- [ ] `localStorage` versionado com impressão digital — editar o arquivo invalida snapshots velhos; o organograma sempre reflete o arquivo.
- [ ] Progresso usa a fórmula (concluído=100, em progresso=50) e recalcula em runtime.
- [ ] Drawer, troca de status, persistência honesta, badge 🔑, pan e zoom funcionam.
- [ ] Ao final, informe **total de nós**, **distribuição por status** e **quantos estão 🔑 aguardando chave** (com quais credenciais).

---

### Entregue apenas o arquivo HTML completo, pronto para salvar e abrir.
