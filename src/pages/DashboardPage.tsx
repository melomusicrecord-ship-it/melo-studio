import {
  FolderKanban,
  Users,
  Mic,
  GitMerge,
  Plug,
  Music2,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Star,
  Sparkles,
  Calculator,
  Headphones,
} from 'lucide-react';
import {
  Project,
  Artist,
  Session,
  ProcessingChain,
  PluginItem,
  Instrumental,
  StudioSettings,
  JournalEntry,
} from '../types';
import { AppPage } from '../components/TopNavigation';
import { QuickAudioTipsCard } from '../components/dashboard/QuickAudioTipsCard';

interface DashboardPageProps {
  settings: StudioSettings;
  projects: Project[];
  artists: Artist[];
  sessions: Session[];
  chains: ProcessingChain[];
  plugins: PluginItem[];
  instrumentals: Instrumental[];
  journal: JournalEntry[];
  onNavigate: (page: AppPage, id?: string) => void;
  onQuickAction: (action: string) => void;
}

export function DashboardPage({
  settings,
  projects,
  artists,
  sessions,
  chains,
  plugins,
  instrumentals,
  journal,
  onNavigate,
  onQuickAction,
}: DashboardPageProps) {
  const activeProjects = projects.filter(
    (p) => p.status !== 'Finalizado' && p.status !== 'Arquivado'
  );

  // Find next upcoming session
  const upcomingSessions = sessions
    .filter((s) => s.status !== 'Concluída' && s.status !== 'Cancelada')
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());

  const nextSession = upcomingSessions[0] || null;

  const statCards = [
    {
      title: 'Projetos Ativos',
      count: activeProjects.length,
      icon: FolderKanban,
      color: 'amber',
      page: 'projects' as AppPage,
      subtitle: `${projects.filter((p) => p.status === 'Finalizado').length} finalizados`,
    },
    {
      title: 'Artistas',
      count: artists.length,
      icon: Users,
      color: 'blue',
      page: 'artists' as AppPage,
      subtitle: `${artists.filter((a) => a.favorite).length} favoritos`,
    },
    {
      title: 'Sessões',
      count: upcomingSessions.length,
      icon: Mic,
      color: 'rose',
      page: 'sessions' as AppPage,
      subtitle: `${sessions.length} registradas`,
    },
    {
      title: 'Chains no Guia',
      count: chains.length,
      icon: GitMerge,
      color: 'sky',
      page: 'chains' as AppPage,
      subtitle: `${chains.filter((c) => c.favorite).length} favoritas`,
    },
    {
      title: 'Plugins',
      count: plugins.length,
      icon: Plug,
      color: 'emerald',
      page: 'plugins' as AppPage,
      subtitle: `${plugins.filter((p) => p.owned).length} que possuo`,
    },
    {
      title: 'Ideias de Beats',
      count: instrumentals.length,
      icon: Music2,
      color: 'purple',
      page: 'instrumentals' as AppPage,
      subtitle: `${instrumentals.filter((i) => i.favorite).length} favoritas`,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-r from-zinc-900 via-[#131317] to-zinc-950 border border-zinc-800/80 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Espaço de Produção Musical</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Bom trabalho, {settings.producerName || 'Melo'}. 🎛️
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              "Vamos ver o que está acontecendo no teu estúdio."
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onQuickAction('new-project')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/10 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Projeto</span>
            </button>
            <button
              onClick={() => onNavigate('chains')}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-2 active:scale-95 transition-all border border-zinc-700"
            >
              <GitMerge className="w-4 h-4 text-sky-400" />
              <span>Guia de Chains</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 High-Level Count Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => onNavigate(card.page)}
              className="p-4 rounded-xl bg-[#121215] hover:bg-zinc-800/80 border border-zinc-800/90 cursor-pointer transition-all hover:border-zinc-700 active:scale-[0.98] group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 truncate">
                  {card.title}
                </span>
                <Icon className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 shrink-0 transition-colors" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {card.count}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dicas Rápidas de Mixagem & Conceitos de Engenharia de Áudio (Curva de Aprendizado) */}
      <QuickAudioTipsCard
        onLearnPluginWithAI={(pluginName) => onNavigate('plugins', `ai-guide:${pluginName}`)}
        onOpenKnowledgeBase={() => onNavigate('plugins', 'guide')}
      />

      {/* Grid: Próxima Sessão & Resumo do Dia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Next Session Highlight Card */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="h-full p-5 rounded-2xl bg-[#121215] border border-zinc-800/90 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  🎙️ Próxima Sessão
                </span>
                {nextSession && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {nextSession.status}
                  </span>
                )}
              </div>

              {nextSession ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {nextSession.artistName}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      Projeto: {nextSession.projectName || 'Produção Geral'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                    <div>
                      <span className="text-[11px] text-zinc-500 block">Data & Hora</span>
                      <span className="font-semibold text-zinc-200">
                        {nextSession.date} • {nextSession.startTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-500 block">Tipo</span>
                      <span className="font-semibold text-amber-400">
                        {nextSession.type}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850">
                    <span className="font-medium text-zinc-300">Objetivo:</span> {nextSession.objective}
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  <Mic className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                  <p>Nenhuma sessão programada no momento.</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Agenda uma gravação para manter o estúdio ativo.</p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/80">
              {nextSession ? (
                <button
                  onClick={() => onNavigate('sessions', nextSession.id)}
                  className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                  <span>ABRIR SESSÃO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onQuickAction('new-session')}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agendar Nova Sessão</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resumo do Dia: Sessões, Tarefas e Projetos em Andamento */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="h-full p-5 rounded-2xl bg-[#121215] border border-zinc-800/90 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  📅 Resumo do Dia & Tarefas do Estúdio
                </span>
                <span className="text-[11px] text-zinc-500">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                </span>
              </div>

              {/* Projects in Progress preview */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Projetos em Produção & Mixagem
                </div>
                {activeProjects.slice(0, 3).map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => onNavigate('projects', proj.id)}
                    className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/70 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                          {proj.name}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            proj.status === 'Mixagem'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : proj.status === 'Gravação'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                        {proj.artist} • {proj.style} ({proj.bpm} BPM, {proj.key})
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${proj.progress || 30}%` }}
                        />
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400" />
                    </div>
                  </div>
                ))}

                {activeProjects.length === 0 && (
                  <div className="py-4 text-center text-zinc-500 text-xs">
                    Nenhum projeto ativo. Cria um novo projeto para começar.
                  </div>
                )}
              </div>

              {/* Recent Journal note or tip */}
              {journal.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800/70">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center justify-between">
                    <span>Última Nota do Diário</span>
                    <button
                      onClick={() => onNavigate('journal')}
                      className="text-amber-400 hover:underline lowercase font-normal"
                    >
                      ver diário →
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300 italic bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850 line-clamp-2">
                    "{journal[0].learnedToday}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => onNavigate('agenda')}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Agenda Completa</span>
              </button>

              <button
                onClick={() => onNavigate('vocal-engine')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>🎙️ Melo Vocal Engine</span>
              </button>

              <button
                onClick={() => onNavigate('tools')}
                className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>🧮 Calculadora de Áudio</span>
              </button>

              <button
                onClick={() => onNavigate('diagnosis')}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
              >
                <span>🩺 Diagnóstico de Mix</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Melo Vocal Engine Spotlight Banner */}
      <div
        onClick={() => onNavigate('vocal-engine')}
        className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#16161b] to-zinc-900 border border-amber-500/35 hover:border-amber-500/60 cursor-pointer transition-all shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                NOVO MÓDULO AVANÇADO
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                16 ETAPAS • WAVES & FABFILTER
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
              Melo Vocal Engine • Central de Produção e Mixagem Vocal
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Limpeza acústica, afinação, de-essing, compressão em série, saturação analógica, ambiência e masterização.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs group-hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20">
            <span>Abrir Vocal Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Featured Chains Carousel / Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-sky-400" />
              <span>Cadeias de Plugins em Destaque</span>
            </h2>
            <p className="text-xs text-zinc-400">
              "Aprende o que usar, em que ordem usar e por que usar."
            </p>
          </div>
          <button
            onClick={() => onNavigate('chains')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {chains.slice(0, 3).map((chain) => (
            <div
              key={chain.id}
              onClick={() => onNavigate('chains', chain.id)}
              className="p-4 rounded-xl bg-[#121215] hover:bg-zinc-800/80 border border-zinc-800/80 cursor-pointer transition-all hover:border-zinc-700 active:scale-[0.99] group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    {chain.target}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {chain.steps.length} plugins
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {chain.name}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                  {chain.goal}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium text-zinc-500">Estilo: {chain.style}</span>
                <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  Abrir Chain →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
