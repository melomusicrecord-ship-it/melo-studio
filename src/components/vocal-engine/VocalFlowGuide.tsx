import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, BookOpen, Volume2, AlertTriangle, ShieldCheck, Wrench, Layers } from 'lucide-react';
import { VOCAL_FLOW_STEPS } from '../../data/vocalEngineData';
import { VocalFlowStep } from '../../types';

interface VocalFlowGuideProps {
  onOpenPluginModal: (pluginName: string) => void;
}

export function VocalFlowGuide({ onOpenPluginModal }: VocalFlowGuideProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>('01-preparacao');

  const toggleStep = (id: string) => {
    setExpandedStep(expandedStep === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-[#121216] border border-zinc-800 p-5 sm:p-6 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Workflow Educativo Master • Do Ganho Bruto à Masterização</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          📚 As 16 Etapas Definitivas da Mixagem Vocal
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-3xl">
          Entenda a lógica de encadeamento profissional de processamento vocal. Cada etapa possui um propósito acústico 
          indispensável, parâmetros de referência, dosagem segura e alternativas com plugins Waves e FabFilter.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {VOCAL_FLOW_STEPS.map((step) => {
          const isOpen = expandedStep === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all duration-150 overflow-hidden ${
                isOpen
                  ? 'bg-zinc-900 border-amber-500/50 shadow-xl shadow-amber-500/5'
                  : 'bg-[#121216] border-zinc-800 hover:border-zinc-700 hover:bg-[#15151a]'
              }`}
            >
              {/* Step Summary Bar */}
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 font-mono transition-colors ${
                      isOpen
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-zinc-800 text-amber-400 border border-zinc-700'
                    }`}
                  >
                    {step.stepNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-sm sm:text-base tracking-tight truncate">
                        {step.title}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {step.stage}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs truncate mt-0.5">
                      {step.objective}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden md:flex items-center gap-1">
                    {step.recommendedPlugins.slice(0, 2).map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-amber-400 border border-zinc-800"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                  <div className="p-1 rounded-lg text-zinc-400 hover:text-white">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Step Expanded Content */}
              {isOpen && (
                <div className="p-5 border-t border-zinc-800 space-y-4 text-xs bg-zinc-950/60 animate-in fade-in duration-150">
                  {/* Objetivo detalhado */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[11px] font-bold text-amber-400 block">
                      OBJETIVO DA ETAPA
                    </span>
                    <p className="text-zinc-200 leading-relaxed text-xs sm:text-sm">{step.objective}</p>
                  </div>

                  {/* Plugins recomendados */}
                  <div className="space-y-2">
                    <span className="font-bold text-zinc-200 block">PLUGINS DE REFERÊNCIA:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {step.recommendedPlugins.map((plug, idx) => (
                        <div
                          key={idx}
                          onClick={() => onOpenPluginModal(plug.name)}
                          className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 cursor-pointer transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{plug.name}</span>
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {plug.manufacturer}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-[11px] mt-1 leading-snug">{plug.role}</p>
                          </div>
                          <span className="text-[10px] text-amber-400 font-semibold mt-2 inline-flex items-center gap-1">
                            <span>Aprender este plugin</span> →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parâmetros & Dosagem */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                        <Wrench className="w-4 h-4" />
                        <span>PARÂMETROS DE BASE</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{step.parameters}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <Sparkles className="w-4 h-4" />
                        <span>DOSAGEM & GUIA DE OUVIDO</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{step.dosage.earGuide}</p>
                      {step.dosage.warning && (
                        <p className="text-[10px] text-amber-400 pt-1 border-t border-zinc-800">
                          ⚠️ {step.dosage.warning}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* O que ouvir vs Riscos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                        <Volume2 className="w-4 h-4" />
                        <span>O QUE OUVIR</span>
                      </div>
                      <p className="text-emerald-100/90 leading-relaxed">{step.whatToHear}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span>RISCOS DO EXCESSO</span>
                      </div>
                      <p className="text-rose-100/90 leading-relaxed">{step.risks}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-1.5 text-zinc-300 font-bold mb-1">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>QUANDO NÃO USAR</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">{step.whenNotToUse}</p>
                    </div>
                  </div>

                  {/* Alternativas */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-zinc-400 font-medium">Alternativas econômicas ou nativas:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {step.alternatives.map((alt, i) => (
                        <span key={i} className="text-[10px] px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
