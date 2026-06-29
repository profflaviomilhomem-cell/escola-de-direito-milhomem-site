"use client";

import { useMemo, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { CalculadoraDeviceMobile } from "@/components/marketing/calculadora/calculadora-device-mobile";

import { crimes } from "@/lib/business/crimes";
import {
  calcular,
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
  categoryOf,
  type Tab,
} from "./case-file-constants";

import {
  TabCalculo,
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
          .map((s) =>
            ATENUANTES_LABEL.find((x) => x.slug === s)?.label.toLowerCase(),
          )
          .join(", ")})`,
      );
    if (ag.length)
      partes.push(
        `${ag.length} agravante${ag.length > 1 ? "s" : ""} (${ag
          .map((s) =>
            AGRAVANTES_LABEL.find((x) => x.slug === s)?.label.toLowerCase(),
          )
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
    if (aum.length)
      partes.push(`${aum.length} causa${aum.length > 1 ? "s" : ""} de aumento`);
    if (dim.length)
      partes.push(
        `${dim.length} causa${dim.length > 1 ? "s" : ""} de diminuição`,
      );
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

  const devicePanel = (
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
            isMobile,
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
            isMobile,
            embedded: true,
            calcPhase,
            setCalcPhase,
          }}
        />
      )}
      {tab === "calculo" && !selectedCrime && <TabEmptyCrime embedded />}
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

  const referenceSidebar = (
    <aside className="hidden space-y-6 lg:sticky lg:top-28 lg:block lg:self-start">
      <div>
        <h3 className="text-amber mb-4 font-mono text-[11px] tracking-[0.2em] uppercase">
          Jurisprudência relacionada
        </h3>
        {jurisprudencia.length === 0 ? (
          <p className="text-paper-600 text-sm italic">
            Sem entradas cadastradas para este crime.
          </p>
        ) : (
          <ul className="space-y-3">
            {jurisprudencia.map((j, i) => (
              <li
                key={i}
                className="bg-paper-50 hover:border-amber border-amber/60 border-l-2 py-2 pl-3 transition-colors"
              >
                <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
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
        <h3 className="text-amber mb-3 font-mono text-[11px] tracking-[0.2em] uppercase">
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
            <span className="text-paper-600">· Tratado vol. 3, dosimetria</span>
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
  );

  return (
    <div
      className={`mt-2 lg:mt-10 ${
        isMobile
          ? ""
          : "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,820px)_280px] xl:justify-center xl:gap-14"
      }`}
    >
      <div className="min-w-0 lg:flex lg:justify-center">
        <CalculadoraDeviceMobile
          layout={isMobile ? "mobile" : "desktop"}
          tab={tab}
          onTabChange={setTab}
          calcPhase={calcPhase}
          onCalcPhaseChange={setCalcPhase}
          display={{
            penaFinal: result.formatado.penaFinal,
            penaBase: result.formatado.penaBase,
            penaIntermediaria: result.formatado.penaIntermediaria,
            crimeName: selectedCrime
              ? isMobile && selectedCrime.nome.length > 32
                ? `${selectedCrime.nome.slice(0, 30)}…`
                : selectedCrime.nome.length > 42
                  ? `${selectedCrime.nome.slice(0, 40)}…`
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
          {devicePanel}
        </CalculadoraDeviceMobile>
      </div>
      {!isMobile ? referenceSidebar : null}
    </div>
  );
}
