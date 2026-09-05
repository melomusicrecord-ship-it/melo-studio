import { useState, useEffect } from 'react';
import {
  Lightbulb,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Shuffle,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  BookOpen,
  Info,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QUICK_AUDIO_TIPS, QuickAudioTip } from '../../data/quickAudioTipsData';
import { useToast } from '../Toast';

interface QuickAudioTipsCardProps {
  onLearnPluginWithAI?: (pluginName: string) => void;
  onOpenKnowledgeBase?: () => void;
}

type TipTypeFilter = 'all' | 'tip' | 'concept';

export function QuickAudioTipsCard({
  onLearnPluginWithAI,
  onOpenKnowledgeBase,
}: QuickAudioTipsCardProps) {
  const { showToast } = useToast();
  const [typeFilter, setTypeFilter] = useState<TipTypeFilter>('all');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const ROTATION_INTERVAL_MS = 13000; // 13 seconds per tip
  const TICK_MS = 100;

  // Filter tips by type and category
  const filteredTips = QUICK_AUDIO_TIPS.filter((t) => {
    const matchesType =
      typeFilter === 'all' ? true : t.type === typeFilter;
    const matchesCategory =
      activeCategory === 'Todos' ? true : t.category === activeCategory;
    return matchesType && matchesCategory;
  });

  // Safety clamp index
  const safeIndex =
    filteredTips.length > 0 ? currentIndex % filteredTips.length : 0;
  const currentTip: QuickAudioTip = filteredTips[safeIndex] || QUICK_AUDIO_TIPS[0];

  // Auto-rotation timer logic
  useEffect(() => {
    if (isPaused || isExpanded || filteredTips.length <= 1) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK_MS / ROTATION_INTERVAL_MS) * 100;
        if (next >= 100) {
          setCurrentIndex((old) => (old + 1) % filteredTips.length);
          return 0;
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [isPaused, isExpanded, filteredTips.length]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % filteredTips.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + filteredTips.length) % filteredTips.length);
  };

  const handleShuffle = () => {
    setProgress(0);
    const randomIndex = Math.floor(Math.random() * filteredTips.length);
    setCurrentIndex(randomIndex);
    showToast('Inspirado! Nova dica selecionada aleatoriamente.');
  };

  const handleCopy = () => {
    const text = `🎧 [Melo Studio Hub - ${currentTip.type === 'concept' ? 'Conceito de Engenharia' : 'Dica de Mixagem'}]\n${currentTip.title}\n\n📌 Regra Prática: ${currentTip.practicalTakeaway}\n\n⚙️ Ação Recomendada: ${currentTip.recommendedAction}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Dica copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    'Todos',
    'Frequência & EQ',
    'Dinâmica & Compressão',
    'Ganho & Headroom',
    'Espaço & Reverb',
    'Fase & Psicoacústica',
    'Harmônicos & Saturação',
    'Vocal Hit',
  ];

  const tipsCount = QUICK_AUDIO_TIPS.filter((t) => t.type === 'tip').length;
  const conceptsCount = QUICK_AUDIO_TIPS.filter((t) => t.type === 'concept').length;

  return (
    <div
      id="quick-audio-tips-card"
      className="rounded-2xl bg-gradient-to-br from-[#121216] via-[#14141a] to-[#101014] border border-amber-500/25 shadow-xl relative overflow-hidden transition-all group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!isExpanded) setIsPaused(false);
      }}
    >
      {/* Subtle background ambient glow */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Progress Line for Auto-Rotation */}
      <div className="w-full bg-zinc-800/40 h-1 overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            isPaused ? 'bg-zinc-600' : 'bg-gradient-to-r from-amber-500 to-amber-300'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Header: Title, Mode Badges & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              {currentTip.type === 'concept' ? (
                <GraduationCap className="w-4 h-4" />
              ) : (
                <Lightbulb className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-white">
                  Dicas Rápidas de Mixagem & Conceitos de Engenharia
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>100% Offline</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {safeIndex + 1} de {filteredTips.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Alterne e aprenda segredos práticos e teoria acústica com rotação automática
              </p>
            </div>
          </div>

          {/* Controls: Prev, Next, Play/Pause, Shuffle, Copy */}
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              id="tips-pause-play-btn"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Retomar rotação periódica' : 'Pausar rotação periódica'}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              id="tips-shuffle-btn"
              onClick={handleShuffle}
              title="Dica aleatória"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button
              id="tips-prev-btn"
              onClick={handlePrev}
              title="Dica anterior"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              id="tips-next-btn"
              onClick={handleNext}
              title="Próxima dica"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              id="tips-copy-btn"
              onClick={handleCopy}
              title="Copiar resumo da dica"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors ml-0.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Type Filter Buttons (Explicitly separating Tips vs Concepts) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
            <button
              id="tips-filter-all"
              onClick={() => {
                setTypeFilter('all');
                setCurrentIndex(0);
                setProgress(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos ({QUICK_AUDIO_TIPS.length})
            </button>
            <button
              id="tips-filter-tips"
              onClick={() => {
                setTypeFilter('tip');
                setCurrentIndex(0);
                setProgress(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'tip'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-amber-300'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Dicas de Mixagem ({tipsCount})</span>
            </button>
            <button
              id="tips-filter-concepts"
              onClick={() => {
                setTypeFilter('concept');
                setCurrentIndex(0);
                setProgress(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'concept'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-sky-300'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Conceitos de Engenharia ({conceptsCount})</span>
            </button>
          </div>

          {/* Quick status text */}
          <span className="text-[11px] text-zinc-500 font-mono hidden md:inline">
            Troca automática a cada 13s • Passe o mouse para pausar
          </span>
        </div>

        {/* Secondary Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono flex items-center gap-1 shrink-0 pl-0.5">
            <Filter className="w-3 h-3 text-zinc-500" />
            <span>Filtro:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentIndex(0);
                setProgress(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tip Content Area with Smooth Motion Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-bold border ${
                      currentTip.type === 'concept'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {currentTip.type === 'concept' ? 'Conceito de Engenharia' : 'Dica Prática'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {currentTip.category}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {currentTip.title}
                </h3>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold shrink-0 bg-zinc-800 text-zinc-300 border border-zinc-700">
                {currentTip.difficulty}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-amber-300/95 font-medium leading-relaxed">
              "{currentTip.headline}"
            </p>

            {/* Practical Takeaway Highlight Box */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 block font-mono">
                💡 Regra de Ouro no Estúdio:
              </span>
              <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed">
                {currentTip.practicalTakeaway}
              </p>
            </div>

            {/* Expanded View: Deep Theory & Recommended Action */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 pt-2 border-t border-zinc-800/80"
              >
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 font-mono flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-sky-400" />
                    <span>Fundamento Acústico / Por que Funciona:</span>
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
                    {currentTip.deepExplanation}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ação Prática Imediata na DAW:</span>
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl">
                    {currentTip.recommendedAction}
                  </p>
                </div>

                {currentTip.suggestedPlugins && currentTip.suggestedPlugins.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Plugins Sugeridos para Aplicar:
                    </span>
                    {currentTip.suggestedPlugins.map((plugin) => (
                      <button
                        key={plugin}
                        onClick={() => onLearnPluginWithAI?.(plugin)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 text-[11px] text-zinc-300 hover:text-amber-300 transition-colors"
                        title={`Aprender como usar ${plugin} com o mentor`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{plugin}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
          <button
            id="tips-expand-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{isExpanded ? 'Recolher detalhes pedagógicos' : 'Ver explicação pedagógica completa'}</span>
          </button>

          <div className="flex items-center gap-2">
            {currentTip.suggestedPlugins && currentTip.suggestedPlugins[0] && onLearnPluginWithAI && (
              <button
                id="tips-explain-plugin-btn"
                onClick={() => onLearnPluginWithAI(currentTip.suggestedPlugins![0])}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aprender Plugin ({currentTip.suggestedPlugins[0]})</span>
              </button>
            )}

            {onOpenKnowledgeBase && (
              <button
                id="tips-open-knowledge-btn"
                onClick={onOpenKnowledgeBase}
                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
              >
                <span>Banco de Plugins</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

