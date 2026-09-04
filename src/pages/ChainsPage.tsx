import { useState, useMemo, useRef, useEffect } from 'react';
import {
  GitMerge,
  Plus,
  Star,
  Download,
  Copy,
  Trash2,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Layers,
  Sliders,
  HelpCircle,
  Headphones,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Check,
  X,
  FileText,
  SlidersHorizontal,
  ArrowRight,
  Volume2,
  VolumeX,
  Workflow,
  Info,
  Shuffle,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ProcessingChain,
  ChainStep,
  ChainTarget,
  ChainLevel,
  ChainGoal,
  PluginItem,
  StudioSettings,
} from '../types';
import {
  MIX_ELEMENTS,
  MUSIC_STYLES,
  CHAIN_GOALS,
  LEVEL_INFOS,
} from '../data/chainGuideData';
import {
  getRecommendedChain,
  COMPREHENSIVE_GUIDE_CHAINS,
} from '../services/chainGuideEngine';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface ChainsPageProps {
  chains: ProcessingChain[];
  plugins: PluginItem[];
  settings: StudioSettings;
  subFilter: string;
  onSaveChain: (chain: ProcessingChain) => Promise<void>;
  onDeleteChain: (id: string) => Promise<void>;
  onOpenNewChainModal: () => void;
}

export function ChainsPage({
  chains,
  plugins,
  settings,
  subFilter,
  onSaveChain,
  onDeleteChain,
  onOpenNewChainModal,
}: ChainsPageProps) {
  const { showToast } = useToast();

  // Mode: Interactive Guide vs Saved Chains vs A/B Compare
  const [pageMode, setPageMode] = useState<'guide' | 'library' | 'compare'>(
    subFilter === 'compare' ? 'compare' : 'guide'
  );

  // Guide Selector State (User parameters)
  const [selectedTarget, setSelectedTarget] = useState<ChainTarget>('Lead Vocal');
  const [selectedStyle, setSelectedStyle] = useState<string>('Afrobeat');
  const [selectedGoal, setSelectedGoal] = useState<ChainGoal>('Dar presença');
  const [selectedLevel, setSelectedLevel] = useState<ChainLevel>('Intermediário');

  // Currently loaded chain in Guide Mode (live editable)
  const [guideChain, setGuideChain] = useState<ProcessingChain>(() => {
    return getRecommendedChain('Lead Vocal', 'Afrobeat', 'Dar presença', 'Intermediário', chains);
  });

  // Library mode state
  const [selectedChainId, setSelectedChainId] = useState<string>(chains[0]?.id || '');
  const [compareChainIdB, setCompareChainIdB] = useState<string>(
    chains[1]?.id || chains[0]?.id || ''
  );

  // Active step highlight and note editing
  const [highlightedStepId, setHighlightedStepId] = useState<string | null>(null);
  const [editingNoteStepId, setEditingNoteStepId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Interactive questions answered: stepId -> 'yes' | 'no'
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, 'yes' | 'no'>>({});

  // Simulated bypass on steps (for ear training comparison)
  const [bypassedSteps, setBypassedSteps] = useState<Record<string, boolean>>({});

  // Swap modal or expanded alternatives per step
  const [expandedAlternativesStepId, setExpandedAlternativesStepId] = useState<string | null>(null);

  // Deletion confirm states
  const [deleteChainConfirm, setDeleteChainConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleteStepConfirm, setDeleteStepConfirm] = useState<{ index: number; name: string } | null>(null);

  // Update guide chain when target/style/goal/level changes, or when subFilter changes
  useEffect(() => {
    if (subFilter === 'compare') {
      setPageMode('compare');
    } else if (subFilter === 'guide') {
      setPageMode('guide');
    } else if (subFilter === 'all' || subFilter === 'favorites') {
      setPageMode('library');
    } else if (['Lead Vocal', 'Backing Vocal', 'Bass', 'Kick', 'Mix Bus'].includes(subFilter)) {
      setSelectedTarget(subFilter as ChainTarget);
      setPageMode('guide');
    }
  }, [subFilter]);

  // Regenerate guide when user changes primary selection
  const handleRegenerateGuide = (
    target: ChainTarget,
    style: string,
    goal: ChainGoal,
    level: ChainLevel
  ) => {
    setSelectedTarget(target);
    setSelectedStyle(style);
    setSelectedGoal(goal);
    setSelectedLevel(level);

    const generated = getRecommendedChain(target, style, goal, level, chains);
    setGuideChain(generated);
    setQuestionAnswers({});
    setBypassedSteps({});
    setHighlightedStepId(null);
  };

  // Switch element
  const handleSelectTarget = (target: ChainTarget) => {
    const elem = MIX_ELEMENTS.find((m) => m.id === target);
    const newGoal = elem?.defaultGoal || selectedGoal;
    handleRegenerateGuide(target, selectedStyle, newGoal, selectedLevel);
  };

  // Active chain for library mode
  const activeLibraryChain =
    chains.find((c) => c.id === selectedChainId) || chains[0] || guideChain;
  const compareChainB =
    chains.find((c) => c.id === compareChainIdB) || chains[1] || chains[0] || null;

  // The active chain being viewed/interacted with
  const activeChain = pageMode === 'guide' ? guideChain : activeLibraryChain;

  // Reorder steps in active chain
  const handleMoveStep = async (stepIndex: number, direction: 'up' | 'down') => {
    if (!activeChain || !activeChain.steps) return;
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeChain.steps.length) return;

    const newSteps = [...activeChain.steps];
    const temp = newSteps[stepIndex];
    newSteps[stepIndex] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    // Recalculate order numbers
    newSteps.forEach((s, idx) => {
      s.order = idx + 1;
    });

    const updated: ProcessingChain = {
      ...activeChain,
      steps: newSteps,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (pageMode === 'guide') {
      setGuideChain(updated);
    } else {
      await onSaveChain(updated);
    }
    showToast('Ordem dos plugins atualizada', 'success');
  };

  // Swap plugin in step with an alternative
  const handleSwapPlugin = async (
    stepId: string,
    newPluginName: string,
    categoryType: 'pro' | 'alt' | 'free' | 'native'
  ) => {
    if (!activeChain || !activeChain.steps) return;

    const updatedSteps = (activeChain.steps || []).map((step) => {
      if (step.id !== stepId) return step;

      let newManufacturer = 'Universal';
      if (newPluginName.includes('Waves') || newPluginName.includes('CLA') || newPluginName.includes('R-')) {
        newManufacturer = 'Waves';
      } else if (newPluginName.includes('FabFilter') || newPluginName.includes('Pro-')) {
        newManufacturer = 'FabFilter';
      } else if (newPluginName.includes('Soundtoys') || newPluginName.includes('Decapitator')) {
        newManufacturer = 'Soundtoys';
      } else if (newPluginName.includes('Valhalla')) {
        newManufacturer = 'Valhalla DSP';
      } else if (newPluginName.includes('SSL')) {
        newManufacturer = 'Solid State Logic';
      } else if (newPluginName.includes('Fruity') || newPluginName.includes('Edison')) {
        newManufacturer = 'Image-Line';
      } else if (newPluginName.includes('Logic')) {
        newManufacturer = 'Apple Logic';
      }

      return {
        ...step,
        pluginName: newPluginName,
        manufacturer: newManufacturer,
        myNote: `${step.myNote || ''} [Substituído por ${newPluginName} (${categoryType})]`.trim(),
      };
    });

    const updated: ProcessingChain = {
      ...activeChain,
      steps: updatedSteps,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (pageMode === 'guide') {
      setGuideChain(updated);
    } else {
      await onSaveChain(updated);
    }

    setExpandedAlternativesStepId(null);
    showToast(`Plugin substituído por "${newPluginName}" nesta cadeia!`, 'success');
  };

  // Toggle favorite
  const handleToggleFavorite = async (chain: ProcessingChain) => {
    const updated = { ...chain, favorite: !chain.favorite };
    if (pageMode === 'guide') {
      setGuideChain(updated);
      await onSaveChain(updated);
    } else {
      await onSaveChain(updated);
    }
    showToast(updated.favorite ? 'Cadeia favoritada ⭐' : 'Cadeia removida dos favoritos', 'info');
  };

  // Save Guide Chain into user's persistent library
  const handleSaveGuideToLibrary = async () => {
    const toSave: ProcessingChain = {
      ...guideChain,
      id: `saved-chain-${Date.now()}`,
      name: `${guideChain.target} — ${guideChain.style} (${guideChain.goal})`,
      isCustom: true,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    await onSaveChain(toSave);
    setSelectedChainId(toSave.id);
    showToast('Cadeia salva com sucesso nas tuas cadeias do estúdio! 💾', 'success');
  };

  // Duplicate chain
  const handleDuplicate = async (chain: ProcessingChain) => {
    const duplicated: ProcessingChain = {
      ...chain,
      id: 'chain-' + Date.now(),
      name: `${chain.name} (Cópia)`,
      isCustom: true,
      updatedAt: new Date().toISOString().split('T')[0],
      steps: (chain.steps || []).map((s) => ({
        ...s,
        id: 'step-' + Math.random().toString(36).substr(2, 6),
      })),
    };
    await onSaveChain(duplicated);
    setSelectedChainId(duplicated.id);
    showToast('Cadeia duplicada com sucesso!', 'success');
  };

  // Export to TXT / Copy DAW blueprint
  const handleCopyDawBlueprint = (chain: ProcessingChain) => {
    let txt = `=====================================================\n`;
    txt += `  MELO STUDIO HUB — GUIA DE CADEIA DE PROCESSAMENTO  \n`;
    txt += `=====================================================\n`;
    txt += `ELEMENTO: ${chain.target}\n`;
    txt += `ESTILO:   ${chain.style}\n`;
    txt += `OBJETIVO: ${chain.goal}\n`;
    txt += `NÍVEL:    ${chain.level}\n`;
    txt += `FLUXO:    ${chain.routingType}\n\n`;
    txt += `ROTA DE SINAL (Passo a Passo):\n`;

    (chain.steps || []).forEach((s) => {
      txt += `\n[PASSO ${String(s.order).padStart(2, '0')}] ${s.pluginName.toUpperCase()} (${s.manufacturer}) — [${s.category}]\n`;
      txt += `  🎯 Objetivo: ${s.objective}\n`;
      txt += `  ❓ Por que está aqui?: ${s.whyIsItHere}\n`;
      if (s.whatToHearBefore) txt += `  🔴 Antes: ${s.whatToHearBefore}\n`;
      if (s.whatToHearAfter) txt += `  🟢 Depois: ${s.whatToHearAfter}\n`;
      txt += `  👂 O que ouvir: ${s.whatToHear}\n`;
      if (s.guideQuestion) {
        txt += `  💡 Decisão: ${s.guideQuestion.question}\n`;
        txt += `     • SIM: ${s.guideQuestion.ifYes}\n`;
        txt += `     • NÃO: ${s.guideQuestion.ifNo}\n`;
      }
      txt += `  🔄 Alternativas: Pro: ${s.alternatives.pro} | Alt: ${s.alternatives.alt} | Free: ${s.alternatives.free} | DAW: ${s.alternatives.native}\n`;
      if (s.myNote) txt += `  📝 Minhas Anotações: ${s.myNote}\n`;
    });

    txt += `\n=====================================================\n`;
    txt += `Dica de Ouro: "A ordem não é uma lei universal, é um ponto de partida.`;
    txt += ` O segredo não é adivinhar números fixos, é aprender a ouvir!"\n`;

    navigator.clipboard.writeText(txt);
    showToast('Roteiro da cadeia copiado para a área de transferência! 📋', 'success');
  };

  // Export to TXT file
  const handleExportTxt = (chain: ProcessingChain) => {
    let txt = `=== ${chain.name} ===\n`;
    txt += `Alvo: ${chain.target} | Estilo: ${chain.style} | Nível: ${chain.level}\n`;
    txt += `Objetivo: ${chain.goal}\n\n`;
    txt += `FLUXO DE PROCESSAMENTO:\n`;
    (chain.steps || []).forEach((s) => {
      txt += `\n[${String(s.order).padStart(2, '0')}] ${s.pluginName} (${s.manufacturer}) - ${s.objective}\n`;
      txt += `   • Por quê: ${s.whyIsItHere}\n`;
      txt += `   • O que ouvir: ${s.whatToHear}\n`;
      txt += `   • Alternativa Grátis: ${s.alternatives.free}\n`;
      txt += `   • Alternativa Nativa: ${s.alternatives.native}\n`;
      if (s.myNote) txt += `   • Minha Nota: ${s.myNote}\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chain.name.replace(/\s+/g, '_')}_Cadeia.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Cadeia exportada em arquivo TXT!', 'info');
  };

  // Step Note editing
  const handleSaveStepNote = async (stepId: string) => {
    if (!activeChain || !activeChain.steps) return;
    const updatedSteps = (activeChain.steps || []).map((s) =>
      s.id === stepId ? { ...s, myNote: tempNote } : s
    );
    const updated = {
      ...activeChain,
      steps: updatedSteps,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (pageMode === 'guide') {
      setGuideChain(updated);
    } else {
      await onSaveChain(updated);
    }
    setEditingNoteStepId(null);
    showToast('Anotação da etapa atualizada', 'success');
  };

  // Scroll to step in page
  const handleScrollToStep = (stepId: string) => {
    setHighlightedStepId(stepId);
    const el = document.getElementById(`step-card-${stepId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Filter chains for library mode
  const filteredLibraryChains = useMemo(() => {
    return chains.filter((c) => {
      if (subFilter === 'all') return true;
      if (subFilter === 'favorites') return c.favorite;
      if (subFilter === 'Lead Vocal') return c.target === 'Lead Vocal';
      if (subFilter === 'Backing Vocal') return c.target === 'Backing Vocal' || c.target === 'Adlibs';
      if (subFilter === 'Bass') return c.target === 'Bass' || c.target === '808';
      if (subFilter === 'Kick') return c.target === 'Kick' || c.target === 'Snare' || c.target === 'Drum Bus';
      if (subFilter === 'Mix Bus') return c.target === 'Master' || c.target === 'Mix Bus';
      return true;
    });
  }, [chains, subFilter]);

  return (
    <div id="chains-page-container" className="space-y-6 pb-20">
      {/* Top Banner & Wisdom */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-amber-400" />
                Melo Studio Hub V2
              </span>
              <span className="text-xs text-zinc-400">
                Engenharia de Áudio & Fluxo de Sinal
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              🎛️ Guia de Cadeias de Processamento
            </h1>
            <p className="text-sm text-zinc-400 max-w-3xl mt-1.5 leading-relaxed">
              O fluxo de sinal completo do estúdio: entende <strong className="text-zinc-200">por que cada plugin está naquela posição</strong>,{' '}
              <strong className="text-zinc-200">o que deves ouvir antes e depois</strong>, perguntas práticas de decisão e alternativas inteligentes se não tiveres o plugin original.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenNewChainModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Criar Nova Cadeia
            </button>
          </div>
        </div>

        {/* Studio Philosophy Banner */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-start sm:items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <span className="italic">
              "A ordem não é uma lei universal — é um ponto de partida. O problema do iniciante não é saber qual plugin usar, é aprender a ouvir se está a fazer certo!"
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 bg-zinc-900/90 px-3 py-1 rounded-lg border border-zinc-800 text-[11px]">
            <span className="text-zinc-500">DAW Ativa:</span>
            <span className="font-semibold text-zinc-300">{settings.mainDaw || 'FL Studio'}</span>
          </div>
        </div>
      </div>

      {/* Main Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setPageMode('guide')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              pageMode === 'guide'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            🎛️ Guia Passo a Passo (Interativo)
          </button>
          <button
            onClick={() => setPageMode('library')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              pageMode === 'library'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            📚 Minhas Cadeias Cadastradas ({chains.length})
          </button>
          <button
            onClick={() => setPageMode('compare')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              pageMode === 'compare'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            🔀 Comparador A/B de Cadeias
          </button>
        </div>

        {/* Global Action in Top Bar */}
        {activeChain && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyDawBlueprint(activeChain)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              title="Copiar roteiro estruturado para colar no bloco de notas da DAW"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              Copiar Roteiro para DAW
            </button>
            <button
              onClick={() => handleExportTxt(activeChain)}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-white text-xs cursor-pointer"
              title="Baixar arquivo TXT"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: INTERACTIVE GUIDE SELECTOR (O QUE O USUÁRIO PEDIU)                 */}
      {/* ========================================================================= */}
      {pageMode === 'guide' && (
        <div className="space-y-6">
          {/* STEP 1: SELECTOR CONSOLE */}
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  1. Configuração do Sinal (O que estás a mixar?)
                </h3>
                <p className="text-xs text-zinc-400">
                  Seleciona o elemento, o estilo musical e o teu objetivo sonoro para calibrar a cadeia ideal.
                </p>
              </div>

              {/* Nível selector */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {(['Iniciante', 'Intermediário', 'Avançado'] as ChainLevel[]).map((lvl) => {
                  const info = LEVEL_INFOS[lvl];
                  const isSelected = selectedLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() =>
                        handleRegenerateGuide(selectedTarget, selectedStyle, selectedGoal, lvl)
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? lvl === 'Iniciante'
                            ? 'bg-emerald-500 text-black shadow-md'
                            : lvl === 'Intermediário'
                            ? 'bg-yellow-500 text-black shadow-md'
                            : 'bg-rose-500 text-white shadow-md'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {info.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Element Buttons (13 Elements) */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Elemento a Mixar:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MIX_ELEMENTS.map((elem) => {
                  const isSelected = selectedTarget === elem.id;
                  return (
                    <button
                      key={elem.id}
                      onClick={() => handleSelectTarget(elem.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20 scale-105'
                          : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      <span>{elem.icon}</span>
                      <span>{elem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style & Goal Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
              {/* Style dropdown / pills */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Estilo Musical:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MUSIC_STYLES.map((st) => (
                    <button
                      key={st.id}
                      onClick={() =>
                        handleRegenerateGuide(selectedTarget, st.id, selectedGoal, selectedLevel)
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                        selectedStyle === st.id
                          ? 'bg-zinc-200 text-black font-bold'
                          : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {st.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal dropdown / pills */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Objetivo Principal:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CHAIN_GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() =>
                        handleRegenerateGuide(selectedTarget, selectedStyle, g.id, selectedLevel)
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer ${
                        selectedGoal === g.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                          : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <span>{g.icon}</span>
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* LEVEL INSTRUCTION BAR */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              selectedLevel === 'Iniciante'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : selectedLevel === 'Intermediário'
                ? 'bg-yellow-950/20 border-yellow-500/30 text-yellow-300'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Nível do Guia Ativo: {LEVEL_INFOS[selectedLevel].title}</span>
              <span className="opacity-70 font-normal">({LEVEL_INFOS[selectedLevel].badge})</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] opacity-90">
              {LEVEL_INFOS[selectedLevel].focus.map((f, i) => (
                <span key={i} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* VISUAL SIGNAL FLOW DIAGRAM (SOLICITADO) */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-amber-400" />
                Diagrama de Fluxo de Sinal (Ordem de Processamento)
              </h3>
              <span className="text-[11px] text-zinc-500">
                Clica num nó para saltar diretamente para o plugin
              </span>
            </div>

            {/* Horizontal / Scrollable Visual Chain Diagram */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max py-2">
                {/* Source Input */}
                <div className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-center text-xs font-bold text-zinc-200">
                  <div className="text-[10px] uppercase text-zinc-400">Origem</div>
                  <div className="text-amber-400 font-black">{guideChain.target}</div>
                </div>

                <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

                {/* Steps Nodes */}
                {(guideChain.steps || []).map((step, idx) => {
                  const isSend = step.routingDetails?.type === 'Send / Aux';
                  const isHighlighted = highlightedStepId === step.id;
                  const isBypassed = bypassedSteps[step.id];

                  return (
                    <div key={step.id} className="flex items-center gap-2">
                      <button
                        onClick={() => handleScrollToStep(step.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isHighlighted
                            ? 'bg-amber-500 text-black font-black border-amber-400 shadow-lg scale-105'
                            : isBypassed
                            ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 line-through'
                            : isSend
                            ? 'bg-purple-950/40 border-purple-500/40 text-purple-200 hover:border-purple-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-850'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-80">
                          <span>{String(step.order).padStart(2, '0')}</span>
                          <span>•</span>
                          <span>{step.category}</span>
                          {isSend && <span className="text-purple-400 text-[9px] font-bold">AUX SEND</span>}
                        </div>
                        <div className="text-xs font-bold truncate max-w-[130px]">
                          {step.pluginName}
                        </div>
                      </button>

                      {idx < guideChain.steps.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      )}
                    </div>
                  );
                })}

                <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

                {/* Output Destination */}
                <div className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-center text-xs font-bold text-zinc-200">
                  <div className="text-[10px] uppercase text-zinc-400">Destino</div>
                  <div className="text-emerald-400 font-black">
                    {guideChain.target === 'Master' ? 'Stereo Out' : 'Mix Bus'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE GUIDE HEADER & ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase text-amber-400">
                  {guideChain.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {guideChain.steps.length} plugins na cadeia
                </span>
              </div>
              <p className="text-xs text-zinc-400">{guideChain.notes}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveGuideToLibrary}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4" />
                Salvar nas Minhas Cadeias
              </button>
              <button
                onClick={() => handleToggleFavorite(guideChain)}
                className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-400 cursor-pointer"
                title="Favoritar cadeia"
              >
                <Star
                  className={`w-4 h-4 ${
                    guideChain.favorite ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* STEP-BY-STEP DETAILED CARDS (O CORAÇÃO DO GUIA) */}
          <div className="space-y-4">
            {(guideChain.steps || []).map((step, stepIndex) => {
              const isBypassed = bypassedSteps[step.id];
              const isHighlighted = highlightedStepId === step.id;
              const isAlternativesOpen = expandedAlternativesStepId === step.id;
              const answer = questionAnswers[step.id];

              return (
                <div
                  id={`step-card-${step.id}`}
                  key={step.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isHighlighted
                      ? 'bg-zinc-850 border-amber-500/80 shadow-2xl ring-2 ring-amber-500/20'
                      : isBypassed
                      ? 'bg-zinc-950/60 border-zinc-850 opacity-70'
                      : 'bg-zinc-900 border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black text-sm flex items-center justify-center shadow-md">
                        {String(step.order).padStart(2, '0')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-white">
                            {step.pluginName}
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {step.manufacturer}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                            {step.category}
                          </span>
                          {step.routingDetails?.type === 'Send / Aux' && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                              Send Auxiliar
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                          {step.objective}
                        </p>
                      </div>
                    </div>

                    {/* Quick controls: Move Up/Down, Bypass, Swap */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Bypass test button */}
                      <button
                        onClick={() =>
                          setBypassedSteps((prev) => ({
                            ...prev,
                            [step.id]: !prev[step.id],
                          }))
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          isBypassed
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                        }`}
                        title="Simular Bypass A/B para treinar o ouvido crítico"
                      >
                        {isBypassed ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        {isBypassed ? 'Bypassed' : 'Ativo'}
                      </button>

                      {/* Swap Plugin Button */}
                      <button
                        onClick={() =>
                          setExpandedAlternativesStepId(isAlternativesOpen ? null : step.id)
                        }
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Trocar plugin por alternativa Pro, Grátis ou Nativa"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Trocar Plugin
                      </button>

                      {/* Move buttons */}
                      <button
                        onClick={() => handleMoveStep(stepIndex, 'up')}
                        disabled={stepIndex === 0}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveStep(stepIndex, 'down')}
                        disabled={stepIndex === (guideChain.steps || []).length - 1}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteStepConfirm({ index: stepIndex, name: step.pluginName })}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-rose-400 cursor-pointer"
                        title="Remover este plugin da cadeia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Core Explanation: POR QUE ESTÁ NESTA POSIÇÃO? */}
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: Why it is here & Pedagogical principle */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Por que este plugin está nesta posição?
                        </h5>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {step.whyIsItHere}
                        </p>
                      </div>

                      {/* Pedagogical Tip (O princípio do Melo: não dar receita fixa) */}
                      {step.pedagogicalTip && (
                        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-300">Regra do Estúdio: </span>
                            {step.pedagogicalTip}
                          </div>
                        </div>
                      )}

                      {/* Question from the guide (Tomada de Decisão do Produtor) */}
                      {step.guideQuestion && (
                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black uppercase text-sky-400 flex items-center gap-1.5">
                              <Workflow className="w-3.5 h-3.5" />
                              Pergunta do Guia (Avalia com os Ouvidos):
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  setQuestionAnswers((prev) => ({
                                    ...prev,
                                    [step.id]: 'yes',
                                  }))
                                }
                                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                  answer === 'yes'
                                    ? 'bg-emerald-500 text-black shadow'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                              >
                                SIM
                              </button>
                              <button
                                onClick={() =>
                                  setQuestionAnswers((prev) => ({
                                    ...prev,
                                    [step.id]: 'no',
                                  }))
                                }
                                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                  answer === 'no'
                                    ? 'bg-rose-500 text-white shadow'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                              >
                                NÃO
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-200 font-medium mb-2">
                            "{step.guideQuestion.question}"
                          </p>

                          {/* Dynamic recommendation based on producer answer */}
                          {answer === 'yes' && (
                            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>
                                <strong>Conduta recomendada: </strong>
                                {step.guideQuestion.ifYes}
                              </span>
                            </div>
                          )}
                          {answer === 'no' && (
                            <div className="p-2 rounded-lg bg-zinc-850 border border-zinc-700 text-xs text-zinc-300 flex items-start gap-1.5">
                              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
                              <span>
                                <strong>Conduta recomendada: </strong>
                                {step.guideQuestion.ifNo}
                              </span>
                            </div>
                          )}
                          {!answer && (
                            <p className="text-[11px] text-zinc-500 italic">
                              Clica em SIM ou NÃO para ver a recomendação exata para este caso.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: 👂 O QUE DEVO OUVIR? (Antes vs Depois) */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                          <Headphones className="w-3.5 h-3.5" />
                          👂 O que devo ouvir?
                        </h5>

                        {/* Antes vs Depois Contrast Box */}
                        <div className="space-y-2 mb-3">
                          {step.whatToHearBefore && (
                            <div className="p-2.5 rounded-lg bg-rose-950/25 border border-rose-500/30 text-xs text-rose-200">
                              <div className="font-bold text-[10px] uppercase text-rose-400 mb-0.5 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                🔴 ANTES:
                              </div>
                              <p className="text-zinc-300">{step.whatToHearBefore}</p>
                            </div>
                          )}

                          {step.whatToHearAfter && (
                            <div className="p-2.5 rounded-lg bg-emerald-950/25 border border-emerald-500/30 text-xs text-emerald-200">
                              <div className="font-bold text-[10px] uppercase text-emerald-400 mb-0.5 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                🟢 DEPOIS:
                              </div>
                              <p className="text-zinc-300">{step.whatToHearAfter}</p>
                            </div>
                          )}
                        </div>

                        {/* Summary description */}
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {step.whatToHear}
                        </p>

                        {/* Level-specific tips (Intermediário / Avançado) */}
                        {step.techniqueTip && (
                          <div className="mt-3 pt-2.5 border-t border-zinc-850 text-xs text-zinc-300">
                            <span className="font-bold text-yellow-400">💡 Parâmetro de Referência: </span>
                            {step.techniqueTip}
                          </div>
                        )}
                        {step.routingDetails && (
                          <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-300">Roteamento:</span>
                            <span>{step.routingDetails.type}</span>
                            {step.routingDetails.notes && <span>• {step.routingDetails.notes}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EXPANDABLE ALTERNATIVES / SWAP PANEL */}
                  {isAlternativesOpen && (
                    <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-amber-400" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                            Alternativas de Plugins ("Não tens este plugin? Sem problema!")
                          </h5>
                        </div>
                        <button
                          onClick={() => setExpandedAlternativesStepId(null)}
                          className="text-zinc-400 hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-zinc-400">
                        Clica em <strong className="text-amber-300">"Usar Nesta Cadeia"</strong> para substituir o plugin original por qualquer uma das opções abaixo:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {/* Option Pro */}
                        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-amber-400 block mb-1">
                              💎 Versão Pro
                            </span>
                            <div className="text-xs font-bold text-white mb-2">
                              {step.alternatives.pro}
                            </div>
                          </div>
                          <button
                            onClick={() => handleSwapPlugin(step.id, step.alternatives.pro, 'pro')}
                            className="w-full py-1.5 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Usar Nesta Cadeia
                          </button>
                        </div>

                        {/* Option Alt */}
                        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-sky-400 block mb-1">
                              🔄 Alternativa de Mercado
                            </span>
                            <div className="text-xs font-bold text-white mb-2">
                              {step.alternatives.alt}
                            </div>
                          </div>
                          <button
                            onClick={() => handleSwapPlugin(step.id, step.alternatives.alt, 'alt')}
                            className="w-full py-1.5 rounded bg-zinc-800 hover:bg-sky-500 hover:text-black text-zinc-300 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Usar Nesta Cadeia
                          </button>
                        </div>

                        {/* Option Free */}
                        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-emerald-400 block mb-1">
                              🎁 Gratuita de Alta Qualidade
                            </span>
                            <div className="text-xs font-bold text-white mb-2">
                              {step.alternatives.free}
                            </div>
                          </div>
                          <button
                            onClick={() => handleSwapPlugin(step.id, step.alternatives.free, 'free')}
                            className="w-full py-1.5 rounded bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-300 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Usar Nesta Cadeia
                          </button>
                        </div>

                        {/* Option Native DAW */}
                        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-purple-400 block mb-1">
                              🎹 Nativo da DAW ({settings.mainDaw || 'FL Studio'})
                            </span>
                            <div className="text-xs font-bold text-white mb-2">
                              {step.alternatives.native}
                            </div>
                          </div>
                          <button
                            onClick={() => handleSwapPlugin(step.id, step.alternatives.native, 'native')}
                            className="w-full py-1.5 rounded bg-zinc-800 hover:bg-purple-500 hover:text-white text-zinc-300 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Usar Nesta Cadeia
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Producer Notes */}
                  <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                    {editingNoteStepId === step.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="Escreve uma anotação pessoal para este plugin..."
                          className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-750 text-white text-xs"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveStepNote(step.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs cursor-pointer"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingNoteStepId(null)}
                          className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
                          <span>
                            {step.myNote ? (
                              <strong className="text-zinc-200">{step.myNote}</strong>
                            ) : (
                              <span className="italic text-zinc-500">Nenhuma anotação pessoal ainda.</span>
                            )}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingNoteStepId(step.id);
                            setTempNote(step.myNote || '');
                          }}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          {step.myNote ? 'Editar anotação' : '+ Adicionar anotação'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SAVED CHAINS LIBRARY                                              */}
      {/* ========================================================================= */}
      {pageMode === 'library' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Chain List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase text-zinc-400">
                Minhas Cadeias ({filteredLibraryChains.length})
              </span>
              <button
                onClick={onOpenNewChainModal}
                className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Cadeia
              </button>
            </div>

            <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {filteredLibraryChains.map((chain) => {
                const isSelected = chain.id === activeLibraryChain?.id;
                return (
                  <div
                    key={chain.id}
                    onClick={() => setSelectedChainId(chain.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                      isSelected
                        ? 'bg-zinc-800/90 border-amber-500/70 shadow-lg'
                        : 'bg-zinc-900 border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-950 text-amber-400 border border-zinc-800">
                        {chain.target}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(chain);
                        }}
                        className="text-zinc-500 hover:text-amber-400 p-0.5 cursor-pointer"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            chain.favorite ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-100 mb-1">
                      {chain.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span>{chain.style}</span>
                      <span>•</span>
                      <span>{(chain.steps || []).length} plugins</span>
                      <span>•</span>
                      <span
                        className={
                          chain.level === 'Iniciante'
                            ? 'text-emerald-400'
                            : chain.level === 'Intermediário'
                            ? 'text-yellow-400'
                            : 'text-rose-400'
                        }
                      >
                        {chain.level}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Library Chain Details */}
          <div className="lg:col-span-8 space-y-4">
            {activeLibraryChain ? (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {activeLibraryChain.target}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">
                        {activeLibraryChain.style}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">
                        {activeLibraryChain.level}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-white">
                      {activeLibraryChain.name}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">{activeLibraryChain.goal}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyDawBlueprint(activeLibraryChain)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Roteiro
                    </button>
                    <button
                      onClick={() => handleDuplicate(activeLibraryChain)}
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteChainConfirm({ id: activeLibraryChain.id, name: activeLibraryChain.name })}
                      className="p-2 rounded-lg bg-zinc-800 text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                      title="Excluir da Biblioteca"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-3">
                  {(activeLibraryChain.steps || []).map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {step.pluginName}
                          </span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {step.category}
                          </span>
                        </div>
                        <p className="text-xs text-amber-400/80 font-medium mt-0.5">
                          {step.objective}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">{step.whyIsItHere}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500">
                Nenhuma cadeia selecionada.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: A/B CHAIN COMPARATOR                                              */}
      {/* ========================================================================= */}
      {pageMode === 'compare' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-amber-400 flex items-center gap-2">
                <Shuffle className="w-4 h-4" />
                Comparador A/B de Cadeias de Áudio
              </h3>
              <p className="text-xs text-zinc-400">
                Compara a estrutura de processamento de duas cadeias lado a lado para entender abordagens diferentes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chain A */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-amber-400">CADEIA A:</span>
                <select
                  value={selectedChainId}
                  onChange={(e) => setSelectedChainId(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 text-xs rounded-lg px-2 py-1 text-white"
                >
                  {chains.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {activeLibraryChain && (
                <div className="space-y-2">
                  {(activeLibraryChain.steps || []).map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs"
                    >
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-amber-400">{idx + 1}.</span>
                        <span>{step.pluginName}</span>
                        <span className="text-zinc-500">({step.category})</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-0.5">{step.objective}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chain B */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-sky-400">CADEIA B:</span>
                <select
                  value={compareChainIdB}
                  onChange={(e) => setCompareChainIdB(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 text-xs rounded-lg px-2 py-1 text-white"
                >
                  {chains.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {compareChainB && (
                <div className="space-y-2">
                  {(compareChainB.steps || []).map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs"
                    >
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-sky-400">{idx + 1}.</span>
                        <span>{step.pluginName}</span>
                        <span className="text-zinc-500">({step.category})</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-0.5">{step.objective}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Confirm Delete Chain from Library Modal */}
      <ConfirmModal
        isOpen={!!deleteChainConfirm}
        title="Eliminar Cadeia de Processamento"
        message={`Tens a certeza que queres eliminar a cadeia "${deleteChainConfirm?.name}" da biblioteca?`}
        confirmText="Eliminar Cadeia"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (deleteChainConfirm) {
            await onDeleteChain(deleteChainConfirm.id);
            showToast('Cadeia eliminada da biblioteca', 'info');
            const remaining = chains.filter((c) => c.id !== deleteChainConfirm.id);
            setSelectedChainId(remaining[0]?.id || '');
            setDeleteChainConfirm(null);
          }
        }}
        onClose={() => setDeleteChainConfirm(null)}
      />

      {/* Confirm Remove Step Modal */}
      <ConfirmModal
        isOpen={!!deleteStepConfirm}
        title="Remover Plugin da Cadeia"
        message={`Queres remover "${deleteStepConfirm?.name}" desta cadeia de processamento?`}
        confirmText="Remover Plugin"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (deleteStepConfirm !== null) {
            const updatedSteps = (guideChain.steps || []).filter(
              (_, i) => i !== deleteStepConfirm.index
            );
            setGuideChain((prev) => ({ ...prev, steps: updatedSteps }));
            showToast(`Plugin "${deleteStepConfirm.name}" removido da cadeia`, 'info');
            setDeleteStepConfirm(null);
          }
        }}
        onClose={() => setDeleteStepConfirm(null)}
      />
    </div>
  );
}
