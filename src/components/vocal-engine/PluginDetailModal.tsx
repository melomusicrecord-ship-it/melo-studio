import { X, Sparkles, AlertTriangle, CheckCircle2, Sliders, Volume2, ShieldAlert, BookOpen, Layers } from 'lucide-react';
import { PluginKnowledgeItem } from '../../types';
import { PLUGIN_KNOWLEDGE_BASE } from '../../data/vocalEngineData';

interface PluginDetailModalProps {
  pluginName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PluginDetailModal({ pluginName, isOpen, onClose }: PluginDetailModalProps) {
  if (!isOpen) return null;

  // Find in knowledge base or generate a structured template
  const item = PLUGIN_KNOWLEDGE_BASE.find(
    (p) => p.pluginName.toLowerCase() === pluginName.toLowerCase() ||
           pluginName.toLowerCase().includes(p.pluginName.toLowerCase())
  ) || {
    id: 'generic-' + pluginName,
    pluginName: pluginName,
    manufacturer: 'Plugin de Estúdio',
    category: 'Processamento Vocal',
    whatItDoes: `Processador especializado para modelagem, controle dinâmico ou ambiência de áudio vocal.`,
    whenToUse: `Utilize para lapidar o sinal de áudio na etapa correspondente da cadeia vocal.`,
    whenNotToUse: `Não utilize em sinais que já possuem as características desejadas ou se a faixa não apresentar a necessidade deste tipo de processamento.`,
    whyUseIt: `Para atingir padrão competitivo de clareza, presença e equilíbrio tonal.`,
    whatIfNotUsed: `O áudio pode manter inconsistências dinâmicas ou ausência de polimento harmônico.`,
    whatIfOverused: `Processamento excessivo gera fadiga auditiva, distorção ou perda da naturalidade da voz.`,
    whatToHear: `Ouça a consistência do sinal e compare o antes e o depois com ganho equiparado (Match Gain).`,
    commonMistakes: `Ajustar parâmetros com os olhos em vez de confiar nos ouvidos e em monitores de referência.`,
    practicalExample: `Inicie com configurações moderadas e ajuste os parâmetros observando o contexto da mixagem com o instrumental ligado.`,
    alternatives: ['Alternativa FabFilter', 'Alternativa Waves', 'Plugin Nativo da DAW'],
    recommendedPositions: ['Inserção na cadeia vocal principal ou envio auxiliar'],
    vocalTypes: ['Lead Vocal', 'Backing Vocals', 'Adlibs'],
    styles: ['Afrobeat', 'Kizomba', 'Trap', 'R&B', 'Pop'],
    suggestedDosage: {
      light: 'Ajuste inicial sutil para conferir transparência',
      moderate: 'Ajuste balanceado para aplicação padrão',
      heavy: 'Ajuste intenso para caráter estilístico ou correções extremas',
      safetyNotice: 'Monitore sempre em volume baixo para certificar-se de que a voz não está soando achatada.',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#111114] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-[#16161b] to-zinc-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{item.pluginName}</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {item.manufacturer}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                  {item.category}
                </span>
              </div>
              <p className="text-zinc-400 text-xs">Ficha Pedagógica do Melo Vocal Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-300">
          {/* O que faz */}
          <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>O QUE ESTE PLUGIN FAZ?</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">{item.whatItDoes}</p>
          </div>

          {/* Por que usar vs E se não usar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>POR QUE USAR?</span>
              </div>
              <p className="text-emerald-100/90 leading-relaxed">{item.whyUseIt}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>E SE EU NÃO USAR?</span>
              </div>
              <p className="text-amber-100/90 leading-relaxed">{item.whatIfNotUsed}</p>
            </div>
          </div>

          {/* E se eu usar demais */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>E SE EU USAR DEMAIS? (SOBREPROCESSAMENTO)</span>
            </div>
            <p className="text-rose-100/90 leading-relaxed">{item.whatIfOverused}</p>
          </div>

          {/* O que ouvir & Exemplo prático */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                <Volume2 className="w-4 h-4" />
                <span>O QUE OUVIR AO CALIBRAR</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{item.whatToHear}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                <Sliders className="w-4 h-4" />
                <span>EXEMPLO PRÁTICO RECOMENDADO</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{item.practicalExample}</p>
            </div>
          </div>

          {/* Dosagem sugerida */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-200">GUIA DE DOSAGEM INTELIGENTE</span>
              <span className="text-[10px] text-amber-400 font-mono">Nunca processe sem ouvir</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="font-bold text-emerald-400 block mb-0.5">Leve</span>
                <span className="text-zinc-400">{item.suggestedDosage.light}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="font-bold text-amber-400 block mb-0.5">Moderada</span>
                <span className="text-zinc-400">{item.suggestedDosage.moderate}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="font-bold text-rose-400 block mb-0.5">Forte</span>
                <span className="text-zinc-400">{item.suggestedDosage.heavy}</span>
              </div>
            </div>
            {item.suggestedDosage.safetyNotice && (
              <p className="text-[10px] text-amber-400/90 pt-1 border-t border-zinc-850">
                ⚠️ {item.suggestedDosage.safetyNotice}
              </p>
            )}
          </div>

          {/* Alternativas */}
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              <span className="font-semibold text-zinc-300">Alternativas diretas:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.alternatives.map((alt, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {alt}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#141418] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500">Melo Studio Hub • Conhecimento Técnico Aplicado</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
