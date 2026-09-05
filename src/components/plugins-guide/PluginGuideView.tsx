import { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Volume2,
  Sliders,
  Scale,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  Zap,
} from 'lucide-react';
import { EXTENDED_PLUGIN_KNOWLEDGE } from '../../data/pluginGuideData';
import { PluginKnowledgeItem } from '../../types';

interface PluginGuideViewProps {
  onSelectForVersus?: (pluginName: string) => void;
  onOpenTrainer?: () => void;
  onLearnWithAI?: (pluginName: string) => void;
}

export function PluginGuideView({ onSelectForVersus, onOpenTrainer, onLearnWithAI }: PluginGuideViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [activePlugin, setActivePlugin] = useState<PluginKnowledgeItem>(EXTENDED_PLUGIN_KNOWLEDGE[0]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    EXTENDED_PLUGIN_KNOWLEDGE.forEach((p) => set.add(p.category));
    return ['all', ...Array.from(set)];
  }, []);

  const manufacturers = useMemo(() => {
    const set = new Set<string>();
    EXTENDED_PLUGIN_KNOWLEDGE.forEach((p) => set.add(p.manufacturer));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredPlugins = useMemo(() => {
    return EXTENDED_PLUGIN_KNOWLEDGE.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedManufacturer !== 'all' && p.manufacturer !== selectedManufacturer) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          p.pluginName.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.whatItDoes.toLowerCase().includes(q) ||
          (p.circuitTopology && p.circuitTopology.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedCategory, selectedManufacturer, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Banner Explicativo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#141418] to-zinc-950 border border-amber-500/25 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Enciclopédia & Guia Pedagógico de Áudio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              O Que Cada Plugin Faz & Como Funciona
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Entenda a topologia de circuito (FET, Óptico, VCA, Digital), a física por trás de cada botão, o que ouvir nos fones, e as armadilhas de sobreprocessamento para nunca mais mixar às cegas.
            </p>
          </div>

          {onOpenTrainer && (
            <button
              onClick={onOpenTrainer}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Ir Para o Treinador Interativo</span>
            </button>
          )}
        </div>
      </div>

      {/* Controles de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por plugin, topologia (FET, Óptico, VCA), marca ou função..."
            className="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#121215] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">Todas as Categorias</option>
            {categories.filter((c) => c !== 'all').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedManufacturer}
            onChange={(e) => setSelectedManufacturer(e.target.value)}
            className="bg-[#121215] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">Todos os Fabricantes</option>
            {manufacturers.filter((m) => m !== 'all').map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Layout em 2 Colunas: Lista à Esquerda + Ficha Detalhada à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lista de Plugins (4 colunas no desktop) */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[750px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="text-[11px] font-semibold text-zinc-400 px-1 flex items-center justify-between">
            <span>{filteredPlugins.length} processadores mapeados</span>
            <span className="text-amber-500">Clique para estudar</span>
          </div>

          {filteredPlugins.map((plugin) => {
            const isSelected = activePlugin.id === plugin.id;
            return (
              <button
                key={plugin.id}
                onClick={() => setActivePlugin(plugin)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 group ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5'
                    : 'bg-[#121215] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {plugin.manufacturer}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {plugin.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${isSelected ? 'text-amber-400' : 'text-zinc-100 group-hover:text-white'}`}>
                    {plugin.pluginName}
                  </h4>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-amber-400 translate-x-1' : 'text-zinc-600'}`} />
                </div>

                {plugin.circuitTopology && (
                  <p className="text-[10px] text-zinc-400 line-clamp-1 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-amber-500/70 shrink-0" />
                    <span>{plugin.circuitTopology}</span>
                  </p>
                )}
              </button>
            );
          })}

          {filteredPlugins.length === 0 && (
            <div className="p-8 rounded-xl bg-[#121215] border border-zinc-800 text-center text-zinc-500 text-xs">
              Nenhum plugin encontrado para os filtros selecionados.
            </div>
          )}
        </div>

        {/* Ficha Pedagógica Detalhada (8 colunas no desktop) */}
        <div className="lg:col-span-8 bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          {/* Header do Plugin Ativo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-white">{activePlugin.pluginName}</h3>
                <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {activePlugin.manufacturer}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold">
                  {activePlugin.category}
                </span>
              </div>

              {activePlugin.hardwareOrigin && (
                <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold">Origem Histórica:</span>
                  <span>{activePlugin.hardwareOrigin}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              {onLearnWithAI && (
                <button
                  onClick={() => onLearnWithAI(activePlugin.pluginName)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
                  title="Abrir Guia Interativo com Mentor Gemini IA"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Aprender com IA</span>
                </button>
              )}

              {onSelectForVersus && (
                <button
                  onClick={() => onSelectForVersus(activePlugin.pluginName)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5"
                  title="Comparar este plugin contra outro lado a lado"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Comparar no Versus</span>
                </button>
              )}
            </div>
          </div>

          {/* Topologia do Circuito & O Que Faz */}
          <div className="grid grid-cols-1 gap-3">
            {activePlugin.circuitTopology && (
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Topologia do Circuito & Resposta de Frequência
                  </span>
                  <p className="text-xs text-zinc-300">{activePlugin.circuitTopology}</p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>O Que Este Plugin Faz Exatamente?</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                {activePlugin.whatItDoes}
              </p>
            </div>
          </div>

          {/* Parâmetros Críticos Explicados */}
          {activePlugin.keyParameters && activePlugin.keyParameters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span>Controles e Knobs Essenciais (Como Regular)</span>
                </span>
                <span className="text-[10px] text-zinc-500">Faixa de Operação Ideal</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activePlugin.keyParameters.map((param, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-sky-300">{param.name}</span>
                      {param.optimalRange && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/60">
                          {param.optimalRange}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal">{param.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Por que Usar vs E se Não Usar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Por Que Usar? (O Ganho no Mix)</span>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed">{activePlugin.whyUseIt}</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>E Se Eu Não Usar? (Consequência)</span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">{activePlugin.whatIfNotUsed}</p>
            </div>
          </div>

          {/* Armadilha: E Se Usar Demais? */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>E Se Eu Usar Demais? (Armadilha de Sobreprocessamento)</span>
            </div>
            <p className="text-xs text-rose-100/90 leading-relaxed">{activePlugin.whatIfOverused}</p>
          </div>

          {/* O Que Ouvir nos Fones & Exemplo Prático */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                <Volume2 className="w-4 h-4" />
                <span>O Que Ouvir ao Calibrar</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{activePlugin.whatToHear}</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>Exemplo Prático Recomendado</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{activePlugin.practicalExample}</p>
            </div>
          </div>

          {/* Dosagem Inteligente */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider">
                Guia de Dosagem Inteligente
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Calibre com os ouvidos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
                <span className="font-bold text-emerald-400 block text-xs mb-1">Leve (Sutil)</span>
                <span className="text-zinc-400 text-[11px] leading-relaxed">
                  {activePlugin.suggestedDosage.light}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
                <span className="font-bold text-amber-400 block text-xs mb-1">Moderada (Comercial)</span>
                <span className="text-zinc-400 text-[11px] leading-relaxed">
                  {activePlugin.suggestedDosage.moderate}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
                <span className="font-bold text-rose-400 block text-xs mb-1">Forte (Estilística)</span>
                <span className="text-zinc-400 text-[11px] leading-relaxed">
                  {activePlugin.suggestedDosage.heavy}
                </span>
              </div>
            </div>

            {activePlugin.suggestedDosage.safetyNotice && (
              <p className="text-[11px] text-amber-400/90 pt-1 border-t border-zinc-900">
                ⚠️ {activePlugin.suggestedDosage.safetyNotice}
              </p>
            )}
          </div>

          {/* Alternativas Diretas e Posição Recomendada */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="font-semibold text-zinc-300">Alternativas Diretas:</span>
              <div className="flex flex-wrap gap-1">
                {activePlugin.alternatives.map((alt, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-zinc-400">
              <span className="text-amber-500 font-semibold">Posição Ideal: </span>
              <span>{activePlugin.recommendedPositions.join(' • ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
