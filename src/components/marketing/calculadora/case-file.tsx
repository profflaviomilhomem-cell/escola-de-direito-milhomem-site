"use client";

import { useMemo, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { CalculadoraDeviceMobile } from "@/components/marketing/calculadora/calculadora-device-mobile";

import { crimes, type CrimePreset } from "@/lib/business/crimes";
import {
  calcular,
  labelsArt59,
  type CircunstanciaArt59,
  type DosimetriaResult,
} from "@/lib/business/dosimetria";

import {
  ATENUANTES_LABEL,
  AGRAVANTES_LABEL,
  CAUSAS_AUMENTO,
  CAUSAS_DIMINUICAO,
  EMPTY_DOSIMETRIA,
  JURISPRUDENCIA,
  TABS,
  categoryOf,
  formatRange,
  type Tab,
} from "./case-file-constants";

import {
  CalcTabIcon,
  TabCalculo,
  TabCalculoMobile,
  TabDados,
  TabEmptyCrime,
  TabExportar,
  TabFato,
  TabSentenca,
} from "./case-file-tabs";

export function CalculadoraCaseFile() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [tab, setTab] = useState<Tab>("dados");
  const [calcPhase, setCalcPhase] = useState<1 | 2 | 3>(1);
  const [crimeSlug, setCrimeSlug] = useState("");
  const [crimeListOpen, setCrimeListOpen] = useState(true);
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

  const selectedCrime = useMemo(
    () => (crimeSlug ? crimes.find((c) => c.slug === crimeSlug) : undefined),
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

  const result: DosimetriaResult = useMemo(() => {
    if (!crimeSlug) return EMPTY_DOSIMETRIA;
    return calcular({
      crimeSlug,
      desfavoraveis: Array.from(desfavoraveis),
      atenuantes: atenuantesSet.size,
      agravantes: agravantesSet.size,
      causasAumento,
      causasDiminuicao,
    });
  }, [
    crimeSlug,
    desfavoraveis,
    atenuantesSet,
    agravantesSet,
    causasAumento,
    causasDiminuicao,
  ]);

  // Range bar marker (em %)
  const rangeMarkerPct = useMemo(() => {
    if (!selectedCrime) return 0;
    const range = selectedCrime.maxDias - selectedCrime.minDias;
    if (range <= 0) return 0;
    const pct = ((result.penaFinalDias - selectedCrime.minDias) / range) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [selectedCrime, result.penaFinalDias]);

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
    setCalcPhase(1);
    setCrimeSlug("");
    setCrimeListOpen(true);
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
    crimeSlug !== "" ||
    primario !== "sim" ||
    antecedentes !== "limpos" ||
    statusProc !== "ipl";

  const mobileModeLabel = useMemo(() => {
    const labels: Record<Tab, string> = {
      dados: "TIPO PENAL",
      fato: "NARRATIVA",
      calculo: `DOSIMETRIA · FASE ${calcPhase}`,
      sentenca: "MANUSCRITO",
      exportar: "SAÍDA · BOBINA",
    };
    return labels[tab];
  }, [tab, calcPhase]);

  const mobileStatusLine = useMemo(() => {
    if (tab === "calculo") {
      if (calcPhase === 1) return `${desfavoraveis.size}/8 VET`;
      if (calcPhase === 2)
        return `${atenuantesSet.size}AT ${agravantesSet.size}AG`;
      return `${diminuicoesSet.size}− ${aumentosSet.size}+`;
    }
    if (tab === "dados") {
      if (crimeSlug && !crimeListOpen && selectedCrime) {
        const short =
          selectedCrime.nome.length > 14
            ? `${selectedCrime.nome.slice(0, 12)}…`
            : selectedCrime.nome;
        return short;
      }
      const catLabels: Record<typeof category, string> = {
        all: "Todos",
        patrimonio: "Patrimônio",
        pessoa: "Pessoa",
        drogas: "Drogas",
        outros: "Outros",
      };
      return crimeSlug ? catLabels[category] : "ESCOLHA";
    }
    if (tab === "fato") return `${fatoText.length} CHR`;
    return "PRONTO";
  }, [
    tab,
    calcPhase,
    desfavoraveis.size,
    atenuantesSet.size,
    agravantesSet.size,
    diminuicoesSet.size,
    aumentosSet.size,
    fatoText.length,
    category,
    crimeSlug,
    crimeListOpen,
    selectedCrime,
  ]);

  const mobilePanel = (
    <>
      {tab === "dados" && (
        <TabDados
          {...{
            crimeSlug,
            setCrimeSlug,
            crimeListOpen,
            setCrimeListOpen,
            selectedCrime,
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
            jurisprudencia,
            isMobile: true,
            embedded: true,
          }}
        />
      )}
      {tab === "fato" && (
        <TabFato fatoText={fatoText} setFatoText={setFatoText} embedded />
      )}
      {tab === "calculo" && selectedCrime && (
        <TabCalculo
          {...{
            crime: selectedCrime,
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
            isMobile: true,
            embedded: true,
            calcPhase,
            setCalcPhase,
          }}
        />
      )}
      {tab === "calculo" && !selectedCrime && (
        <TabEmptyCrime embedded />
      )}
      {tab === "sentenca" && selectedCrime && (
        <TabSentenca
          {...{
            crime: selectedCrime,
            result,
            desfavoraveisCount: desfavoraveis.size,
            sentencaFase2,
            sentencaFase3,
            fatoText,
            embedded: true,
          }}
        />
      )}
      {tab === "sentenca" && !selectedCrime && <TabEmptyCrime embedded />}
      {tab === "exportar" && <TabExportar embedded />}
    </>
  );

  if (isMobile) {
    return (
      <div className="mt-2 lg:mt-12">
        <CalculadoraDeviceMobile
          tab={tab}
          onTabChange={setTab}
          calcPhase={calcPhase}
          onCalcPhaseChange={setCalcPhase}
          display={{
            penaFinal: result.formatado.penaFinal,
            penaBase: result.formatado.penaBase,
            penaIntermediaria: result.formatado.penaIntermediaria,
            crimeName: selectedCrime
              ? selectedCrime.nome.length > 32
                ? `${selectedCrime.nome.slice(0, 30)}…`
                : selectedCrime.nome
              : "Selecione o crime",
            artigo: selectedCrime?.artigo ?? "—",
            modeLabel: mobileModeLabel,
            statusLine: mobileStatusLine,
          }}
          onReset={resetCase}
          resetDisabled={!hasInput}
          crimeCategory={category}
          onCrimeCategoryChange={(cat) => {
            setCategory(cat);
            setCrimeListOpen(true);
          }}
          crimeCategoryCounts={categoryCounts}
        >
          {mobilePanel}
        </CalculadoraDeviceMobile>
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-12">
      {/* Case header */}
      <header className="mb-5 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.18em]">
            Caso #2026/001
          </p>
          <h2
            className="text-paper mt-2 font-serif leading-[1.08] sm:mt-3"
            style={{ fontSize: "clamp(22px, 5.5vw, 44px)" }}
          >
            {selectedCrime ? selectedCrime.nome : "Selecione o crime"}
          </h2>
          <p className="text-paper-600 mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] sm:mt-2 sm:text-[11px] sm:tracking-[0.2em]">
            {selectedCrime
              ? `${selectedCrime.artigo} · ${formatRange(selectedCrime)}`
              : "Aba Crime · escolha o tipo penal"}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="bg-amber/15 text-amber border-amber/40 shrink-0 border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] sm:px-3 sm:py-2 sm:text-[11px]">
            Ao vivo
          </span>
          <button
            type="button"
            onClick={resetCase}
            disabled={!hasInput}
            className="border-paper-200 text-paper-700 enabled:hover:border-amber enabled:hover:text-amber inline-flex flex-1 items-center justify-center gap-1.5 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4 sm:text-[11px] sm:tracking-[0.2em]"
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
              aria-hidden
            >
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="sm:hidden">Zerar</span>
            <span className="hidden sm:inline">Novo cálculo</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("exportar")}
            className="bg-amber text-carbon hover:bg-amber-soft hidden px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors sm:inline-flex"
          >
            Exportar PDF
          </button>
        </div>
      </header>

      {isMobile && tab !== "calculo" && (
        <div className="border-amber/30 bg-carbon-elevated/90 mb-4 flex items-center justify-between gap-3 border px-4 py-3 backdrop-blur">
          <div>
            <p className="text-paper-600 font-mono text-[9px] uppercase tracking-[0.14em]">
              Pena definitiva
            </p>
            <p className="text-amber font-serif text-2xl leading-none">
              {result.formatado.penaFinal}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTab("calculo")}
            className="border-amber/50 text-amber shrink-0 border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em]"
          >
            Ajustar
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="hidden space-y-6 lg:sticky lg:top-24 lg:block lg:self-start">
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

        <main className="bg-carbon-elevated/80 border-paper-100 border backdrop-blur">
          <div
            className="border-paper-100 hidden flex-wrap border-b px-2 lg:flex lg:px-4"
            role="tablist"
            aria-label="Etapas da calculadora"
          >
            {TABS.map(({ id, label }) => {
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

          <div
            className="p-4 sm:p-6 lg:p-10"
            role="tabpanel"
            id={`calc-panel-${tab}`}
          >
            {tab === "dados" && (
              <TabDados
                {...{
                  crimeSlug,
                  setCrimeSlug,
                  crimeListOpen,
                  setCrimeListOpen,
                  selectedCrime,
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
                  jurisprudencia,
                  isMobile,
                }}
              />
            )}
            {tab === "fato" && (
              <TabFato fatoText={fatoText} setFatoText={setFatoText} />
            )}
            {tab === "calculo" && selectedCrime && (
              <TabCalculo
                {...{
                  crime: selectedCrime,
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
                  isMobile,
                }}
              />
            )}
            {tab === "calculo" && !selectedCrime && <TabEmptyCrime />}
            {tab === "sentenca" && selectedCrime && (
              <TabSentenca
                {...{
                  crime: selectedCrime,
                  result,
                  desfavoraveisCount: desfavoraveis.size,
                  sentencaFase2,
                  sentencaFase3,
                  fatoText,
                }}
              />
            )}
            {tab === "sentenca" && !selectedCrime && <TabEmptyCrime />}
            {tab === "exportar" && <TabExportar />}
          </div>
        </main>
      </div>

      <nav
        className="border-paper-100 bg-carbon/95 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        role="tablist"
        aria-label="Navegação da calculadora"
      >
        <div className="grid grid-cols-5">
          {TABS.map(({ id, short }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-col items-center gap-0.5 px-1 py-2.5 font-mono text-[9px] uppercase tracking-[0.08em] transition-colors ${
                  active ? "text-amber bg-amber/10" : "text-paper-600"
                }`}
                aria-selected={active}
                role="tab"
                aria-controls={`calc-panel-${id}`}
              >
                <CalcTabIcon tab={id} active={active} />
                <span>{short}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
