import { useState, useMemo } from 'react';
import {
  Scale,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
  Link2,
  Zap,
  Cpu,
  Layers,
  HelpCircle,
  Clock,
  Flame,
  Check,
} from 'lucide-react';
import { CURATED_PLUGIN_COMPARISONS, EXTENDED_PLUGIN_KNOWLEDGE } from '../../data/pluginGuideData';
import { PluginComparison } from '../../types';

interface PluginVersusViewProps {
  initialPluginName?: string;
  onOpenTrainer?: () => void;
}

export function PluginVersusView({ initialPluginName, onOpenTrainer }: PluginVersusViewProps) {
  // Preset or custom selection
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cla76-vs-cla2a');
  const [customMode, setCustomMode] = useState<boolean>(false);

  // Custom picker
  const [customA, setCustomA] = useState<string>(
    initialPluginName || 'Waves CLA-76'
  );
  const [customB, setCustomB] = useState<string>('Waves CLA-2A');

  // Curated preset
  const activePreset = useMemo(() => {
    return CURATED_PLUGIN_COMPARISONS.find((c) => c.id === selectedPresetId) || CURATED_PLUGIN_COMPARISONS[0];
  }, [selectedPresetId]);

  // Knowledge items for custom picker
  const itemA = useMemo(() => {
    const search = customMode ? customA : activePreset.pluginA;
    return EXTENDED_PLUGIN_KNOWLEDGE.find(
      (p) => p.pluginName.toLowerCase() === search.toLowerCase() ||
             search.toLowerCase().includes(p.pluginName.toLowerCase())
    );
  }, [customMode, customA, activePreset]);

  const itemB = useMemo(() => {
    const search = customMode ? customB : activePreset.pluginB;
    return EXTENDED_PLUGIN_KNOWLEDGE.find(
      (p) => p.pluginName.toLowerCase() === search.toLowerCase() ||
             search.toLowerCase().includes(p.pluginName.toLowerCase())
    );
  }, [customMode, customB, activePreset]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#141418] to-zinc-950 border border-amber-500/25 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Scale className="w-3.5 h-3.5" />
              <span>Entendendo o Que o Outro Faz • Comparador Técnico</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Plugin A vs Plugin B: Decisão & Diferenciação
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Descubra por que escolher um processador no lugar do outro, as diferenças fundamentais de circuito (FET vs Óptico, VCA vs Digital) e como combiná-los em série na mesma cadeia vocal.
            </p>
          </div>

          {onOpenTrainer && (
            <button
              onClick={onOpenTrainer}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Testar Conhecimento no Treinador</span>
            </button>
          )}
        </div>
      </div>

      {/* Seletor de Comparações Pré-Curadas vs Modo Livre */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#121215] border border-zinc-800 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-zinc-400 mr-2 uppercase tracking-wider">
            Comparações Clássicas:
          </span>
          {CURATED_PLUGIN_COMPARISONS.map((comp) => (
            <button
              key={comp.id}
              onClick={() => {
                setSelectedPresetId(comp.id);
                setCustomMode(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                !customMode && selectedPresetId === comp.id
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {comp.title}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCustomMode(!customMode)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            customMode
              ? 'bg-sky-500 text-zinc-950 shadow-md'
              : 'bg-zinc-900 text-sky-400 border border-sky-500/30 hover:bg-sky-500/10'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>{customMode ? 'Modo Livre Ativado' : 'Comparar Qualquer Plugin'}</span>
        </button>
      </div>

      {/* Seletor Livre Customizado (se ativado) */}
      {customMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#15151a] border border-sky-500/30">
          <div>
            <label className="block text-xs font-bold text-sky-400 mb-1.5 uppercase">
              Escolha o Plugin A:
            </label>
            <select
              value={customA}
              onChange={(e) => setCustomA(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              {EXTENDED_PLUGIN_KNOWLEDGE.map((p) => (
                <option key={p.id} value={p.pluginName}>
                  {p.pluginName} ({p.manufacturer} • {p.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1.5 uppercase">
              Escolha o Plugin B:
            </label>
            <select
              value={customB}
              onChange={(e) => setCustomB(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {EXTENDED_PLUGIN_KNOWLEDGE.map((p) => (
                <option key={p.id} value={p.pluginName}>
                  {p.pluginName} ({p.manufacturer} • {p.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Card Central de Duelo Lado a Lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card Plugin A */}
        <div className="bg-[#121215] border border-sky-500/30 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-sky-500 text-zinc-950 font-black text-[10px] uppercase rounded-bl-xl tracking-wider">
            LADO A
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/60">
                {itemA ? itemA.manufacturer : 'Estúdio'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold">
                {itemA ? itemA.category : 'Processador'}
              </span>
            </div>
            <h3 className="text-xl font-black text-white">{itemA ? itemA.pluginName : customA}</h3>
            {itemA?.circuitTopology && (
              <p className="text-xs text-sky-300 mt-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{itemA.circuitTopology}</span>
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
            {itemA?.whatItDoes || 'Processador com características dinâmicas e tonais específicas.'}
          </div>

          <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/30 space-y-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
              Quando Escolher o Lado A?
            </span>
            <p className="text-xs text-sky-100/90 leading-relaxed">
              {!customMode && activePreset
                ? activePreset.whenToPickA
                : itemA?.whenToUse || 'Utilize quando a função primária do áudio exigir esse processamento.'}
            </p>
          </div>

          {itemA?.whyUseIt && (
            <div className="text-xs text-zinc-400 space-y-1">
              <span className="text-zinc-200 font-semibold block">Vantagem Principal:</span>
              <p>{itemA.whyUseIt}</p>
            </div>
          )}
        </div>

        {/* Card Plugin B */}
        <div className="bg-[#121215] border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-zinc-950 font-black text-[10px] uppercase rounded-bl-xl tracking-wider">
            LADO B
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60">
                {itemB ? itemB.manufacturer : 'Estúdio'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold">
                {itemB ? itemB.category : 'Processador'}
              </span>
            </div>
            <h3 className="text-xl font-black text-white">{itemB ? itemB.pluginName : customB}</h3>
            {itemB?.circuitTopology && (
              <p className="text-xs text-amber-300 mt-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{itemB.circuitTopology}</span>
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
            {itemB?.whatItDoes || 'Processador complementar com características balísticas ou harmônicas distintas.'}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Quando Escolher o Lado B?
            </span>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              {!customMode && activePreset
                ? activePreset.whenToPickB
                : itemB?.whenToUse || 'Utilize quando a faixa exigir as características sonoras deste processador.'}
            </p>
          </div>

          {itemB?.whyUseIt && (
            <div className="text-xs text-zinc-400 space-y-1">
              <span className="text-zinc-200 font-semibold block">Vantagem Principal:</span>
              <p>{itemB.whyUseIt}</p>
            </div>
          )}
        </div>
      </div>

      {/* Matriz Comparativa Detalhada (se for Preset) */}
      {!customMode && activePreset && (
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <Scale className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Tabela Comparativa de Comportamento
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Parâmetro / Característica</th>
                  <th className="py-2.5 px-3 font-bold text-sky-400">{activePreset.pluginA}</th>
                  <th className="py-2.5 px-3 font-bold text-amber-400">{activePreset.pluginB}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {activePreset.comparisonPoints.map((point, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-zinc-400">{point.label}</td>
                    <td className="py-3 px-3 font-semibold text-zinc-200">{point.a}</td>
                    <td className="py-3 px-3 font-semibold text-zinc-200">{point.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estratégia de Combinação em Série (Combo Chain) */}
      <div className="bg-gradient-to-r from-zinc-950 via-[#16161c] to-zinc-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm uppercase tracking-wider">
          <Link2 className="w-5 h-5" />
          <span>Estratégia Combo: Como Usar os Dois Juntos em Série!</span>
        </div>

        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
          {!customMode && activePreset
            ? activePreset.comboStrategy
            : 'Em engenharia de áudio profissional, plugins rivais não competem: eles trabalham juntos! Posicione o processador cirúrgico ou ultra-rápido no início da cadeia para controlar picos ou sujeiras, seguido do processador musical ou de calor para encorpar o sinal com musicalidade sem estresse.'}
        </p>

        <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400/90 font-medium">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Resultado: Nenhum plugin trabalha sobrecarregado e a mixagem ganha dimensionalidade de grande estúdio.</span>
        </div>
      </div>
    </div>
  );
}
