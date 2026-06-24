"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  text: string;
  status: "CONCLUÍDO" | "EM PROGRESSO" | "PENDENTE";
  ref: string;
}

interface Subsection {
  no: string;
  title: string;
  items: ChecklistItem[];
}

interface Phase {
  index: number;
  title: string;
  description: string;
  subsections: Subsection[];
}

const statusColors = {
  CONCLUÍDO: "#10B981",
  "EM PROGRESSO": "#f59e0b",
  PENDENTE: "#94a3b8",
};

const phaseColors = [
  "#f1bb41", // Fase 0 (Gold)
  "#2f80ed", // Fase 1 (Blue)
  "#00B4D8", // Fase 2 (Cyan)
  "#9B5DE5", // Fase 3 (Purple)
  "#EF476F", // Fase 4 (Coral)
  "#10B981", // Fase 5 (Green)
  "#f59e0b", // Fase 6 (Orange)
];

export default function OrganogramaPage() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Layout mode: 'tree' (Mapa Mental) or 'board' (Abas por Fase)
  const [viewMode, setViewMode] = useState<"tree" | "board">("board"); // Default to Board now as it's the requested view
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Interactive diagram state
  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drawer state
  const [selectedItem, setSelectedItem] = useState<{
    type: "item" | "phase" | "sub";
    id: string;
    title: string;
    refCode: string;
    description: string;
    richText: string;
    status?: "CONCLUÍDO" | "EM PROGRESSO" | "PENDENTE";
    themeColor: string;
  } | null>(null);

  // Fetch checklist data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dev/checklist");
      if (!res.ok) throw new Error("Erro ao buscar dados do checklist");
      const data = await res.json();
      setPhases(data.phases);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update item status
  const updateItemStatus = async (itemId: string, newStatus: "CONCLUÍDO" | "EM PROGRESSO" | "PENDENTE") => {
    try {
      const res = await fetch("/api/dev/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Erro ao salvar status");
      
      // Update local state
      setPhases((prevPhases) =>
        prevPhases.map((phase) => ({
          ...phase,
          subsections: phase.subsections.map((sub) => ({
            ...sub,
            items: sub.items.map((item) =>
              item.id === itemId ? { ...item, status: newStatus } : item
            ),
          })),
        }))
      );
      
      // Update selected drawer item status
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert("Falha ao salvar alteração: " + err.message);
    }
  };

  // Toggle/cycle status on quick checkmark click
  const cycleStatus = (e: React.MouseEvent, item: { id: string; status: "CONCLUÍDO" | "EM PROGRESSO" | "PENDENTE" }) => {
    e.stopPropagation();
    let nextStatus: "CONCLUÍDO" | "EM PROGRESSO" | "PENDENTE" = "PENDENTE";
    if (item.status === "PENDENTE") nextStatus = "EM PROGRESSO";
    else if (item.status === "EM PROGRESSO") nextStatus = "CONCLUÍDO";
    
    updateItemStatus(item.id, nextStatus);
  };

  // Pan and zoom event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") || 
      target.closest(".circle-checkbox-btn") || 
      target.closest(".drawer") || 
      target.closest(".top-panel-header")
    ) {
      return;
    }
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.current.x);
    setPanY(e.clientY - dragStart.current.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Figma-style wheel listener (scroll to pan, ctrl+scroll to zoom)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = 0.05;
      if (e.deltaY < 0) {
        setZoomLevel((prev) => Math.min(prev + zoomFactor, 1.8));
      } else {
        setZoomLevel((prev) => Math.max(prev - zoomFactor, 0.4));
      }
    } else {
      setPanX((prev) => prev - e.deltaX);
      setPanY((prev) => prev - e.deltaY);
    }
  };

  const centerCanvas = () => {
    if (viewportRef.current && containerRef.current) {
      const vRect = viewportRef.current.getBoundingClientRect();
      const cRect = containerRef.current.getBoundingClientRect();
      setPanX((vRect.width - cRect.width * zoomLevel) / 2);
      setPanY(60);
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(0.75);
    centerCanvas();
  };

  useEffect(() => {
    if (viewMode === "tree" && phases.length > 0) {
      setTimeout(centerCanvas, 100);
    }
  }, [viewMode, phases]);

  // Calculate statistics
  const getStats = () => {
    let total = 0;
    let completed = 0;
    phases.forEach((phase) => {
      phase.subsections.forEach((sub) => {
        sub.items.forEach((item) => {
          total++;
          if (item.status === "CONCLUÍDO") completed += 1;
          else if (item.status === "EM PROGRESSO") completed += 0.5;
        });
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  const stats = getStats();

  // Selected phase variables for Tab view
  const selectedPhase = phases[activeTab];
  const activeColor = selectedPhase ? phaseColors[selectedPhase.index % phaseColors.length] : "#f1bb41";
  
  // Calculate selected tab stats
  const getTabStats = () => {
    if (!selectedPhase) return { total: 0, completed: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    selectedPhase.subsections.forEach((sub) => {
      sub.items.forEach((item) => {
        total++;
        if (item.status === "CONCLUÍDO") completed += 1;
        else if (item.status === "EM PROGRESSO") completed += 0.5;
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };
  
  const tabStats = getTabStats();

  if (loading && phases.length === 0) {
    return (
      <div className="bg-[#030024] text-[#e0e0e0] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f1bb41] mx-auto"></div>
          <p className="mt-4 font-mono text-sm tracking-widest uppercase">Carregando organograma...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#030024] text-[#e0e0e0] flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-[#242a34] rounded-xl border border-red-500/30">
          <h2 className="text-xl font-bold text-red-500">Erro de Carregamento</h2>
          <p className="mt-2 text-sm text-[#e0e0e0]/70">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-[#f1bb41] text-[#030024] font-bold rounded-lg hover:bg-[#f5ce6a] transition-colors">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-[#030024] text-[#e0e0e0] min-h-screen overflow-hidden flex flex-col relative select-none">
      {/* Styles for tree connection lines */}
      <style jsx global>{`
        .tree-row {
          display: flex;
          justify-content: center;
          position: relative;
        }
        .tree-branches {
          display: flex;
          justify-content: center;
          position: relative;
          margin-top: 40px;
        }
        .tree-branch {
          position: relative;
          padding: 40px 16px 0 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tree-branch::before, .tree-branch::after {
          content: '';
          position: absolute;
          top: 0;
          right: 50%;
          border-top: 2px solid rgba(241, 187, 65, 0.2);
          width: 50%;
          height: 40px;
        }
        .tree-branch::after {
          right: auto;
          left: 50%;
          border-left: 2px solid rgba(241, 187, 65, 0.2);
        }
        .tree-branch:only-child::after, .tree-branch:only-child::before {
          display: none;
        }
        .tree-branch:only-child {
          padding-top: 0;
        }
        .tree-branch:first-child::before, .tree-branch:last-child::after {
          border: 0 none;
        }
        .tree-branch:last-child::before {
          border-right: 2px solid rgba(241, 187, 65, 0.2);
          border-radius: 0 8px 0 0;
        }
        .tree-branch:first-child::after {
          border-radius: 8px 0 0 0;
        }
        .tree-branches::before {
          content: '';
          position: absolute;
          top: -40px;
          left: 50%;
          border-left: 2px solid rgba(241, 187, 65, 0.2);
          width: 0;
          height: 40px;
        }
      `}</style>

      {/* HEADER PANEL */}
      <div className="top-panel-header bg-[#242a34] border-b border-[#f1bb41]/20 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl z-20">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <Link href="/dev" className="text-xs font-mono px-2 py-1 bg-[#030024] border border-[#f1bb41]/20 rounded text-[#f1bb41] hover:bg-[#f1bb41]/10 transition-colors">
              ← Painel Dev
            </Link>
            <h1 className="font-bold text-lg md:text-xl tracking-tight text-[#f1bb41] uppercase Montserrat">
              Escola Flávio Milhomem
            </h1>
          </div>
          <span className="text-xs text-[#e0e0e0]/60 font-mono uppercase tracking-wider">
            Organograma &amp; Checklist de Execução Sincronizado
          </span>
        </div>

        {/* PROGRESS BAR */}
        <div className="flex-1 max-w-sm w-full flex flex-col gap-1 md:mx-4">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span>Progresso Geral do Projeto</span>
            <span className="text-[#f1bb41]">{stats.percent}%</span>
          </div>
          <div className="bg-[#030024]/60 h-2.5 rounded-full overflow-hidden border border-[#f1bb41]/10">
            <div
              className="bg-gradient-to-r from-[#f1bb41] to-[#f5ce6a] h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.percent}%` }}
            ></div>
          </div>
        </div>

        {/* VIEW MODE TOGGLE & ZOOM CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <div className="flex bg-[#030024]/60 border border-[#f1bb41]/20 rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setViewMode("tree")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                viewMode === "tree" ? "bg-[#f1bb41] text-[#030024]" : "text-[#e0e0e0]/70 hover:text-white"
              }`}
            >
              Mapa Mental
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                viewMode === "board" ? "bg-[#f1bb41] text-[#030024]" : "text-[#e0e0e0]/70 hover:text-white"
              }`}
            >
              Abas por Fase
            </button>
          </div>

          {viewMode === "tree" && (
            <>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.8))}
                className="px-2.5 py-1 bg-[#030024]/60 border border-[#f1bb41]/20 rounded-lg hover:border-[#f1bb41] hover:text-[#f1bb41] transition-all text-xs font-mono font-bold"
              >
                Zoom +
              </button>
              <button
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.4))}
                className="px-2.5 py-1 bg-[#030024]/60 border border-[#f1bb41]/20 rounded-lg hover:border-[#f1bb41] hover:text-[#f1bb41] transition-all text-xs font-mono font-bold"
              >
                Zoom -
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2.5 py-1 bg-[#030024]/60 border border-[#f1bb41]/20 rounded-lg hover:border-[#f1bb41] hover:text-[#f1bb41] transition-all text-xs font-mono font-bold"
              >
                100%
              </button>
            </>
          )}
        </div>
      </div>

      {/* VIEWPORT CONTROLLER */}
      {viewMode === "tree" ? (
        <div
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="flex-1 w-full overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#030024]"
        >
          {/* DRAGGABLE & ZOOMABLE CANVAS */}
          <div
            ref={containerRef}
            className="absolute transform-origin-top-left p-[100px] min-w-max flex flex-col items-center"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
          >
            {/* Root Node */}
            <div className="tree-row">
              <div className="node-root-container flex flex-col items-center w-[280px] relative">
                <div className="w-[60px] h-[60px] bg-[#242a34] border-3 border-[#f1bb41] rounded-full flex items-center justify-center z-10 shadow-2xl">
                  <svg className="w-8 h-8 text-[#f1bb41]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="bg-[#f1bb41] text-[#030024] font-extrabold text-[13px] py-2 px-6 rounded-t-lg mt-[-10px] z-0 uppercase tracking-wider text-center w-[90%] shadow-lg Montserrat">
                  Escola Milhomem
                </div>
                <div className="bg-[#242a34] border-2 border-[#f1bb41] rounded-b-lg w-[90%] p-3 text-center mt-[-2px] shadow-xl">
                  <span className="font-bold text-[13px] text-white tracking-wide uppercase Montserrat">
                    Checklist de Fases
                  </span>
                </div>
              </div>
            </div>

            {/* Pillars (Level 2) */}
            <div className="tree-branches">
              {phases.map((phase) => {
                const themeColor = phaseColors[phase.index % phaseColors.length];

                return (
                  <div key={phase.index} className="tree-branch" style={{ "--theme-color": themeColor } as any}>
                    {/* Phase Node (L2) */}
                    <div
                      onClick={() =>
                        setSelectedItem({
                          type: "phase",
                          id: `phase-${phase.index}`,
                          title: `Fase 0${phase.index} — ${phase.title}`,
                          refCode: `Fase 0${phase.index}`,
                          description: phase.description || "Esta fase agrupa sub-áreas de desenvolvimento focadas em entregar valor contínuo para o projeto.",
                          richText: "Utilize o checklist detalhado das sub-áreas para acompanhar e progredir nas pendências.",
                          themeColor,
                        })
                      }
                      className="node-l2-container flex flex-col items-center w-[220px] cursor-pointer"
                    >
                      <div className="l2-avatar-wrapper relative z-10">
                        <div className="absolute top-[-2px] left-[-6px] bg-[var(--theme-color)] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#242a34]">
                          0{phase.index}
                        </div>
                        <div className="w-[52px] h-[52px] bg-[#242a34] border-3 border-[var(--theme-color)] rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-[var(--theme-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                      </div>
                      <div className="l2-banner-card bg-[#242a34] border-[2.5px] border-[var(--theme-color)] rounded-xl w-full mt-[-12px] overflow-hidden shadow-lg hover:translate-y-[-3px] transition-all duration-300">
                        <div className="bg-[var(--theme-color)] text-[#030024] font-extrabold text-[10px] py-1.5 px-3 uppercase tracking-wider text-left rounded-tr-lg" style={{ clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)", width: "90%" }}>
                          Fase 0{phase.index}
                        </div>
                        <div className="p-3 text-left">
                          <h4 className="font-bold text-[12px] text-white leading-tight Montserrat">
                            {phase.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Subsections (Level 3) */}
                    {phase.subsections && phase.subsections.length > 0 && (
                      <div className="tree-branches">
                        {phase.subsections.map((sub) => (
                          <div key={sub.no} className="tree-branch">
                            {/* Subarea Node (L3) */}
                            <div
                              onClick={() =>
                                setSelectedItem({
                                  type: "sub",
                                  id: `sub-${sub.no}`,
                                  title: sub.title,
                                  refCode: `Ref ${sub.no}`,
                                  description: `Sub-área ${sub.no} da Fase 0${phase.index}.`,
                                  richText: `Clique nas bolinhas de status nos fatores abaixo para avançar as pendências.`,
                                  themeColor,
                                })
                              }
                              className="node-l3-container bg-[#242a34] border border-[var(--theme-color)] rounded-lg w-[190px] overflow-hidden shadow-md cursor-pointer hover:translate-y-[-2px] transition-all"
                            >
                              <div className="bg-[var(--theme-color)] text-[#030024] font-extrabold text-[10px] p-2 text-center uppercase tracking-wider">
                                {sub.title}
                              </div>
                              <div className="p-2.5 text-center text-[11px] text-[#e0e0e0]/60 font-semibold">
                                Fatores de {sub.no}
                              </div>
                            </div>

                            {/* Items (Level 4) */}
                            {sub.items && sub.items.length > 0 && (
                              <div className="l4-branches-row">
                                {sub.items.map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() =>
                                      setSelectedItem({
                                        type: "item",
                                        id: item.id,
                                        title: item.text,
                                        refCode: item.ref,
                                        description: item.text,
                                        richText: `Parte da Fase 0${phase.index} (${phase.title}) sob a sub-área ${sub.no} (${sub.title}).`,
                                        status: item.status,
                                        themeColor,
                                      })
                                    }
                                    className="l4-item-wrapper flex flex-col items-center cursor-pointer w-[110px]"
                                  >
                                    {/* Checkbox circle */}
                                    <div
                                      onClick={(e) => cycleStatus(e, item)}
                                      className="circle-checkbox-btn w-9 h-9 bg-[#242a34] border-2 rounded-full flex items-center justify-center z-10 transition-all shadow-md"
                                      style={{
                                        borderColor: item.status !== "PENDENTE" ? statusColors[item.status] : themeColor,
                                        backgroundColor: item.status !== "PENDENTE" ? statusColors[item.status] : "#242a34",
                                        boxShadow: item.status !== "PENDENTE" ? `0 0 12px ${statusColors[item.status]}` : "none",
                                      }}
                                    >
                                      {item.status === "CONCLUÍDO" && (
                                        <svg className="w-5 h-5 text-[#030024]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      {item.status === "EM PROGRESSO" && (
                                        <svg className="w-5 h-5 text-[#030024]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                        </svg>
                                      )}
                                      {item.status === "PENDENTE" && (
                                        <svg className="w-5 h-5 text-[#e0e0e0]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <circle cx={12} cy={12} r={9} />
                                        </svg>
                                      )}
                                    </div>

                                    <div className="mt-2 text-center w-full">
                                      <span className="font-semibold text-[10px] text-white leading-tight block line-clamp-3 h-[38px]" title={item.text}>
                                        {item.text}
                                      </span>
                                      <span className="text-[8px] text-[#e0e0e0]/40 font-bold uppercase tracking-wider block mt-1">
                                        #{sub.no}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* TABS VIEW (DIVIDIDO EM ABAS POR FASE) */
        <div 
          className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 bg-[#030024]"
          style={{ "--phase-color": activeColor } as any}
        >
          {/* Tabs bar */}
          <div className="flex border-b border-[#f1bb41]/10 pb-1 gap-1.5 overflow-x-auto scrollbar-none">
            {phases.map((phase, idx) => {
              const tabColor = phaseColors[phase.index % phaseColors.length];
              const isActive = idx === activeTab;
              return (
                <button
                  key={phase.index}
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap rounded-t-lg ${
                    isActive
                      ? "bg-white/5 border-b-3 text-white"
                      : "text-[#e0e0e0]/50 hover:text-white hover:bg-white/5"
                  }`}
                  style={{ 
                    borderBottomColor: isActive ? tabColor : "transparent",
                    color: isActive ? tabColor : ""
                  }}
                >
                  Fase 0{phase.index}
                </button>
              );
            })}
          </div>

          {/* Tab content area */}
          {selectedPhase && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Header Box */}
              <div 
                className="bg-[#242a34] border border-[#f1bb41]/10 rounded-xl p-5 shadow-xl flex flex-col gap-3"
                style={{ borderLeft: `5px solid ${activeColor}` }}
              >
                <h3 className="font-extrabold text-white text-base Montserrat tracking-wide">
                  Fase 0{selectedPhase.index} — {selectedPhase.title}
                </h3>
                <p className="text-xs text-[#e0e0e0]/70 leading-relaxed max-w-2xl">
                  {selectedPhase.description || "Esta fase agrupa um conjunto de tarefas estruturadas para o projeto."}
                </p>
                <div className="flex items-center gap-4 mt-1.5">
                  <div className="bg-[#030024]/60 h-2 flex-1 rounded-full overflow-hidden border border-[#f1bb41]/5 max-w-sm">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${tabStats.percent}%`,
                        backgroundColor: activeColor
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-black font-mono" style={{ color: activeColor }}>
                    {tabStats.percent}% Concluído
                  </span>
                  <span className="text-[10px] text-[#e0e0e0]/40 font-mono">
                    ({selectedPhase.subsections.reduce((acc, sub) => acc + sub.items.filter(i => i.status === 'CONCLUÍDO').length, 0)}/{tabStats.total} itens)
                  </span>
                </div>
              </div>

              {/* Subsections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {selectedPhase.subsections.map((sub) => (
                  <div 
                    key={sub.no}
                    className="bg-[#242a34] border border-[#f1bb41]/10 rounded-xl p-5 shadow-lg flex flex-col gap-4"
                  >
                    <h4 
                      className="font-extrabold text-xs uppercase tracking-widest pl-2"
                      style={{ borderLeft: `3px solid ${activeColor}`, color: activeColor }}
                    >
                      {sub.title}
                    </h4>

                    {/* Items List */}
                    <div className="flex flex-col gap-2">
                      {sub.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() =>
                            setSelectedItem({
                              type: "item",
                              id: item.id,
                              title: item.text,
                              refCode: item.ref,
                              description: item.text,
                              richText: `Parte da Fase 0${selectedPhase.index} (${selectedPhase.title}) sob a sub-área ${sub.no} (${sub.title}).`,
                              status: item.status,
                              themeColor: activeColor,
                            })
                          }
                          className="flex items-center gap-3 p-2.5 bg-[#030024]/40 border border-[#f1bb41]/5 hover:border-[var(--theme-color)] rounded-lg cursor-pointer transition-all hover:bg-[#030024]/80"
                          style={{ "--theme-color": activeColor } as any}
                        >
                          <div
                            onClick={(e) => cycleStatus(e, item)}
                            className="circle-checkbox-btn w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0"
                            style={{
                              borderColor: item.status !== "PENDENTE" ? statusColors[item.status] : activeColor,
                              backgroundColor: item.status !== "PENDENTE" ? statusColors[item.status] : "transparent",
                            }}
                          >
                            {item.status === "CONCLUÍDO" && (
                              <svg className="w-3.5 h-3.5 text-[#030024]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {item.status === "EM PROGRESSO" && (
                              <svg className="w-3.5 h-3.5 text-[#030024]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] text-[#e0e0e0]/90 leading-tight font-semibold flex-1">
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAILED DRAWER BACKDROP */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="drawer-backdrop active"
        ></div>
      )}

      {/* DETAILED DRAWER */}
      {selectedItem && (
        <div
          className="drawer active"
          style={{ "--theme-color": selectedItem.themeColor } as any}
        >
          <div className="drawer-header">
            <div className="drawer-header-left">
              <span className="drawer-category text-[11px] font-black tracking-widest uppercase block" style={{ color: selectedItem.themeColor }}>
                {selectedItem.type === "item" ? "Item do Checklist" : selectedItem.type === "phase" ? "Fase do Projeto" : "Sub-área de Foco"}
              </span>
              <h2 className="drawer-title Montserrat font-extrabold text-[17px] text-white mt-1">
                {selectedItem.title}
              </h2>
              <div className="drawer-badges flex gap-2 mt-2">
                {selectedItem.type === "item" && selectedItem.status && (
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: `${statusColors[selectedItem.status]}20`,
                      color: statusColors[selectedItem.status],
                      borderColor: statusColors[selectedItem.status],
                    }}
                  >
                    {selectedItem.status}
                  </span>
                )}
                <span className="status-badge bg-white/5 border-white/10 text-[#e0e0e0]/60">
                  {selectedItem.refCode}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="close-btn"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="drawer-content p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="drawer-section">
              <span className="drawer-label text-[10px] font-black text-[#e0e0e0]/40 uppercase tracking-widest block">
                Descrição
              </span>
              <div className="drawer-value text-[13px] text-[#e0e0e0]/80 mt-1.5 leading-relaxed">
                {selectedItem.description}
              </div>
            </div>

            <div className="drawer-section">
              <span className="drawer-label text-[10px] font-black text-[#e0e0e0]/40 uppercase tracking-widest block">
                Contexto Técnico &amp; Guia
              </span>
              <div className="drawer-value text-[13px] text-[#e0e0e0]/80 mt-1.5 leading-relaxed">
                {selectedItem.richText}
              </div>
            </div>

            {/* Edit Status Section for Leaf Items only */}
            {selectedItem.type === "item" && selectedItem.status && (
              <div className="drawer-section mt-auto border-t border-[#f1bb41]/10 pt-6">
                <span className="drawer-label text-[10px] font-black text-[#e0e0e0]/40 uppercase tracking-widest block mb-3">
                  Alterar Status de Execução
                </span>
                <div className="action-box bg-[#030024]/40 border border-[#f1bb41]/10 p-4 rounded-xl">
                  <div className="action-status-selector flex gap-2">
                    <button
                      onClick={() => updateItemStatus(selectedItem.id, "PENDENTE")}
                      className={`status-select-btn flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg border transition-all ${
                        selectedItem.status === "PENDENTE"
                          ? "bg-[#94a3b8]/20 border-[#94a3b8] text-white"
                          : "bg-white/5 border-white/10 text-[#e0e0e0]/60 hover:border-[#94a3b8]/50"
                      }`}
                    >
                      Pendente
                    </button>
                    <button
                      onClick={() => updateItemStatus(selectedItem.id, "EM PROGRESSO")}
                      className={`status-select-btn flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg border transition-all ${
                        selectedItem.status === "EM PROGRESSO"
                          ? "bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                          : "bg-white/5 border-white/10 text-[#e0e0e0]/60 hover:border-[#f59e0b]/50"
                      }`}
                    >
                      Progresso
                    </button>
                    <button
                      onClick={() => updateItemStatus(selectedItem.id, "CONCLUÍDO")}
                      className={`status-select-btn flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg border transition-all ${
                        selectedItem.status === "CONCLUÍDO"
                          ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                          : "bg-white/5 border-white/10 text-[#e0e0e0]/60 hover:border-[#10B981]/50"
                      }`}
                    >
                      Concluído
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
