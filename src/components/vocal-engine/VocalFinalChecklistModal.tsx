import { useState } from 'react';
import { CheckSquare, Square, ShieldCheck, Radio, Sparkles, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { VOCAL_FINAL_CHECKLIST, STREAMING_TARGETS } from '../../data/vocalEngineData';

export function VocalFinalChecklistModal() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'check-mono': true,
    'check-clipping': true,
    'check-sub-rumble': true,
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalCount = VOCAL_FINAL_CHECKLIST.length;
  const passedCount = Object.values(checkedItems).filter(Boolean).length;
  const isReady = passedCount === totalCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-[#121216] border border-zinc-800 p-5 sm:p-6 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Auditoria Técnica Final & Master Readiness</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ✅ Checklist de Finalização do Vocal
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl mt-1">
              Antes de exportar ou enviar para a masterização, execute estes 10 testes críticos de estúdio.
            </p>
          </div>

          <div className="px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3 shrink-0">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Status de Prontidão</span>
              <span className={`text-sm font-bold ${isReady ? 'text-emerald-400' : 'text-amber-400'}`}>
                {passedCount} de {totalCount} Testes Aprovados
              </span>
            </div>
            <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' : 'bg-amber-400'}`} />
          </div>
        </div>
      </div>

      {/* 10 Points Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {VOCAL_FINAL_CHECKLIST.map((item) => {
          const isDone = !!checkedItems[item.id];

          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-150 flex items-start gap-3.5 ${
                isDone
                  ? 'bg-emerald-950/15 border-emerald-500/30 text-zinc-200'
                  : 'bg-[#121216] border-zinc-800 hover:border-zinc-700 hover:bg-[#15151a]'
              }`}
            >
              <div className="pt-0.5 shrink-0 text-emerald-400">
                {isDone ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5 text-zinc-600" />
                )}
              </div>
              <div className="space-y-1 text-xs min-w-0">
                <span className={`font-bold text-sm block ${isDone ? 'text-white' : 'text-zinc-300'}`}>
                  {item.title}
                </span>
                <p className="text-zinc-400 leading-relaxed text-[11px]">{item.description}</p>
                <div className="pt-1.5 text-[10px] text-zinc-500 border-t border-zinc-800/80">
                  <span className="text-amber-400/90 font-medium">Como testar:</span> {item.howToCheck}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Streaming Platform Reference Targets */}
      <div className="rounded-2xl bg-[#121216] border border-zinc-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Radio className="w-4 h-4" />
          <span>ALVOS DE LOUDNESS (LUFS) & TRUE PEAK POR PLATAFORMA</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {STREAMING_TARGETS.map((target) => (
            <div
              key={target.id}
              className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="font-bold text-white text-xs block">{target.platform}</span>
                <div className="mt-1 space-y-0.5">
                  <span className="font-mono text-amber-400 font-bold text-xs block">
                    {target.targetLufs}
                  </span>
                  <span className="font-mono text-zinc-400 text-[10px] block">
                    Ceiling: {target.truePeak}
                  </span>
                </div>
              </div>
              <p className="text-zinc-400 text-[10px] leading-tight pt-2 border-t border-zinc-850">
                {target.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
