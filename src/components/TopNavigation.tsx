import {
  Sliders,
  FolderKanban,
  Users,
  Calendar,
  Mic,
  Music2,
  Plug,
  GitMerge,
  Stethoscope,
  FlaskConical,
  BookOpen,
  GraduationCap,
  Library,
  BarChart3,
  Settings,
  Calculator,
  Plus,
  Search,
  Menu,
  Activity,
  Headphones,
  Sparkles,
  Monitor,
} from 'lucide-react';
import { StudioSettings } from '../types';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';

export type AppPage =
  | 'dashboard'
  | 'projects'
  | 'artists'
  | 'agenda'
  | 'sessions'
  | 'vocal-engine'
  | 'chains'
  | 'instrumentals'
  | 'plugins'
  | 'diagnosis'
  | 'tools'
  | 'experiences'
  | 'journal'
  | 'learning'
  | 'library'
  | 'stats'
  | 'settings';

interface TopNavigationProps {
  currentPage: AppPage;
  onPageChange: (page: AppPage) => void;
  subFilter: string;
  onSubFilterChange: (sub: string) => void;
  settings: StudioSettings;
  onOpenSearch: () => void;
  onOpenQuickTools: () => void;
  onOpenBypass: () => void;
  onQuickAction: (action: string) => void;
  onToggleMobileDrawer: () => void;
  onOpenInstallModal: () => void;
}

export function TopNavigation({
  currentPage,
  onPageChange,
  subFilter,
  onSubFilterChange,
  settings,
  onOpenSearch,
  onOpenQuickTools,
  onOpenBypass,
  onQuickAction,
  onToggleMobileDrawer,
  onOpenInstallModal,
}: TopNavigationProps) {
  const mainNavItems = [
    { id: 'dashboard' as AppPage, label: 'Dashboard', icon: Sliders },
    { id: 'projects' as AppPage, label: 'Projetos', icon: FolderKanban },
    { id: 'artists' as AppPage, label: 'Artistas', icon: Users },
    { id: 'sessions' as AppPage, label: 'Sessões', icon: Mic },
    { id: 'vocal-engine' as AppPage, label: '🎙️ Vocal Engine', icon: Headphones },
    { id: 'chains' as AppPage, label: 'Guia de Cadeias', icon: GitMerge },
    { id: 'diagnosis' as AppPage, label: 'Diagnóstico', icon: Stethoscope },
    { id: 'tools' as AppPage, label: 'Calculadora & Áudio', icon: Calculator },
    { id: 'plugins' as AppPage, label: 'Plugins', icon: Plug },
    { id: 'instrumentals' as AppPage, label: 'Instrumentais', icon: Music2 },
    { id: 'agenda' as AppPage, label: 'Agenda', icon: Calendar },
    { id: 'learning' as AppPage, label: 'Aprendizagem', icon: GraduationCap },
    { id: 'journal' as AppPage, label: 'Diário', icon: BookOpen },
    { id: 'experiences' as AppPage, label: 'Experiências', icon: FlaskConical },
    { id: 'library' as AppPage, label: 'Biblioteca', icon: Library },
    { id: 'stats' as AppPage, label: 'Estatísticas', icon: BarChart3 },
    { id: 'settings' as AppPage, label: 'Configurações', icon: Settings },
  ];

  // Sub-navigation buttons depending on current page
  const getSubNavItems = () => {
    switch (currentPage) {
      case 'projects':
        return [
          { id: 'all', label: 'Todos os Projetos' },
          { id: 'Ideia', label: '💡 Ideia' },
          { id: 'Produção', label: '🎹 Produção' },
          { id: 'Gravação', label: '🔴 Gravação' },
          { id: 'Mixagem', label: '🎛️ Mixagem' },
          { id: 'Masterização', label: '⚡ Masterização' },
          { id: 'Finalizado', label: '✅ Finalizado' },
          { id: 'favorites', label: '⭐ Favoritos' },
        ];
      case 'vocal-engine':
        return [
          { id: 'chain', label: '🎛️ Cadeia Ativa' },
          { id: 'flow', label: '📚 16 Etapas' },
          { id: 'diagnosis', label: '🎯 Diagnóstico Vocal' },
          { id: 'frequency', label: '📊 Mapa de Frequências' },
          { id: 'plugins', label: '📖 Guia de Plugins' },
          { id: 'versus', label: '⚖️ Versus (A vs B)' },
          { id: 'trainer', label: '⚡ Treinador' },
          { id: 'checklist', label: '✅ Check Final & Master' },
        ];
      case 'chains':
        return [
          { id: 'vocal-engine', label: '🎙️ Vocal Engine' },
          { id: 'guide', label: '🎛️ Guia Interativo' },
          { id: 'all', label: '📚 Todas as Cadeias' },
          { id: 'Lead Vocal', label: '🎤 Lead Vocal' },
          { id: 'Backing Vocal', label: '👥 Backing / Adlibs' },
          { id: 'Bass', label: '🎸 808 & Bass' },
          { id: 'Kick', label: '🥁 Kick & Drums' },
          { id: 'Mix Bus', label: '🎚️ Mix Bus & Master' },
          { id: 'favorites', label: '⭐ Favoritas' },
          { id: 'compare', label: '🔀 Comparador A/B' },
        ];
      case 'plugins':
        return [
          { id: 'all', label: 'Todos os Plugins' },
          { id: 'ai-guide', label: '🤖 Guia de Aprendizado IA (Gemini)' },
          { id: 'guide', label: '📘 Guia Pedagógico & O Que Faz' },
          { id: 'versus', label: '⚖️ Versus (Plugin A vs B)' },
          { id: 'trainer', label: '⚡ Treinador & Desafios' },
          { id: 'owned', label: '☑️ Eu Tenho' },
          { id: 'favorites', label: '⭐ Favoritos' },
          { id: 'mostUsed', label: '🔥 Mais Usados' },
          { id: 'cat-EQ', label: 'EQ' },
          { id: 'cat-Compressor', label: 'Compressor' },
          { id: 'cat-Reverb', label: 'Reverb' },
          { id: 'cat-Delay', label: 'Delay' },
          { id: 'cat-Saturation', label: 'Saturação' },
        ];
      case 'sessions':
        return [
          { id: 'all', label: 'Todas as Sessões' },
          { id: 'timeline', label: '⏱️ Cronograma' },
          { id: 'checklist', label: '📋 Checklist de Sessão' },
          { id: 'Gravação', label: '🔴 Gravação' },
          { id: 'Mixagem', label: '🎛️ Mixagem' },
          { id: 'Confirmada', label: '✅ Confirmadas' },
        ];
      case 'instrumentals':
        return [
          { id: 'all', label: 'Todas as Ideias' },
          { id: 'mood-energetico', label: '🔥 Energético' },
          { id: 'mood-melancolico', label: '🌙 Melancólico' },
          { id: 'mood-romantico', label: '❤️ Romântico' },
          { id: 'mood-dark', label: '🌑 Dark' },
          { id: 'favorites', label: '⭐ Favoritos' },
        ];
      case 'diagnosis':
        return [
          { id: 'all', label: 'Todos os Sintomas' },
          { id: 'cat-Vocal', label: '🎤 Vocal' },
          { id: 'cat-Graves', label: '🔊 Graves & 808' },
          { id: 'cat-Bateria', label: '🥁 Bateria & Punch' },
          { id: 'cat-Mix Geral', label: '🎚️ Mix Geral' },
          { id: 'cat-Espaço & Imagem', label: '🌐 Espaço & Stereo' },
        ];
      case 'learning':
        return [
          { id: 'all', label: 'Todas as Matérias' },
          { id: 'cat-learn-eq', label: 'Equalização' },
          { id: 'cat-learn-comp', label: 'Compressão' },
          { id: 'cat-learn-space', label: 'Reverb & Delay' },
          { id: 'cat-learn-saturation', label: 'Saturação' },
          { id: 'cat-learn-master', label: 'Masterização' },
        ];
      case 'settings':
        return [
          { id: 'studio', label: 'Estúdio & DAW' },
          { id: 'backup', label: '💾 Backup & Restauração' },
          { id: 'demo', label: '🔄 Dados de Demonstração' },
        ];
      case 'experiences':
        return [
          { id: 'all', label: 'Todos os Testes' },
          { id: 'rating-5', label: '⭐⭐⭐⭐⭐ Ouro (5 Estrelas)' },
          { id: 'vocal', label: '🎤 Vocais' },
          { id: 'mix', label: '🎛️ Mix & Master' },
          { id: 'plugins', label: '🔌 Com Plugins' },
        ];
      case 'library':
        return [
          { id: 'all', label: 'Todos os Documentos' },
          { id: 'type-Template', label: '📋 Templates' },
          { id: 'type-Nota de Estúdio', label: '📝 Notas & Frequências' },
          { id: 'type-Tutorial', label: '💡 Tutoriais' },
          { id: 'type-Preset', label: '🎚️ Presets' },
          { id: 'type-Referência', label: '🎯 Referências' },
        ];
      case 'stats':
        return [
          { id: 'all', label: '📊 Visão Geral' },
          { id: 'pipeline', label: '📁 Pipeline de Projetos' },
          { id: 'plugins', label: '🔌 Arsenal de Plugins' },
          { id: 'beats', label: '🎹 Catálogo de Beats' },
        ];
      case 'tools':
        return [
          { id: 'all', label: '🧮 Todas as Ferramentas' },
          { id: 'delay', label: '⏱️ Delay & Reverb Sync' },
          { id: 'freq', label: '🎯 Nota ➔ Hz (808 / Kick)' },
          { id: 'pitch', label: '🔄 Pitch & Time-Stretch' },
        ];
      default:
        return [];
    }
  };

  const subNavItems = getSubNavItems();

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-2xl">
      {/* ROW 1: Studio Identity + Action Buttons & Sub-buttons */}
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 border-b border-zinc-800/50">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleMobileDrawer}
            className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-white hover:bg-zinc-800"
            title="Menu de navegação"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onPageChange('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors shadow-inner">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-sm sm:text-base">
                  MELO STUDIO HUB
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  OFFLINE V2
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-zinc-400 font-medium truncate max-w-[200px] lg:max-w-none">
                {settings.studioName || 'Melo Studio Hub'} • {settings.mainDaw || 'FL Studio'}
              </p>
            </div>
          </div>
        </div>

        {/* Center/Actions: Top Buttons for Instant Creation & Quick Tools */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onQuickAction('new-project')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>

          <button
            onClick={() => onQuickAction('new-session')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Nova Sessão</span>
          </button>

          <button
            onClick={() => onQuickAction('new-chain')}
            className="px-2.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Nova Chain</span>
          </button>

          <button
            onClick={() => onQuickAction('new-idea')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Novo Beat</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 mx-1 shrink-0" />

          {/* Quick Studio Tools */}
          <button
            onClick={() => onPageChange('tools')}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer ${
              currentPage === 'tools'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-750 text-zinc-200'
            }`}
            title="Calculadora de Delay/Reverb, Nota ➔ Hz e Pitch"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Calculadora & Áudio</span>
          </button>

          <button
            onClick={onOpenBypass}
            className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 text-xs font-medium flex items-center gap-1 transition-all active:scale-95 shrink-0"
            title="Comparação A/B Educacional de Ouvido"
          >
            <Headphones className="w-3.5 h-3.5 text-sky-400" />
            <span>A/B</span>
          </button>
        </div>

        {/* Right: Status Indicator + PC Install + Search + Mobile Quick Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Subtle Status Indicator for 100% Offline readiness & navigator.onLine */}
          <OfflineStatusIndicator onOpenInstallModal={onOpenInstallModal} />

          {/* Install on PC / Desktop Button */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white text-xs font-medium transition-all active:scale-95 shrink-0 shadow-sm"
            title="Instalar MELO STUDIO HUB no Computador (Windows / Mac / Linux) para 100% Offline"
          >
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Instalar no PC</span>
          </button>

          {/* Mobile fast action button */}
          <button
            onClick={() => onQuickAction('new-project')}
            className="lg:hidden p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 active:scale-95"
            title="Novo Projeto"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQuickTools}
            className="lg:hidden p-2 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-750 active:scale-95"
            title="Ferramentas de Áudio"
          >
            <Activity className="w-4 h-4 text-amber-400" />
          </button>

          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-750 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
            title="Pesquisa Global no Studio (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Pesquisar...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono border border-zinc-700">
              Ctrl+K
            </kbd>
          </button>
        </div>
      </div>

      {/* ROW 2: Primary Navigation Tabs (Smooth horizontal scrolling on mobile/desktop) */}
      <nav className="px-2 sm:px-6 pt-1.5 pb-2 flex items-center gap-1 overflow-x-auto custom-nav-scrollbar bg-[#09090b]">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                onSubFilterChange('all');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-amber-400' : 'text-zinc-500'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ROW 3: Sub-Buttons Bar (Contextual dynamic filters for instantaneous loading & rapid switching) */}
      {subNavItems.length > 0 && (
        <div className="px-3 sm:px-6 pt-1.5 pb-2 bg-[#121215] border-t border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto custom-nav-scrollbar text-xs">
          <span className="text-[11px] font-medium text-zinc-500 shrink-0 uppercase tracking-wider pl-1 mr-1">
            Filtro:
          </span>
          {subNavItems.map((sub) => {
            const isSubActive = subFilter === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSubFilterChange(sub.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isSubActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
