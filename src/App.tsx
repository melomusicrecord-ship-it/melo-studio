import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { AppPage, TopNavigation } from './components/TopNavigation';
import { MobileDrawer } from './components/MobileDrawer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { QuickToolsModal } from './components/QuickToolsModal';
import { AudioBypassModal } from './components/AudioBypassModal';
import { OnboardingModal } from './components/OnboardingModal';
import { InstallPCModal } from './components/InstallPCModal';
import { ToastProvider, useToast } from './components/Toast';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ChainsPage } from './pages/ChainsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SessionsPage } from './pages/SessionsPage';
import { PluginsPage } from './pages/PluginsPage';
import { DiagnosisPage } from './pages/DiagnosisPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { InstrumentalsPage } from './pages/InstrumentalsPage';
import { JournalPage } from './pages/JournalPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { SettingsPage } from './pages/SettingsPage';
import { ExperiencesPage } from './pages/ExperiencesPage';
import { LibraryPage } from './pages/LibraryPage';
import { StatsPage } from './pages/StatsPage';
import { ToolsPage } from './pages/ToolsPage';

// Database & Types
import { studioDB } from './services/db';
import {
  StudioSettings,
  Project,
  Artist,
  Session,
  ProcessingChain,
  PluginItem,
  Instrumental,
  JournalEntry,
  Experience,
  LibraryItem,
} from './types';
import {
  INITIAL_CHAINS,
  INITIAL_SETTINGS,
  INITIAL_PROJECTS,
  INITIAL_ARTISTS,
  INITIAL_SESSIONS,
  INITIAL_PLUGINS,
  INITIAL_INSTRUMENTALS,
  INITIAL_JOURNAL,
  INITIAL_EXPERIENCES,
  INITIAL_LIBRARY,
} from './data/initialData';
import { X, Plus, GitMerge } from 'lucide-react';

function StudioApp() {
  const { showToast } = useToast();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [subFilter, setSubFilter] = useState<string>('all');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Modals & Panels State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickToolsOpen, setIsQuickToolsOpen] = useState(false);
  const [isBypassOpen, setIsBypassOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isNewChainModalOpen, setIsNewChainModalOpen] = useState(false);

  // Entities in memory
  const [settings, setSettings] = useState<StudioSettings>(INITIAL_SETTINGS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [artists, setArtists] = useState<Artist[]>(INITIAL_ARTISTS);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [chains, setChains] = useState<ProcessingChain[]>(INITIAL_CHAINS);
  const [plugins, setPlugins] = useState<PluginItem[]>(INITIAL_PLUGINS);
  const [instrumentals, setInstrumentals] = useState<Instrumental[]>(INITIAL_INSTRUMENTALS);
  const [journal, setJournal] = useState<JournalEntry[]>(INITIAL_JOURNAL);
  const [experiences, setExperiences] = useState<Experience[]>(INITIAL_EXPERIENCES);
  const [library, setLibrary] = useState<LibraryItem[]>(INITIAL_LIBRARY);
  const [isLoading, setIsLoading] = useState(true);

  // New Chain Modal Form State
  const [newChainName, setNewChainName] = useState('');
  const [newChainTarget, setNewChainTarget] = useState('Lead Vocal');
  const [newChainStyle, setNewChainStyle] = useState('Afrobeat');
  const [newChainGoal, setNewChainGoal] = useState('');

  // Load all data from IndexedDB
  const reloadAllData = useCallback(async () => {
    try {
      await studioDB.init();
      const [s, p, a, sess, c, pl, inst, j, exp, lib] = await Promise.all([
        studioDB.getSettings(),
        studioDB.getProjects(),
        studioDB.getArtists(),
        studioDB.getSessions(),
        studioDB.getChains(),
        studioDB.getPlugins(),
        studioDB.getInstrumentals(),
        studioDB.getJournal(),
        studioDB.getExperiences(),
        studioDB.getLibrary(),
      ]);

      if (s) setSettings(s);
      if (p && p.length > 0) setProjects(p);
      if (a && a.length > 0) setArtists(a);
      if (sess && sess.length > 0) setSessions(sess);
      if (c && c.length > 0) setChains(c);
      if (pl && pl.length > 0) setPlugins(pl);
      if (inst && inst.length > 0) setInstrumentals(inst);
      if (j && j.length > 0) setJournal(j);
      if (exp && exp.length > 0) setExperiences(exp);
      if (lib && lib.length > 0) setLibrary(lib);

      if (s && !s.onboarded) {
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      console.error('Failed to load studio data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadAllData();
  }, [reloadAllData]);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation Handler
  const handleNavigate = (page: AppPage, id?: string) => {
    setCurrentPage(page);
    setSubFilter('all');
    if (id) {
      setSelectedEntityId(id);
    } else {
      setSelectedEntityId(null);
    }
    // Scroll smoothly to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick Action Handler from Dashboard or elsewhere
  const handleQuickAction = (action: string) => {
    if (action === 'new-project') {
      setCurrentPage('projects');
      setSubFilter('all');
    } else if (action === 'new-session') {
      setCurrentPage('sessions');
      setSubFilter('all');
    } else if (action === 'new-chain') {
      setIsNewChainModalOpen(true);
    } else if (action === 'quick-tools') {
      setIsQuickToolsOpen(true);
    }
  };

  // Handlers for updating DB entities
  const handleSaveProject = async (project: Project) => {
    await studioDB.saveProject(project);
    setProjects(await studioDB.getProjects());
  };

  const handleDeleteProject = async (id: string) => {
    await studioDB.deleteProject(id);
    setProjects(await studioDB.getProjects());
  };

  const handleSaveChain = async (chain: ProcessingChain) => {
    await studioDB.saveChain(chain);
    setChains(await studioDB.getChains());
  };

  const handleDeleteChain = async (id: string) => {
    await studioDB.deleteChain(id);
    setChains(await studioDB.getChains());
  };

  const handleSaveSession = async (session: Session) => {
    await studioDB.saveSession(session);
    setSessions(await studioDB.getSessions());
  };

  const handleDeleteSession = async (id: string) => {
    await studioDB.deleteSession(id);
    setSessions(await studioDB.getSessions());
  };

  const handleSavePlugin = async (plugin: PluginItem) => {
    await studioDB.savePlugin(plugin);
    setPlugins(await studioDB.getPlugins());
  };

  const handleDeletePlugin = async (id: string) => {
    await studioDB.deletePlugin(id);
    setPlugins(await studioDB.getPlugins());
  };

  const handleSaveArtist = async (artist: Artist) => {
    await studioDB.saveArtist(artist);
    setArtists(await studioDB.getArtists());
  };

  const handleDeleteArtist = async (id: string) => {
    await studioDB.deleteArtist(id);
    setArtists(await studioDB.getArtists());
  };

  const handleSaveInstrumental = async (inst: Instrumental) => {
    await studioDB.saveInstrumental(inst);
    setInstrumentals(await studioDB.getInstrumentals());
  };

  const handleDeleteInstrumental = async (id: string) => {
    await studioDB.deleteInstrumental(id);
    setInstrumentals(await studioDB.getInstrumentals());
  };

  const handleSaveJournalEntry = async (entry: JournalEntry) => {
    await studioDB.saveJournalEntry(entry);
    setJournal(await studioDB.getJournal());
  };

  const handleDeleteJournalEntry = async (id: string) => {
    await studioDB.deleteJournalEntry(id);
    setJournal(await studioDB.getJournal());
  };

  const handleSaveExperience = async (exp: Experience) => {
    await studioDB.saveExperience(exp);
    setExperiences(await studioDB.getExperiences());
  };

  const handleDeleteExperience = async (id: string) => {
    await studioDB.deleteExperience(id);
    setExperiences(await studioDB.getExperiences());
  };

  const handleSaveLibraryItem = async (item: LibraryItem) => {
    await studioDB.saveLibraryItem(item);
    setLibrary(await studioDB.getLibrary());
  };

  const handleDeleteLibraryItem = async (id: string) => {
    await studioDB.deleteLibraryItem(id);
    setLibrary(await studioDB.getLibrary());
  };

  const handleSaveSettings = async (newSettings: StudioSettings) => {
    await studioDB.saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Create new custom chain
  const handleCreateCustomChain = async (e: FormEvent) => {
    e.preventDefault();
    if (!newChainName.trim()) {
      showToast('Insira o nome da cadeia de plugins', 'warning');
      return;
    }

    const newChain: ProcessingChain = {
      id: 'chain-' + Date.now(),
      name: newChainName.trim(),
      target: newChainTarget as any,
      style: newChainStyle,
      goal: newChainGoal.trim() || 'Cadeia personalizada para captação e mixagem.',
      level: 'Intermediário',
      versionType: 'Completa',
      version: 'Completa',
      routingType: 'Serial',
      favorite: false,
      isCustom: true,
      updatedAt: new Date().toISOString().split('T')[0],
      steps: [
        {
          id: 'step-1',
          order: 1,
          pluginName: 'EQ Corretivo',
          manufacturer: 'FabFilter',
          category: 'EQ',
          objective: 'Corte de ressonâncias e frequências indesejadas',
          whyIsItHere: 'Limpa a lama antes de enviar o sinal para os compressores.',
          whatToHear: 'Sinal mais transparente e articulado.',
          whenNotToUse: 'Se a captação foi perfeita e cristalina.',
          alternatives: {
            pro: 'Pro-Q 4',
            alt: 'TDR Nova',
            free: 'Tokyo Dawn Nova',
            native: 'Parametric EQ 2',
          },
        },
        {
          id: 'step-2',
          order: 2,
          pluginName: 'Compressor de Picos (FET)',
          manufacturer: 'Universal Audio',
          category: 'Compressor',
          objective: 'Segurar transientes rápidos',
          whyIsItHere: 'Uniformiza a energia das sílabas e golpes fortes.',
          whatToHear: 'Vocal firme na frente sem oscilar volume.',
          whenNotToUse: 'Se a dinâmica precisa soar extremamente crua.',
          alternatives: {
            pro: 'UA 1176LN',
            alt: 'CLA-76',
            free: 'Analog Obsession FETISH',
            native: 'Fruity Limiter (Comp)',
          },
        },
      ],
    };

    await handleSaveChain(newChain);
    setIsNewChainModalOpen(false);
    setNewChainName('');
    setNewChainGoal('');
    setCurrentPage('chains');
    showToast('Nova cadeia criada com sucesso!', 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-bold text-zinc-300">Carregando MELO STUDIO HUB...</h2>
        <p className="text-xs text-zinc-500 mt-1">Preparando o teu espaço de produção musical</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Three-Tier Top Navigation with Buttons and Sub-Buttons */}
      <TopNavigation
        currentPage={currentPage}
        onPageChange={handleNavigate}
        subFilter={subFilter}
        onSubFilterChange={setSubFilter}
        settings={settings}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenQuickTools={() => setIsQuickToolsOpen(true)}
        onOpenBypass={() => setIsBypassOpen(true)}
        onQuickAction={handleQuickAction}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Page Content - Fast responsive container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        {currentPage === 'dashboard' && (
          <DashboardPage
            settings={settings}
            projects={projects}
            artists={artists}
            sessions={sessions}
            chains={chains}
            plugins={plugins}
            instrumentals={instrumentals}
            journal={journal}
            onNavigate={handleNavigate}
            onQuickAction={handleQuickAction}
          />
        )}

        {currentPage === 'chains' && (
          <ChainsPage
            chains={chains}
            plugins={plugins}
            settings={settings}
            subFilter={subFilter}
            onSaveChain={handleSaveChain}
            onDeleteChain={handleDeleteChain}
            onOpenNewChainModal={() => setIsNewChainModalOpen(true)}
          />
        )}

        {currentPage === 'projects' && (
          <ProjectsPage
            projects={projects}
            artists={artists}
            sessions={sessions}
            chains={chains}
            subFilter={subFilter}
            selectedProjectId={selectedEntityId || undefined}
            onSelectProject={setSelectedEntityId}
            onSaveProject={handleSaveProject}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {(currentPage === 'sessions' || currentPage === 'agenda') && (
          <SessionsPage
            sessions={sessions}
            artists={artists}
            projects={projects}
            subFilter={subFilter}
            onSaveSession={handleSaveSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {currentPage === 'plugins' && (
          <PluginsPage
            plugins={plugins}
            subFilter={subFilter}
            onSavePlugin={handleSavePlugin}
            onDeletePlugin={handleDeletePlugin}
          />
        )}

        {currentPage === 'diagnosis' && (
          <DiagnosisPage subFilter={subFilter} />
        )}

        {currentPage === 'tools' && (
          <ToolsPage subFilter={subFilter} />
        )}

        {currentPage === 'artists' && (
          <ArtistsPage
            artists={artists}
            subFilter={subFilter}
            onSaveArtist={handleSaveArtist}
            onDeleteArtist={handleDeleteArtist}
          />
        )}

        {currentPage === 'instrumentals' && (
          <InstrumentalsPage
            instrumentals={instrumentals}
            subFilter={subFilter}
            onSaveInstrumental={handleSaveInstrumental}
            onDeleteInstrumental={handleDeleteInstrumental}
          />
        )}

        {currentPage === 'journal' && (
          <JournalPage
            journal={journal}
            projects={projects}
            subFilter={subFilter}
            onSaveEntry={handleSaveJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
          />
        )}

        {(currentPage === 'knowledge' || currentPage === 'learning') && <KnowledgePage />}

        {currentPage === 'experiences' && (
          <ExperiencesPage
            experiences={experiences}
            projects={projects}
            chains={chains}
            plugins={plugins}
            subFilter={subFilter}
            onSaveExperience={handleSaveExperience}
            onDeleteExperience={handleDeleteExperience}
          />
        )}

        {currentPage === 'library' && (
          <LibraryPage
            library={library}
            subFilter={subFilter}
            onSaveItem={handleSaveLibraryItem}
            onDeleteItem={handleDeleteLibraryItem}
          />
        )}

        {currentPage === 'stats' && (
          <StatsPage
            projects={projects}
            artists={artists}
            sessions={sessions}
            plugins={plugins}
            chains={chains}
            instrumentals={instrumentals}
            journal={journal}
            experiences={experiences}
            settings={settings}
            subFilter={subFilter}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onReloadAllData={reloadAllData}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
          />
        )}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-zinc-800/60 py-4 px-4 text-center text-xs text-zinc-500 bg-[#0c0c0e]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {settings.studioName || 'MELO STUDIO HUB'} • O teu estúdio. As tuas ideias. O teu método.
          </span>
          <span className="text-[11px] text-zinc-600">
            100% Offline-First • Armazenamento Local Seguro
          </span>
        </div>
      </footer>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        currentPage={currentPage}
        onClose={() => setIsMobileDrawerOpen(false)}
        onPageChange={handleNavigate}
        settings={settings}
        onQuickAction={handleQuickAction}
        onOpenQuickTools={() => {
          setIsMobileDrawerOpen(false);
          setIsQuickToolsOpen(true);
        }}
        onOpenBypass={() => {
          setIsMobileDrawerOpen(false);
          setIsBypassOpen(true);
        }}
        onOpenInstallModal={() => {
          setIsMobileDrawerOpen(false);
          setIsInstallModalOpen(true);
        }}
      />

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projects={projects}
        chains={chains}
        plugins={plugins}
        artists={artists}
        sessions={sessions}
        instrumentals={instrumentals}
        journal={journal}
        experiences={experiences}
        library={library}
        onNavigate={handleNavigate}
      />

      {/* Quick Tools Modal (BPM Tapper & Hz Reference) */}
      <QuickToolsModal
        isOpen={isQuickToolsOpen}
        onClose={() => setIsQuickToolsOpen(false)}
      />

      {/* A/B Audio Bypass & Notes Modal */}
      <AudioBypassModal
        isOpen={isBypassOpen}
        onClose={() => setIsBypassOpen(false)}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        currentSettings={settings}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={async (updated) => {
          await handleSaveSettings(updated);
          setIsOnboardingOpen(false);
          showToast('Perfil de estúdio configurado com sucesso!', 'success');
        }}
      />

      {/* PWA PC Installation & Offline Info Modal */}
      <InstallPCModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Modal: New Custom Chain */}
      {isNewChainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-sky-400" />
                <span>Criar Nova Cadeia de Plugins</span>
              </h3>
              <button
                onClick={() => setIsNewChainModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomChain} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Nome da Chain *
                </label>
                <input
                  type="text"
                  required
                  value={newChainName}
                  onChange={(e) => setNewChainName(e.target.value)}
                  placeholder="Ex: Lead Vocal Brilhante - Afrobeat"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Alvo / Instrumento
                  </label>
                  <select
                    value={newChainTarget}
                    onChange={(e) => setNewChainTarget(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Lead Vocal">Lead Vocal</option>
                    <option value="Backing Vocal">Backing Vocal</option>
                    <option value="Adlibs">Adlibs</option>
                    <option value="Rap Vocal">Rap Vocal</option>
                    <option value="Kick">Kick</option>
                    <option value="Snare">Snare</option>
                    <option value="808">808 / Bass</option>
                    <option value="Drum Bus">Drum Bus</option>
                    <option value="Piano">Piano</option>
                    <option value="Guitar">Guitar</option>
                    <option value="Synth">Synth</option>
                    <option value="Mix Bus">Mix Bus</option>
                    <option value="Master">Master</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Estilo Musical
                  </label>
                  <input
                    type="text"
                    value={newChainStyle}
                    onChange={(e) => setNewChainStyle(e.target.value)}
                    placeholder="Afrobeat, Kizomba, Trap..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Objetivo Sonoro
                </label>
                <textarea
                  rows={3}
                  value={newChainGoal}
                  onChange={(e) => setNewChainGoal(e.target.value)}
                  placeholder="Ex: Obter presença nos médios e agudos sem agredir o ouvido, mantendo a dinâmica musical..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewChainModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg"
                >
                  Salvar e Abrir Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StudioApp />
    </ToastProvider>
  );
}
