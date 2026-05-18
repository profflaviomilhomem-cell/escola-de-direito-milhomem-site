# Calculadora de pena — alinhamento UI (mobile → desktop)

Referência aprovada em maio/2026. Ao evoluir o **desktop** (versão mais robusta), manter estes princípios e comportamentos.

## Metáfora visual

- **Calculadora de bobina** (estilo Procalc / desktop com papel): corpo escuro, LCD verde, teclado tátil.
- **Impressora no topo**: fenda + braços laterais; papel sobe verticalmente; linhas aparecem **uma a uma** (cursor ▌ na linha ativa); bobina gira enquanto imprime; respeitar `prefers-reduced-motion`.
- **Área central (papel kraft)**: conteúdo do passo atual; chips/campos com classes `fm-calc-screen-*`.

## Navegação mobile (`CalculadoraDeviceMobile`)

| Tecla | Aba |
|-------|-----|
| TIPO | Crime + filtros |
| FATO | Narrativa |
| PENA | Dosimetria (fases I–III no teclado) |
| TXT | Sentença |
| OUT | Exportar |
| CLR / PRINT | Zerar / impressão completa |

Arquivos principais: `calculadora-device-mobile.tsx`, `case-file.tsx`, `globals.css` (`.fm-calc-*`).

## Filtros de crimes

- Categorias com **nomes completos**: Todos, Patrimônio, Pessoa, Drogas, Outros (nunca abreviar PAT/PES).
- Chips horizontais com contagem; no mobile também na fileira de teclas da aba TIPO (scroll horizontal).
- **Sem crime pré-selecionado** ao abrir (`crimeSlug === ""`).
- Após selecionar um crime: **ocultar lista**; mostrar só cartão do crime escolhido + hint “Toque em um filtro para trocar”.
- **Reabrir lista** ao clicar em qualquer filtro/categoria (ou busca).
- Estado: `crimeListOpen`, `selectedCrime`, `EMPTY_DOSIMETRIA` quando não há crime.

## Dosimetria / abas

- PENA e TXT exigem crime; placeholder `TabEmptyCrime` se não houver seleção.
- Auto-impressão no LCD ao mudar pena; PRINT → cupom longo + aba exportar.
- Instrumento didático — sem valor jurídico vinculante (disclaimer no rodapé).

## Desktop (próxima fase — mais robusto)

Manter a mesma linguagem, expandindo:

- Layout em duas colunas (jurisprudência / doutrina já existem no `case-file` desktop).
- Lista de crimes com mais espaço; mesma lógica colapsar/expandir por filtro.
- Impressora/bobina pode ser maior, com histórico de linhas ou painel lateral de “cupom”.
- Não regredir o mobile: branch `useMediaQuery("(max-width: 1023px)")` → só device; desktop mantém shell atual até migração explícita.

## Teste no celular

`npm run dev` + `npm run link` (túnel HTTPS) para Android/iOS.
