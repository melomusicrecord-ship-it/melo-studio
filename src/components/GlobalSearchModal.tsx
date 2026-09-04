import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  FolderKanban,
  Users,
  Mic,
  Plug,
  GitMerge,
  Music2,
  BookOpen,
  ArrowRight,
  FlaskConical,
  Library,
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
  LibraryItem,
} from '../types';
import { AppPage } from './TopNavigation';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: AppPage, id?: string) => void;
  projects: Project[];
  artists: Artist[];
  sessions: Session[];
  plugins: PluginItem[];
  chains: ProcessingChain[];
  instrumentals: Instrumental[];
  journal: JournalEntry[];
  experiences?: Experience[];
  library?: LibraryItem[];
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigate,
  projects,
  artists,
  sessions,
  plugins,
  chains,
  instrumentals,
  journal,
  experiences = [],
  library = [],
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const found: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      page: AppPage;
      icon: any;
    }> = [];

    // Projects
    projects.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.artist.toLowerCase().includes(q) ||
        p.style.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
      ) {
        found.push({
          id: p.id,
          title: p.name,
          subtitle: `${p.artist} • ${p.style} (${p.bpm} BPM, ${p.key}) • ${p.status}`,
          category: 'Projetos',
          page: 'projects',
          icon: FolderKanban,
        });
      }
    });

    // Chains
    chains.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.style.toLowerCase().includes(q) ||
        c.target.toLowerCase().includes(q) ||
        c.goal.toLowerCase().includes(q)
      ) {
        found.push({
          id: c.id,
          title: c.name,
          subtitle: `${c.target} • ${c.style} • ${c.level}`,
          category: 'Cadeias de Efeitos',
          page: 'chains',
          icon: GitMerge,
        });
      }
    });

    // Plugins
    plugins.forEach((pl) => {
      if (
        pl.name.toLowerCase().includes(q) ||
        pl.manufacturer.toLowerCase().includes(q) ||
        pl.category.toLowerCase().includes(q) ||
        (pl.notes && pl.notes.toLowerCase().includes(q))
      ) {
        found.push({
          id: pl.id,
          title: pl.name,
          subtitle: `${pl.manufacturer} • ${pl.category} ${pl.owned ? '• [Tenho]' : ''}`,
          category: 'Plugins',
          page: 'plugins',
          icon: Plug,
        });
      }
    });

    // Artists
    artists.forEach((a) => {
      if (
        a.stageName.toLowerCase().includes(q) ||
        (a.realName && a.realName.toLowerCase().includes(q)) ||
        a.style.toLowerCase().includes(q)
      ) {
        found.push({
          id: a.id,
          title: a.stageName,
          subtitle: `${a.style} ${a.realName ? `(${a.realName})` : ''}`,
          category: 'Artistas',
          page: 'artists',
          icon: Users,
        });
      }
    });

    // Instrumentals
    instrumentals.forEach((i) => {
      if (
        i.name.toLowerCase().includes(q) ||
        i.style.toLowerCase().includes(q) ||
        i.mood.toLowerCase().includes(q) ||
        (i.reference && i.reference.toLowerCase().includes(q))
      ) {
        found.push({
          id: i.id,
          title: i.name,
          subtitle: `${i.style} • ${i.bpm} BPM (${i.key}) • ${i.mood}`,
          category: 'Instrumentais',
          page: 'instrumentals',
          icon: Music2,
        });
      }
    });

    // Sessions
    sessions.forEach((s) => {
      if (
        s.artistName.toLowerCase().includes(q) ||
        (s.projectName && s.projectName.toLowerCase().includes(q)) ||
        s.objective.toLowerCase().includes(q)
      ) {
        found.push({
          id: s.id,
          title: `${s.type}: ${s.artistName}`,
          subtitle: `${s.date} às ${s.startTime} • ${s.objective}`,
          category: 'Sessões',
          page: 'sessions',
          icon: Mic,
        });
      }
    });

    // Experiences
    experiences.forEach((exp) => {
      if (
        exp.problem.toLowerCase().includes(q) ||
        exp.solution.toLowerCase().includes(q) ||
        (exp.pluginName && exp.pluginName.toLowerCase().includes(q)) ||
        (exp.projectName && exp.projectName.toLowerCase().includes(q)) ||
        (exp.chainName && exp.chainName.toLowerCase().includes(q))
      ) {
        found.push({
          id: exp.id,
          title: exp.pluginName ? `Teste: ${exp.pluginName}` : `Experiência (${exp.date})`,
          subtitle: `${exp.problem.slice(0, 60)}...`,
          category: 'Experiências',
          page: 'experiences',
          icon: FlaskConical,
        });
      }
    });

    // Library Documents
    library.forEach((item) => {
      if (
        item.title.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        found.push({
          id: item.id,
          title: item.title,
          subtitle: `[${item.type}] ${item.tags.join(', ')}`,
          category: 'Biblioteca',
          page: 'library',
          icon: Library,
        });
      }
    });

    return found.slice(0, 15);
  }, [query, projects, chains, plugins, artists, instrumentals, sessions, experiences, library]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#121215] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-[#16161a]">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar projetos, artistas, chains, plugins, instrumentais..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-500 hover:text-zinc-300 text-xs p-1"
            >
              Limpar
            </button>
          )}
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-zinc-800/40">
          {!query && (
            <div className="py-10 text-center text-zinc-500 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p>Digita o que procuras no estúdio.</p>
              <p className="text-[11px] text-zinc-600 mt-1">Exemplos: "Afrobeat", "Pro-Q", "Jay Santos", "808"</p>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="py-10 text-center text-zinc-400 text-xs">
              <p className="text-zinc-300 font-medium">Nenhum resultado encontrado para "{query}"</p>
              <p className="text-zinc-500 mt-1">Tenta pesquisar por nome do artista, estilo ou plugin.</p>
            </div>
          )}

          {results.map((res) => {
            const Icon = res.icon;
            return (
              <div
                key={`${res.category}-${res.id}`}
                onClick={() => {
                  onNavigate(res.page, res.id);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-750 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/40 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-100 group-hover:text-white truncate">
                        {res.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {res.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{res.subtitle}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 shrink-0 ml-2" />
              </div>
            );
          })}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Pressione ESC para fechar</span>
          <span>{results.length} resultados</span>
        </div>
      </div>
    </div>
  );
}
