import { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  Award,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Trophy,
  Volume2,
  BookOpen,
  Scale,
  Flame,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { TRAINER_CHALLENGES } from '../../data/pluginGuideData';
import { TrainerChallenge } from '../../types';

interface PluginTrainerViewProps {
  onOpenGuide?: () => void;
  onOpenVersus?: () => void;
}

export function PluginTrainerView({ onOpenGuide, onOpenVersus }: PluginTrainerViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [history, setHistory] = useState<{ [challengeId: string]: boolean }>({});

  const currentChallenge: TrainerChallenge = TRAINER_CHALLENGES[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (hasAnswered) return;

    setSelectedOptionId(optionId);
    setHasAnswered(true);

    const chosen = currentChallenge.options.find((o) => o.id === optionId);
    const isCorrect = chosen?.isCorrect ?? false;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAnsweredCount((prev) => prev + 1);
    setHistory((prev) => ({ ...prev, [currentChallenge.id]: isCorrect }));
  };

  const handleNext = () => {
    if (currentIndex < TRAINER_CHALLENGES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setHasAnswered(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedOptionId(null);
      setHasAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setHasAnswered(false);
    setScore(0);
    setAnsweredCount(0);
    setHistory({});
  };

  // Rank calculation
  const getRank = () => {
    if (answeredCount === 0) return { title: 'Iniciante do Estúdio', color: 'text-zinc-400' };
    const pct = (score / answeredCount) * 100;
    if (pct >= 85) return { title: 'Mestre da Engenharia Vocal 🏆', color: 'text-amber-400' };
    if (pct >= 65) return { title: 'Mixer Profissional 🎛️', color: 'text-emerald-400' };
    if (pct >= 40) return { title: 'Técnico Assistente 🎧', color: 'text-sky-400' };
    return { title: 'Estagiário em Treinamento 📚', color: 'text-zinc-300' };
  };

  const rank = getRank();
  const isFinished = answeredCount === TRAINER_CHALLENGES.length && hasAnswered;

  return (
    <div className="space-y-6">
      {/* Banner Principal do Treinador */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#141418] to-zinc-950 border border-amber-500/25 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Treinador de Ouvido & Escolha de Plugins</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Desafios de Decisão: Qual Plugin Você Escolhe?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Enfrente situações reais de estúdio (picos explosivos, ressonâncias de sala, sibilância cortante, cola de vozes) e teste seu raciocínio técnico. Cada resposta vem com análise profunda de por que a escolha certa funciona e por que as outras opções falham!
            </p>
          </div>

          {/* Placar & Nível */}
          <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 shrink-0 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Nível Atual</span>
              <span className={`text-xs font-bold ${rank.color}`}>{rank.title}</span>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Acertos: <strong className="text-white">{score}</strong> de {answeredCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Barra de Progresso dos Desafios */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Desafio {currentIndex + 1} de {TRAINER_CHALLENGES.length}</span>
            <span>{Math.round(((currentIndex + 1) / TRAINER_CHALLENGES.length) * 100)}% concluído</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-850 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / TRAINER_CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navegação Rápida entre os Desafios */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {TRAINER_CHALLENGES.map((ch, idx) => {
          const isDone = history[ch.id] !== undefined;
          const isPassed = history[ch.id] === true;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={ch.id}
              onClick={() => {
                setCurrentIndex(idx);
                setSelectedOptionId(null);
                setHasAnswered(isDone);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : isDone
                  ? isPassed
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                  : 'bg-[#121215] text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <span>#{idx + 1}</span>
              {isDone && (
                isPassed ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-rose-400" />
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Card do Desafio Ativo */}
      <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* Header do Desafio */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
              {currentChallenge.category}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
              Dificuldade: {currentChallenge.difficulty}
            </span>
          </div>

          <span className="text-xs text-zinc-500 font-mono">
            ID: {currentChallenge.id}
          </span>
        </div>

        {/* Título & Contexto do Estúdio */}
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
            {currentChallenge.title}
          </h3>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              🎧 Situação Real de Mixagem:
            </span>
            <p>{currentChallenge.context}</p>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-950/20 border border-sky-500/30 text-xs text-sky-200">
            <Volume2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sky-300 font-semibold block">O Que Seus Ouvidos Escutam nos Monitores:</strong>
              <span>{currentChallenge.audioDescription}</span>
            </div>
          </div>
        </div>

        {/* Pergunta Central */}
        <div className="pt-2">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{currentChallenge.question}</span>
          </h4>

          {/* Opções de Múltipla Escolha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentChallenge.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              let btnStyle = 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 text-zinc-200';

              if (hasAnswered) {
                if (option.isCorrect) {
                  btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-100 ring-1 ring-rose-500';
                } else {
                  btnStyle = 'bg-zinc-900/40 border-zinc-850 text-zinc-500 opacity-60';
                }
              }

              return (
                <button
                  key={option.id}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(option.id)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 group ${btnStyle}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                      {option.plugin}
                    </span>
                    {hasAnswered && option.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {hasAnswered && isSelected && !option.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-normal">
                    {option.reason}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Pedagógico Detalhado (Aparece após responder) */}
        {hasAnswered && (
          <div className="space-y-4 pt-4 border-t border-zinc-800 animate-in fade-in duration-200">
            {/* Explicação da Resposta Correta */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Por Que Esta É a Escolha Ideal da Engenharia de Áudio:</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {currentChallenge.correctExplanation}
              </p>
            </div>

            {/* Por que os outros falhariam */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Por Que as Outras Opções Falhariam ou Danificariam o Sinal:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {currentChallenge.whyOthersFail.map((fail, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1">
                    <span className="font-bold text-rose-400 block">{fail.plugin}</span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">{fail.why}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Regra de Ouro */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-zinc-950 border border-amber-500/30 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-amber-400 block font-bold mb-0.5 uppercase tracking-wider">
                  Regra de Ouro para Levar Para a DAW:
                </strong>
                <span className="text-zinc-200 leading-relaxed">{currentChallenge.goldenRule}</span>
              </div>
            </div>

            {/* Botões de Ação Próximo / Navegação */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold"
              >
                ← Desafio Anterior
              </button>

              <div className="flex items-center gap-2">
                {onOpenVersus && (
                  <button
                    onClick={onOpenVersus}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Ver Comparação Lado a Lado</span>
                  </button>
                )}

                {currentIndex < TRAINER_CHALLENGES.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <span>Próximo Desafio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleRestart}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reiniciar Treinamento</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Atalhos Rápidos para Guia e Comparador */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="p-4 rounded-xl bg-[#121215] border border-zinc-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">
                  Consultar a Enciclopédia de Plugins
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Veja a ficha técnica de cada compressor, EQ e saturação detalhadamente.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
          </button>
        )}

        {onOpenVersus && (
          <button
            onClick={onOpenVersus}
            className="p-4 rounded-xl bg-[#121215] border border-zinc-800 hover:border-sky-500/40 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs group-hover:text-sky-400 transition-colors">
                  Abrir Comparador (Plugin A vs B)
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Compare topologias (FET vs Óptico, Pro-Q 3 vs Maag) lado a lado.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-sky-400 transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}
