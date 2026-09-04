import { useState, useMemo } from 'react';
import { Search, AlertCircle, Wrench, Volume2, ShieldAlert, Sparkles, Filter, Check, ArrowRight } from 'lucide-react';
import { VOCAL_PROBLEMS } from '../../data/vocalEngineData';
import { VocalProblem } from '../../types';

interface VocalDiagnosisViewProps {
  onSelectSolution?: (problem: VocalProblem) => void;
  onOpenPluginModal?: (pluginName: string) => void;
}

export function VocalDiagnosisView({ onSelectSolution, onOpenPluginModal }: VocalDiagnosisViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');
  const [activeProblem, setActiveProblem] = useState<VocalProblem | null>(null);

  const filteredProblems = useMemo(() => {
    return VOCAL_PROBLEMS.filter((prob) => {
      const matchesSearch =
        prob.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prob.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prob.firstTool.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prob.acaoRecomendada.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedRegionFilter === 'grave') {
        return prob.region.includes('Hz') && (prob.region.includes('80') || prob.region.includes('150') || prob.region.includes('250') || prob.region.includes('400'));
      }
      if (selectedRegionFilter === 'agudo') {
        return prob.region.includes('kHz') || prob.title.toLowerCase().includes('brilho') || prob.title.toLowerCase().includes('sibil');
      }
      if (selectedRegionFilter === 'dinamica') {
        return prob.title.toLowerCase().includes('dinâm') || prob.title.toLowerCase().includes('comprim') || prob.title.toLowerCase().includes('enterrado');
      }
      if (selectedRegionFilter === 'espaco') {
        return prob.title.toLowerCase().includes('reverb') || prob.title.toLowerCase().includes('distante') || prob.title.toLowerCase().includes('pequeno');
      }

      return true;
    });
  }, [searchTerm, selectedRegionFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/30 p-5 sm:p-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Melo Studio Vocal Diagnostic Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            🎯 Qual é o problema do meu vocal?
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Identifique instantaneamente o sintoma sonoro da sua gravação e veja a ferramenta exata, 
            a faixa de frequência responsável, a dosagem recomendada e o que ouvir para consertar.
          </p>
        </div>

        {/* Search & Quick Filters */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar sintoma (ex: abafado, sibilante, sem presença, lama, boxy, enterrado)..."
              className="w-full bg-zinc-950 border border-zinc-750 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {[
              { id: 'all', label: 'Todos (22)' },
              { id: 'grave', label: 'Graves & Lama' },
              { id: 'agudo', label: 'Agudos & Sibilância' },
              { id: 'dinamica', label: 'Dinâmica' },
              { id: 'espaco', label: 'Espaço & Reverb' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedRegionFilter(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedRegionFilter === f.id
                    ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnosis Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProblems.map((prob) => {
          const isExpanded = activeProblem?.id === prob.id;

          return (
            <div
              key={prob.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                isExpanded
                  ? 'bg-zinc-900 border-amber-500/50 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30'
                  : 'bg-[#121216] border-zinc-800 hover:border-zinc-700 hover:bg-[#15151a]'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-zinc-800/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <h3 className="font-bold text-white text-sm tracking-tight">{prob.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700 whitespace-nowrap">
                    {prob.region}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium text-zinc-300">{prob.firstTool}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 text-xs">
                {/* Ação Recomendada */}
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850">
                  <span className="text-[11px] font-bold text-amber-400 block mb-1">
                    AÇÃO RECOMENDADA
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{prob.acaoRecomendada}</p>
                </div>

                {/* Faixa inicial */}
                <div className="flex items-center justify-between text-[11px] px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 font-medium">Faixa inicial:</span>
                  <span className="font-mono text-zinc-200 font-bold">{prob.faixaInicial}</span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="space-y-2.5 pt-2 border-t border-zinc-800 animate-in fade-in duration-150">
                    <div className="p-2.5 rounded-lg bg-sky-950/20 border border-sky-500/20">
                      <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-0.5">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>O QUE OUVIR</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">{prob.oQueOuvir}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-0.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>O QUE EVITAR</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">{prob.oQueEvitar}</p>
                    </div>

                    {prob.alternatives.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-zinc-500">Alternativas:</span>
                        {prob.alternatives.map((alt, idx) => (
                          <span
                            key={idx}
                            onClick={() => onOpenPluginModal && onOpenPluginModal(alt)}
                            className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-amber-500/50 cursor-pointer"
                          >
                            {alt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-3 border-t border-zinc-800 bg-zinc-950/40 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveProblem(isExpanded ? null : prob)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  {isExpanded ? 'Ocultar detalhes' : 'Ver guia completo'}
                </button>

                {onSelectSolution && (
                  <button
                    onClick={() => onSelectSolution(prob)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>Carregar na Cadeia</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProblems.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
          <h4 className="font-bold text-white text-sm">Nenhum sintoma correspondente encontrado</h4>
          <p className="text-zinc-500 text-xs">
            Tente pesquisar por termos como "grave", "lama", "sibilante", "brilho", "boxy" ou "reverb".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedRegionFilter('all');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700"
          >
            Ver todos os 22 sintomas
          </button>
        </div>
      )}
    </div>
  );
}
