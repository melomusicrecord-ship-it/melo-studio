import { useState } from 'react';
import {
  Sparkles,
  Volume2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Power,
  Info,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  Share2,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { VocalChainPreset, ChainStepState, VocalExperienceLevel } from '../../types';

interface VocalChainVisualizerProps {
  chain: VocalChainPreset;
  experienceLevel: VocalExperienceLevel;
  onOpenPluginModal: (pluginName: string) => void;
  onSaveChain?: (chain: VocalChainPreset) => void;
  onExportChain?: (chain: VocalChainPreset) => void;
}

export function VocalChainVisualizer({
  chain,
  experienceLevel,
  onOpenPluginModal,
  onSaveChain,
  onExportChain,
}: VocalChainVisualizerProps) {
  // Local state for interactive steps
  const [steps, setSteps] = useState(chain.steps);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [isAbActive, setIsAbActive] = useState(false); // A/B bypass simulation
  const [matchGainDb, setMatchGainDb] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Toggle step bypass / state
  const toggleStepBypass = (index: number) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const newState: ChainStepState = s.state === 'bypass' ? 'ok' : 'bypass';
        return { ...s, state: newState };
      })
    );
  };

  // Change step state (OK, Atenção, Problema)
  const setStepStatus = (index: number, state: ChainStepState) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, state } : s))
    );
  };

  const currentStep = steps[selectedStepIndex] || steps[0];

  const handleCopyChainText = () => {
    const summary = `${chain.title} (${chain.style})
${chain.steps.map((s, i) => `${i + 1}. [${s.manufacturer}] ${s.plugin} - ${s.role} | Dosagem: ${s.initialDosage}`).join('\n')}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Chain Ribbon / Breadcrumb */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 sm:p-5 space-y-4">
        {/* Ribbon Header with A/B and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              FLUXO SERIAL DE PROCESSAMENTO ({steps.length} SLOTS)
            </span>
            {isAbActive && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 animate-pulse">
                Modo A/B (Bypass Geral Ativo)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* A/B Comparison Toggle */}
            <button
              onClick={() => setIsAbActive(!isAbActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isAbActive
                  ? 'bg-rose-500 text-black border-rose-400'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-750 hover:border-amber-500/50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAbActive ? 'animate-spin' : ''}`} />
              <span>{isAbActive ? 'Ouvindo Seco (B)' : 'Comparar A/B'}</span>
            </button>

            {/* Copy & Export */}
            <button
              onClick={handleCopyChainText}
              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-750 text-zinc-400 hover:text-white transition-colors"
              title="Copiar resumo da cadeia"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Visual Slots Nodes (Horizontal scrolling blocks with arrows) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {steps.map((step, idx) => {
            const isSelected = selectedStepIndex === idx;
            const isBypassed = step.state === 'bypass' || isAbActive;

            let badgeColor = 'bg-emerald-500';
            if (step.state === 'warning') badgeColor = 'bg-amber-500';
            if (step.state === 'critical') badgeColor = 'bg-rose-500';
            if (isBypassed) badgeColor = 'bg-zinc-600';

            return (
              <div key={idx} className="flex items-center gap-2 shrink-0">
                <div
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer min-w-[150px] max-w-[170px] relative ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                      : isBypassed
                      ? 'bg-zinc-950/60 border-zinc-850 opacity-60'
                      : 'bg-[#121216] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                  }`}
                >
                  {/* Slot Top Bar */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-zinc-500">
                      SLOT {step.number}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${badgeColor}`} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepBypass(idx);
                        }}
                        className={`p-0.5 rounded text-[10px] hover:text-white ${
                          step.state === 'bypass' ? 'text-zinc-600' : 'text-zinc-400'
                        }`}
                        title="Ativar/Desativar slot"
                      >
                        <Power className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Plugin Name & Manufacturer */}
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-white block truncate">
                      {step.plugin}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400/90 block truncate uppercase">
                      {step.manufacturer}
                    </span>
                  </div>

                  {/* Role */}
                  <span className="text-[9px] text-zinc-400 block truncate mt-1">
                    {step.role}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Step Deep Dive Inspector */}
      {currentStep && (
        <div className="rounded-2xl bg-[#121216] border border-amber-500/30 p-5 sm:p-6 space-y-5 shadow-xl">
          {/* Header of Inspector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-400 text-lg">
                {currentStep.number}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {currentStep.plugin}
                  </h3>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                    {currentStep.manufacturer}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                    {currentStep.role}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Slot de Processamento Ativo • Ajuste e Supervisão Técnica
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenPluginModal(currentStep.plugin)}
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Info className="w-4 h-4" />
                <span>Aprender este Plugin</span>
              </button>

              <button
                onClick={() => toggleStepBypass(selectedStepIndex)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  currentStep.state === 'bypass'
                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{currentStep.state === 'bypass' ? 'Slot em Bypass' : 'Slot Ativo'}</span>
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Por que está aqui */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>POR QUE ESTÁ AQUI NESTA POSIÇÃO?</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{currentStep.why}</p>
            </div>

            {/* Como ajustar */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Sliders className="w-4 h-4" />
                <span>COMO AJUSTAR</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{currentStep.how}</p>
            </div>

            {/* Dosagem inicial sugerida */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>DOSAGEM INICIAL SUGERIDA</span>
              </div>
              <p className="font-mono text-zinc-200 text-xs font-semibold">{currentStep.initialDosage}</p>
              <p className="text-[11px] text-zinc-400">
                Inicie neste valor e calibre usando o instrumental ligado.
              </p>
            </div>

            {/* O que ouvir */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Volume2 className="w-4 h-4" />
                <span>O QUE OUVIR (REFERÊNCIA DE OUVIDO)</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{currentStep.whatToHear}</p>
            </div>
          </div>

          {/* Estado de Auditoria Manual */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-zinc-400 font-medium">
              Classificar estado desta etapa na sua mixagem:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStepStatus(selectedStepIndex, 'ok')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  currentStep.state === 'ok' || !currentStep.state
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
              >
                🟢 OK
              </button>
              <button
                onClick={() => setStepStatus(selectedStepIndex, 'warning')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  currentStep.state === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
              >
                🟡 Atenção
              </button>
              <button
                onClick={() => setStepStatus(selectedStepIndex, 'critical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  currentStep.state === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
              >
                🔴 Problema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
