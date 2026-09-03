import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import {
  ProcessingChain,
  ChainStep,
  ChainTarget,
  ChainLevel,
  ChainVersion,
  PluginItem,
  StudioSettings,
} from '../types';
import { useToast } from '../components/Toast';

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
  const [selectedChainId, setSelectedChainId] = useState<string>(
    chains[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'detailed' | 'quick' | 'learn'>('detailed');
  const [learnStepIndex, setLearnStepIndex] = useState(0);
  const [useOnlyOwned, setUseOnlyOwned] = useState(settings.useOnlyOwnedPlugins);
  const [selectedDaw, setSelectedDaw] = useState(settings.mainDaw || 'FL Studio');
  const [editingNoteStepId, setEditingNoteStepId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Compare mode state
  const [isComparing, setIsComparing] = useState(false);
  const [compareChainIdB, setCompareChainIdB] = useState<string>(
    chains[1]?.id || chains[0]?.id || ''
  );

  // Filter chains
  const filteredChains = useMemo(() => {
    return chains.filter((c) => {
      if (subFilter === 'all') return true;
      if (subFilter === 'favorites') return c.favorite;
      if (subFilter === 'compare') return true;
      if (subFilter === 'Lead Vocal') return c.target === 'Lead Vocal';
      if (subFilter === 'Backing Vocal') return c.target === 'Backing Vocal' || c.target === 'Adlibs';
      if (subFilter === '808') return c.target === '808' || c.target === 'Bass';
      if (subFilter === 'Kick') return c.target === 'Kick' || c.target === 'Snare' || c.target === 'Drum Bus';
      if (subFilter === 'Master') return c.target === 'Master' || c.target === 'Mix Bus';
      return true;
    });
  }, [chains, subFilter]);

  const activeChain = chains.find((c) => c.id === selectedChainId) || chains[0];
  const compareChainB = chains.find((c) => c.id === compareChainIdB);

  // Reorder steps
  const handleMoveStep = async (stepIndex: number, direction: 'up' | 'down') => {
    if (!activeChain) return;
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

    const updated = {
      ...activeChain,
      steps: newSteps,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    await onSaveChain(updated);
    showToast('Ordem da chain atualizada', 'success');
  };

  // Toggle favorite
  const handleToggleFavorite = async (chain: ProcessingChain) => {
    const updated = { ...chain, favorite: !chain.favorite };
    await onSaveChain(updated);
    showToast(updated.favorite ? 'Chain favoritada ⭐' : 'Chain removida dos favoritos', 'info');
  };

  // Duplicate chain
  const handleDuplicate = async (chain: ProcessingChain) => {
    const duplicated: ProcessingChain = {
      ...chain,
      id: 'chain-' + Date.now(),
      name: `${chain.name} (Cópia)`,
      isCustom: true,
      updatedAt: new Date().toISOString().split('T')[0],
      steps: chain.steps.map((s) => ({ ...s, id: 'step-' + Math.random().toString(36).substr(2, 6) })),
    };
    await onSaveChain(duplicated);
    setSelectedChainId(duplicated.id);
    showToast('Chain duplicada com sucesso!', 'success');
  };

  // Export to TXT
  const handleExportTxt = (chain: ProcessingChain) => {
    let txt = `=== ${chain.name} ===\n`;
    txt += `Alvo: ${chain.target} | Estilo: ${chain.style} | Nível: ${chain.level}\n`;
    txt += `Objetivo: ${chain.goal}\n\n`;
    txt += `FLUXO DE PROCESSAMENTO:\n`;
    chain.steps.forEach((s) => {
      txt += `\n[${String(s.order).padStart(2, '0')}] ${s.pluginName} (${s.manufacturer}) - ${s.objective}\n`;
      txt += `   • Por quê: ${s.whyIsItHere}\n`;
      txt += `   • O que ouvir: ${s.whatToHear}\n`;
      txt += `   • Alternativa Grátis: ${s.alternatives.free}\n`;
      txt += `   • Alternativa Nativa: ${s.alternatives.native}\n`;
      if (s.myNote) txt += `   • Minha Nota: ${s.myNote}\n`;
    });
    txt += `\nLembre-se: Esta é uma cadeia de partida. O resultado depende da gravação. Usa os teus ouvidos!`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chain.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    showToast('Cadeia exportada em TXT', 'success');
  };

  // Export to JSON
  const handleExportJson = (chain: ProcessingChain) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(chain, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${chain.name.replace(/\s+/g, '_')}.json`;
    a.click();
    showToast('Cadeia exportada em JSON', 'success');
  };

  // Save Step Note
  const handleSaveStepNote = async (stepId: string) => {
    if (!activeChain) return;
    const newSteps = activeChain.steps.map((s) =>
      s.id === stepId ? { ...s, myNote: tempNote } : s
    );
    await onSaveChain({ ...activeChain, steps: newSteps });
    setEditingNoteStepId(null);
    showToast('Nota do plugin salva!', 'success');
  };

  // Delete chain
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Queres mesmo excluir a chain "${name}"?`)) {
      await onDeleteChain(id);
      showToast('Chain excluída', 'info');
      if (selectedChainId === id && chains.length > 1) {
        setSelectedChainId(chains.find((c) => c.id !== id)?.id || '');
      }
    }
  };

  if (chains.length === 0) {
    return (
      <div className="py-16 text-center text-zinc-400">
        <GitMerge className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
        <h3 className="text-base font-bold text-white mb-1">Ainda não tens nenhuma chain cadastrada</h3>
        <p className="text-xs text-zinc-500 mb-4">Cria a tua primeira cadeia ou restaura os dados de exemplo.</p>
        <button
          onClick={onOpenNewChainModal}
          className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
        >
          Criar Primeira Chain
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Principle Banner */}
      <div className="p-3.5 rounded-xl bg-[#121215] border border-amber-500/30 flex items-start gap-3 text-xs text-zinc-300">
        <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
          <Headphones className="w-4 h-4" />
        </div>
        <div className="leading-relaxed">
          <span className="font-bold text-amber-300 block mb-0.5">
            Princípio Fundamental do Melo Studio:
          </span>
          "Esta é uma cadeia de partida. O resultado depende da captação e da gravação. Usa os teus ouvidos. Nem todo processamento é necessário. Se três plugins resolvem, não uses dez."
        </div>
      </div>

      {/* Main Chains Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Chains Selector & Filters */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Cadeias Disponíveis ({filteredChains.length})
            </span>
            <button
              onClick={onOpenNewChainModal}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Chain</span>
            </button>
          </div>

          {/* List of chains */}
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filteredChains.map((chain) => {
              const isSelected = chain.id === activeChain?.id;
              return (
                <div
                  key={chain.id}
                  onClick={() => {
                    setSelectedChainId(chain.id);
                    setLearnStepIndex(0);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                    isSelected
                      ? 'bg-zinc-800/90 border-amber-500/70 shadow-lg'
                      : 'bg-[#121215] border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-sky-400 border border-zinc-800">
                      {chain.target}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(chain);
                      }}
                      className="text-zinc-500 hover:text-amber-400 p-0.5"
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
                    <span>{chain.steps.length} plugins</span>
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

        {/* Right Column: Active Chain Viewer / Editor */}
        <div className="lg:col-span-8 space-y-4">
          {activeChain && (
            <div className="p-5 rounded-2xl bg-[#121215] border border-zinc-800/90 shadow-2xl space-y-5">
              {/* Chain Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {activeChain.target}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                      {activeChain.style}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                      Fluxo: {activeChain.routingType}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {activeChain.name}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">{activeChain.goal}</p>
                </div>

                {/* Header Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleFavorite(activeChain)}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-amber-400"
                    title="Favoritar chain"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        activeChain.favorite ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDuplicate(activeChain)}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-white"
                    title="Duplicar chain"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExportTxt(activeChain)}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-white"
                    title="Exportar TXT"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExportJson(activeChain)}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-white"
                    title="Exportar JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {activeChain.isCustom && (
                    <button
                      onClick={() => handleDelete(activeChain.id, activeChain.name)}
                      className="p-2 rounded-lg bg-zinc-900 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                      title="Excluir chain"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* View Mode Switcher & DAW Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-850 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      viewMode === 'detailed'
                        ? 'bg-zinc-800 text-amber-300 border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Modo Detalhado
                  </button>
                  <button
                    onClick={() => setViewMode('quick')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      viewMode === 'quick'
                        ? 'bg-zinc-800 text-amber-300 border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Modo Rápido
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('learn');
                      setLearnStepIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                      viewMode === 'learn'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Aprender Esta Chain</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-zinc-400">
                  <label className="text-[11px]">DAW Nativo:</label>
                  <select
                    value={selectedDaw}
                    onChange={(e) => setSelectedDaw(e.target.value)}
                    className="bg-zinc-900 border border-zinc-750 text-zinc-200 rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="FL Studio">FL Studio</option>
                    <option value="Studio One">Studio One</option>
                    <option value="Ableton Live">Ableton Live</option>
                    <option value="Logic Pro">Logic Pro</option>
                    <option value="Reaper">Reaper</option>
                    <option value="Pro Tools">Pro Tools</option>
                    <option value="Cubase">Cubase</option>
                  </select>
                </div>
              </div>

              {/* Mode: LEARN (Aprender esta chain step-by-step) */}
              {viewMode === 'learn' && (
                <div className="p-5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-3">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>
                        Passo {learnStepIndex + 1} de {activeChain.steps.length}
                      </span>
                    </span>
                    <div className="flex gap-1">
                      {activeChain.steps.map((_, i) => (
                        <div
                          key={i}
                          onClick={() => setLearnStepIndex(i)}
                          className={`w-6 h-1.5 rounded-full cursor-pointer transition-all ${
                            i === learnStepIndex
                              ? 'bg-emerald-400'
                              : i < learnStepIndex
                              ? 'bg-emerald-600/50'
                              : 'bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {activeChain.steps[learnStepIndex] && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-zinc-500 uppercase font-bold">
                            Etapa {String(activeChain.steps[learnStepIndex].order).padStart(2, '0')}
                          </span>
                          <h3 className="text-lg font-bold text-white">
                            {activeChain.steps[learnStepIndex].pluginName}
                          </h3>
                          <p className="text-xs text-amber-300 font-medium">
                            {activeChain.steps[learnStepIndex].manufacturer} • {activeChain.steps[learnStepIndex].objective}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800">
                          <span className="font-bold text-amber-400 block mb-1 flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" />
                            🎯 Por que está aqui?
                          </span>
                          <p className="text-zinc-300 leading-relaxed">
                            {activeChain.steps[learnStepIndex].whyIsItHere}
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800">
                          <span className="font-bold text-sky-400 block mb-1 flex items-center gap-1">
                            <Headphones className="w-3.5 h-3.5" />
                            👂 O que devo ouvir?
                          </span>
                          <p className="text-zinc-300 leading-relaxed">
                            {activeChain.steps[learnStepIndex].whatToHear}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs">
                        <span className="font-bold text-rose-300 block mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          ⚠️ Quando não usar?
                        </span>
                        <p className="text-zinc-300 leading-relaxed">
                          {activeChain.steps[learnStepIndex].whenNotToUse}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs">
                        <span className="font-bold text-zinc-300 block mb-2 flex items-center gap-1">
                          <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                          Alternativas por Função:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div>
                            <span className="text-zinc-500 block">Profissional</span>
                            <span className="text-zinc-200 font-medium">
                              {activeChain.steps[learnStepIndex].alternatives.pro}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Alternativa</span>
                            <span className="text-zinc-200 font-medium">
                              {activeChain.steps[learnStepIndex].alternatives.alt}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Gratuito</span>
                            <span className="text-emerald-400 font-medium">
                              {activeChain.steps[learnStepIndex].alternatives.free}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Nativo ({selectedDaw})</span>
                            <span className="text-amber-400 font-medium">
                              {activeChain.steps[learnStepIndex].alternatives.native}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          disabled={learnStepIndex === 0}
                          onClick={() => setLearnStepIndex((i) => Math.max(0, i - 1))}
                          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-200 text-xs font-semibold"
                        >
                          Anterior
                        </button>
                        {learnStepIndex < activeChain.steps.length - 1 ? (
                          <button
                            onClick={() => setLearnStepIndex((i) => i + 1)}
                            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg"
                          >
                            Próximo Plugin →
                          </button>
                        ) : (
                          <button
                            onClick={() => setViewMode('detailed')}
                            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg"
                          >
                            Concluir Aprendizagem ✓
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode: QUICK or DETAILED Vertical Chain Flow */}
              {viewMode !== 'learn' && (
                <div className="space-y-3">
                  <div className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 flex items-center justify-between">
                    <span>Fluxo da Chain Vertical (Sinal de Áudio de Cima para Baixo)</span>
                    <span>{activeChain.steps.length} plugins em série</span>
                  </div>

                  {activeChain.steps.map((step, idx) => (
                    <div key={step.id} className="relative group">
                      {/* Vertical connector line */}
                      {idx < activeChain.steps.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-zinc-800 group-hover:bg-amber-500/40 transition-colors z-0" />
                      )}

                      <div className="relative z-10 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 hover:border-zinc-700 transition-all space-y-3">
                        {/* Step title row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-750 flex items-center justify-center font-mono font-bold text-xs text-amber-400 shrink-0">
                              {String(step.order).padStart(2, '0')}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">
                                  {step.pluginName}
                                </h4>
                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                  {step.category}
                                </span>
                              </div>
                              <span className="text-xs text-zinc-400">
                                {step.manufacturer} • <span className="text-amber-300 font-medium">{step.objective}</span>
                              </span>
                            </div>
                          </div>

                          {/* Move up / down controls */}
                          <div className="flex items-center gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMoveStep(idx, 'up')}
                              className="p-1.5 rounded bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-20"
                              title="Mover para cima"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={idx === activeChain.steps.length - 1}
                              onClick={() => handleMoveStep(idx, 'down')}
                              className="p-1.5 rounded bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-20"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Detailed explanation fields if in detailed view */}
                        {viewMode === 'detailed' && (
                          <div className="space-y-2 pt-2 border-t border-zinc-900 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-zinc-300">
                              <p>
                                <span className="text-amber-400 font-semibold">🎯 Por quê:</span>{' '}
                                {step.whyIsItHere}
                              </p>
                              <p>
                                <span className="text-sky-400 font-semibold">👂 O que ouvir:</span>{' '}
                                {step.whatToHear}
                              </p>
                            </div>

                            {step.whenNotToUse && (
                              <p className="text-zinc-400 text-[11px]">
                                <span className="text-rose-400 font-semibold">⚠️ Quando evitar:</span>{' '}
                                {step.whenNotToUse}
                              </p>
                            )}

                            {/* Alternatives row */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400">
                              <span>
                                <strong className="text-zinc-300">Grátis:</strong>{' '}
                                {step.alternatives.free}
                              </span>
                              <span>•</span>
                              <span>
                                <strong className="text-zinc-300">Nativo ({selectedDaw}):</strong>{' '}
                                {step.alternatives.native}
                              </span>
                            </div>

                            {/* Custom Note Section */}
                            <div className="pt-2">
                              {editingNoteStepId === step.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={tempNote}
                                    onChange={(e) => setTempNote(e.target.value)}
                                    placeholder="Escreve uma nota pessoal para este plugin..."
                                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveStepNote(step.id)}
                                    className="p-1 rounded bg-emerald-500 text-zinc-950 font-bold"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingNoteStepId(null)}
                                    className="p-1 rounded bg-zinc-800 text-zinc-400"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-900/50 px-2.5 py-1.5 rounded-lg border border-zinc-850">
                                  <span>
                                    {step.myNote ? (
                                      <span className="text-amber-300 italic">"{step.myNote}"</span>
                                    ) : (
                                      <span className="text-zinc-600">Sem notas pessoais neste plugin</span>
                                    )}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingNoteStepId(step.id);
                                      setTempNote(step.myNote || '');
                                    }}
                                    className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-semibold ml-2"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Editar</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quick View alternative summary */}
                        {viewMode === 'quick' && (
                          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                            <span>Alt. Gratuita: {step.alternatives.free}</span>
                            <span className="text-amber-400">Nativo: {step.alternatives.native}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
