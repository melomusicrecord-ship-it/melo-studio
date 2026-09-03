import { useState, useRef } from 'react';
import { X, Activity, Music, Clock, Waves, RotateCcw } from 'lucide-react';

interface QuickToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickToolsModal({ isOpen, onClose }: QuickToolsModalProps) {
  const [activeTab, setActiveTab] = useState<'bpm' | 'hz' | 'delay'>('bpm');

  // BPM Tapper State
  const [bpm, setBpm] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const tapTimes = useRef<number[]>([]);

  const handleTap = () => {
    const now = performance.now();
    const times = tapTimes.current;

    // Reset if last tap was more than 2.5 seconds ago
    if (times.length > 0 && now - times[times.length - 1] > 2500) {
      times.length = 0;
    }

    times.push(now);
    setTapCount(times.length);

    if (times.length > 1) {
      // Keep up to last 8 taps
      if (times.length > 8) times.shift();

      let intervals: number[] = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      setBpm(calculatedBpm);
    }
  };

  const resetBpm = () => {
    tapTimes.current = [];
    setBpm(null);
    setTapCount(0);
  };

  const currentBpm = bpm || 120;
  const quarterMs = Math.round(60000 / currentBpm);
  const eighthMs = Math.round(quarterMs / 2);
  const sixteenthMs = Math.round(eighthMs / 2);
  const dottedEighthMs = Math.round(eighthMs * 1.5);
  const tripletQuarterMs = Math.round((60000 * 2) / (currentBpm * 3));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Ferramentas de Áudio do Estúdio</h3>
              <p className="text-[11px] text-zinc-400">Utilitários rápidos para produção e mixagem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('bpm')}
            className={`px-3 py-2 border-b-2 font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'bpm'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>BPM Tap & Delay</span>
          </button>
          <button
            onClick={() => setActiveTab('hz')}
            className={`px-3 py-2 border-b-2 font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'hz'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Guia de Frequências (EQ)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {activeTab === 'bpm' && (
            <div className="space-y-5">
              {/* Tap Button Box */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 text-center flex flex-col items-center">
                <span className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                  BPM Calculado
                </span>
                <div className="text-5xl font-black text-white my-2 font-mono tracking-tight text-amber-400">
                  {bpm !== null ? bpm : '--'}
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  {tapCount > 0 ? `${tapCount} toques registrados` : 'Clica no botão no ritmo da música'}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTap}
                    className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-base shadow-lg shadow-amber-500/20 active:scale-95 transition-all select-none cursor-pointer"
                  >
                    TAP TEMPO
                  </button>
                  <button
                    onClick={resetBpm}
                    className="p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 active:scale-95 transition-all"
                    title="Reiniciar contagem"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Delay Sync Time Table */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sincronização de Delay (Base: {currentBpm} BPM)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">1/4 (Semínima)</span>
                    <span className="font-mono font-bold text-sky-300">{quarterMs} ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">1/8 (Colcheia)</span>
                    <span className="font-mono font-bold text-sky-300">{eighthMs} ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">1/8 Pontilhada</span>
                    <span className="font-mono font-bold text-amber-300">{dottedEighthMs} ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">1/16 (Semicolcheia)</span>
                    <span className="font-mono font-bold text-sky-300">{sixteenthMs} ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">1/4 Tercina</span>
                    <span className="font-mono font-bold text-emerald-300">{tripletQuarterMs} ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Pre-Delay Reverb Típico</span>
                    <span className="font-mono font-bold text-rose-300">
                      {Math.round(sixteenthMs / 2)} ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hz' && (
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-rose-500/20 flex gap-3 items-start">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold shrink-0">
                  20 - 50 Hz
                </span>
                <div>
                  <h5 className="font-bold text-white">Subgraves Profundos</h5>
                  <p className="text-zinc-400 text-[11px]">
                    Sensação física no estômago. Corte em quase todos os canais para economizar energia, exceto Kick e 808.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/80 border border-amber-500/20 flex gap-3 items-start">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold shrink-0">
                  60 - 120 Hz
                </span>
                <div>
                  <h5 className="font-bold text-white">Peso & Impacto (Punch)</h5>
                  <p className="text-zinc-400 text-[11px]">
                    Corpo do bumbo e nota fundamental do baixo elétrico.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/80 border border-yellow-500/20 flex gap-3 items-start">
                <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-mono font-bold shrink-0">
                  250 - 500 Hz
                </span>
                <div>
                  <h5 className="font-bold text-white">Calor vs. Embolamento (Lama)</h5>
                  <p className="text-zinc-400 text-[11px]">
                    Sensação de som oco ou caixa de papelão. Corte suave de 2-3 dB aqui costuma limpar a mix inteira.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/80 border border-emerald-500/20 flex gap-3 items-start">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold shrink-0">
                  800 - 1.5 kHz
                </span>
                <div>
                  <h5 className="font-bold text-white">Médios & Nasalidade</h5>
                  <p className="text-zinc-400 text-[11px]">
                    Inteligibilidade das palavras e ataque de instrumentos acústicos. Cuidado com excesso (buzina).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/80 border border-sky-500/20 flex gap-3 items-start">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold shrink-0">
                  3 - 6 kHz
                </span>
                <div>
                  <h5 className="font-bold text-white">Presença & Definição</h5>
                  <p className="text-zinc-400 text-[11px]">
                    Traz a voz para a linha de frente. Cuidado com fadiga auditiva e aspereza nos fones.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/80 border border-purple-500/20 flex gap-3 items-start">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold shrink-0">
                  10 - 20 kHz
                </span>
                <div>
                  <h5 className="font-bold text-white">O Ar (Air Band)</h5>
                  <p className="text-zinc-400 text-[11px]">
                    Abertura luxuosa, brilho sedoso e sensação de mix profissional moderna.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-[#0c0c0e] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
