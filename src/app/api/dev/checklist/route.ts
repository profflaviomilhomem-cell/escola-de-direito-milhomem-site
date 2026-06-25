import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define paths
const WORKSPACE_DIR = "/Users/carlos/BettoOrbee/clientes /Flavio Milhomem/escola_de_direito_milhomem_site";
const CHECKLIST_PATH = path.join(WORKSPACE_DIR, "docs/CHECKLIST-FASES.md");
// NÃO apontar para `organograma-checklist.html` (o MESTRE de 308 nós, gerado
// do livro-guia em 24/jun). Este gerador legado produz só os ~101 itens do
// markdown de fases e sobrescreveria o mestre a cada GET/POST. Escreve num
// arquivo separado (gitignored) para preservar o mestre.
const STATIC_HTML_PATH = path.join(WORKSPACE_DIR, ".organograma-autogen.html");

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

// Simple slug generator for IDs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, "") // remove special chars
    .substring(0, 30);
}

// Parse markdown to JSON structure
function parseChecklistMarkdown(content: string) {
  const lines = content.split("\n");
  const phases: Phase[] = [];
  
  let currentPhase: Phase | null = null;
  let currentSub: Subsection | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we hit "Controle de progresso" or anything after the main phases
    if (line.startsWith("## Controle de progresso")) {
      break;
    }
    
    // Match Phase (e.g. ## Fase 0 — Fundação produção)
    const phaseMatch = line.match(/^##\s+Fase\s+(\d+)\s*[—-]\s*(.+)$/i);
    if (phaseMatch) {
      const index = parseInt(phaseMatch[1], 10);
      const title = phaseMatch[2].trim();
      currentPhase = {
        index,
        title,
        description: "",
        subsections: [],
      };
      phases.push(currentPhase);
      currentSub = null;
      continue;
    }
    
    // Match Description for Phase (any line immediately after ## Phase that is meta/description)
    if (currentPhase && !currentSub && line.startsWith("**Meta:**")) {
      currentPhase.description = line.replace(/^\*\*Meta:\*\*/i, "").trim();
      continue;
    }
    
    // Match Subsection (e.g. ### 0.1 Infra e ambiente)
    const subMatch = line.match(/^###\s+(\d+\.\d+)\s*(.+)$/i);
    if (subMatch) {
      if (!currentPhase) continue;
      const no = subMatch[1].trim();
      const title = subMatch[2].trim();
      currentSub = {
        no,
        title,
        items: [],
      };
      currentPhase.subsections.push(currentSub);
      continue;
    }
    
    // Match Checklist Item (e.g. - [ ] Upstash Redis...)
    const itemMatch = line.match(/^-\s*\[([ x~])\]\s*(.+)$/i);
    if (itemMatch && currentSub && currentPhase) {
      const statusChar = itemMatch[1].toLowerCase();
      const text = itemMatch[2].trim();
      
      let status: "CONCLUÍDO" | "EM PROGRESSO" | "PENDENTE" = "PENDENTE";
      if (statusChar === "x") status = "CONCLUÍDO";
      else if (statusChar === "~") status = "EM PROGRESSO";
      
      const cleanText = text.replace(/—\s*[^*]+$/, "").trim(); // strip tail refs if any
      const id = `item-${currentPhase.index}-${currentSub.no.replace(".", "-")}-${slugify(cleanText)}`;
      
      let ref = `Fase ${currentPhase.index} · ${currentSub.no}`;
      
      currentSub.items.push({
        id,
        text,
        status,
        ref,
      });
    }
  }
  
  return phases;
}

// Generate static organograma HTML file
function updateStaticHtmlFile(phases: Phase[]) {
  // Let's create the JSON representation of items
  const dataItems: any[] = [];
  
  const colors = [
    "var(--color-yellow)", // Fase 0
    "var(--color-blue)",   // Fase 1
    "var(--color-cyan)",   // Fase 2
    "var(--color-purple)", // Fase 3
    "var(--color-coral)",  // Fase 4
    "var(--color-green)",  // Fase 5
    "var(--color-orange)", // Fase 6
  ];
  
  phases.forEach(phase => {
    const themeColor = colors[phase.index % colors.length];
    phase.subsections.forEach(sub => {
      sub.items.forEach(item => {
        dataItems.push({
          id: item.id,
          parent: `sub-${sub.no.replace(".", "-")}`,
          title: item.text,
          sub: `#${sub.no}`,
          theme: themeColor,
          ref: item.ref,
          status: item.status,
          desc: item.text,
          rich: `Parte do escopo planejado na Fase ${phase.index} (${phase.title}), sub-área ${sub.no} (${sub.title}).`,
        });
      });
    });
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Escola Flávio Milhomem — Organograma &amp; Checklist Mestre</title>
  <!-- Google Fonts: Inter e Montserrat -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --bg-main: #030024;
      --border-color: rgba(241, 187, 65, 0.2);
      --text-main: #e0e0e0;
      --text-muted: rgba(224, 224, 224, 0.6);
      --bg-card: #242a34;
      
      /* Colors */
      --color-yellow: #f1bb41;
      --color-blue: #2f80ed;
      --color-cyan: #00B4D8;
      --color-purple: #9B5DE5;
      --color-coral: #EF476F;
      --color-green: #10B981;
      --color-orange: #f59e0b;
      
      /* Status Colors */
      --color-concluido: #10B981;
      --color-progresso: #f59e0b;
      --color-pendente: #94a3b8;

      --font-title: 'Montserrat', sans-serif;
      --font-body: 'Inter', sans-serif;
      
      --transition: all 0.25s ease;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-main);
      color: var(--text-main);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* -------------------------------------------------------------
       PAINEL SUPERIOR
       ------------------------------------------------------------- */
    .top-panel {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      padding: 1.2rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10;
      position: relative;
    }

    .logo-area {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .logo-title {
      font-family: var(--font-title);
      font-weight: 800;
      font-size: 1.4rem;
      color: var(--color-yellow);
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }

    .logo-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .progress-section {
      flex: 1;
      max-width: 450px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .progress-bar-bg {
      background: rgba(224, 224, 224, 0.1);
      height: 8px;
      border-radius: 99px;
      overflow: hidden;
      display: flex;
    }

    .progress-bar-fill {
      background: linear-gradient(90deg, var(--color-yellow) 0%, var(--color-orange) 100%);
      width: 0%;
      height: 100%;
      border-radius: 99px;
      transition: width 0.4s ease;
    }

    .controls-area {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-action {
      background: rgba(224, 224, 224, 0.05);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.5rem 0.8rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: var(--transition);
    }

    .btn-action:hover, .btn-action.active {
      border-color: var(--color-yellow);
      color: var(--color-yellow);
      background: rgba(241, 187, 65, 0.1);
    }

    /* -------------------------------------------------------------
       CANVAS DO ORGANOGRAMA
       ------------------------------------------------------------- */
    .canvas-viewport {
      flex: 1;
      overflow: hidden;
      position: relative;
      cursor: grab;
      user-select: none;
    }

    .canvas-viewport:active {
      cursor: grabbing;
    }

    .canvas-container {
      position: absolute;
      transform-origin: 0 0;
      padding: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: max-content;
      transition: transform 0.05s linear;
    }

    /* -------------------------------------------------------------
       LINHAS DE CONEXÃO
       ------------------------------------------------------------- */
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
      padding: 40px 20px 0 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .tree-branch::before, .tree-branch::after {
      content: '';
      position: absolute;
      top: 0;
      right: 50%;
      border-top: 2px solid rgba(241, 187, 65, 0.3);
      width: 50%;
      height: 40px;
    }

    .tree-branch::after {
      right: auto;
      left: 50%;
      border-left: 2px solid rgba(241, 187, 65, 0.3);
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
      border-right: 2px solid rgba(241, 187, 65, 0.3);
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
      border-left: 2px solid rgba(241, 187, 65, 0.3);
      width: 0;
      height: 40px;
    }

    /* -------------------------------------------------------------
       DESIGN DOS NÓS
       ------------------------------------------------------------- */
    .node-root-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      width: 280px;
    }

    .root-avatar {
      width: 60px;
      height: 60px;
      background: var(--bg-card);
      border: 3px solid var(--color-yellow);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      box-shadow: 0 6px 15px rgba(0,0,0,0.5);
      position: relative;
    }

    .root-avatar svg {
      width: 32px;
      height: 32px;
      color: var(--color-yellow);
    }

    .root-banner {
      background: var(--color-yellow);
      color: var(--bg-main);
      font-family: var(--font-title);
      font-weight: 800;
      font-size: 0.8rem;
      padding: 0.6rem 1.5rem;
      border-radius: 8px 8px 0 0;
      margin-top: -10px;
      z-index: 1;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-align: center;
      width: 90%;
      box-shadow: 0 4px 10px rgba(241, 187, 65, 0.3);
    }

    .root-box {
      background: var(--bg-card);
      border: 2px solid var(--color-yellow);
      border-radius: 0 0 10px 10px;
      width: 90%;
      padding: 0.8rem;
      text-align: center;
      margin-top: -2px;
      box-shadow: 0 6px 15px rgba(0,0,0,0.3);
    }

    .root-box-title {
      font-family: var(--font-title);
      font-weight: 700;
      font-size: 0.8rem;
      color: #ffffff;
      letter-spacing: 0.5px;
    }

    /* PILARES (LEVEL 2) */
    .node-l2-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 220px;
      cursor: pointer;
    }

    .l2-avatar-wrapper {
      position: relative;
      z-index: 2;
    }

    .l2-avatar {
      width: 52px;
      height: 52px;
      background: var(--bg-card);
      border: 3px solid var(--theme-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    }

    .l2-avatar svg {
      width: 26px;
      height: 26px;
      color: var(--theme-color);
    }

    .l2-number-badge {
      position: absolute;
      top: -2px;
      left: -6px;
      background: var(--theme-color);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 800;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--bg-card);
    }

    .l2-banner-card {
      background: var(--bg-card);
      border: 2.5px solid var(--theme-color);
      border-radius: 12px;
      width: 100%;
      margin-top: -12px;
      overflow: hidden;
      box-shadow: 0 6px 15px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      transition: var(--transition);
    }

    .node-l2-container:hover .l2-banner-card {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.5), 0 0 15px rgba(255,255,255,0.02);
    }

    .l2-banner-header {
      background: var(--theme-color);
      color: #fff;
      font-family: var(--font-title);
      font-weight: 700;
      font-size: 0.7rem;
      padding: 0.65rem 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      clip-path: polygon(0 0, 85% 0, 100% 100%, 0 100%);
      width: 90%;
    }

    .l2-banner-body {
      padding: 0.7rem 0.8rem;
      text-align: left;
    }

    .l2-banner-title {
      font-family: var(--font-title);
      font-weight: 700;
      font-size: 0.75rem;
      color: #ffffff;
    }

    /* SUB-ÁREAS (LEVEL 3) */
    .node-l3-container {
      background: var(--bg-card);
      border: 1.5px solid var(--theme-color);
      border-radius: 10px;
      width: 190px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: var(--transition);
    }

    .node-l3-container:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0,0,0,0.4);
    }

    .l3-header {
      background: var(--theme-color);
      color: #fff;
      font-family: var(--font-title);
      font-weight: 700;
      font-size: 0.7rem;
      padding: 0.5rem;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .l3-body {
      padding: 0.6rem;
      text-align: center;
      font-size: 0.7rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* ITENS GRANULARES (LEVEL 4) */
    .l4-branches-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.8rem;
      margin-top: 30px;
      position: relative;
    }

    .l4-branches-row::before {
      content: '';
      position: absolute;
      top: -30px;
      left: 50%;
      border-left: 2px solid rgba(241, 187, 65, 0.2);
      width: 0;
      height: 30px;
    }

    .l4-item-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      cursor: pointer;
      width: 100px;
    }

    .l4-circle-checkbox {
      width: 34px;
      height: 34px;
      background: var(--bg-card);
      border: 2px solid var(--theme-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      transition: var(--transition);
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      position: relative;
    }

    .l4-circle-checkbox svg {
      width: 16px;
      height: 16px;
      display: none;
      color: #fff;
    }

    .l4-item-wrapper.status-concluido .l4-circle-checkbox {
      background: var(--color-concluido);
      border-color: var(--color-concluido);
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
    }
    .l4-item-wrapper.status-concluido .l4-circle-checkbox svg.check-icon {
      display: block;
      color: var(--bg-main);
    }

    .l4-item-wrapper.status-progresso .l4-circle-checkbox {
      background: var(--color-progresso);
      border-color: var(--color-progresso);
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
    }
    .l4-item-wrapper.status-progresso .l4-circle-checkbox svg.progress-icon {
      display: block;
      color: var(--bg-main);
    }

    .l4-item-wrapper.status-pendente .l4-circle-checkbox svg.empty-icon {
      display: block;
      color: var(--text-muted);
      opacity: 0.3;
    }

    .l4-item-wrapper::before {
      content: '';
      position: absolute;
      top: -30px;
      left: 50%;
      border-left: 2px solid rgba(241, 187, 65, 0.2);
      width: 0;
      height: 30px;
      z-index: 1;
    }

    .l4-text-area {
      margin-top: 8px;
      text-align: center;
      width: 100%;
    }

    .l4-title {
      font-family: var(--font-title);
      font-weight: 600;
      font-size: 0.65rem;
      color: #ffffff;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: 36px;
    }

    .l4-subtitle {
      font-size: 0.55rem;
      color: var(--text-muted);
      margin-top: 2px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    /* -------------------------------------------------------------
       TABS VIEW (ABAS POR FASE)
       ------------------------------------------------------------- */
    .tabs-viewport {
      display: none;
      flex: 1;
      flex-direction: row;
      padding: 0;
      gap: 0;
      overflow: hidden;
      background: var(--bg-main);
    }

    .tabs-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .tabs-navigation {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      width: 280px;
      flex-shrink: 0;
      border-right: 1px solid var(--border-color);
      padding: 1rem 0.75rem;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .tabs-navigation::-webkit-scrollbar {
      display: none;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.7rem 1rem;
      width: 100%;
      text-align: left;
      font-family: var(--font-title);
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      border-radius: 6px;
      transition: var(--transition);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-btn.active {
      color: var(--phase-color);
      background: rgba(255, 255, 255, 0.05);
      border-left: 3px solid var(--phase-color);
      border-radius: 0 6px 6px 0;
    }

    .phase-content-header {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-left: 5px solid var(--phase-color);
      border-radius: 10px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    .phase-header-title {
      font-family: var(--font-title);
      font-weight: 700;
      font-size: 1.2rem;
      color: #ffffff;
    }

    .phase-header-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .phase-progress-area {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .phase-progress-bar-bg {
      flex: 1;
      background: rgba(224, 224, 224, 0.1);
      height: 6px;
      border-radius: 99px;
      overflow: hidden;
    }

    .phase-progress-bar-fill {
      background: var(--phase-color);
      height: 100%;
      border-radius: 99px;
      transition: width 0.4s ease;
    }

    .phase-progress-text {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--phase-color);
    }

    .subsections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 0.5rem;
    }

    .sub-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    .sub-card-title {
      font-family: var(--font-title);
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--phase-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-left: 3px solid var(--phase-color);
      padding-left: 8px;
    }

    .sub-card-items {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .sub-card-item {
      background: rgba(3, 0, 36, 0.2);
      border: 1px solid rgba(224, 224, 224, 0.03);
      border-radius: 8px;
      padding: 0.7rem 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .sub-card-item:hover {
      border-color: var(--phase-color);
      background: rgba(224, 224, 224, 0.05);
    }

    .sub-card-item-text {
      font-size: 0.8rem;
      color: #e2e8f0;
      line-height: 1.4;
      font-weight: 500;
      flex: 1;
    }

    /* -------------------------------------------------------------
       DRAWER LATERAL DE DETALHES
       ------------------------------------------------------------- */
    .drawer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(3, 0, 36, 0.7);
      backdrop-filter: blur(6px);
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: var(--transition);
    }

    .drawer-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }

    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: 100%;
      max-width: 500px;
      height: 100vh;
      background: var(--bg-card);
      border-left: 1px solid var(--border-color);
      z-index: 101;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
    }

    .drawer.active {
      transform: translateX(0);
    }

    .drawer-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .drawer-header-left {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .drawer-category {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--theme-color);
    }

    .drawer-title {
      font-family: var(--font-title);
      font-weight: 700;
      font-size: 1.2rem;
      color: #ffffff;
      line-height: 1.3;
    }

    .drawer-badges {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-top: 0.25rem;
    }

    .status-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid transparent;
    }

    .status-badge.p-concluido { background: rgba(16, 185, 129, 0.15); color: var(--color-concluido); border-color: var(--color-concluido); }
    .status-badge.p-progresso { background: rgba(245, 158, 11, 0.15); color: var(--color-progresso); border-color: var(--color-progresso); }
    .status-badge.p-pendente { background: rgba(148, 163, 184, 0.15); color: var(--color-pendente); border-color: var(--color-pendente); }

    .close-btn {
      background: rgba(224, 224, 224, 0.05);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      width: 2.2rem;
      height: 2.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-main);
      transition: var(--transition);
    }

    .close-btn:hover {
      background: rgba(241, 187, 65, 0.1);
      border-color: var(--color-yellow);
      color: var(--color-yellow);
    }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .drawer-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .drawer-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      color: var(--text-muted);
      font-weight: 700;
      letter-spacing: 1px;
    }

    .drawer-value {
      font-size: 0.9rem;
      line-height: 1.6;
      color: #d1d5db;
    }

    /* Action Box */
    .action-box {
      background: rgba(3, 0, 36, 0.3);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .action-status-selector {
      display: flex;
      gap: 0.5rem;
    }

    .status-select-btn {
      flex: 1;
      padding: 0.6rem;
      border-radius: 6px;
      border: 1px solid rgba(224, 224, 224, 0.1);
      background: rgba(224, 224, 224, 0.02);
      color: var(--text-main);
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
      text-align: center;
      letter-spacing: 0.5px;
    }

    .status-select-btn.concluido:hover, .status-select-btn.concluido.active {
      background: var(--color-concluido);
      color: var(--bg-main);
      border-color: var(--color-concluido);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
    }
    .status-select-btn.progresso:hover, .status-select-btn.progresso.active {
      background: var(--color-progresso);
      color: var(--bg-main);
      border-color: var(--color-progresso);
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
    }
    .status-select-btn.pendente:hover, .status-select-btn.pendente.active {
      background: var(--color-pendente);
      color: #fff;
      border-color: var(--color-pendente);
    }
  </style>
</head>
<body>

  <!-- BARRA SUPERIOR E PROGRESSO -->
  <div class="top-panel">
    <div class="logo-area">
      <h1 class="logo-title">Escola Flávio Milhomem</h1>
      <span class="logo-subtitle">Organograma &amp; Checklist de Execução</span>
    </div>
    
    <div class="progress-section">
      <div class="progress-info">
        <span>Progresso de Implementação</span>
        <span id="progress-percent">0%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" id="progress-fill"></div>
      </div>
    </div>

    <div class="controls-area">
      <button class="btn-action" id="btn-view-tree" onclick="switchView('tree')">Mapa Mental</button>
      <button class="btn-action active" id="btn-view-board" onclick="switchView('board')">Abas por Fase</button>
      <div style="width: 1px; height: 20px; background: rgba(241, 187, 65, 0.2); margin: 0 8px;"></div>
      <button class="btn-action" onclick="zoomIn()">Zoom +</button>
      <button class="btn-action" onclick="zoomOut()">Zoom -</button>
      <button class="btn-action" onclick="resetZoom()">100%</button>
    </div>
  </div>

  <!-- VIEWPORT DO CANVAS (TREE VIEW) -->
  <main class="canvas-viewport" id="viewport" onmousedown="onMouseDown(event)">
    <div class="canvas-container" id="canvas-container">
      
      <!-- Root Node -->
      <div class="tree-row">
        <div class="node-root-container">
          <div class="root-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div class="root-banner">Escola Milhomem</div>
          <div class="root-box">
            <span class="root-box-title">ORGANOGRAMA DO PROJETO</span>
          </div>
        </div>
      </div>

      <!-- Pilares (Level 2) -->
      <div class="tree-branches" id="pillars-container">
        <!-- Renderizado dinamicamente via JS -->
      </div>

    </div>
  </main>

  <!-- VIEWPORT DAS ABAS (TABS VIEW) -->
  <main class="tabs-viewport" id="tabs-viewport">
    <!-- Renderizado dinamicamente via JS -->
  </main>

  <!-- DRAWER LATERAL -->
  <div class="drawer-backdrop" id="drawer-backdrop" onclick="closeDrawer()"></div>
  <div class="drawer" id="detail-drawer">
    <div class="drawer-header">
      <div class="drawer-header-left">
        <span class="drawer-category" id="drawer-node-category">Item Checklist</span>
        <h2 class="drawer-title" id="drawer-node-title">Título</h2>
        <div class="drawer-badges">
          <span class="status-badge" id="drawer-node-status">PENDENTE</span>
          <span class="status-badge" id="drawer-node-ref" style="background: rgba(224,224,224,0.05); color: var(--text-muted); border-color: var(--border-color)">Ref</span>
        </div>
      </div>
      <button class="close-btn" onclick="closeDrawer()">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    
    <div class="drawer-content">
      <div class="drawer-section">
        <span class="drawer-label">Descrição da Pendência</span>
        <div class="drawer-value" id="drawer-node-desc">Descrição</div>
      </div>
      
      <div class="drawer-section">
        <span class="drawer-label">Guia e Contexto</span>
        <div class="drawer-value" id="drawer-node-rich">Detalhes...</div>
      </div>

      <!-- Mudar Status Interativamente -->
      <div class="drawer-section">
        <span class="drawer-label">Mudar Status</span>
        <div class="action-box">
          <div class="action-status-selector">
            <button class="status-select-btn pendente" id="status-btn-pendente" onclick="updateItemStatus('PENDENTE')">PENDENTE</button>
            <button class="status-select-btn progresso" id="status-btn-progresso" onclick="updateItemStatus('EM PROGRESSO')">PROGRESSO</button>
            <button class="status-select-btn concluido" id="status-btn-concluido" onclick="updateItemStatus('CONCLUÍDO')">CONCLUÍDO</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const statusMap = {
      'CONCLUÍDO': 'concluido',
      'EM PROGRESSO': 'progresso',
      'PENDENTE': 'pendente'
    };

    // Dados estruturados injetados dinamicamente
    const phasesData = ${JSON.stringify(phases)};
    const dataItems = ${JSON.stringify(dataItems)};

    let zoomLevel = 0.75;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX, startY;
    let selectedItem = null;
    let currentView = 'board';
    let activeTab = 0;

    window.addEventListener('DOMContentLoaded', () => {
      renderPillarsAndSubareas();
      updateProgress();
      switchView('board');
    });

    function switchView(view) {
      currentView = view;
      if (view === 'tree') {
        document.getElementById('btn-view-tree').classList.add('active');
        document.getElementById('btn-view-board').classList.remove('active');
        document.getElementById('viewport').style.display = 'block';
        document.getElementById('tabs-viewport').style.display = 'none';
        centerCanvas();
      } else {
        document.getElementById('btn-view-tree').classList.remove('active');
        document.getElementById('btn-view-board').classList.add('active');
        document.getElementById('viewport').style.display = 'none';
        document.getElementById('tabs-viewport').style.display = 'flex';
        renderTabsView();
      }
    }

    function selectTab(tabIdx) {
      activeTab = tabIdx;
      renderTabsView();
    }

    function renderPillarsAndSubareas() {
      const container = document.getElementById('pillars-container');
      container.innerHTML = '';

      const colors = [
        "var(--color-yellow)",
        "var(--color-blue)",
        "var(--color-cyan)",
        "var(--color-purple)",
        "var(--color-coral)",
        "var(--color-green)",
        "var(--color-orange)",
      ];

      phasesData.forEach((phase, idx) => {
        const themeColor = colors[phase.index % colors.length];
        
        const branch = document.createElement('div');
        branch.className = 'tree-branch';
        branch.style.setProperty('--theme-color', themeColor);
        
        // Pillar Node (L2)
        const nodeL2 = document.createElement('div');
        nodeL2.className = 'node-l2-container interactive-node';
        nodeL2.onclick = () => openPillarDetails(phase, themeColor);
        
        nodeL2.innerHTML = \`
          <div class="l2-avatar-wrapper">
            <div class="l2-number-badge">0\${phase.index}</div>
            <div class="l2-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <div class="l2-banner-card">
            <div class="l2-banner-header">Fase 0\${phase.index}</div>
            <div class="l2-banner-body">
              <h4 class="l2-banner-title">\${phase.title}</h4>
            </div>
          </div>
        \`;
        
        branch.appendChild(nodeL2);
        
        // Sub-areas (L3)
        if (phase.subsections && phase.subsections.length > 0) {
          const subBranches = document.createElement('div');
          subBranches.className = 'tree-branches';
          
          phase.subsections.forEach(sub => {
            const subBranch = document.createElement('div');
            subBranch.className = 'tree-branch';
            
            const nodeL3 = document.createElement('div');
            nodeL3.className = 'node-l3-container interactive-node';
            nodeL3.onclick = () => openSubareaDetails(sub, themeColor);
            
            nodeL3.innerHTML = \`
              <div class="l3-header">\${sub.title}</div>
              <div class="l3-body">Fatores de \${sub.no}</div>
            \`;
            
            subBranch.appendChild(nodeL3);
            
            // Items (L4)
            const l4Row = document.createElement('div');
            l4Row.className = 'l4-branches-row';
            l4Row.id = \`l4-sub-\${sub.no.replace('.', '-')}\`;
            
            const subItems = dataItems.filter(item => item.parent === \`sub-\${sub.no.replace('.', '-')}\`);
            subItems.forEach(item => {
              const wrapper = document.createElement('div');
              wrapper.className = \`l4-item-wrapper interactive-node status-\${statusMap[item.status] || 'pendente'}\`;
              wrapper.setAttribute('data-item-id', item.id);
              wrapper.onclick = (e) => {
                if (e.target.closest('.l4-circle-checkbox')) {
                  e.stopPropagation();
                  cycleStatus(item);
                } else {
                  openItemDetails(item);
                }
              };
              
              wrapper.innerHTML = \`
                <div class="l4-circle-checkbox" style="--theme-color: \${item.theme}">
                  <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <svg class="progress-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/>
                  </svg>
                  <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                </div>
                <div class="l4-text-area">
                  <span class="l4-title" title="\${item.title}">\${item.title}</span>
                  <span class="l4-subtitle">\${item.sub}</span>
                </div>
              \`;
              l4Row.appendChild(wrapper);
            });
            
            subBranch.appendChild(l4Row);
            subBranches.appendChild(subBranch);
          });
          
          branch.appendChild(subBranches);
        }
        
        container.appendChild(branch);
      });
    }

    function renderTabsView() {
      const container = document.getElementById('tabs-viewport');
      container.innerHTML = '';
      
      const colors = [
        "var(--color-yellow)",
        "var(--color-blue)",
        "var(--color-cyan)",
        "var(--color-purple)",
        "var(--color-coral)",
        "var(--color-green)",
        "var(--color-orange)",
      ];
      
      const activeColor = colors[activeTab % colors.length];
      container.style.setProperty('--phase-color', activeColor);
      
      // 1. Navigation Tabs Bar
      const nav = document.createElement('div');
      nav.className = 'tabs-navigation';
      
      phasesData.forEach((phase, idx) => {
        const btn = document.createElement('button');
        btn.className = \`tab-btn \${idx === activeTab ? 'active' : ''}\`;
        btn.style.setProperty('--phase-color', colors[idx % colors.length]);
        btn.onclick = () => selectTab(idx);
        btn.innerText = \`Fase 0\${phase.index}\`;
        nav.appendChild(btn);
      });
      container.appendChild(nav);

      const content = document.createElement('div');
      content.className = 'tabs-content';

      const selectedPhase = phasesData[activeTab];
      const phaseItems = dataItems.filter(item => item.id.startsWith(\`item-\${selectedPhase.index}-\`));
      const total = phaseItems.length;
      const completed = phaseItems.filter(item => item.status === 'CONCLUÍDO').length + 
                        phaseItems.filter(item => item.status === 'EM PROGRESSO').length * 0.5;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // 2. Phase Header Info Box
      const header = document.createElement('div');
      header.className = 'phase-content-header';
      header.innerHTML = \`
        <h3 class="phase-header-title">Fase 0\${selectedPhase.index} — \${selectedPhase.title}</h3>
        <p class="phase-header-desc">\${selectedPhase.description || 'Esta fase agrupa tarefas estratégicas do projeto.'}</p>
        <div class="phase-progress-area">
          <div class="phase-progress-bar-bg">
            <div class="phase-progress-bar-fill" style="width: \${percent}%"></div>
          </div>
          <span class="phase-progress-text">\${percent}% Concluído</span>
        </div>
      \`;
      content.appendChild(header);

      // 3. Grid of Subsections
      const grid = document.createElement('div');
      grid.className = 'subsections-grid';
      
      selectedPhase.subsections.forEach(sub => {
        const card = document.createElement('div');
        card.className = 'sub-card';
        
        const title = document.createElement('div');
        title.className = 'sub-card-title';
        title.innerText = sub.title;
        card.appendChild(title);
        
        const list = document.createElement('div');
        list.className = 'sub-card-items';
        
        const subItems = phaseItems.filter(item => item.parent === \`sub-\${sub.no.replace('.', '-')}\`);
        subItems.forEach(item => {
          const itemEl = document.createElement('div');
          itemEl.className = \`sub-card-item status-\${statusMap[item.status]}\`;
          itemEl.onclick = (e) => {
            if (e.target.closest('.l4-circle-checkbox')) {
              e.stopPropagation();
              cycleStatus(item);
              if (currentView === 'board') renderTabsView();
            } else {
              openItemDetails(item);
            }
          };
          
          itemEl.innerHTML = \`
            <div class="l4-circle-checkbox" style="--theme-color: \${item.theme}">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              <svg class="progress-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/>
              </svg>
              <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9"/>
              </svg>
            </div>
            <span class="sub-card-item-text">\${item.title}</span>
          \`;
          list.appendChild(itemEl);
        });
        
        card.appendChild(list);
        grid.appendChild(card);
      });
      
      content.appendChild(grid);
      container.appendChild(content);
    }

    function cycleStatus(item) {
      let nextStatus = 'PENDENTE';
      if (item.status === 'PENDENTE') nextStatus = 'EM PROGRESSO';
      else if (item.status === 'EM PROGRESSO') nextStatus = 'CONCLUÍDO';
      
      saveItemStatus(item.id, nextStatus);
    }

    function saveItemStatus(itemId, newStatus) {
      fetch('/api/dev/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: newStatus })
      })
      .then(res => {
        if (res.ok) {
          const item = dataItems.find(i => i.id === itemId);
          if (item) {
            item.status = newStatus;
            updateNodeUI(item);
            updateProgress();
            if (currentView === 'board') renderTabsView();
            if (selectedItem && selectedItem.id === itemId) {
              selectedItem.status = newStatus;
              updateDrawerBadge(selectedItem);
              highlightDrawerStatusButtons(selectedItem);
            }
          }
        } else {
          alert('Erro ao sincronizar status. Certifique-se de que o servidor local Next.js está de pé!');
        }
      })
      .catch(err => {
        alert('Erro ao conectar ao servidor. Certifique-se de que o servidor Next.js está de pé!');
      });
    }

    function updateNodeUI(item) {
      const el = document.querySelector(\`[data-item-id="\${item.id}"]\`);
      if (el) {
        el.className = \`l4-item-wrapper interactive-node status-\${statusMap[item.status] || 'pendente'}\`;
      }
    }

    function updateProgress() {
      let total = dataItems.length;
      let completed = 0;
      
      dataItems.forEach(i => {
        if (i.status === 'CONCLUÍDO') completed += 1;
        else if (i.status === 'EM PROGRESSO') completed += 0.5;
      });
      
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      document.getElementById('progress-percent').innerText = \`\${percent}%\`;
      document.getElementById('progress-fill').style.width = \`\${percent}%\`;
    }

    function openItemDetails(item) {
      selectedItem = item;
      
      document.getElementById('detail-drawer').style.setProperty('--theme-color', item.theme);
      document.getElementById('drawer-node-category').innerText = "Fator de Checklist";
      document.getElementById('drawer-node-title').innerText = item.title;
      document.getElementById('drawer-node-ref').innerText = item.ref;
      document.getElementById('drawer-node-desc').innerText = item.desc;
      document.getElementById('drawer-node-rich').innerText = item.rich;
      
      updateDrawerBadge(item);
      highlightDrawerStatusButtons(item);
      
      document.querySelector('.action-box').style.display = 'flex';
      
      document.getElementById('drawer-backdrop').classList.add('active');
      document.getElementById('detail-drawer').classList.add('active');
    }

    function openPillarDetails(phase, color) {
      selectedItem = { id: \`pillar-\${phase.index}\`, status: 'PENDENTE' };
      document.getElementById('detail-drawer').style.setProperty('--theme-color', color);
      document.getElementById('drawer-node-category').innerText = "Fase do Projeto";
      document.getElementById('drawer-node-title').innerText = \`Fase 0\${phase.index} — \${phase.title}\`;
      document.getElementById('drawer-node-ref').innerText = \`Fase 0\${phase.index}\`;
      document.getElementById('drawer-node-desc').innerText = phase.description || "Sem meta descrita.";
      document.getElementById('drawer-node-rich').innerText = "Fase estrutural do checklist. Clique nos fatores individuais para alterar o progresso.";
      
      document.querySelector('.action-box').style.display = 'none';
      document.getElementById('drawer-node-status').style.display = 'none';
      
      document.getElementById('drawer-backdrop').classList.add('active');
      document.getElementById('detail-drawer').classList.add('active');
    }

    function openSubareaDetails(sub, color) {
      selectedItem = { id: \`sub-\${sub.no}\`, status: 'PENDENTE' };
      document.getElementById('detail-drawer').style.setProperty('--theme-color', color);
      document.getElementById('drawer-node-category').innerText = "Sub-área de Foco";
      document.getElementById('drawer-node-title').innerText = sub.title;
      document.getElementById('drawer-node-ref').innerText = \`Ref \${sub.no}\`;
      document.getElementById('drawer-node-desc').innerText = \`Conjunto de tarefas sob o código \${sub.no}.\`;
      document.getElementById('drawer-node-rich').innerText = "Clique nas bolinhas de status abaixo de cada sub-área para marcar tarefas como pendente, em andamento ou concluído.";
      
      document.querySelector('.action-box').style.display = 'none';
      document.getElementById('drawer-node-status').style.display = 'none';
      
      document.getElementById('drawer-backdrop').classList.add('active');
      document.getElementById('detail-drawer').classList.add('active');
    }

    function closeDrawer() {
      document.getElementById('drawer-backdrop').classList.remove('active');
      document.getElementById('detail-drawer').classList.remove('active');
      document.getElementById('drawer-node-status').style.display = 'inline-block';
      selectedItem = null;
    }

    function updateDrawerBadge(item) {
      const badge = document.getElementById('drawer-node-status');
      badge.innerText = item.status;
      badge.className = \`status-badge p-\${statusMap[item.status] || 'pendente'}\`;
    }

    function highlightDrawerStatusButtons(item) {
      document.querySelectorAll('.status-select-btn').forEach(btn => btn.classList.remove('active'));
      if (item.status === 'CONCLUÍDO') document.getElementById('status-btn-concluido').classList.add('active');
      else if (item.status === 'EM PROGRESSO') document.getElementById('status-btn-progresso').classList.add('active');
      else document.getElementById('status-btn-pendente').classList.add('active');
    }

    function updateItemStatus(newStatus) {
      if (!selectedItem || selectedItem.id.startsWith('pillar') || selectedItem.id.startsWith('sub')) return;
      saveItemStatus(selectedItem.id, newStatus);
    }

    // -------------------------------------------------------------
    // CONTROLES DE ZOOM E PAN
    // -------------------------------------------------------------
    const viewport = document.getElementById('viewport');
    const canvas = document.getElementById('canvas-container');

    function centerCanvas() {
      const vRect = viewport.getBoundingClientRect();
      const cRect = canvas.getBoundingClientRect();
      panX = (vRect.width - cRect.width * zoomLevel) / 2;
      panY = 60;
      updateTransform();
    }

    function updateTransform() {
      canvas.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${zoomLevel})\`;
    }

    function zoomIn() {
      zoomLevel = Math.min(zoomLevel + 0.1, 1.8);
      updateTransform();
    }

    function zoomOut() {
      zoomLevel = Math.max(zoomLevel - 0.1, 0.4);
      updateTransform();
    }

    function resetZoom() {
      zoomLevel = 0.75;
      centerCanvas();
    }

    function onMouseDown(e) {
      if (e.target.closest('button') || 
          e.target.closest('.l4-circle-checkbox') || 
          e.target.closest('.drawer') || 
          e.target.closest('.status-select-btn') || 
          e.target.closest('.top-panel')) {
        return;
      }
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      updateTransform();
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    // Advanced Wheel Listener for Figma-like scroll/pan & ctrl+scroll zoom
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = 0.05;
        if (e.deltaY < 0) {
          zoomLevel = Math.min(zoomLevel + zoomFactor, 1.8);
        } else {
          zoomLevel = Math.max(zoomLevel - zoomFactor, 0.4);
        }
      } else {
        panX -= e.deltaX;
        panY -= e.deltaY;
      }
      updateTransform();
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(STATIC_HTML_PATH, htmlContent, "utf-8");
}

export async function GET() {
  try {
    if (!fs.existsSync(CHECKLIST_PATH)) {
      return NextResponse.json({ error: "Checklist file not found at " + CHECKLIST_PATH }, { status: 404 });
    }
    const content = fs.readFileSync(CHECKLIST_PATH, "utf-8");
    const phases = parseChecklistMarkdown(content);
    // Automatically generate/sync the static HTML file on load
    updateStaticHtmlFile(phases);
    return NextResponse.json({ phases });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { itemId, status } = await req.json();
    if (!itemId || !status) {
      return NextResponse.json({ error: "Missing itemId or status" }, { status: 400 });
    }

    if (!fs.existsSync(CHECKLIST_PATH)) {
      return NextResponse.json({ error: "Checklist file not found" }, { status: 404 });
    }

    let content = fs.readFileSync(CHECKLIST_PATH, "utf-8");
    let lines = content.split("\n");
    const phases = parseChecklistMarkdown(content);
    
    // Find the item matching this ID
    let targetItem: ChecklistItem | null = null;
    let targetSubNo = "";
    let targetPhaseIdx = -1;

    for (const phase of phases) {
      for (const sub of phase.subsections) {
        for (const item of sub.items) {
          if (item.id === itemId) {
            targetItem = item;
            targetSubNo = sub.no;
            targetPhaseIdx = phase.index;
            break;
          }
        }
        if (targetItem) break;
      }
      if (targetItem) break;
    }

    if (!targetItem) {
      return NextResponse.json({ error: `Item with id ${itemId} not found in parsed structure` }, { status: 404 });
    }

    // Now update the line in the markdown file
    let currentPhaseIdx = -1;
    let currentSubNo = "";
    let updated = false;

    const newStatusChar = status === "CONCLUÍDO" ? "x" : status === "EM PROGRESSO" ? "~" : " ";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      const phaseMatch = line.match(/^##\s+Fase\s+(\d+)/i);
      if (phaseMatch) {
        currentPhaseIdx = parseInt(phaseMatch[1], 10);
        continue;
      }

      const subMatch = line.match(/^###\s+(\d+\.\d+)/i);
      if (subMatch) {
        currentSubNo = subMatch[1].trim();
        continue;
      }

      const itemMatch = line.match(/^-\s*\[([ x~])\]\s*(.+)$/i);
      if (itemMatch && currentPhaseIdx === targetPhaseIdx && currentSubNo === targetSubNo) {
        const text = itemMatch[2].trim();
        const cleanText = text.replace(/—\s*[^*]+$/, "").trim();
        const slug = slugify(cleanText);
        const itemSlug = slugify(targetItem.text.replace(/—\s*[^*]+$/, "").trim());

        if (slug === itemSlug) {
          // Replace checkbox
          const leadingSpace = lines[i].match(/^\s*/)?.[0] || "";
          lines[i] = `${leadingSpace}- [${newStatusChar}] ${text}`;
          updated = true;
          break;
        }
      }
    }

    if (!updated) {
      return NextResponse.json({ error: "Failed to locate and update item in raw text lines" }, { status: 500 });
    }

    // Reconstruct content to parse updated counts for progress table
    let updatedContent = lines.join("\n");
    const updatedPhases = parseChecklistMarkdown(updatedContent);

    // Update progress table dynamically
    const linesForTable = updatedContent.split("\n");
    let tableStartIdx = -1;
    let tableEndIdx = -1;

    for (let i = 0; i < linesForTable.length; i++) {
      if (linesForTable[i].trim().startsWith("## Controle de progresso")) {
        tableStartIdx = i;
        // Search for table boundary
        for (let j = i + 1; j < linesForTable.length; j++) {
          if (linesForTable[j].trim().startsWith("---") || linesForTable[j].trim().startsWith("*Última atualização")) {
            tableEndIdx = j;
            break;
          }
        }
        break;
      }
    }

    if (tableStartIdx !== -1 && tableEndIdx !== -1) {
      // Re-generate progress table rows
      const tableRows = [
        "## Controle de progresso",
        "",
        "| Fase | Itens | Concluídos | % |",
        "|------|-------|------------|---|",
      ];

      updatedPhases.forEach(phase => {
        let totalItems = 0;
        let completedItems = 0;

        phase.subsections.forEach(sub => {
          sub.items.forEach(item => {
            totalItems++;
            if (item.status === "CONCLUÍDO") {
              completedItems++;
            }
          });
        });

        const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        tableRows.push(`| ${phase.index} | ${totalItems} | ${completedItems} | ${percent}% |`);
      });

      tableRows.push("");
      tableRows.push("_Atualizar a tabela ao marcar `[x]` nos itens acima._");
      tableRows.push("");

      // Replace everything between tableStartIdx and tableEndIdx with tableRows
      linesForTable.splice(tableStartIdx, tableEndIdx - tableStartIdx, ...tableRows);
      updatedContent = linesForTable.join("\n");
    }

    // Save Markdown
    fs.writeFileSync(CHECKLIST_PATH, updatedContent, "utf-8");

    // Re-parse and regenerate static HTML file
    const finalPhases = parseChecklistMarkdown(updatedContent);
    updateStaticHtmlFile(finalPhases);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
