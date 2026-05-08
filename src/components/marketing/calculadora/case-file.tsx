"use client";

import { useMemo, useState } from "react";

import { crimes, type CrimePreset } from "@/lib/business/crimes";
import {
  calcular,
  labelsArt59,
  type CircunstanciaArt59,
  type DosimetriaResult,
} from "@/lib/business/dosimetria";

// ====================================================================
// CONSTANTES — atenuantes/agravantes/causas com label (UI only)
// ====================================================================

const ATENUANTES_LABEL: Array<{ slug: string; label: string }> = [
  { slug: "menoridade", label: "Menoridade relativa (< 21 anos)" },
  { slug: "confissao", label: "Confissão espontânea" },
  { slug: "reparacao", label: "Reparação do dano" },
  { slug: "coacao", label: "Coação resistível" },
  { slug: "violenta-emocao", label: "Violenta emoção" },
];

const AGRAVANTES_LABEL: Array<{ slug: string; label: string }> = [
  { slug: "reincidencia", label: "Reincidência" },
  { slug: "motivo-torpe", label: "Motivo torpe" },
  { slug: "premeditacao", label: "Premeditação" },
  { slug: "vitima-vulneravel", label: "Vítima vulnerável" },
  { slug: "concurso-pessoas", label: "Concurso de pessoas" },
];

const CAUSAS_AUMENTO: Array<{ slug: string; label: string; fracao: number }> = [
  { slug: "continuidade", label: "Continuidade delitiva (1/6 a 2/3)", fracao: 1 / 3 },
  { slug: "concurso-formal", label: "Concurso formal (1/6 a 1/2)", fracao: 1 / 6 },
  { slug: "qualificadora-aumento", label: "Causa especial — 1/3 (art. 226, II)", fracao: 1 / 3 },
  { slug: "violencia-domestica", label: "Violência doméstica (art. 61, II, f)", fracao: 1 / 2 },
];

const CAUSAS_DIMINUICAO: Array<{ slug: string; label: string; fracao: number }> = [
  { slug: "tentativa", label: "Tentativa (1/3 a 2/3) — art. 14, II", fracao: 2 / 3 },
  { slug: "arrependimento", label: "Arrependimento posterior — 1/3 a 2/3", fracao: 1 / 3 },
  { slug: "semi-imputavel", label: "Semi-imputabilidade — art. 26, p.ú.", fracao: 1 / 2 },
  { slug: "trafico-privilegiado", label: "Tráfico privilegiado — art. 33 §4°", fracao: 2 / 3 },
];

// Categorias por slug (heurística pelo artigo). 50 crimes
// distribuídos em 4 famílias para o filtro.
function categoryOf(c: CrimePreset): "patrimonio" | "pessoa" | "drogas" | "outros" {
  if (c.artigo.startsWith("Lei 11.343")) return "drogas";
  const m = c.artigo.match(/art\.\s*(\d+)/);
  if (!m) return "outros";
  const n = parseInt(m[1]!, 10);
  if (n >= 121 && n <= 154) return "pessoa";
  if (n >= 155 && n <= 183) return "patrimonio";
  return "outros";
}

// Jurisprudência mock — 5 crimes mais ensinados ganham entradas reais.
const JURISPRUDENCIA: Record<
  string,
  Array<{ tribunal: string; code: string; summary: string }>
> = {
  "furto-simples": [
    { tribunal: "STJ", code: "Súmula 599", summary: "Insignificância afastada por reincidência específica." },
    { tribunal: "STJ", code: "AgRg 1.892.401/RS", summary: "Furto noturno isolado: sem qualificadora se ausente violência." },
    { tribunal: "STF", code: "HC 168.052/SP", summary: "Bem ínfimo + ausência de antecedentes = atipicidade material." },
  ],
  "furto-qualificado": [
    { tribunal: "STJ", code: "HC 715.823/MG", summary: "Concurso de pessoas exige liame subjetivo demonstrado." },
    { tribunal: "STJ", code: "Súmula 511", summary: "Privilégio aplica-se ao §4° quando primário e bem ínfimo." },
  ],
  estelionato: [
    { tribunal: "STJ", code: "Súmula 17", summary: "Estelionato consumido pelo falso é absorvido." },
    { tribunal: "STF", code: "HC 211.890/SP", summary: "Estelionato eletrônico: competência do local da vantagem." },
  ],
  "roubo-simples": [
    { tribunal: "STJ", code: "Tese 56", summary: "Emprego de arma branca volta a qualificar (Lei 13.654/18 não retroage)." },
  ],
  "trafico-caput": [
    { tribunal: "STF", code: "RE 635.659", summary: "Distinção tráfico × usuário exige análise concreta." },
    { tribunal: "STJ", code: "HC 769.842/SP", summary: "Apreensão fracionada + balança = mercancia." },
  ],
};

// ====================================================================
// HELPERS
// ====================================================================

function formatRange(c: CrimePreset): string {
  const ANO = 365;
  const fmt = (d: number) => {
    const a = Math.round(d / ANO);
    return `${a} ano${a === 1 ? "" : "s"}`;
  };
  return `${fmt(c.minDias)} a ${fmt(c.maxDias)}`;
}

// ====================================================================
// COMPONENTE
// ====================================================================

type Tab = "dados" | "fato" | "calculo" | "sentenca" | "exportar";

export function CalculadoraCaseFile() {
  const [tab, setTab] = useState<Tab>("dados");
  const [crimeSlug, setCrimeSlug] = useState<string>(crimes[0]!.slug);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<
    "all" | "patrimonio" | "pessoa" | "drogas" | "outros"
  >("all");

  // Form state
  const [desfavoraveis, setDesfavoraveis] = useState<Set<CircunstanciaArt59>>(
    new Set(),
  );
  const [atenuantesSet, setAtenuantesSet] = useState<Set<string>>(new Set());
  const [agravantesSet, setAgravantesSet] = useState<Set<string>>(new Set());
  const [aumentosSet, setAumentosSet] = useState<Set<string>>(new Set());
  const [diminuicoesSet, setDiminuicoesSet] = useState<Set<string>>(new Set());
  const [fatoText, setFatoText] = useState("");
  const [primario, setPrimario] = useState<"sim" | "nao">("sim");
  const [antecedentes, setAntecedentes] = useState<
    "limpos" | "1-condenacao" | "multiplas"
  >("limpos");
  const [statusProc, setStatusProc] = useState<
    "ipl" | "denuncia" | "instrucao" | "sentenca"
  >("ipl");

  const crime = useMemo(
    () => crimes.find((c) => c.slug === crimeSlug)!,
    [crimeSlug],
  );

  const causasAumento = useMemo(
    () =>
      CAUSAS_AUMENTO.filter((c) => aumentosSet.has(c.slug)).map(
        (c) => c.fracao,
      ),
    [aumentosSet],
  );
  const causasDiminuicao = useMemo(
    () =>
      CAUSAS_DIMINUICAO.filter((c) => diminuicoesSet.has(c.slug)).map(
        (c) => c.fracao,
      ),
    [diminuicoesSet],
  );

  const result: DosimetriaResult = useMemo(
    () =>
      calcular({
        crimeSlug,
        desfavoraveis: Array.from(desfavoraveis),
        atenuantes: atenuantesSet.size,
        agravantes: agravantesSet.size,
        causasAumento,
        causasDiminuicao,
      }),
    [
      crimeSlug,
      desfavoraveis,
      atenuantesSet,
      agravantesSet,
      causasAumento,
      causasDiminuicao,
    ],
  );

  // Range bar marker (em %)
  const rangeMarkerPct = useMemo(() => {
    const range = crime.maxDias - crime.minDias;
    if (range <= 0) return 0;
    const pct = ((result.penaFinalDias - crime.minDias) / range) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [crime, result.penaFinalDias]);

  // Balança — diff entre atenuantes e agravantes em fração da pena-base
  const balanceAngle = useMemo(() => {
    const diff = atenuantesSet.size - agravantesSet.size; // -5 a +5
    return Math.max(-12, Math.min(12, diff * 3));
  }, [atenuantesSet, agravantesSet]);

  // Sentença textual contextual
  const sentencaFase2 = useMemo(() => {
    const at = Array.from(atenuantesSet);
    const ag = Array.from(agravantesSet);
    if (at.length === 0 && ag.length === 0)
      return "não há atenuantes ou agravantes a considerar";
    const partes: string[] = [];
    if (at.length)
      partes.push(
        `${at.length} atenuante${at.length > 1 ? "s" : ""} (${at
          .map((s) => ATENUANTES_LABEL.find((x) => x.slug === s)?.label.toLowerCase())
          .join(", ")})`,
      );
    if (ag.length)
      partes.push(
        `${ag.length} agravante${ag.length > 1 ? "s" : ""} (${ag
          .map((s) => AGRAVANTES_LABEL.find((x) => x.slug === s)?.label.toLowerCase())
          .join(", ")})`,
      );
    return `consideradas ${partes.join(" e ")}`;
  }, [atenuantesSet, agravantesSet]);

  const sentencaFase3 = useMemo(() => {
    const aum = Array.from(aumentosSet);
    const dim = Array.from(diminuicoesSet);
    if (aum.length === 0 && dim.length === 0)
      return "não incidem causas de aumento ou diminuição";
    const partes: string[] = [];
    if (aum.length) partes.push(`${aum.length} causa${aum.length > 1 ? "s" : ""} de aumento`);
    if (dim.length) partes.push(`${dim.length} causa${dim.length > 1 ? "s" : ""} de diminuição`);
    return `incidente${aum.length + dim.length > 1 ? "s" : ""} ${partes.join(" e ")}`;
  }, [aumentosSet, diminuicoesSet]);

  // Filtragem dos crimes
  const filteredCrimes = useMemo(() => {
    return crimes.filter((c) => {
      if (category !== "all" && categoryOf(c) !== category) return false;
      if (searchQuery) {
        const blob = `${c.nome} ${c.artigo}`.toLowerCase();
        if (!blob.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [searchQuery, category]);

  const categoryCounts = useMemo(
    () => ({
      all: crimes.length,
      patrimonio: crimes.filter((c) => categoryOf(c) === "patrimonio").length,
      pessoa: crimes.filter((c) => categoryOf(c) === "pessoa").length,
      drogas: crimes.filter((c) => categoryOf(c) === "drogas").length,
      outros: crimes.filter((c) => categoryOf(c) === "outros").length,
    }),
    [],
  );

  const jurisprudencia = JURISPRUDENCIA[crimeSlug] ?? [];

  // Helpers de toggle
  const toggleSet = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  // Zera todo o caso e volta para a aba inicial — usado pelo botão
  // "Novo cálculo" no cabeçalho do case file.
  const resetCase = () => {
    setTab("dados");
    setCrimeSlug(crimes[0]!.slug);
    setSearchQuery("");
    setCategory("all");
    setDesfavoraveis(new Set());
    setAtenuantesSet(new Set());
    setAgravantesSet(new Set());
    setAumentosSet(new Set());
    setDiminuicoesSet(new Set());
    setFatoText("");
    setPrimario("sim");
    setAntecedentes("limpos");
    setStatusProc("ipl");
    // Rola para o topo do case header pra reforçar visualmente o reset
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Indica se o caso já foi modificado a ponto de o reset fazer diferença.
  const hasInput =
    desfavoraveis.size > 0 ||
    atenuantesSet.size > 0 ||
    agravantesSet.size > 0 ||
    aumentosSet.size > 0 ||
    diminuicoesSet.size > 0 ||
    fatoText.trim().length > 0 ||
    crimeSlug !== crimes[0]!.slug ||
    primario !== "sim" ||
    antecedentes !== "limpos" ||
    statusProc !== "ipl";

  return (
    <div className="mt-12">
      {/* Case header */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
            Caso hipotético · #2026/001
          </p>
          <h2
            className="mt-3 font-serif leading-[1.05]"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
          >
            Calculadora ·{" "}
            <em className="text-amber italic">
              {crime.nome.toLowerCase()}
            </em>
          </h2>
          <p className="text-paper-600 mt-2 font-mono text-[11px] uppercase tracking-[0.2em]">
            {crime.artigo} · {formatRange(crime)} · pena de reclusão
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-amber/15 text-amber border-amber/40 border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em]">
            Em cálculo
          </span>
          <button
            type="button"
            onClick={resetCase}
            disabled={!hasInput}
            className="border-paper-200 text-paper-700 enabled:hover:border-amber enabled:hover:text-amber inline-flex items-center gap-2 border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Resetar e iniciar novo cálculo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Novo cálculo
          </button>
          <button
            type="button"
            className="bg-amber text-carbon hover:bg-amber-soft px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            Exportar PDF
          </button>
        </div>
      </header>

      {/* Layout: aside esquerdo + main */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]">
        {/* Aside — jurisprudência + doutrina */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <h3 className="text-amber mb-4 font-mono text-[11px] uppercase tracking-[0.2em]">
              Jurisprudência relacionada
            </h3>
            {jurisprudencia.length === 0 ? (
              <p className="text-paper-600 italic text-sm">
                Sem entradas cadastradas para este crime.
              </p>
            ) : (
              <ul className="space-y-3">
                {jurisprudencia.map((j, i) => (
                  <li
                    key={i}
                    className="bg-paper-50 hover:border-amber border-amber/60 border-l-2 py-2 pl-3 transition-colors"
                  >
                    <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
                      {j.tribunal} · {j.code}
                    </p>
                    <p className="text-paper-800 mt-1 text-[13px] leading-relaxed">
                      {j.summary}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-paper-100 border-t pt-4">
            <h3 className="text-amber mb-3 font-mono text-[11px] uppercase tracking-[0.2em]">
              Doutrina sugerida
            </h3>
            <ul className="space-y-2 text-[13px]">
              <li className="text-paper-800">
                Greco{" "}
                <span className="text-paper-600">
                  · Curso de Direito Penal vol. 1, cap. 12
                </span>
              </li>
              <li className="text-paper-800">
                Bittencourt{" "}
                <span className="text-paper-600">
                  · Tratado vol. 3, dosimetria
                </span>
              </li>
              <li className="text-paper-800">
                Nucci{" "}
                <span className="text-paper-600">
                  · Manual de Direito Penal, cap. 27
                </span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main — case file */}
        <main className="bg-carbon-elevated/80 border-paper-100 border backdrop-blur">
          {/* Tabs */}
          <div className="border-paper-100 flex flex-wrap border-b px-2 lg:px-4">
            {(
              [
                ["dados", "Dados"],
                ["fato", "Fato"],
                ["calculo", "Cálculo"],
                ["sentenca", "Sentença"],
                ["exportar", "Exportar"],
              ] as const
            ).map(([id, label]) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`-mb-px border-x border-t px-5 py-4 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                    active
                      ? "bg-amber/10 border-paper-100 text-amber border-b-transparent"
                      : "border-transparent text-paper-700 hover:text-paper"
                  }`}
                  aria-selected={active}
                  role="tab"
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-6 lg:p-10" role="tabpanel">
            {tab === "dados" && (
              <TabDados
                {...{
                  crimeSlug,
                  setCrimeSlug,
                  searchQuery,
                  setSearchQuery,
                  category,
                  setCategory,
                  categoryCounts,
                  filteredCrimes,
                  primario,
                  setPrimario,
                  antecedentes,
                  setAntecedentes,
                  statusProc,
                  setStatusProc,
                }}
              />
            )}
            {tab === "fato" && (
              <TabFato fatoText={fatoText} setFatoText={setFatoText} />
            )}
            {tab === "calculo" && (
              <TabCalculo
                {...{
                  crime,
                  result,
                  desfavoraveis,
                  setDesfavoraveis,
                  atenuantesSet,
                  setAtenuantesSet,
                  agravantesSet,
                  setAgravantesSet,
                  aumentosSet,
                  setAumentosSet,
                  diminuicoesSet,
                  setDiminuicoesSet,
                  toggleSet,
                  rangeMarkerPct,
                  balanceAngle,
                }}
              />
            )}
            {tab === "sentenca" && (
              <TabSentenca
                {...{
                  crime,
                  result,
                  desfavoraveisCount: desfavoraveis.size,
                  sentencaFase2,
                  sentencaFase3,
                  fatoText,
                }}
              />
            )}
            {tab === "exportar" && <TabExportar />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ====================================================================
// TAB · DADOS
// ====================================================================

type TabDadosProps = {
  crimeSlug: string;
  setCrimeSlug: (s: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  category: "all" | "patrimonio" | "pessoa" | "drogas" | "outros";
  setCategory: (
    c: "all" | "patrimonio" | "pessoa" | "drogas" | "outros",
  ) => void;
  categoryCounts: Record<
    "all" | "patrimonio" | "pessoa" | "drogas" | "outros",
    number
  >;
  filteredCrimes: CrimePreset[];
  primario: "sim" | "nao";
  setPrimario: (p: "sim" | "nao") => void;
  antecedentes: "limpos" | "1-condenacao" | "multiplas";
  setAntecedentes: (a: "limpos" | "1-condenacao" | "multiplas") => void;
  statusProc: "ipl" | "denuncia" | "instrucao" | "sentenca";
  setStatusProc: (s: "ipl" | "denuncia" | "instrucao" | "sentenca") => void;
};

function TabDados(props: TabDadosProps) {
  return (
    <div>
      <h2 className="mb-2 font-serif text-3xl">Dados do caso</h2>
      <p className="text-paper-700 mb-6 text-[15px]">
        Tipo penal e qualificadoras estruturam todo o cálculo subsequente.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Coluna esquerda — busca + filtros + lista */}
        <div className="space-y-4">
          <input
            type="search"
            value={props.searchQuery}
            onChange={(e) => props.setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou artigo (ex.: estelionato)…"
            className="border-paper-200 focus:border-amber bg-carbon text-paper placeholder:text-paper-600 w-full border px-4 py-3 text-sm outline-none"
          />

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Todos"],
                ["patrimonio", "Patrimônio"],
                ["pessoa", "Pessoa"],
                ["drogas", "Drogas"],
                ["outros", "Outros"],
              ] as const
            ).map(([key, label]) => {
              const active = props.category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => props.setCategory(key)}
                  className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    active
                      ? "bg-amber/10 border-amber text-amber"
                      : "border-paper-200 text-paper-700 hover:text-paper"
                  }`}
                >
                  {label} ({props.categoryCounts[key]})
                </button>
              );
            })}
          </div>

          <ul className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
            {props.filteredCrimes.length === 0 && (
              <li className="text-paper-600 italic">
                Nenhum crime corresponde ao filtro.
              </li>
            )}
            {props.filteredCrimes.map((c) => {
              const selected = c.slug === props.crimeSlug;
              return (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() => props.setCrimeSlug(c.slug)}
                    className={`group flex w-full items-center justify-between gap-3 border p-3 text-left transition-colors ${
                      selected
                        ? "bg-amber/5 border-amber"
                        : "border-paper-100 hover:border-amber/60"
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border ${selected ? "border-amber" : "border-paper-400"}`}
                    >
                      {selected && (
                        <span className="bg-amber block h-2.5 w-2.5 rounded-full" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-serif text-base leading-tight ${selected ? "text-amber" : "text-paper"}`}
                      >
                        {c.nome}
                      </span>
                      <span className="text-paper-600 mt-0.5 block font-mono text-[10px] uppercase tracking-[0.15em]">
                        {c.artigo}
                      </span>
                    </span>
                    <span className="text-paper-700 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em]">
                      {formatRange(c)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Coluna direita — situação processual */}
        <div className="space-y-5">
          <div>
            <label className="text-paper-600 mb-2 block font-mono text-[10px] uppercase tracking-[0.2em]">
              Status processual
            </label>
            <select
              value={props.statusProc}
              onChange={(e) => props.setStatusProc(e.target.value as TabDadosProps["statusProc"])}
              className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 text-sm outline-none"
            >
              <option value="ipl">Indiciamento (IPL)</option>
              <option value="denuncia">Denúncia oferecida</option>
              <option value="instrucao">Audiência de instrução</option>
              <option value="sentenca">Sentença</option>
            </select>
          </div>

          <div>
            <label className="text-paper-600 mb-2 block font-mono text-[10px] uppercase tracking-[0.2em]">
              Réu primário?
            </label>
            <div className="flex gap-3">
              {(["sim", "nao"] as const).map((p) => {
                const active = props.primario === p;
                return (
                  <label
                    key={p}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 border p-3 transition-colors ${
                      active ? "bg-amber/5 border-amber" : "border-paper-200 hover:border-amber/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="primario"
                      checked={active}
                      onChange={() => props.setPrimario(p)}
                      className="accent-amber"
                    />
                    <span className="text-sm capitalize">{p === "sim" ? "Sim" : "Não"}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-paper-600 mb-2 block font-mono text-[10px] uppercase tracking-[0.2em]">
              Antecedentes
            </label>
            <select
              value={props.antecedentes}
              onChange={(e) => props.setAntecedentes(e.target.value as TabDadosProps["antecedentes"])}
              className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 text-sm outline-none"
            >
              <option value="limpos">Sem antecedentes criminais</option>
              <option value="1-condenacao">1 condenação anterior trânsita</option>
              <option value="multiplas">Múltiplas condenações anteriores</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// TAB · FATO
// ====================================================================

function TabFato({
  fatoText,
  setFatoText,
}: {
  fatoText: string;
  setFatoText: (s: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 font-serif text-3xl">Descrição do fato</h2>
      <p className="text-paper-700 mb-6 text-[15px]">
        Narre o caso hipotético em poucos parágrafos. Esse texto entra na aba
        Sentença como prólogo do manuscrito.
      </p>
      <textarea
        rows={12}
        value={fatoText}
        onChange={(e) => setFatoText(e.target.value)}
        placeholder="Em data e local que constam dos autos, o réu, agindo com vontade livre e consciente, subtraiu para si bens de propriedade alheia consistentes em… [continue]"
        className="border-paper-200 focus:border-amber bg-carbon text-paper placeholder:text-paper-600 w-full border px-4 py-3 text-sm leading-relaxed outline-none"
      />
      <p className="text-paper-600 mt-3 flex items-center justify-between text-xs">
        <span>Markdown básico aceito · texto vai para a aba Sentença.</span>
        <span>{fatoText.length} caracteres</span>
      </p>
    </div>
  );
}

// ====================================================================
// TAB · CÁLCULO
// ====================================================================

type TabCalculoProps = {
  crime: CrimePreset;
  result: DosimetriaResult;
  desfavoraveis: Set<CircunstanciaArt59>;
  setDesfavoraveis: React.Dispatch<React.SetStateAction<Set<CircunstanciaArt59>>>;
  atenuantesSet: Set<string>;
  setAtenuantesSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  agravantesSet: Set<string>;
  setAgravantesSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  aumentosSet: Set<string>;
  setAumentosSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  diminuicoesSet: Set<string>;
  setDiminuicoesSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  toggleSet: <T,>(s: Set<T>, v: T) => Set<T>;
  rangeMarkerPct: number;
  balanceAngle: number;
};

function TabCalculo(p: TabCalculoProps) {
  const balanceLabel =
    p.atenuantesSet.size > p.agravantesSet.size
      ? "Pendendo a favor do réu"
      : p.atenuantesSet.size < p.agravantesSet.size
        ? "Pendendo contra o réu"
        : "Equilíbrio neutro";

  return (
    <div>
      <h2 className="mb-2 font-serif text-3xl">Cálculo trifásico</h2>
      <p className="text-paper-700 mb-6 text-[15px]">
        Três fases sequenciais. A balança à direita reflete o equilíbrio entre
        atenuantes e agravantes.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Esquerda — fases */}
        <div className="space-y-6">
          {/* Fase 1 */}
          <details open className="border-paper-100 group border">
            <summary className="hover:bg-paper-50 flex cursor-pointer items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-4">
                <span className="bg-amber text-carbon grid h-10 w-10 place-items-center rounded-full font-serif italic">
                  1
                </span>
                <div>
                  <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
                    Fase 1
                  </p>
                  <h3 className="font-serif text-xl leading-tight">
                    Pena-base · vetores do art. 59
                  </h3>
                </div>
              </div>
              <span className="text-paper-700 font-mono text-[11px] uppercase tracking-[0.2em]">
                {p.desfavoraveis.size} de 8
              </span>
            </summary>
            <div className="border-paper-100 border-t p-5">
              <p className="text-paper-700 mb-4 text-sm">
                Marque os vetores desfavoráveis ao acusado.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.entries(labelsArt59) as [
                  CircunstanciaArt59,
                  string,
                ][]).map(([key, label]) => {
                  const active = p.desfavoraveis.has(key);
                  return (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center gap-3 border p-3 transition-colors ${
                        active
                          ? "bg-amber/5 border-amber"
                          : "border-paper-100 hover:border-amber/60"
                      }`}
                    >
                      <FmCheck
                        checked={active}
                        onChange={() =>
                          p.setDesfavoraveis((s) => p.toggleSet(s, key))
                        }
                      />
                      <span className="text-paper text-sm">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </details>

          {/* Fase 2 */}
          <details open className="border-paper-100 border">
            <summary className="hover:bg-paper-50 flex cursor-pointer items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-4">
                <span className="bg-amber/10 border-amber text-amber grid h-10 w-10 place-items-center rounded-full border-2 font-serif italic">
                  2
                </span>
                <div>
                  <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
                    Fase 2
                  </p>
                  <h3 className="font-serif text-xl leading-tight">
                    Intermediária · atenuantes/agravantes
                  </h3>
                </div>
              </div>
              <span className="text-paper-700 font-mono text-[11px] uppercase tracking-[0.2em]">
                {p.atenuantesSet.size}A · {p.agravantesSet.size}G
              </span>
            </summary>
            <div className="border-paper-100 grid gap-4 border-t p-5 md:grid-cols-2">
              <div>
                <h4 className="text-amber mb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                  Atenuantes (−1/6 cada)
                </h4>
                <ul className="space-y-1.5">
                  {ATENUANTES_LABEL.map((a) => {
                    const active = p.atenuantesSet.has(a.slug);
                    return (
                      <li key={a.slug}>
                        <label
                          className={`flex cursor-pointer items-center gap-2 border p-2 transition-colors ${
                            active
                              ? "bg-amber/5 border-amber"
                              : "border-paper-100 hover:border-amber/60"
                          }`}
                        >
                          <FmCheck
                            checked={active}
                            onChange={() =>
                              p.setAtenuantesSet((s) => p.toggleSet(s, a.slug))
                            }
                          />
                          <span className="text-sm">{a.label}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h4 className="text-alerta-400 mb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                  Agravantes (+1/6 cada)
                </h4>
                <ul className="space-y-1.5">
                  {AGRAVANTES_LABEL.map((a) => {
                    const active = p.agravantesSet.has(a.slug);
                    return (
                      <li key={a.slug}>
                        <label
                          className={`flex cursor-pointer items-center gap-2 border p-2 transition-colors ${
                            active
                              ? "border-alerta-400 bg-alerta-400/10"
                              : "border-paper-100 hover:border-alerta-400/60"
                          }`}
                        >
                          <FmCheck
                            checked={active}
                            onChange={() =>
                              p.setAgravantesSet((s) => p.toggleSet(s, a.slug))
                            }
                          />
                          <span className="text-sm">{a.label}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </details>

          {/* Fase 3 */}
          <details open className="border-paper-100 border">
            <summary className="hover:bg-paper-50 flex cursor-pointer items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-4">
                <span className="bg-carbon-elevated border-paper-200 text-paper-700 grid h-10 w-10 place-items-center rounded-full border-2 font-serif italic">
                  3
                </span>
                <div>
                  <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
                    Fase 3
                  </p>
                  <h3 className="font-serif text-xl leading-tight">
                    Definitiva · causas
                  </h3>
                </div>
              </div>
              <span className="text-paper-700 font-mono text-[11px] uppercase tracking-[0.2em]">
                {p.aumentosSet.size}+ · {p.diminuicoesSet.size}−
              </span>
            </summary>
            <div className="border-paper-100 grid gap-4 border-t p-5 md:grid-cols-2">
              <div>
                <h4 className="text-amber mb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                  Diminuições (×)
                </h4>
                <ul className="space-y-1.5">
                  {CAUSAS_DIMINUICAO.map((d) => {
                    const active = p.diminuicoesSet.has(d.slug);
                    return (
                      <li key={d.slug}>
                        <label
                          className={`flex cursor-pointer items-center gap-2 border p-2 transition-colors ${
                            active
                              ? "bg-amber/5 border-amber"
                              : "border-paper-100 hover:border-amber/60"
                          }`}
                        >
                          <FmCheck
                            checked={active}
                            onChange={() =>
                              p.setDiminuicoesSet((s) => p.toggleSet(s, d.slug))
                            }
                          />
                          <span className="text-sm">{d.label}</span>
                          <span className="text-paper-600 ml-auto whitespace-nowrap font-mono text-[10px]">
                            ×{(1 - d.fracao).toFixed(2)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h4 className="text-alerta-400 mb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                  Aumentos (×)
                </h4>
                <ul className="space-y-1.5">
                  {CAUSAS_AUMENTO.map((a) => {
                    const active = p.aumentosSet.has(a.slug);
                    return (
                      <li key={a.slug}>
                        <label
                          className={`flex cursor-pointer items-center gap-2 border p-2 transition-colors ${
                            active
                              ? "border-alerta-400 bg-alerta-400/10"
                              : "border-paper-100 hover:border-alerta-400/60"
                          }`}
                        >
                          <FmCheck
                            checked={active}
                            onChange={() =>
                              p.setAumentosSet((s) => p.toggleSet(s, a.slug))
                            }
                          />
                          <span className="text-sm">{a.label}</span>
                          <span className="text-paper-600 ml-auto whitespace-nowrap font-mono text-[10px]">
                            ×{(1 + a.fracao).toFixed(2)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </details>
        </div>

        {/* Direita — painel de resultado */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Pena definitiva */}
          <div className="border-paper-100 bg-carbon border p-6 text-center">
            <p className="text-paper-600 mb-2 font-mono text-[10px] uppercase tracking-[0.2em]">
              Pena definitiva (parcial)
            </p>
            <p
              className="text-amber font-serif leading-none"
              style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
            >
              {p.result.formatado.penaFinal}
            </p>
            <div className="mt-5">
              <div className="text-paper-600 mb-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.15em]">
                <span>{formatRange(p.crime).split(" a ")[0]}</span>
                <span>{formatRange(p.crime).split(" a ")[1]}</span>
              </div>
              <div className="bg-paper-200 relative h-[2px]">
                <span
                  className="bg-amber absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
                  style={{
                    left: `${p.rangeMarkerPct}%`,
                    boxShadow: "0 0 12px rgba(221, 173, 12, 0.5)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Balança SVG */}
          <div className="border-paper-100 bg-carbon flex flex-col items-center border p-6">
            <p className="text-paper-600 mb-3 font-mono text-[10px] uppercase tracking-[0.2em]">
              Balança da justiça
            </p>
            <svg viewBox="0 0 220 200" className="w-full max-w-[220px]">
              <line x1="110" y1="190" x2="110" y2="60" stroke="#DDAD0C" strokeWidth="2" />
              <line x1="80" y1="190" x2="140" y2="190" stroke="#DDAD0C" strokeWidth="2" />
              <g
                style={{
                  transform: `rotate(${p.balanceAngle}deg)`,
                  transformOrigin: "110px 60px",
                  transition: "transform .5s cubic-bezier(0.34, 1.3, 0.64, 1)",
                }}
              >
                <line x1="20" y1="60" x2="200" y2="60" stroke="#DDAD0C" strokeWidth="2" />
                <line x1="20" y1="60" x2="20" y2="80" stroke="#DDAD0C" strokeWidth="1.5" />
                <ellipse cx="20" cy="84" rx="22" ry="4" fill="#DDAD0C" opacity="0.85" />
                <text x="20" y="106" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#EAE4D9" letterSpacing="1">−</text>
                <line x1="200" y1="60" x2="200" y2="80" stroke="#DDAD0C" strokeWidth="1.5" />
                <ellipse cx="200" cy="84" rx="22" ry="4" fill="#DDAD0C" opacity="0.85" />
                <text x="200" y="106" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#EAE4D9" letterSpacing="1">+</text>
                <circle cx="110" cy="60" r="4" fill="#DDAD0C" />
              </g>
            </svg>
            <p className="text-paper-700 mt-2 font-mono text-[10px] uppercase tracking-[0.2em]">
              {balanceLabel}
            </p>
          </div>

          {/* Quebra do cálculo */}
          <div className="border-paper-100 bg-carbon border p-5 font-mono text-[12px]">
            <BreakdownRow
              label="Pena-base:"
              value={p.result.formatado.penaBase}
            />
            <BreakdownRow
              label="Intermediária:"
              value={p.result.formatado.penaIntermediaria}
              bordered
            />
            <BreakdownRow
              label="Definitiva:"
              value={p.result.formatado.penaFinal}
              accent
              bordered
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  accent,
  bordered,
}: {
  label: string;
  value: string;
  accent?: boolean;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-2 ${bordered ? "border-paper-100 border-t" : ""}`}
    >
      <span className={accent ? "text-amber" : "text-paper-600"}>
        {label}
      </span>
      <span className={accent ? "text-amber font-semibold" : "text-paper"}>
        {value}
      </span>
    </div>
  );
}

function FmCheck({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <span
      className={`relative inline-grid h-[1.15rem] w-[1.15rem] flex-shrink-0 cursor-pointer place-items-center border ${
        checked
          ? "border-amber bg-amber"
          : "border-paper-400 bg-transparent"
      }`}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange();
        }
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      {checked && (
        <span className="text-carbon text-xs font-bold leading-none">✓</span>
      )}
    </span>
  );
}

// ====================================================================
// TAB · SENTENÇA
// ====================================================================

function TabSentenca({
  crime,
  result,
  desfavoraveisCount,
  sentencaFase2,
  sentencaFase3,
  fatoText,
}: {
  crime: CrimePreset;
  result: DosimetriaResult;
  desfavoraveisCount: number;
  sentencaFase2: string;
  sentencaFase3: string;
  fatoText: string;
}) {
  return (
    <div className="fm-paper-kraft relative shadow-2xl">
      <div className="border-amber/40 border-b px-8 py-6">
        <div
          className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{ color: "#1a0f04" }}
        >
          <span>República Federativa do Brasil</span>
          <span>Caso #2026/001</span>
        </div>
        <h3
          className="mt-3 font-serif text-2xl"
          style={{ color: "#1a0f04" }}
        >
          Manuscrito da{" "}
          <em className="italic" style={{ color: "#8a6a09" }}>
            sentença
          </em>
        </h3>
        <p className="mt-1 text-[13px]" style={{ color: "#1a0f04" }}>
          Atualiza-se em tempo real conforme você ajusta o cálculo.
        </p>
      </div>

      <article
        className="px-8 py-8 font-serif text-[15px] leading-[1.85]"
        style={{ color: "#2a1f10" }}
      >
        {fatoText.trim().length > 0 && (
          <p className="mb-5">
            <strong style={{ color: "#1a0f04" }}>Dos fatos.</strong> {fatoText}
          </p>
        )}

        <p className="mb-5">
          <strong style={{ color: "#1a0f04" }}>Vistos os autos.</strong>{" "}
          Trata-se de caso hipotético envolvendo o crime de{" "}
          <strong style={{ color: "#8a6a09" }}>
            {crime.nome.toLowerCase()} ({crime.artigo})
          </strong>
          , cuja pena cominada varia de{" "}
          <span style={{ color: "#8a6a09" }}>{formatRange(crime)}</span> de
          reclusão.
        </p>

        <p className="mb-5">
          Atendendo às circunstâncias judiciais do art. 59, verificou-se que{" "}
          <span style={{ color: "#8a6a09" }}>
            {desfavoraveisCount} d{desfavoraveisCount === 1 ? "os 8" : "os 8"}{" "}
            vetores
          </span>{" "}
          depõem contra o acusado, fixando-se a <strong>pena-base</strong> em{" "}
          <strong style={{ color: "#8a6a09" }}>
            {result.formatado.penaBase}
          </strong>
          .
        </p>

        <p className="mb-5">
          Na fase intermediária, {sentencaFase2}, resultando em{" "}
          <strong style={{ color: "#8a6a09" }}>
            {result.formatado.penaIntermediaria}
          </strong>
          .
        </p>

        <p className="mb-7">
          Em última fase, {sentencaFase3}, fixando-se a{" "}
          <strong>
            pena definitiva em{" "}
            <span style={{ color: "#8a6a09" }}>
              {result.formatado.penaFinal}
            </span>
          </strong>
          .
        </p>

        <hr className="border-amber/40 my-7" />

        <p
          className="text-[13px] italic"
          style={{ color: "rgba(26,15,4,0.7)" }}
        >
          Documento didático. Não vincula MPDFT, Escola ou o Prof. Flávio
          Milhomem em sua condição funcional.
        </p>
      </article>
    </div>
  );
}

// ====================================================================
// TAB · EXPORTAR
// ====================================================================

function TabExportar() {
  const formatos = [
    {
      eyebrow: "PDF · A4",
      title: "Sentença formal",
      desc: "Manuscrito em papel kraft, cabeçalho institucional, hash de validação no rodapé.",
    },
    {
      eyebrow: "PDF · resumo",
      title: "Memorial técnico",
      desc: "Duas páginas com o cálculo passo a passo, jurisprudência citada e legislação aplicada.",
    },
    {
      eyebrow: "JSON · API",
      title: "Estrutura bruta",
      desc: "Para integração com outros sistemas. Inclui todos os parâmetros e o resultado de cada fase.",
    },
  ];
  return (
    <div>
      <h2 className="mb-2 font-serif text-3xl">Exportar caso</h2>
      <p className="text-paper-700 mb-8 text-[15px]">
        Escolha o formato. Cada exportação inclui hash de validação único em{" "}
        <code className="text-amber font-mono text-xs">/calc/[hash]</code>.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {formatos.map((f) => (
          <button
            key={f.title}
            type="button"
            className="border-paper-200 hover:border-amber bg-carbon-elevated group border p-6 text-left transition-colors"
          >
            <p className="text-amber mb-3 font-mono text-[10px] uppercase tracking-[0.2em]">
              {f.eyebrow}
            </p>
            <h3 className="group-hover:text-amber mb-2 font-serif text-xl">
              {f.title}
            </h3>
            <p className="text-paper-700 text-sm leading-relaxed">{f.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
