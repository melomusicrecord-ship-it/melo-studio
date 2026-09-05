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
  GitFork,
  Layers,
  Radio,
  Split,
  Workflow,
  ArrowDown,
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
  const [viewMode, setViewMode] = useState<'slots' | 'routing'>('slots');

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
        {/* Ribbon Header with Mode Toggle, A/B and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              <button
                onClick={() => setViewMode('slots')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'slots'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Slots Sequenciais ({steps.length})</span>
              </button>
              <button
                onClick={() => setViewMode('routing')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'routing'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Roteamento da DAW (Inserts, Sends & Bus)</span>
              </button>
            </div>

            {isAbActive && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 animate-pulse">
                Modo A/B (Bypass Geral)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* A/B Comparison Toggle */}
            <button
              onClick={() => setIsAbActive(!isAbActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
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
              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-750 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Copiar resumo da cadeia"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* View Mode 1: Visual Slots Nodes (Horizontal scrolling blocks with arrows) */}
        {viewMode === 'slots' ? (
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
        ) : (
          /* View Mode 2: Full DAW Channel Architecture Routing Map */
          <div className="space-y-6 pt-2">
            <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Organização da DAW:</strong> O sinal percorre a pista do <strong>Lead Vocal</strong> em cascata, envia cópias para os <strong>Canais Auxiliares (Sends)</strong>, soma-se no <strong>Vocal Bus</strong> e deságua no <strong>Master Bus</strong>.
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 shrink-0">
                Padrão Indústria
              </span>
            </div>

            {/* DAW Channel Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* CANAL 1: PISTA LEAD VOCAL (INSERTS) */}
              <div className="rounded-xl bg-zinc-900/90 border border-amber-500/30 p-4 space-y-3.5 flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        CANAL 01 • LEAD VOCAL
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      INSERTS (SECO)
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400">
                    Ordem sequencial obrigatória no canal da voz gravada:
                  </p>

                  <div className="space-y-2">
                    {steps.map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedStepIndex(idx);
                          setViewMode('slots');
                        }}
                        className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 transition-colors cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded bg-zinc-800 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white truncate block">
                              {s.plugin}
                            </span>
                            <span className="text-[10px] text-zinc-400 truncate block">
                              {s.role}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase shrink-0">
                          Slot {s.number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Routing Out from Lead Vocal */}
                <div className="pt-3 border-t border-zinc-800 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-purple-300">
                    <span className="flex items-center gap-1 font-semibold">
                      <Split className="w-3.5 h-3.5" /> Send Aux 1 (Reverb):
                    </span>
                    <span className="font-mono text-zinc-400">-12 dB</span>
                  </div>
                  <div className="flex items-center justify-between text-sky-300">
                    <span className="flex items-center gap-1 font-semibold">
                      <Split className="w-3.5 h-3.5" /> Send Aux 2 (Delay):
                    </span>
                    <span className="font-mono text-zinc-400">-16 dB</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-300 pt-1 font-bold">
                    <span className="flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5" /> Saída (Fader Output):
                    </span>
                    <span className="text-amber-400 font-mono">➜ VOCAL BUS</span>
                  </div>
                </div>
              </div>

              {/* CANAL 2: CANAIS AUXILIARES (SENDS FX) */}
              <div className="rounded-xl bg-zinc-900/90 border border-purple-500/30 p-4 space-y-4 flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        CANAIS AUXILIARES (SENDS)
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
                      PARALELO 3D
                    </span>
                  </div>

                  {/* AUX 1: REVERB LARGO COM DUCKING */}
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-purple-400" /> AUX 1: REVERB LARGO
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">100% WET</span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-zinc-300">
                      <div className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold font-mono">1º</span>
                        <span><strong>EQ Abbey Road:</strong> Corta &lt; 500 Hz e &gt; 7 kHz (elimina a lama).</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold font-mono">2º</span>
                        <span><strong>Reverb 3D:</strong> Valhalla VintageVerb (Decay 2.8s, Pre-delay 35ms).</span>
                      </div>
                      <div className="flex items-start gap-1.5 bg-purple-950/40 p-1.5 rounded border border-purple-500/30">
                        <span className="text-amber-400 font-bold font-mono">3º</span>
                        <span><strong>Sidechain Ducking:</strong> Compressor linkado ao Lead Vocal; atenua 4 a 6 dB enquanto canta!</span>
                      </div>
                    </div>
                  </div>

                  {/* AUX 2: DELAY RÍTMICO */}
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-sky-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-sky-400" /> AUX 2: DELAY RÍTMICO
                      </span>
                      <span className="text-[9px] font-mono text-sky-400 font-bold">100% WET</span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-zinc-300">
                      <div className="flex items-start gap-1.5">
                        <span className="text-sky-400 font-bold font-mono">1º</span>
                        <span><strong>EQ Filtro:</strong> HPF 400 Hz e LPF 4.5 kHz (para não sibilar).</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-sky-400 font-bold font-mono">2º</span>
                        <span><strong>H-Delay / EchoBoy:</strong> Tempo 1/8 Dotted ou Ping-Pong estéreo.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-sky-400 font-bold font-mono">3º</span>
                        <span><strong>Ducking / Automação:</strong> Ecos abrem nas pausas do verso.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Saídas dos Sends:</span>
                  <span className="text-amber-400 font-bold font-mono">➜ VOCAL BUS</span>
                </div>
              </div>

              {/* CANAL 3: CANAL DE VOCAL BUS (BUSH / SUBMIX) */}
              <div className="rounded-xl bg-zinc-900/90 border border-amber-500/30 p-4 space-y-3.5 flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        CANAL 03 • VOCAL BUS
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      SUBGRUPO ("BUSH")
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400">
                    Soma de <strong>Lead + Backings + Reverb + Delay</strong> sob o mesmo teto acústico:
                  </p>

                  <div className="space-y-2">
                    {/* Bus Slot 1 */}
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono flex items-center justify-center font-bold">1</span>
                          FabFilter Pro-MB / Dynamic EQ
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight">
                        Doma o acúmulo de médios (250Hz e 3.5kHz) quando várias vozes cantam juntas no refrão.
                      </p>
                    </div>

                    {/* Bus Slot 2 */}
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono flex items-center justify-center font-bold">2</span>
                          SSL G-Master Buss Compressor
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight">
                        A cola analógica definitiva. Attack: 30ms, Release: Auto, Ratio 2:1 ou 4:1 com 1 a 2 dB de GR.
                      </p>
                    </div>

                    {/* Bus Slot 3 */}
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono flex items-center justify-center font-bold">3</span>
                          FabFilter Saturn 2 / Waves J37
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight">
                        Saturação Clean Tape sutil (10% drive) para unir timbres com harmônicos aveludados.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-zinc-400">Destino do Vocal Bus:</span>
                  <span className="text-emerald-400 font-mono">➜ MASTER BUS</span>
                </div>
              </div>

              {/* CANAL 4: CANAL MASTER BUS (LIMITER & SAÍDA) */}
              <div className="rounded-xl bg-zinc-900/90 border border-emerald-500/30 p-4 space-y-3.5 flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        CANAL 04 • MASTER BUS
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                      SAÍDA FINAL
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400">
                    Último estágio de processamento estéreo para streaming comercial:
                  </p>

                  <div className="space-y-2">
                    {/* Master Slot 1 */}
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">1</span>
                          Master EQ / Pultec Tonal
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight">
                        Ajuste tonal sutil da música inteira (+0.5 dB no topo a 16kHz e graves limpos).
                      </p>
                    </div>

                    {/* Master Slot 2 */}
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-emerald-500/30 space-y-1 bg-emerald-950/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-emerald-500/30 text-emerald-300 text-[10px] font-mono flex items-center justify-center font-bold">2</span>
                          FabFilter Pro-L 2 (Limiter)
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-300 leading-tight">
                        Modo Modern, Lookahead 0.8ms, True Peak ON, Ceiling -1.0 dBTP. Ganho para 1.5 a 2.5 dB GR nos picos.
                      </p>
                    </div>

                    {/* Master Slot 3 */}
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">3</span>
                          Youlean Loudness Meter 2
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight">
                        Último plugin da cadeia. Mede LUFS Integrado (-9 a -10 LUFS) e confirma True Peak &lt; -1.0 dB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-zinc-400">Entrega do Áudio:</span>
                  <span className="text-emerald-400 font-mono">🔊 MONITORES / STREAMING</span>
                </div>
              </div>
            </div>
          </div>
        )}
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
