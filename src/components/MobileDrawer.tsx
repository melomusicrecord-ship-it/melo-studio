import {
  X,
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
  Activity,
  Headphones,
  Monitor,
} from 'lucide-react';
import { AppPage } from './TopNavigation';
import { StudioSettings } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: AppPage;
  onPageChange: (page: AppPage) => void;
  settings: StudioSettings;
  onQuickAction: (action: string) => void;
  onOpenQuickTools: () => void;
  onOpenBypass: () => void;
  onOpenInstallModal?: () => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
  currentPage,
  onPageChange,
  settings,
  onQuickAction,
  onOpenQuickTools,
  onOpenBypass,
  onOpenInstallModal,
}: MobileDrawerProps) {
  if (!isOpen) return null;

  const navigateTo = (page: AppPage) => {
    onPageChange(page);
    onClose();
  };

  const sections = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard' as AppPage, label: 'Dashboard', icon: Sliders },
        { id: 'agenda' as AppPage, label: 'Agenda & Eventos', icon: Calendar },
        { id: 'stats' as AppPage, label: 'Estatísticas', icon: BarChart3 },
      ],
    },
    {
      title: 'Produção Musical',
      items: [
        { id: 'projects' as AppPage, label: 'Projetos de Música', icon: FolderKanban },
        { id: 'artists' as AppPage, label: 'Artistas', icon: Users },
        { id: 'sessions' as AppPage, label: 'Sessões & Checklist', icon: Mic },
        { id: 'instrumentals' as AppPage, label: 'Ideias de Instrumentais', icon: Music2 },
      ],
    },
    {
      title: 'Mixagem & Som',
      items: [
        { id: 'vocal-engine' as AppPage, label: '🎙️ Melo Vocal Engine', icon: Headphones },
        { id: 'chains' as AppPage, label: '🎛️ Guia de Cadeias', icon: GitMerge },
        { id: 'diagnosis' as AppPage, label: 'Diagnóstico ("Tenho um Problema")', icon: Stethoscope },
        { id: 'tools' as AppPage, label: '🧮 Calculadora & Áudio', icon: Calculator },
        { id: 'plugins' as AppPage, label: 'Biblioteca de Plugins', icon: Plug },
      ],
    },
    {
      title: 'Conhecimento & Evolução',
      items: [
        { id: 'learning' as AppPage, label: 'Minha Evolução', icon: GraduationCap },
        { id: 'journal' as AppPage, label: 'Diário do Produtor', icon: BookOpen },
        { id: 'experiences' as AppPage, label: 'Experiências de Estúdio', icon: FlaskConical },
        { id: 'library' as AppPage, label: 'Biblioteca & Referências', icon: Library },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { id: 'settings' as AppPage, label: 'Configurações & Backup', icon: Settings },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Body */}
      <div className="relative w-4/5 max-w-xs bg-[#0f0f12] h-full flex flex-col border-r border-zinc-800 shadow-2xl z-10 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">MELO STUDIO HUB</h2>
              <p className="text-[11px] text-zinc-400">{settings.studioName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Mobile Creation Buttons */}
        <div className="p-3 border-b border-zinc-800/80 grid grid-cols-2 gap-2 bg-zinc-950/40">
          <button
            onClick={() => {
              onClose();
              onQuickAction('new-project');
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onQuickAction('new-session');
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Nova Sessão</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onQuickAction('new-chain');
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-300 text-xs font-semibold"
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Nova Chain</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenQuickTools();
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-medium"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>BPM & Hertz</span>
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 p-3 space-y-4">
          {sections.map((section) => {
            const hasActiveItem = section.items.some((i) => i.id === currentPage);
            return (
              <div
                key={section.title}
                className={hasActiveItem ? 'rounded-xl bg-zinc-900/40 p-1.5 border border-zinc-800/80' : ''}
              >
                <div className="flex items-center justify-between px-2 mb-1.5">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      hasActiveItem ? 'text-amber-400' : 'text-zinc-500'
                    }`}
                  >
                    {section.title}
                  </span>
                  {hasActiveItem && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Módulo Atual
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          active
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-500/10'
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              active ? 'text-amber-400' : 'text-zinc-500'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {active && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                              Ativo
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {onOpenInstallModal && (
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenInstallModal();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold transition-all active:scale-98"
              >
                <Monitor className="w-4 h-4 text-amber-400" />
                <span>Instalar App no PC (100% Offline)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-[#09090b] text-center text-[11px] text-zinc-500">
          "O teu estúdio. As tuas ideias. O teu método."
        </div>
      </div>
    </div>
  );
}
