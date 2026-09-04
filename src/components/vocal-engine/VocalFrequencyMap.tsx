import { useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, Sparkles, Volume2, Info } from 'lucide-react';
import { VOCAL_FREQ_ZONES } from '../../data/vocalEngineData';
import { VocalFreqZone } from '../../types';

export function VocalFrequencyMap() {
  const [selectedZone, setSelectedZone] = useState<VocalFreqZone>(VOCAL_FREQ_ZONES[2]); // Default: Corpo

  // Visual color mapped to zones
  const getZoneColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-red-600/30 to-rose-600/20 text-rose-400 border-rose-500/30';
      case 1:
        return 'from-amber-600/30 to-amber-500/20 text-amber-400 border-amber-500/30';
      case 2:
        return 'from-orange-600/30 to-amber-600/20 text-orange-400 border-orange-500/30';
      case 3:
        return 'from-yellow-600/30 to-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 4:
        return 'from-lime-600/30 to-emerald-600/20 text-lime-400 border-lime-500/30';
      case 5:
        return 'from-emerald-600/30 to-teal-600/20 text-emerald-400 border-emerald-500/30';
      case 6:
        return 'from-cyan-600/30 to-sky-600/20 text-cyan-400 border-cyan-500/30';
      case 7:
        return 'from-sky-600/30 to-blue-600/20 text-sky-400 border-sky-500/30';
      case 8:
        return 'from-indigo-600/30 to-violet-600/20 text-indigo-400 border-indigo-500/30';
      case 9:
        return 'from-purple-600/30 to-fuchsia-600/20 text-purple-400 border-purple-500/30';
      default:
        return 'from-zinc-700/30 to-zinc-600/20 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-[#121216] border border-zinc-800 p-5 sm:p-6 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>Espectro Acústico Vocal • 20 Hz a 20.000 Hz</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          📊 Mapa de Frequências da Voz Humana
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-3xl">
          Navegue pelas 10 zonas críticas do vocal. Compreenda onde reside o corpo, onde mora a lama de quartos não tratados, 
          onde atua a sibilância e onde reside o luxo do ar comercial sem criar aspereza metálica.
        </p>
      </div>

      {/* Interactive Spectrum Ribbon */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span className="font-mono text-zinc-500">20 Hz (Subgrave)</span>
          <span className="font-semibold text-zinc-300">Clique em qualquer região para inspecionar</span>
          <span className="font-mono text-zinc-500">20.000 Hz (Ar / Air)</span>
        </div>

        {/* Visual Spectrum Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
          {VOCAL_FREQ_ZONES.map((zone, idx) => {
            const isSelected = selectedZone.name === zone.name;
            const colorClass = getZoneColor(idx);

            return (
              <button
                key={zone.name}
                onClick={() => setSelectedZone(zone)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[90px] relative overflow-hidden ${
                  isSelected
                    ? `bg-gradient-to-b ${colorClass} ring-2 ring-amber-400 shadow-lg shadow-amber-500/10 scale-[1.02]`
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono block text-zinc-400 leading-none">
                    {zone.range}
                  </span>
                  <span className="font-bold text-xs text-white block truncate leading-tight">
                    {zone.name}
                  </span>
                </div>
                <div className="text-base mt-2">{zone.icon || '🎵'}</div>

                {isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Zone Deep Dive Card */}
      <div className="rounded-2xl bg-[#131317] border border-amber-500/30 p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
              {selectedZone.icon || '🎙️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{selectedZone.name}</h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {selectedZone.range}
                </span>
              </div>
              <p className="text-zinc-400 text-xs mt-0.5">Diagnóstico Espectral Cirúrgico</p>
            </div>
          </div>
        </div>

        {/* Content Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* O que é */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
              <Info className="w-4 h-4 text-amber-400" />
              <span>O QUE ESTA FAIXA CONTÉM</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">{selectedZone.description}</p>
          </div>

          {/* Ação recomendada */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>AÇÃO TÉCNICA RECOMENDADA</span>
            </div>
            <p className="text-emerald-100/90 leading-relaxed">{selectedZone.primaryAction}</p>
          </div>

          {/* Alerta / Atenção */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>CUIDADO / PERIGO CRÍTICO</span>
            </div>
            <p className="text-rose-100/90 leading-relaxed">{selectedZone.warning}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
