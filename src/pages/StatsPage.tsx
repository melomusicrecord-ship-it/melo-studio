import { useMemo } from 'react';
import {
  BarChart3,
  FolderKanban,
  Users,
  Mic,
  Plug,
  GitMerge,
  Music2,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  Project,
  Artist,
  Session,
  PluginItem,
  ProcessingChain,
  Instrumental,
  JournalEntry,
  Experience,
  StudioSettings,
} from '../types';
import { AppPage } from '../components/TopNavigation';

interface StatsPageProps {
  projects: Project[];
  artists: Artist[];
  sessions: Session[];
  plugins: PluginItem[];
  chains: ProcessingChain[];
  instrumentals: Instrumental[];
  journal: JournalEntry[];
  experiences: Experience[];
  settings: StudioSettings;
  subFilter?: string;
  onNavigate: (page: AppPage) => void;
}

export function StatsPage({
  projects,
  artists,
  sessions,
  plugins,
  chains,
  instrumentals,
  journal,
  experiences,
  settings,
  subFilter = 'all',
  onNavigate,
}: StatsPageProps) {
  // Calculations
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'Finalizado').length;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // Projects by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Ideia: 0,
      Produção: 0,
      Gravação: 0,
      Mixagem: 0,
      Masterização: 0,
      Finalizado: 0,
    };
    projects.forEach((p) => {
      if (counts[p.status] !== undefined) {
        counts[p.status]++;
      }
    });
    return counts;
  }, [projects]);

  // Projects by style
  const styleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      const s = p.style || 'Outro';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  // Plugins stats
  const totalPlugins = plugins.length;
  const ownedPlugins = plugins.filter((p) => p.owned).length;
  const pluginOwnershipRate = totalPlugins > 0 ? Math.round((ownedPlugins / totalPlugins) * 100) : 0;

  const pluginsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    plugins.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [plugins]);

  // Sessions stats
  const totalSessions = sessions.length;
  const confirmedSessions = sessions.filter((s) => s.status === 'Confirmada').length;
  const completedSessions = sessions.filter((s) => s.status === 'Concluída').length;

  // Instrumentals stats
  const totalBeats = instrumentals.length;
  const beatsByMood = useMemo(() => {
    const map: Record<string, number> = {};
    instrumentals.forEach((i) => {
      map[i.mood] = (map[i.mood] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [instrumentals]);

  // Experiences stats
  const totalExperiences = experiences.length;
  const fiveStarExperiments = experiences.filter((e) => e.rating === 5).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Estatísticas & Produtividade
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Métricas em tempo real da tua produção musical no estúdio {settings.studioName || 'MELO STUDIO'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            DAW Principal: <strong className="text-white">{settings.mainDaw || 'FL Studio'}</strong>
          </span>
        </div>
      </div>

      {/* Top 4 Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Projects & Completion */}
        <div
          onClick={() => onNavigate('projects')}
          className="p-5 rounded-2xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-lg cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Projetos Musicais
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-white">{totalProjects}</span>
            <span className="text-xs text-emerald-400 font-medium">
              {completedProjects} finalizados ({completionRate}%)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-zinc-500 group-hover:text-amber-400 transition-colors">
            <span>Ver todos os projetos</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 2: Plugins Inventory */}
        <div
          onClick={() => onNavigate('plugins')}
          className="p-5 rounded-2xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-lg cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Biblioteca de Plugins
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Plug className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-white">{totalPlugins}</span>
            <span className="text-xs text-blue-400 font-medium">
              {ownedPlugins} adquiridos ({pluginOwnershipRate}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${pluginOwnershipRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-zinc-500 group-hover:text-blue-400 transition-colors">
            <span>Explorar inventário</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Sessions */}
        <div
          onClick={() => onNavigate('sessions')}
          className="p-5 rounded-2xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-lg cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Sessões de Gravação
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-white">{totalSessions}</span>
            <span className="text-xs text-rose-400 font-medium">
              {confirmedSessions} confirmadas
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{
                width: `${totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-zinc-500 group-hover:text-rose-400 transition-colors">
            <span>Gerir agenda de estúdio</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Chains & Experiments */}
        <div
          onClick={() => onNavigate('chains')}
          className="p-5 rounded-2xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-lg cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Cadeias & Experiências
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <GitMerge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-white">{chains.length}</span>
            <span className="text-xs text-cyan-400 font-medium">
              {totalExperiences} testes A/B ({fiveStarExperiments} ⭐⭐⭐⭐⭐)
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full w-4/5" />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-zinc-500 group-hover:text-cyan-400 transition-colors">
            <span>Guia de plugins e cadeias</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Detailed Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Pipeline & Category Charts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Projects Pipeline Breakdown */}
          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800/80 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Pipeline de Produção Musical
                </h3>
                <p className="text-xs text-zinc-400">
                  Distribuição dos projetos pelas etapas de concepção até finalização
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300">
                {totalProjects} No Total
              </span>
            </div>

            <div className="space-y-3">
              {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => {
                const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
                let barColor = 'bg-zinc-500';
                if (status === 'Ideia') barColor = 'bg-yellow-500';
                if (status === 'Produção') barColor = 'bg-blue-500';
                if (status === 'Gravação') barColor = 'bg-rose-500';
                if (status === 'Mixagem') barColor = 'bg-purple-500';
                if (status === 'Masterização') barColor = 'bg-cyan-500';
                if (status === 'Finalizado') barColor = 'bg-emerald-500';

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">{status}</span>
                      <span className="text-zinc-400">
                        {count} {count === 1 ? 'música' : 'músicas'} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plugins by Category Breakdown */}
          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800/80 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Distribuição de Plugins por Categoria
                </h3>
                <p className="text-xs text-zinc-400">
                  Arsenal de processamento cadastrado no teu estúdio
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 text-blue-400">
                {totalPlugins} Plugins
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pluginsByCategory.map(([cat, count]) => {
                const pct = totalPlugins > 0 ? Math.round((count / totalPlugins) * 100) : 0;
                return (
                  <div
                    key={cat}
                    className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200">{cat}</span>
                      <span className="text-zinc-400 font-mono">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Studio Ecosystem Overview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Studio Summary Box */}
          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Resumo do Estúdio
            </h3>

            <div className="divide-y divide-zinc-800/80 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  Artistas Cadastrados
                </span>
                <span className="font-bold text-white">{artists.length}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Music2 className="w-3.5 h-3.5 text-zinc-500" />
                  Ideias de Beats
                </span>
                <span className="font-bold text-white">{totalBeats}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                  Anotações no Diário
                </span>
                <span className="font-bold text-white">{journal.length}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2">
                  <FlaskConical className="w-3.5 h-3.5 text-zinc-500" />
                  Experiências A/B
                </span>
                <span className="font-bold text-white">{totalExperiences}</span>
              </div>
            </div>
          </div>

          {/* Beats by Mood */}
          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Music2 className="w-4 h-4 text-amber-400" />
              Catálogo de Beats por Mood
            </h3>

            <div className="space-y-2.5">
              {beatsByMood.map(([mood, count]) => {
                const pct = totalBeats > 0 ? Math.round((count / totalBeats) * 100) : 0;
                return (
                  <div key={mood} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium capitalize">{mood}</span>
                      <span className="text-zinc-500">{count} beats</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500/80 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-[#121215] border border-zinc-800 space-y-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Acesso Rápido
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('experiences')}
                className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-medium text-left flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                Experiências
              </button>
              <button
                onClick={() => onNavigate('library')}
                className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-medium text-left flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Biblioteca
              </button>
              <button
                onClick={() => onNavigate('journal')}
                className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-medium text-left flex items-center gap-2 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Diário
              </button>
              <button
                onClick={() => onNavigate('chains')}
                className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-medium text-left flex items-center gap-2 transition-colors cursor-pointer"
              >
                <GitMerge className="w-3.5 h-3.5 text-cyan-400" />
                Cadeias
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
