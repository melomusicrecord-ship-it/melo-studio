import { useRef, useEffect } from 'react';
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
  ChevronRight,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
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

// Module hierarchy categorization for mobile and visual context
export const MODULE_METADATA: Record<
  AppPage,
  { category: string; categoryColor: string; description: string }
> = {
  dashboard: {
    category: 'Principal',
    categoryColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    description: 'Painel Central & Visão Geral',
  },
  projects: {
    category: 'Produção Musical',
    categoryColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    description: 'Projetos & Músicas',
  },
  artists: {
    category: 'Produção Musical',
    categoryColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    description: 'Artistas & Contatos',
  },
  sessions: {
    category: 'Produção Musical',
    categoryColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    description: 'Sessões & Checklists',
  },
  'vocal-engine': {
    category: 'Mixagem & Som',
    categoryColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
    description: '16 Etapas & Cadeias Vocais',
  },
  chains: {
    category: 'Mixagem & Som',
    categoryColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
    description: 'Cadeias de Processamento & A/B',
  },
  diagnosis: {
    category: 'Mixagem & Som',
    categoryColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    description: 'Diagnóstico de Áudio',
  },
  tools: {
    category: 'Mixagem & Som',
    categoryColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    description: 'Calculadora de Delay, Hertz & Pitch',
  },
  plugins: {
    category: 'Mixagem & Som',
    categoryColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    description: 'Biblioteca & Mentor IA',
  },
  instrumentals: {
    category: 'Produção Musical',
    categoryColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    description: 'Beats & Catálogo Instrumental',
  },
  agenda: {
    category: 'Principal',
    categoryColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    description: 'Calendário & Prazos',
  },
  learning: {
    category: 'Conhecimento',
    categoryColor: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
    description: 'Matérias & Evolução Técnica',
  },
  journal: {
    category: 'Conhecimento',
    categoryColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    description: 'Diário & Anotações de Produção',
  },
  experiences: {
    category: 'Conhecimento',
    categoryColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    description: 'Testes de Estúdio & Presets',
  },
  library: {
    category: 'Conhecimento',
    categoryColor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
    description: 'Arquivos, Referências & Manuais',
  },
  stats: {
    category: 'Principal',
    categoryColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    description: 'Estatísticas & Produtividade',
  },
  settings: {
    category: 'Sistema',
    categoryColor: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/30',
    description: 'Configurações de Áudio & Backup',
  },
};

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
  const activeNavRef = useRef<HTMLButtonElement | null>(null);

  // Smooth auto-scroll to keep active navigation item in view on mobile/desktop
  useEffect(() => {
    if (activeNavRef.current) {
      activeNavRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentPage]);
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

      {/* MOBILE HIERARCHY BAR: Clearly indicates the active module & hierarchy depth on mobile screens */}
      <div className="md:hidden px-3 py-1.5 bg-[#0e0e12] border-b border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-bold border shrink-0 ${
              MODULE_METADATA[currentPage]?.categoryColor ||
              'text-zinc-400 bg-zinc-800 border-zinc-750'
            }`}
          >
            {MODULE_METADATA[currentPage]?.category || 'Módulo'}
          </span>
          <span className="text-zinc-500 text-[10px] shrink-0 font-mono">▸</span>
          <div className="flex items-center gap-1 min-w-0 truncate">
            <span className="font-bold text-white text-xs truncate">
              {mainNavItems.find((i) => i.id === currentPage)?.label || currentPage}
            </span>
            {subFilter !== 'all' && (
              <>
                <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
                <span className="text-amber-400 text-[11px] font-medium truncate">
                  {subNavItems.find((s) => s.id === subFilter)?.label || subFilter}
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onToggleMobileDrawer}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-[11px] text-zinc-400 hover:text-white shrink-0 font-medium transition-colors"
          title="Ver todos os módulos"
        >
          <Layers className="w-3 h-3 text-amber-400" />
          <span>Trocar</span>
        </button>
      </div>

      {/* ROW 2: Primary Navigation Tabs (With smooth motion active indicator & auto-scroll) */}
      <nav className="px-2 sm:px-6 pt-1.5 pb-2 flex items-center gap-1 overflow-x-auto custom-nav-scrollbar bg-[#09090b] relative">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              ref={isActive ? activeNavRef : undefined}
              onClick={() => {
                onPageChange(item.id);
                onSubFilterChange('all');
              }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {/* Smooth Animated Highlight Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeNavTabHighlight"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-zinc-800/90 border border-amber-500/40 rounded-lg shadow-sm shadow-amber-500/10"
                />
              )}

              <span className="relative z-10 flex items-center gap-1.5">
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-zinc-500'
                  }`}
                />
                <span className={isActive ? 'text-white font-bold' : 'text-zinc-400'}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavDot"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] ml-0.5 shrink-0"
                  />
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ROW 3: Sub-Buttons Bar (Contextual dynamic filters with smooth sliding highlight) */}
      {subNavItems.length > 0 && (
        <div className="px-3 sm:px-6 pt-1.5 pb-2 bg-[#121215] border-t border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto custom-nav-scrollbar text-xs relative">
          <span className="text-[11px] font-medium text-zinc-500 shrink-0 uppercase tracking-wider pl-1 mr-1">
            Filtro:
          </span>
          {subNavItems.map((sub) => {
            const isSubActive = subFilter === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSubFilterChange(sub.id)}
                className={`relative px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  isSubActive
                    ? 'text-amber-300 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                }`}
              >
                {/* Smooth Animated Filter Highlight Pill */}
                {isSubActive && (
                  <motion.div
                    layoutId="activeSubFilterHighlight"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 rounded-full shadow-sm"
                  />
                )}
                <span className="relative z-10">{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
