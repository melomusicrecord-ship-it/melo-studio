import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calculator,
  Clock,
  Music,
  Activity,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Zap,
  ArrowRightLeft,
  Percent,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface NoteFreq {
  note: string;
  octave: number;
  name: string;
  freq: number;
  wavelengthCm: number;
  useCase: string;
}

export function ToolsPage({ subFilter = 'all' }: { subFilter?: string }) {
  const { showToast } = useToast();

  // Active Tab: 'delay' | 'pitch' | 'freq'
  const [activeTab, setActiveTab] = useState<'delay' | 'freq' | 'pitch'>('delay');

  // Handle subFilter from navigation if provided
  useEffect(() => {
    if (subFilter === 'freq') setActiveTab('freq');
    else if (subFilter === 'pitch') setActiveTab('pitch');
    else if (subFilter === 'delay') setActiveTab('delay');
  }, [subFilter]);

  // -------------------------------------------------------------
  // 1. DELAY & REVERB SYNC STATES & LOGIC
  // -------------------------------------------------------------
  const [bpm, setBpm] = useState<number>(120);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tap tempo state
  const tapTimesRef = useRef<number[]>([]);
  const [isTapping, setIsTapping] = useState(false);

  const handleTapTempo = () => {
    const now = performance.now();
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 200);

    const taps = tapTimesRef.current.filter((t) => now - t < 3000);
    taps.push(now);
    tapTimesRef.current = taps;

    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 280) {
        setBpm(calculatedBpm);
      }
    }
  };

  // Divisions definition (relative to 1/4 beat = 1.0)
  const timeDivisions = useMemo(() => {
    // 1 beat = 60000 / BPM ms (Quarter note 1/4)
    const quarterMs = bpm > 0 ? 60000 / bpm : 500;

    const divisions = [
      { name: '1/1 (Semibreve / Whole)', factor: 4 },
      { name: '1/2 (Mínima / Half)', factor: 2 },
      { name: '1/4 (Semínima / Quarter)', factor: 1 },
      { name: '1/8 (Colcheia / 8th)', factor: 0.5 },
      { name: '1/16 (Semicolcheia / 16th)', factor: 0.25 },
      { name: '1/32 (Fusa / 32nd)', factor: 0.125 },
      { name: '1/64 (Semifusa / 64th)', factor: 0.0625 },
    ];

    return divisions.map((div) => {
      const normalMs = Math.round(quarterMs * div.factor * 100) / 100;
      const dottedMs = Math.round(normalMs * 1.5 * 100) / 100;
      const tripletMs = Math.round(((normalMs * 2) / 3) * 100) / 100;

      return {
        name: div.name,
        normal: {
          ms: normalMs,
          hz: normalMs > 0 ? (1000 / normalMs).toFixed(2) : '0',
        },
        dotted: {
          ms: dottedMs,
          hz: dottedMs > 0 ? (1000 / dottedMs).toFixed(2) : '0',
        },
        triplet: {
          ms: tripletMs,
          hz: tripletMs > 0 ? (1000 / tripletMs).toFixed(2) : '0',
        },
      };
    });
  }, [bpm]);

  // Reverb presets based on BPM
  const reverbPresets = useMemo(() => {
    const quarterMs = bpm > 0 ? 60000 / bpm : 500;
    return [
      {
        type: 'Vocal Slap / Tight Room',
        preDelayMs: Math.round(quarterMs * 0.0625), // 1/64
        decaySec: (quarterMs * 1.5) / 1000,
        tip: 'Ótimo para dar profundidade íntima sem afastar a voz',
      },
      {
        type: 'Vocal Plate / Modern Lead',
        preDelayMs: Math.round(quarterMs * 0.125), // 1/32
        decaySec: (quarterMs * 4) / 1000,
        tip: 'O pré-delay limpa as consoantes antes do brilho da placa',
      },
      {
        type: 'Snare / Drum Chamber',
        preDelayMs: Math.round(quarterMs * 0.03125),
        decaySec: (quarterMs * 2) / 1000,
        tip: 'Mantém o transiente do Kick/Snare colado no beat',
      },
      {
        type: 'Ballad / Large Hall Reverb',
        preDelayMs: Math.round(quarterMs * 0.25), // 1/16
        decaySec: (quarterMs * 8) / 1000,
        tip: 'Sensação cinematográfica e espacial épica',
      },
    ];
  }, [bpm]);

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label} copiado (${text})`, 'info');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // -------------------------------------------------------------
  // 2. NOTA ➔ FREQUÊNCIA (Hz) & 808 TUNING LOGIC
  // -------------------------------------------------------------
  const [selectedOctave, setSelectedOctave] = useState<number | 'all'>('all');
  const [noteSearch, setNoteSearch] = useState('');
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Generate complete musical notes table (A4 = 440Hz standard)
  const allNotes: NoteFreq[] = useMemo(() => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const notesList: NoteFreq[] = [];

    // Octaves 0 to 8
    for (let oct = 0; oct <= 8; oct++) {
      for (let i = 0; i < noteNames.length; i++) {
        const note = noteNames[i];
        // MIDI note number: C0 = 12, A4 = 69
        const midiNum = (oct + 1) * 12 + i;
        const freq = 440 * Math.pow(2, (midiNum - 69) / 12);
        const roundedFreq = Math.round(freq * 100) / 100;
        // Wavelength = speed of sound (343 m/s) / freq
        const wavelengthCm = Math.round((34300 / freq) * 10) / 10;

        let useCase = 'Médios / Harmônicos';
        if (oct === 0) useCase = 'Sub-Graves Profundos / Rumbler (<32Hz)';
        else if (oct === 1) useCase = '🎯 Sweet Spot de Kicks e 808s (32Hz - 62Hz)';
        else if (oct === 2) useCase = 'Corpo de Baixo / Fundamental de Bumbo';
        else if (oct === 3) useCase = 'Corpo de Voz Masculina / Caixa de Bateria';
        else if (oct === 4) useCase = 'Fundamental de Voz Feminina / Presença de Teclado';
        else if (oct === 5) useCase = 'Clareza / Ataque de Voz e Sintetizadores';
        else if (oct >= 6) useCase = 'Brilho / Ar de Pratos e Harmônicos Superiores';

        notesList.push({
          note,
          octave: oct,
          name: `${note}${oct}`,
          freq: roundedFreq,
          wavelengthCm,
          useCase,
        });
      }
    }
    return notesList;
  }, []);

  const filteredNotes = useMemo(() => {
    return allNotes.filter((item) => {
      if (selectedOctave !== 'all' && item.octave !== selectedOctave) return false;
      if (noteSearch.trim()) {
        const q = noteSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.freq.toString().includes(q) ||
          item.useCase.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allNotes, selectedOctave, noteSearch]);

  // Audio tone generator for hearing exact pitch
  const playTone = (freq: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Volume envelope (soft attack, safe ceiling)
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscRef.current = osc;
      setPlayingFreq(freq);

      // Auto stop after 2.5 seconds
      setTimeout(() => {
        stopTone();
      }, 2500);
    } catch {
      showToast('Áudio não suportado neste navegador', 'warning');
    }
  };

  const stopTone = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {
        // ignore
      }
      oscRef.current = null;
    }
    setPlayingFreq(null);
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopTone();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // -------------------------------------------------------------
  // 3. PITCH-SHIFT & TIME-STRETCH CONVERTER LOGIC
  // -------------------------------------------------------------
  const [semitones, setSemitones] = useState<number>(2);
  const [cents, setCents] = useState<number>(0);
  const [origBpm, setOrigBpm] = useState<number>(120);
  const [targetBpm, setTargetBpm] = useState<number>(128);

  // Semitones to speed ratio
  const pitchCalc = useMemo(() => {
    const totalSemitones = semitones + cents / 100;
    const ratio = Math.pow(2, totalSemitones / 12);
    const speedPercentChange = (ratio - 1) * 100;
    const resampleBpm = bpm * ratio;

    return {
      ratio: ratio.toFixed(4),
      percent: speedPercentChange.toFixed(2),
      resampleBpm: Math.round(resampleBpm * 10) / 10,
    };
  }, [semitones, cents, bpm]);

  // Tempo stretch to pitch shift
  const tempoCalc = useMemo(() => {
    if (origBpm <= 0 || targetBpm <= 0) {
      return { ratio: '1.0000', percent: '0.00', semitonesShift: '0.00' };
    }
    const ratio = targetBpm / origBpm;
    const percent = ((ratio - 1) * 100).toFixed(2);
    // In resample mode: pitch shift = 12 * log2(ratio)
    const semitonesShift = (12 * (Math.log(ratio) / Math.log(2))).toFixed(2);

    return {
      ratio: ratio.toFixed(4),
      percent,
      semitonesShift,
    };
  }, [origBpm, targetBpm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Calculadora & Ferramentas de Áudio
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Sincronização de Delays, Pré-delays de Reverb, Frequências para 808s e Conversão de Pitch / Tempo
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#121215] p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('delay')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'delay'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Delay & Reverb Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('freq')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'freq'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Nota ➔ Hz (808 / Kick)</span>
          </button>
          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pitch'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Pitch & Time-Stretch</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: DELAY & REVERB SYNC */}
      {/* ============================================================= */}
      {activeTab === 'delay' && (
        <div className="space-y-6">
          {/* BPM Control Panel */}
          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                Andamento da Sessão
              </span>
              <h3 className="text-lg font-bold text-white">
                Definir BPM do Projeto
              </h3>
              <p className="text-xs text-zinc-400">
                Altera o BPM manualmente ou usa o botão de <strong>Tap Tempo</strong> no ritmo da música.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Tap Tempo Button */}
              <button
                onClick={handleTapTempo}
                className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  isTapping
                    ? 'bg-amber-500 text-black border-amber-400 scale-105'
                    : 'bg-zinc-900 border-zinc-700 text-amber-300 hover:bg-zinc-800'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-1" />
                TAP TEMPO
              </button>

              {/* BPM Stepper & Input */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                <button
                  onClick={() => setBpm((b) => Math.max(40, b - 1))}
                  className="px-2.5 py-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 text-sm font-bold cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min={40}
                  max={280}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value) || 120)}
                  className="w-16 text-center bg-transparent text-white font-bold text-lg focus:outline-none"
                />
                <button
                  onClick={() => setBpm((b) => Math.min(280, b + 1))}
                  className="px-2.5 py-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 text-sm font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Presets */}
              <div className="hidden sm:flex items-center gap-1.5">
                {[90, 100, 120, 130, 140, 160].map((presetBpm) => (
                  <button
                    key={presetBpm}
                    onClick={() => setBpm(presetBpm)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      bpm === presetBpm
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {presetBpm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divisions Table */}
          <div className="rounded-2xl bg-[#121215] border border-zinc-800/80 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Tabela de Tempos de Delay e Modulação ({bpm} BPM)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Clica em qualquer valor para copiar instantaneamente os milissegundos para colar no teu plugin de Delay
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#16161a] border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Divisão Rítmica</th>
                    <th className="py-3.5 px-4 text-center">Tempo Normal</th>
                    <th className="py-3.5 px-4 text-center text-amber-400">Pontuada (1.5x)</th>
                    <th className="py-3.5 px-4 text-center text-cyan-400">Tercina (Triplet)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {timeDivisions.map((div, idx) => (
                    <tr
                      key={div.name}
                      className={idx % 2 === 0 ? 'bg-transparent' : 'bg-zinc-900/30'}
                    >
                      <td className="py-3 px-4 sm:px-6 font-sans font-semibold text-zinc-200 text-xs sm:text-sm">
                        {div.name}
                      </td>

                      {/* Normal */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            copyToClipboard(
                              div.normal.ms.toString(),
                              `${div.name} Normal`,
                              `norm-${idx}`
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-all cursor-pointer group"
                        >
                          <span className="font-bold text-white">{div.normal.ms}</span>
                          <span className="text-[11px] text-zinc-500">ms</span>
                          <span className="text-[10px] text-zinc-600 ml-1">({div.normal.hz} Hz)</span>
                          {copiedKey === `norm-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                          ) : (
                            <Copy className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 ml-1" />
                          )}
                        </button>
                      </td>

                      {/* Dotted */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            copyToClipboard(
                              div.dotted.ms.toString(),
                              `${div.name} Pontuada`,
                              `dot-${idx}`
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/20 hover:bg-amber-900/40 border border-amber-800/40 text-amber-200 transition-all cursor-pointer group"
                        >
                          <span className="font-bold text-amber-300">{div.dotted.ms}</span>
                          <span className="text-[11px] text-amber-400/70">ms</span>
                          <span className="text-[10px] text-amber-500/60 ml-1">({div.dotted.hz} Hz)</span>
                          {copiedKey === `dot-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                          ) : (
                            <Copy className="w-3 h-3 text-amber-500/50 group-hover:text-amber-300 ml-1" />
                          )}
                        </button>
                      </td>

                      {/* Triplet */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            copyToClipboard(
                              div.triplet.ms.toString(),
                              `${div.name} Tercina`,
                              `trip-${idx}`
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-800/40 text-cyan-200 transition-all cursor-pointer group"
                        >
                          <span className="font-bold text-cyan-300">{div.triplet.ms}</span>
                          <span className="text-[11px] text-cyan-400/70">ms</span>
                          <span className="text-[10px] text-cyan-500/60 ml-1">({div.triplet.hz} Hz)</span>
                          {copiedKey === `trip-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                          ) : (
                            <Copy className="w-3 h-3 text-cyan-500/50 group-hover:text-cyan-300 ml-1" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reverb Sync Recommendations */}
          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Fórmulas de Pré-Delay & Decay de Reverb ({bpm} BPM)
                </h3>
                <p className="text-xs text-zinc-400">
                  Valores calculados para que o reverb expire antes do próximo compasso, evitando mix embolada
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reverbPresets.map((preset, i) => (
                <div
                  key={preset.type}
                  className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5"
                >
                  <span className="text-xs font-bold text-zinc-200 block">{preset.type}</span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Pré-Delay:</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            preset.preDelayMs.toString(),
                            `Pré-delay ${preset.type}`,
                            `rev-pre-${i}`
                          )
                        }
                        className="font-mono font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {preset.preDelayMs} ms
                        {copiedKey === `rev-pre-${i}` && <Check className="w-3 h-3 text-emerald-400" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Decay / RT60:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {preset.decaySec.toFixed(2)} s
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight pt-1 border-t border-zinc-800">
                    {preset.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: NOTA ➔ FREQUÊNCIA (Hz) PARA KICKS & 808s */}
      {/* ============================================================= */}
      {activeTab === 'freq' && (
        <div className="space-y-6">
          {/* Sub-Bass Sweet Spot Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#121215] to-cyan-950/30 border border-amber-500/30 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              GUIA DE AFINAÇÃO PARA KICK & 808 (TRAP, DRILL, KIZOMBA & BOOM BAP)
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              O tom fundamental de um 808 precisa estar entre <strong>32 Hz e 65 Hz (Oitava 1)</strong>. Se afinares abaixo de 30 Hz (B0/C0), a maioria dos telemóveis e colunas normais não conseguem reproduzir. Entre <strong>D1 (36.7 Hz)</strong> e <strong>G1 (49.0 Hz)</strong> está a zona de ouro de máxima pressão sonora e energia limpa.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold border border-amber-500/40">
                C1 = 32.70 Hz
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold border border-amber-500/40">
                D1 = 36.71 Hz
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold border border-amber-500/40">
                E1 = 41.20 Hz
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40">
                F1 = 43.65 Hz (Sweet Spot)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold border border-amber-500/40">
                G1 = 49.00 Hz
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold border border-amber-500/40">
                A1 = 55.00 Hz
              </span>
            </div>
          </div>

          {/* Tone Generator Status / Playing Bar */}
          {playingFreq && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
                <Volume2 className="w-5 h-5 text-amber-400" />
                A tocar frequência pura senoidal: <span className="font-mono font-bold">{playingFreq} Hz</span>
              </div>
              <button
                onClick={stopTone}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold cursor-pointer"
              >
                Parar Som
              </button>
            </div>
          )}

          {/* Search and Octave Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#121215] border border-zinc-800/80">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar nota (Ex: F1, C2, 440, 808)..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-zinc-500 mr-1">Oitava:</span>
              <button
                onClick={() => setSelectedOctave('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  selectedOctave === 'all'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                Todas
              </button>
              {[0, 1, 2, 3, 4, 5, 6].map((oct) => (
                <button
                  key={oct}
                  onClick={() => setSelectedOctave(oct)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    selectedOctave === oct
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {oct === 1 ? `Oit. ${oct} (808)` : `Oit. ${oct}`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredNotes.map((item) => {
              const isSubSweetSpot = item.octave === 1;
              const isPlaying = playingFreq === item.freq;

              return (
                <div
                  key={item.name}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isSubSweetSpot
                      ? 'bg-[#14130e] border-amber-500/40 hover:border-amber-400'
                      : 'bg-[#121215] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-xl font-black ${
                            isSubSweetSpot ? 'text-amber-400' : 'text-white'
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          Oitava {item.octave}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            isPlaying ? stopTone() : playTone(item.freq)
                          }
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isPlaying
                              ? 'bg-amber-500 text-black border-amber-400 animate-bounce'
                              : 'bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700'
                          }`}
                          title="Tocar som senoidal"
                        >
                          {isPlaying ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              item.freq.toString(),
                              `Frequência de ${item.name}`,
                              item.name
                            )
                          }
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                          title="Copiar Frequência Hz"
                        >
                          {copiedKey === item.name ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex items-baseline gap-1.5 font-mono">
                      <span className="text-2xl font-bold text-zinc-100">
                        {item.freq}
                      </span>
                      <span className="text-xs text-zinc-500">Hz</span>
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {item.useCase}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Comprimento de onda:</span>
                    <span>{item.wavelengthCm > 100 ? `${(item.wavelengthCm / 100).toFixed(2)} m` : `${item.wavelengthCm} cm`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: PITCH & TIME-STRETCH CONVERTER */}
      {/* ============================================================= */}
      {activeTab === 'pitch' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Semitons ➔ Velocidade & Novo BPM */}
            <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800/80 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                  Cálculo de Transposição (Pitch-Shift)
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Mudar Tom (Semitons) ➔ Efeito na Velocidade
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Descobre a porcentagem exata de variação de andamento ao subir ou descer o tom de um sample no modo clássico de fita / resample.
                </p>
              </div>

              {/* Semitones Control */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold mb-1">
                    <span>Transposição em Semitons:</span>
                    <span className="font-mono text-amber-400 text-sm">
                      {semitones > 0 ? `+${semitones}` : semitones} semitons
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={semitones}
                    onChange={(e) => setSemitones(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                    <span>-12 (Oitava Abaixo)</span>
                    <span>0 (Original)</span>
                    <span>+12 (Oitava Acima)</span>
                  </div>
                </div>

                {/* Fine Cents */}
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold mb-1">
                    <span>Ajuste Fino (Cents):</span>
                    <span className="font-mono text-zinc-400 text-xs">
                      {cents > 0 ? `+${cents}` : cents} cents
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    step={1}
                    value={cents}
                    onChange={(e) => setCents(Number(e.target.value))}
                    className="w-full accent-zinc-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Results Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block">Variação de Velocidade</span>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    {Number(pitchCalc.percent) > 0 ? `+${pitchCalc.percent}%` : `${pitchCalc.percent}%`}
                  </div>
                  <span className="text-[10px] text-zinc-500">fator: {pitchCalc.ratio}x</span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block">Novo BPM ({bpm} BPM)</span>
                  <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                    {pitchCalc.resampleBpm} BPM
                  </div>
                  <span className="text-[10px] text-zinc-500">em modo Resample</span>
                </div>
              </div>
            </div>

            {/* Box 2: Time-Stretch (BPM Original ➔ BPM Destino) */}
            <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800/80 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                  Ajuste de Tempo (Time-Stretch)
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  BPM Original ➔ BPM de Destino
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Calcula o percentual de stretch necessário para sincronizar um loop ou sample na tua DAW.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    BPM Original do Sample
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={250}
                    value={origBpm}
                    onChange={(e) => setOrigBpm(Number(e.target.value) || 120)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    BPM do Teu Projeto
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={250}
                    value={targetBpm}
                    onChange={(e) => setTargetBpm(Number(e.target.value) || 128)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Results Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block">Fator de Time-Stretch</span>
                  <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
                    {Number(tempoCalc.percent) > 0 ? `+${tempoCalc.percent}%` : `${tempoCalc.percent}%`}
                  </div>
                  <span className="text-[10px] text-zinc-500">ratio: {tempoCalc.ratio}x</span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block">Deslocamento de Pitch</span>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    {Number(tempoCalc.semitonesShift) > 0
                      ? `+${tempoCalc.semitonesShift}`
                      : tempoCalc.semitonesShift}{' '}
                    st
                  </div>
                  <span className="text-[10px] text-zinc-500">se tocado sem pitch lock</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/30 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  <strong>Dica de DAW (FL Studio / Ableton / Logic):</strong> Se quiseres manter o tom original ao mudar de {origBpm} para {targetBpm} BPM, usa o algoritmo <em>Complex Pro</em>, <em>Elastique Pro</em> ou <em>Monophonic/Polyphonic</em>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
