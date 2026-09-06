import { useState, useMemo, useEffect, type FormEvent, type MouseEvent } from 'react';
import {
  FolderKanban,
  Plus,
  Star,
  Search,
  Calendar,
  Clock,
  Music2,
  Mic,
  Sliders,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowRight,
  Sparkles,
  FileText,
  X,
  Check,
  DollarSign,
  Users,
  Layers,
  AlertCircle,
  ExternalLink,
  Link2,
  UserCheck,
  UserPlus,
  Phone,
  CreditCard,
} from 'lucide-react';
import {
  Project,
  ProjectStatus,
  Artist,
  Session,
  ProcessingChain,
  ProjectBudget,
  PaymentStatus,
  SessionType,
  StudioTransaction,
  FutureEquipment,
} from '../types';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { ArtistBudgetManager } from '../components/budget/ArtistBudgetManager';

interface ProjectsPageProps {
  projects: Project[];
  artists: Artist[];
  sessions: Session[];
  chains: ProcessingChain[];
  subFilter: string;
  selectedProjectId?: string;
  transactions?: StudioTransaction[];
  futureEquipment?: FutureEquipment[];
  onSelectProject: (id: string | null) => void;
  onSaveProject: (project: Project) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onSaveArtist?: (artist: Artist) => Promise<void>;
  onSaveSession?: (session: Session) => Promise<void>;
  onSaveTransaction?: (tx: StudioTransaction) => Promise<void>;
  onDeleteTransaction?: (id: string) => Promise<void>;
  onSaveFutureEquipment?: (eq: FutureEquipment) => Promise<void>;
  onDeleteFutureEquipment?: (id: string) => Promise<void>;
  onBuyEquipment?: (eq: FutureEquipment) => Promise<void>;
  onAllocateToEquipment?: (eqId: string, amountToAdd: number) => Promise<void>;
  onNavigate?: (page: string, subFilter?: string) => void;
}

export function ProjectsPage({
  projects,
  artists,
  sessions,
  chains,
  subFilter,
  selectedProjectId,
  transactions = [],
  futureEquipment = [],
  onSelectProject,
  onSaveProject,
  onDeleteProject,
  onSaveArtist,
  onSaveSession,
  onSaveTransaction,
  onDeleteTransaction,
  onSaveFutureEquipment,
  onDeleteFutureEquipment,
  onBuyEquipment,
  onAllocateToEquipment,
  onNavigate,
}: ProjectsPageProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetTab, setBudgetTab] = useState<'artists' | 'account' | 'equipment'>('artists');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [detailTab, setDetailTab] = useState<
    'overview' | 'budget' | 'sessions' | 'vocal' | 'mix' | 'master' | 'notes'
  >('overview');

  // Modo de visualização: 'list' (Todas as Músicas) ou 'grouped' (Organizado por Artista)
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [selectedArtistFilter, setSelectedArtistFilter] = useState<string>('all');

  // Modo de seleção de artista no formulário de projeto: 'select' (Cadastrado) | 'new' (Novo Artista)
  const [artistSelectionMode, setArtistSelectionMode] = useState<'select' | 'new'>('select');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [newArtistName, setNewArtistName] = useState<string>('');
  const [newArtistStyle, setNewArtistStyle] = useState<string>('Afrobeat');
  const [newArtistPreferredMic, setNewArtistPreferredMic] = useState<string>('Neumann U87');
  const [newArtistVocalTone, setNewArtistVocalTone] = useState<string>('Tenor encorpado');
  const [newArtistPhone, setNewArtistPhone] = useState<string>('');

  // Agendamento rápido de sessão sincronizada com a música
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionStartTime, setSessionStartTime] = useState('14:00');
  const [sessionEndTime, setSessionEndTime] = useState('18:00');
  const [sessionType, setSessionType] = useState<SessionType>('Gravação');
  const [sessionObjective, setSessionObjective] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Form states for create/edit
  const [formName, setFormName] = useState('');
  const [formArtist, setFormArtist] = useState('');
  const [formStyle, setFormStyle] = useState('Afrobeat');
  const [formBpm, setFormBpm] = useState(105);
  const [formKey, setFormKey] = useState('Am');
  const [formStatus, setFormStatus] = useState<ProjectStatus>('Produção');
  const [formDeadline, setFormDeadline] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formProgress, setFormProgress] = useState(25);

  // Budget form states
  const [formBudgetTotal, setFormBudgetTotal] = useState<number>(250);
  const [formBudgetPaid, setFormBudgetPaid] = useState<number>(125);
  const [formBudgetCurrency, setFormBudgetCurrency] = useState<string>('€');
  const [formMusicDelivered, setFormMusicDelivered] = useState<boolean>(false);
  const [formPaymentMethod, setFormPaymentMethod] = useState<string>('MB Way');

  // React to external navigation via subFilter (e.g. from Dashboard or Quick Actions)
  useEffect(() => {
    if (subFilter === 'budget') {
      setBudgetTab('artists');
      setIsBudgetModalOpen(true);
    } else if (subFilter === 'account') {
      setBudgetTab('account');
      setIsBudgetModalOpen(true);
    } else if (subFilter === 'equipment') {
      setBudgetTab('equipment');
      setIsBudgetModalOpen(true);
    }
  }, [subFilter]);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Subfilter
      if (subFilter !== 'all') {
        if (subFilter === 'favorites') {
          if (!p.favorite) return false;
        } else if (p.status !== subFilter) {
          return false;
        }
      }

      // Filtro de artista específico selecionado no dropdown
      if (selectedArtistFilter !== 'all') {
        const matchesArtist =
          (p.artistId && p.artistId === selectedArtistFilter) ||
          p.artist.toLowerCase() === selectedArtistFilter.toLowerCase();
        if (!matchesArtist) return false;
      }

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.artist.toLowerCase().includes(q) ||
          p.style.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [projects, subFilter, selectedArtistFilter, searchTerm]);

  // Agrupamento por Artista para visualização unificada (evitar criar múltiplos projetos repetidos)
  const groupedArtistsData = useMemo(() => {
    const map = new Map<
      string,
      {
        artistKey: string;
        artistName: string;
        artistObj?: Artist;
        projects: Project[];
        totalBudget: number;
        totalPaid: number;
        deliveredCount: number;
      }
    >();

    filteredProjects.forEach((p) => {
      const aName = p.artist.trim() || 'Artista';
      const key = (p.artistId || aName).toLowerCase();

      if (!map.has(key)) {
        const artObj = artists.find(
          (a) => (p.artistId && a.id === p.artistId) || a.stageName.toLowerCase() === aName.toLowerCase()
        );
        map.set(key, {
          artistKey: key,
          artistName: artObj?.stageName || aName,
          artistObj: artObj,
          projects: [],
          totalBudget: 0,
          totalPaid: 0,
          deliveredCount: 0,
        });
      }

      const item = map.get(key)!;
      item.projects.push(p);
      const b = p.budget;
      const tot = b?.totalAmount ?? 0;
      const pd = b?.paidAmount ?? (b?.paymentStatus === 'Completo' ? tot : b?.paymentStatus === 'Metade' ? tot / 2 : 0);
      item.totalBudget += tot;
      item.totalPaid += pd;
      if (b?.musicDelivered) {
        item.deliveredCount++;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.projects.length - a.projects.length);
  }, [filteredProjects, artists]);

  // Artista atualmente selecionado no modal
  const currentModalArtistName = useMemo(() => {
    if (artistSelectionMode === 'new') return newArtistName.trim();
    return formArtist.trim();
  }, [artistSelectionMode, newArtistName, formArtist]);

  // Projetos existentes do artista no modal (para detecção em tempo real e prevenção de duplicatas)
  const modalArtistExistingProjects = useMemo(() => {
    if (!currentModalArtistName) return [];
    const nameLower = currentModalArtistName.toLowerCase();
    return projects.filter((p) => {
      if (selectedArtistId && p.artistId === selectedArtistId) return true;
      return p.artist.trim().toLowerCase() === nameLower;
    });
  }, [projects, selectedArtistId, currentModalArtistName]);

  const modalArtistExistingSessions = useMemo(() => {
    if (!currentModalArtistName) return [];
    const nameLower = currentModalArtistName.toLowerCase();
    return sessions.filter((s) => {
      if (selectedArtistId && s.artistId === selectedArtistId) return true;
      return s.artistName.trim().toLowerCase() === nameLower;
    });
  }, [sessions, selectedArtistId, currentModalArtistName]);

  const isModalArtistRecurring = modalArtistExistingProjects.length > 0 || modalArtistExistingSessions.length > 0;
  const isModalArtistRegistered = artists.some(
    (a) =>
      (selectedArtistId && a.id === selectedArtistId) ||
      a.stageName.trim().toLowerCase() === currentModalArtistName.toLowerCase()
  );

  const openCreateModal = (preselectedArtist?: Artist | string) => {
    setEditingProject(null);
    setFormName('');

    if (preselectedArtist) {
      if (typeof preselectedArtist === 'string') {
        const found = artists.find((a) => a.stageName.toLowerCase() === preselectedArtist.toLowerCase());
        setFormArtist(preselectedArtist);
        setSelectedArtistId(found?.id || '');
        setFormStyle(found?.style || 'Afrobeat');
      } else {
        setFormArtist(preselectedArtist.stageName);
        setSelectedArtistId(preselectedArtist.id);
        setFormStyle(preselectedArtist.style || 'Afrobeat');
      }
      setArtistSelectionMode('select');
    } else if (artists.length > 0) {
      setFormArtist(artists[0].stageName);
      setSelectedArtistId(artists[0].id);
      setFormStyle(artists[0].style || 'Afrobeat');
      setArtistSelectionMode('select');
    } else {
      setFormArtist('');
      setSelectedArtistId('');
      setFormStyle('Afrobeat');
      setArtistSelectionMode('new');
    }

    setNewArtistName('');
    setNewArtistStyle('Afrobeat');
    setNewArtistPreferredMic('Neumann U87');
    setNewArtistVocalTone('Tenor encorpado');
    setNewArtistPhone('');

    setFormBpm(105);
    setFormKey('Am');
    setFormStatus('Produção');
    setFormDeadline('');
    setFormNotes('');
    setFormProgress(20);
    setFormBudgetTotal(250);
    setFormBudgetPaid(125);
    setFormBudgetCurrency('€');
    setFormMusicDelivered(false);
    setFormPaymentMethod('MB Way');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setFormName(p.name);
    setFormArtist(p.artist);
    setSelectedArtistId(p.artistId || '');
    setArtistSelectionMode('select');
    setFormStyle(p.style);
    setFormBpm(p.bpm);
    setFormKey(p.key);
    setFormStatus(p.status);
    setFormDeadline(p.deadline || '');
    setFormNotes(p.notes || '');
    setFormProgress(p.progress || 0);

    const b = p.budget;
    const total = b?.totalAmount ?? 200;
    const paid = b?.paidAmount ?? (b?.paymentStatus === 'Completo' ? total : b?.paymentStatus === 'Metade' ? total / 2 : 0);
    setFormBudgetTotal(total);
    setFormBudgetPaid(paid);
    setFormBudgetCurrency(b?.currency || '€');
    setFormMusicDelivered(Boolean(b?.musicDelivered));
    setFormPaymentMethod(b?.paymentMethod || 'MB Way');
    setIsModalOpen(true);
  };

  const handleArtistSelectChange = (artId: string) => {
    if (artId === '__NEW__') {
      setArtistSelectionMode('new');
      setSelectedArtistId('');
      setFormArtist('');
      return;
    }
    const found = artists.find((a) => a.id === artId);
    if (found) {
      setSelectedArtistId(found.id);
      setFormArtist(found.stageName);
      if (found.style) setFormStyle(found.style);
    }
  };

  const handleSaveForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Insira o nome da música / projeto', 'warning');
      return;
    }

    let finalArtistName = '';
    let finalArtistId: string | undefined = selectedArtistId;

    if (artistSelectionMode === 'new') {
      if (!newArtistName.trim()) {
        showToast('Insira o nome artístico do novo artista', 'warning');
        return;
      }
      finalArtistName = newArtistName.trim();
      const generatedArtistId = 'art-' + Date.now();
      finalArtistId = generatedArtistId;

      if (onSaveArtist) {
        const newArt: Artist = {
          id: generatedArtistId,
          stageName: finalArtistName,
          style: newArtistStyle || formStyle,
          mainStyles: [newArtistStyle || formStyle],
          preferredMic: newArtistPreferredMic || 'Neumann U87',
          vocalTone: newArtistVocalTone || 'Geral',
          phone: newArtistPhone || undefined,
          notes: `Cadastrado durante criação da música "${formName.trim()}".`,
          favorite: false,
        };
        await onSaveArtist(newArt);
      }
    } else {
      finalArtistName = formArtist.trim() || 'Artista';
      let foundArtist = artists.find(
        (a) => (selectedArtistId && a.id === selectedArtistId) || a.stageName.trim().toLowerCase() === finalArtistName.toLowerCase()
      );

      if (!foundArtist && onSaveArtist) {
        const autoArt: Artist = {
          id: 'art-' + Date.now(),
          stageName: finalArtistName,
          style: formStyle,
          mainStyles: [formStyle],
          notes: `Criado automaticamente no projeto "${formName.trim()}".`,
          favorite: false,
        };
        await onSaveArtist(autoArt);
        foundArtist = autoArt;
        finalArtistId = autoArt.id;
      } else if (foundArtist) {
        finalArtistId = foundArtist.id;
      }
    }

    const total = Math.max(0, Number(formBudgetTotal) || 0);
    const paid = Math.max(0, Number(formBudgetPaid) || 0);
    const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

    let pStatus: PaymentStatus = 'Pendente';
    if (percent >= 100) pStatus = 'Completo';
    else if (percent >= 45 && percent <= 55) pStatus = 'Metade';
    else if (percent > 0) pStatus = 'Parcial';

    const projectBudget: ProjectBudget = {
      totalAmount: total,
      paidAmount: paid,
      percentagePaid: percent,
      paymentStatus: pStatus,
      currency: formBudgetCurrency,
      musicDelivered: formMusicDelivered,
      deliveryDate: formMusicDelivered
        ? editingProject?.budget?.deliveryDate || new Date().toISOString().split('T')[0]
        : undefined,
      deliveryStatusNotes: formMusicDelivered
        ? 'Música entregue com sucesso ao artista.'
        : 'Produção em andamento / entrega pendente.',
      paymentDate: paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
      paymentMethod: formPaymentMethod,
      notes: editingProject?.budget?.notes,
    };

    const projectData: Project = {
      id: editingProject ? editingProject.id : 'proj-' + Date.now(),
      name: formName.trim(),
      artist: finalArtistName,
      artistId: finalArtistId,
      style: formStyle,
      bpm: Number(formBpm) || 120,
      key: formKey.trim() || 'C',
      status: formStatus,
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString().split('T')[0],
      deadline: formDeadline || undefined,
      notes: formNotes,
      progress: formProgress,
      favorite: editingProject ? editingProject.favorite : false,
      budget: projectBudget,
      chainIds: editingProject?.chainIds,
      projectChains: editingProject?.projectChains,
      vocalNotes: editingProject?.vocalNotes,
    };

    await onSaveProject(projectData);
    setIsModalOpen(false);
    showToast(editingProject ? 'Projeto atualizado!' : 'Novo projeto criado com sucesso!', 'success');
  };

  // Agendamento de sessão direto da música ativa
  const handleScheduleSessionForProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeProject || !onSaveSession) return;

    const matchedArtist = artists.find(
      (a) =>
        (activeProject.artistId && a.id === activeProject.artistId) ||
        a.stageName.toLowerCase() === activeProject.artist.toLowerCase()
    );

    const newSess: Session = {
      id: 'sess-' + Date.now(),
      projectId: activeProject.id,
      artistId: activeProject.artistId || matchedArtist?.id,
      artistName: activeProject.artist,
      projectName: activeProject.name,
      date: sessionDate,
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      type: sessionType,
      status: 'Confirmada',
      objective:
        sessionObjective.trim() ||
        `Gravação de Vocais de "${activeProject.name}" (Tom: ${activeProject.key}, ${activeProject.bpm} BPM)`,
      notes:
        sessionNotes.trim() ||
        `Tom: ${activeProject.key} | BPM: ${activeProject.bpm} | Mic: ${matchedArtist?.preferredMic || 'Neumann U87'} | Estilo: ${activeProject.style}`,
      checklist: {
        'Projeto preparado': true,
        'Microfone preparado': true,
      },
    };

    await onSaveSession(newSess);
    setIsScheduleModalOpen(false);
    showToast(`Sessão de gravação agendada para "${activeProject.name}"!`, 'success');
  };

  const handleToggleFavorite = async (p: Project, e: MouseEvent) => {
    e.stopPropagation();
    const updated = { ...p, favorite: !p.favorite };
    await onSaveProject(updated);
    showToast(updated.favorite ? 'Projeto favoritado ⭐' : 'Removido dos favoritos', 'info');
  };

  const handleDelete = (id: string, name: string, e: MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ id, name });
  };

  // Se o subfiltro for 'budget', exibe diretamente o ArtistBudgetManager
  if (subFilter === 'budget') {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <ArtistBudgetManager
          projects={projects}
          artists={artists}
          onSaveProject={onSaveProject}
          onNavigateToProject={(id) => {
            onSelectProject(id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, View Mode, Artist Filter and Add Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#121215] p-3 rounded-2xl border border-zinc-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nome, artista ou estilo..."
              className="w-full bg-zinc-900/90 border border-zinc-750 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Filtro Dropdown por Artista */}
          <div className="relative min-w-[160px]">
            <select
              value={selectedArtistFilter}
              onChange={(e) => setSelectedArtistFilter(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="all">👥 Todos os Artistas ({artists.length})</option>
              {artists.map((a) => {
                const count = projects.filter(
                  (p) => (p.artistId && p.artistId === a.id) || p.artist.toLowerCase() === a.stageName.toLowerCase()
                ).length;
                return (
                  <option key={a.id} value={a.id}>
                    {a.stageName} ({count} {count === 1 ? 'música' : 'músicas'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Alternador de Visualização: Músicas vs Agrupado por Artista */}
          <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Exibir todas as músicas individualmente"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Músicas ({filteredProjects.length})</span>
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grouped'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Organizar todas as músicas agrupadas pelo mesmo artista para não duplicar projetos"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Por Artista ({groupedArtistsData.length})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* BOTÃO CONTA DO ESTÚDIO & GASTOS */}
          <button
            onClick={() => {
              setBudgetTab('account');
              setIsBudgetModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
            title="Consultar saldo na conta, entradas, gastos e compras de equipamentos"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Conta & Gastos</span>
            <span className="md:hidden">Conta</span>
          </button>

          {/* BOTÃO DE ORÇAMENTO DOS ARTISTAS */}
          <button
            onClick={() => {
              setBudgetTab('artists');
              setIsBudgetModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-700/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/45 text-amber-300 font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all shrink-0 group"
            title="Ver orçamento de todos os artistas com projetos no estúdio"
          >
            <DollarSign className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Orçamento dos Artistas</span>
            <span className="sm:hidden">Orçamentos</span>
          </button>

          <button
            onClick={() => openCreateModal()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Projects List & Project Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Projects Cards List OR Grouped View */}
        <div className={`${activeProject ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-medium">
            <span>
              {viewMode === 'list'
                ? `${filteredProjects.length} músicas encontradas`
                : `${groupedArtistsData.length} artistas com projetos`}
            </span>
            {activeProject && (
              <button
                onClick={() => onSelectProject(null)}
                className="text-amber-400 hover:underline"
              >
                Ver em grade ampla
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {/* MODO AGRUPADO POR ARTISTA: Evita duplicatas e mantém todas as músicas de cada artista unificadas */}
            {viewMode === 'grouped' && (
              <div className="space-y-4">
                {groupedArtistsData.map((group) => {
                  const pct =
                    group.totalBudget > 0 ? Math.min(100, Math.round((group.totalPaid / group.totalBudget) * 100)) : 0;
                  const hasCurrentActive = group.projects.some((p) => p.id === activeProject?.id);

                  return (
                    <div
                      key={group.artistKey}
                      className={`p-4 rounded-2xl border transition-all ${
                        hasCurrentActive
                          ? 'bg-zinc-900/90 border-amber-500/50 shadow-xl'
                          : 'bg-[#121215] border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      {/* Cabeçalho do Artista */}
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                            {group.artistName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-sm">
                                {group.artistName}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 text-[10px] font-mono font-bold">
                                {group.projects.length} {group.projects.length === 1 ? 'Música' : 'Músicas'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                              <span>{group.artistObj?.style || 'Vários Estilos'}</span>
                              <span>•</span>
                              <span className="text-emerald-400">
                                Mic: {group.artistObj?.preferredMic || 'Neumann U87'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => openCreateModal(group.artistObj || group.artistName)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-300 text-xs font-semibold flex items-center gap-1 border border-zinc-700 transition-all"
                          title={`Criar nova música para ${group.artistName} sem duplicar o artista`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Música</span>
                        </button>
                      </div>

                      {/* Resumo Financeiro & Entregas do Artista */}
                      <div className="grid grid-cols-2 gap-2 my-2.5 p-2 rounded-xl bg-zinc-950/60 border border-zinc-850 text-[11px]">
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-mono">Total Pago</span>
                          <strong className="text-emerald-300">
                            {group.totalPaid}€ / {group.totalBudget}€ ({pct}%)
                          </strong>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-mono">Entregas</span>
                          <strong className={group.deliveredCount === group.projects.length && group.projects.length > 0 ? 'text-emerald-400' : 'text-amber-400'}>
                            {group.deliveredCount} de {group.projects.length} entregues
                          </strong>
                        </div>
                      </div>

                      {/* Músicas deste Artista */}
                      <div className="space-y-2 mt-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Músicas Registradas no Estúdio:
                        </span>
                        {group.projects.map((proj) => {
                          const isProjSelected = proj.id === activeProject?.id;
                          const isDelivered = proj.budget?.musicDelivered;

                          return (
                            <div
                              key={proj.id}
                              onClick={() => onSelectProject(proj.id)}
                              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                isProjSelected
                                  ? 'bg-amber-500/15 border-amber-500 text-white'
                                  : 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-sm shrink-0">🎵</span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-zinc-100 truncate block">
                                      {proj.name}
                                    </span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                        proj.status === 'Finalizado'
                                          ? 'bg-emerald-500/20 text-emerald-300'
                                          : 'bg-amber-500/20 text-amber-300'
                                      }`}
                                    >
                                      {proj.status}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-zinc-400 block truncate">
                                    Tom: {proj.key} • {proj.bpm} BPM • {proj.style}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isDelivered ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                    Entregue ✅
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                    Produção ⏳
                                  </span>
                                )}
                                <span className="text-xs text-amber-400">→</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {groupedArtistsData.length === 0 && (
                  <div className="py-12 text-center text-zinc-500 text-xs">
                    <Users className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p>Nenhum artista com projetos encontrado.</p>
                  </div>
                )}
              </div>
            )}

            {/* MODO LISTA DE TODAS AS MÚSICAS */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {filteredProjects.map((p) => {
                  const isSelected = p.id === activeProject?.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProject(p.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-zinc-850 border-amber-500/70 shadow-lg'
                          : 'bg-[#121215] border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              p.status === 'Mixagem'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : p.status === 'Gravação'
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                : p.status === 'Finalizado'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            }`}
                          >
                            {p.status}
                          </span>
                          <span className="text-xs text-zinc-400 font-medium">
                            {p.style}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleToggleFavorite(p, e)}
                            className="text-zinc-500 hover:text-amber-400 p-1"
                            title="Favoritar"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                p.favorite ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(p);
                            }}
                            className="text-zinc-500 hover:text-zinc-200 p-1"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-sm sm:text-base mb-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mb-3 font-medium">
                        Artista: <span className="text-zinc-200">{p.artist}</span> • {p.bpm} BPM ({p.key})
                      </p>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span>Progresso da Produção</span>
                          <span>{p.progress || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${p.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Budget & Music Delivery Pill */}
                      {(() => {
                        const b = p.budget;
                        const total = b?.totalAmount ?? 200;
                        const paid = b?.paidAmount ?? (b?.paymentStatus === 'Completo' ? total : b?.paymentStatus === 'Metade' ? total / 2 : 0);
                        const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
                        const isDelivered = Boolean(b?.musicDelivered);

                        return (
                          <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{pct}% Pago ({paid}€ / {total}€)</span>
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                isDelivered
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              {isDelivered ? 'Música Entregue ✅' : 'Música Pendente ⏳'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <div className="py-12 text-center text-zinc-500 text-xs col-span-full">
                    <FolderKanban className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p>Nenhum projeto encontrado nesta categoria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Project Full Detailed Inspection View */}
        {activeProject && (
          <div className="lg:col-span-7 space-y-4 animate-in fade-in duration-150">
            <div className="p-5 rounded-2xl bg-[#121215] border border-zinc-800/90 shadow-2xl space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-400">
                      {activeProject.artist}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-zinc-400">
                      Criado em {activeProject.createdAt}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {activeProject.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(activeProject)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(activeProject.id, activeProject.name, e)}
                    className="p-1.5 rounded-lg bg-zinc-900 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Andamento (BPM)</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{activeProject.bpm} BPM</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Tom / Escala</span>
                  <span className="font-mono font-bold text-sky-300 text-sm">{activeProject.key}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Estilo Principal</span>
                  <span className="font-semibold text-zinc-200 text-sm">{activeProject.style}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Status Atual</span>
                  <span className="font-semibold text-emerald-400 text-sm">{activeProject.status}</span>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="flex border-b border-zinc-800 gap-1 overflow-x-auto text-xs pb-1">
                {[
                  { id: 'overview', label: 'Visão Geral' },
                  { id: 'budget', label: '💰 Orçamento & Entrega' },
                  { id: 'sessions', label: 'Sessões' },
                  { id: 'vocal', label: 'Vocal & Gravação' },
                  { id: 'mix', label: 'Mix & Master' },
                  { id: 'notes', label: 'Anotações' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      detailTab === t.id
                        ? 'bg-zinc-800 text-amber-300 border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Detail Content */}
              <div className="min-h-[160px] text-xs">
                {detailTab === 'overview' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
                      <span className="text-zinc-400 block font-semibold mb-1">Notas do Projeto:</span>
                      <p className="text-zinc-200 leading-relaxed whitespace-pre-line">
                        {activeProject.notes || 'Nenhuma anotação registrada ainda para este projeto.'}
                      </p>
                    </div>

                    {activeProject.deadline && (
                      <div className="flex items-center gap-2 text-zinc-400 text-xs">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Prazo limite de entrega: <strong className="text-zinc-200">{activeProject.deadline}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {detailTab === 'budget' && (() => {
                  const b = activeProject.budget;
                  const total = b?.totalAmount ?? 200;
                  const paid = b?.paidAmount ?? (b?.paymentStatus === 'Completo' ? total : b?.paymentStatus === 'Metade' ? total / 2 : 0);
                  const balance = Math.max(0, total - paid);
                  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
                  const isDelivered = Boolean(b?.musicDelivered);

                  const handleUpdateBudgetDirect = async (updates: Partial<ProjectBudget>) => {
                    const newBudget: ProjectBudget = {
                      totalAmount: total,
                      paidAmount: paid,
                      percentagePaid: pct,
                      paymentStatus: b?.paymentStatus || (pct >= 100 ? 'Completo' : pct >= 50 ? 'Metade' : 'Pendente'),
                      currency: b?.currency || '€',
                      musicDelivered: isDelivered,
                      ...updates,
                    };
                    const updated: Project = { ...activeProject, budget: newBudget };
                    await onSaveProject(updated);
                    showToast('Orçamento e entrega atualizados!', 'success');
                  };

                  return (
                    <div className="space-y-4">
                      {/* Metric cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">Orçamento Total</span>
                          <span className="text-base font-black text-white font-mono">{total} {b?.currency || '€'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">Total Já Pago</span>
                          <span className="text-base font-black text-emerald-400 font-mono">{paid} {b?.currency || '€'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">Saldo Restante</span>
                          <span className="text-base font-black text-rose-400 font-mono">{balance} {b?.currency || '€'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">Música Já Entregue?</span>
                          <span className={`text-xs font-bold block mt-0.5 ${isDelivered ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isDelivered ? '✅ Sim, Entregue' : '⏳ Não, Pendente'}
                          </span>
                        </div>
                      </div>

                      {/* Payment progress bar */}
                      <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-300 font-bold">Estado do Pagamento do Artista</span>
                          <span className="font-mono font-bold text-amber-400">
                            {pct}% ({b?.paymentStatus || (pct >= 100 ? 'Completo' : pct >= 50 ? 'Metade' : 'Pendente')})
                          </span>
                        </div>
                        <div className="w-full bg-zinc-850 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                          <span>Método: {b?.paymentMethod || 'MB Way'}</span>
                          {b?.deliveryDate && (
                            <span>Entregue em: {b.deliveryDate}</span>
                          )}
                        </div>
                      </div>

                      {/* Quick action buttons for this project */}
                      <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-850 space-y-2.5">
                        <span className="text-zinc-400 text-xs font-bold block">Ações Rápidas:</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUpdateBudgetDirect({
                              paidAmount: total,
                              percentagePaid: 100,
                              paymentStatus: 'Completo',
                              paymentDate: new Date().toISOString().split('T')[0],
                            })}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Pagar 100% (Completo)</span>
                          </button>

                          <button
                            onClick={() => handleUpdateBudgetDirect({
                              paidAmount: Math.round(total / 2),
                              percentagePaid: 50,
                              paymentStatus: 'Metade',
                              paymentDate: new Date().toISOString().split('T')[0],
                            })}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <span>Pagar 50% (Metade)</span>
                          </button>

                          <button
                            onClick={() => handleUpdateBudgetDirect({
                              musicDelivered: !isDelivered,
                              deliveryDate: !isDelivered ? new Date().toISOString().split('T')[0] : undefined,
                            })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                              isDelivered
                                ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            }`}
                          >
                            <span>{isDelivered ? 'Mudar para Pendente ⏳' : 'Marcar Música Entregue ✅'}</span>
                          </button>

                          <button
                            onClick={() => setIsBudgetModalOpen(true)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-amber-300 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all ml-auto"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                            <span>Ver Todos os Orçamentos →</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {detailTab === 'sessions' && (() => {
                  const matchedArtist = artists.find(
                    (a) =>
                      (activeProject.artistId && a.id === activeProject.artistId) ||
                      a.stageName.toLowerCase() === activeProject.artist.toLowerCase()
                  );
                  const projectSessions = sessions.filter(
                    (s) =>
                      s.projectId === activeProject.id ||
                      (s.artistName && s.artistName.toLowerCase() === activeProject.artist.toLowerCase() && s.projectName?.toLowerCase() === activeProject.name.toLowerCase())
                  );

                  return (
                    <div className="space-y-4">
                      {/* PAINEL DE DADOS INTERLIGADOS: Música <-> Sessões */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-950 to-zinc-900 border border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🔗</span>
                            <div>
                              <span className="font-bold text-amber-300 text-xs block">
                                Informações Musicais Interligadas à Sessão de Gravação
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                Estes parâmetros são injetados automaticamente no agendamento e nas mesas de captação
                              </span>
                            </div>
                          </div>
                          {onSaveSession && (
                            <button
                              onClick={() => {
                                setSessionObjective(`Gravação de "${activeProject.name}" (Tom: ${activeProject.key}, ${activeProject.bpm} BPM)`);
                                setSessionNotes(`Tom: ${activeProject.key} | BPM: ${activeProject.bpm} | Mic: ${matchedArtist?.preferredMic || 'Neumann U87'}`);
                                setIsScheduleModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Agendar Sessão</span>
                            </button>
                          )}
                        </div>

                        {/* Grade de Parâmetros Técnicos Sincronizados */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800">
                            <span className="text-[9px] uppercase font-mono text-zinc-500 block">Tom / Key</span>
                            <span className="font-bold text-amber-300 text-xs">{activeProject.key || 'C'}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800">
                            <span className="text-[9px] uppercase font-mono text-zinc-500 block">BPM / Metrônomo</span>
                            <span className="font-bold text-emerald-300 text-xs">{activeProject.bpm} BPM</span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800">
                            <span className="text-[9px] uppercase font-mono text-zinc-500 block">Microfone do Artista</span>
                            <span className="font-bold text-zinc-200 text-xs truncate block">
                              {matchedArtist?.preferredMic || 'Neumann U87'}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800">
                            <span className="text-[9px] uppercase font-mono text-zinc-500 block">Cadeia Vocal</span>
                            <span className="font-bold text-sky-300 text-xs truncate block">
                              {activeProject.projectChains?.leadVocal || 'Afrobeat Clean'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lista de Sessões da Música */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase px-1">
                          <span>Sessões Vinculadas ({projectSessions.length})</span>
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate('sessions')}
                              className="text-amber-400 hover:underline capitalize text-xs font-normal"
                            >
                              Ver Agenda Completa →
                            </button>
                          )}
                        </div>

                        {projectSessions.map((s) => (
                          <div
                            key={s.id}
                            className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">{s.type}: {s.objective}</span>
                                <span
                                  className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                                    s.status === 'Confirmada'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : s.status === 'Em andamento'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                  }`}
                                >
                                  {s.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                                <span>📅 {s.date}</span>
                                <span>•</span>
                                <span>⏰ {s.startTime} às {s.endTime}</span>
                                <span>•</span>
                                <span className="text-zinc-300">🚪 Estúdio Principal</span>
                              </div>
                              {s.notes && (
                                <p className="text-[10px] text-zinc-400 italic bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-850">
                                  {s.notes}
                                </p>
                              )}
                            </div>

                            {onNavigate && (
                              <button
                                onClick={() => onNavigate('sessions')}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium self-start sm:self-auto shrink-0 border border-zinc-700 transition-all flex items-center gap-1"
                              >
                                <span>Abrir na Agenda</span>
                                <ArrowRight className="w-3 h-3 text-amber-400" />
                              </button>
                            )}
                          </div>
                        ))}

                        {projectSessions.length === 0 && (
                          <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl space-y-2">
                            <Clock className="w-6 h-6 mx-auto text-zinc-600" />
                            <p className="text-xs text-zinc-400">Nenhuma sessão agendada para esta música ainda.</p>
                            {onSaveSession && (
                              <button
                                onClick={() => {
                                  setSessionObjective(`Gravação de "${activeProject.name}" (Tom: ${activeProject.key}, ${activeProject.bpm} BPM)`);
                                  setSessionNotes(`Tom: ${activeProject.key} | BPM: ${activeProject.bpm} | Mic: ${matchedArtist?.preferredMic || 'Neumann U87'}`);
                                  setIsScheduleModalOpen(true);
                                }}
                                className="text-xs text-amber-400 font-bold hover:underline"
                              >
                                + Agendar Primeira Sessão com os Parâmetros da Música
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {detailTab === 'vocal' && (
                  <div className="space-y-3">
                    {/* Vocal Engine Quick Launch */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#141418] to-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg">
                          🎙️
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block">
                            Melo Vocal Engine
                          </span>
                          <span className="font-bold text-white text-xs">
                            Tratamento & Cadeia Vocal de {activeProject.name}
                          </span>
                        </div>
                      </div>
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('vocal-engine')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                        >
                          <span>Abrir Vocal Engine</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Assigned Project Chains */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-850 space-y-2.5">
                      <span className="font-bold text-zinc-200 block text-xs">
                        Cadeias de Processamento do Projeto:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-mono">Lead Vocal</span>
                            <span className="font-semibold text-zinc-200">
                              {activeProject.projectChains?.leadVocal || 'Lead Vocal — Afrobeat Clean'}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                            Ativa
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-mono">Backing Vocals</span>
                            <span className="font-semibold text-zinc-200">
                              {activeProject.projectChains?.backingVocal || 'Backing Vocals Estéreo'}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                            Pronto
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-mono">Adlibs & Efeitos</span>
                            <span className="font-semibold text-zinc-200">
                              {activeProject.projectChains?.adlibs || 'Adlibs Espaciais (Ping-Pong & Pitch)'}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/20">
                            FX Bus
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-mono">Vocal Bus (Glue)</span>
                            <span className="font-semibold text-zinc-200">
                              {activeProject.projectChains?.vocalBus || 'Vocal Bus Glue (SSL G-Master + Saturn 2)'}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/20">
                            Glue
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vocal Notes */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-850 space-y-1.5">
                      <span className="font-bold text-zinc-200 block text-xs">
                        Anotações Vocais & Equipamento:
                      </span>
                      <textarea
                        value={activeProject.vocalNotes || ''}
                        onChange={async (e) => {
                          const updated = { ...activeProject, vocalNotes: e.target.value };
                          await onSaveProject(updated);
                        }}
                        placeholder="Ex: Gravado no Shure SM7B + Apollo Twin. Afinação em tom E menor. Cantora prefere pouco reverb na voz principal..."
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
                      />
                      <p className="text-[10px] text-zinc-500">Salvo automaticamente no projeto.</p>
                    </div>
                  </div>
                )}

                {detailTab === 'mix' && (
                  <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-2">
                    <span className="font-bold text-zinc-200 block">Metas de Mixagem & Master:</span>
                    <div className="space-y-1 text-zinc-400">
                      <div>• Headroom pré-master: -4 dB True Peak</div>
                      <div>• Graves (abaixo de 100Hz) consolidados em mono</div>
                      <div>• Loudness comercial alvo: -10 a -9 LUFS integrado</div>
                    </div>
                  </div>
                )}

                {detailTab === 'notes' && (
                  <div className="space-y-2">
                    <textarea
                      value={activeProject.notes || ''}
                      onChange={async (e) => {
                        const updated = { ...activeProject, notes: e.target.value };
                        await onSaveProject(updated);
                      }}
                      placeholder="Escreve notas rápidas de mix ou feedback do artista..."
                      rows={5}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
                    />
                    <p className="text-[10px] text-zinc-500">Salvo automaticamente no armazenamento local.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
              <h3 className="font-bold text-white text-sm">
                {editingProject ? 'Editar Projeto' : 'Criar Novo Projeto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Nome da Música / Projeto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Kizomba da Madrugada"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Passo 1: Seleção de Artista (Prevenção de duplicatas & detecção de artista existente) */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Artista da Produção *</span>
                    </label>

                    {/* Alternador de Modo: Artista Cadastrado vs Novo Artista */}
                    <div className="flex items-center p-0.5 bg-zinc-900 border border-zinc-750 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setArtistSelectionMode('select');
                          if (artists.length > 0 && !selectedArtistId) {
                            setSelectedArtistId(artists[0].id);
                            setFormArtist(artists[0].stageName);
                            setFormStyle(artists[0].style || formStyle);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                          artistSelectionMode === 'select'
                            ? 'bg-amber-500 text-black shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        🎙️ Artista Cadastrado ({artists.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setArtistSelectionMode('new');
                        }}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                          artistSelectionMode === 'new'
                            ? 'bg-amber-500 text-black shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        ✨ Novo Artista
                      </button>
                    </div>
                  </div>

                  {/* MODO 1: SELECIONAR ARTISTA EXISTENTE */}
                  {artistSelectionMode === 'select' && (
                    <div className="space-y-2.5">
                      <select
                        value={selectedArtistId}
                        onChange={(e) => {
                          const aId = e.target.value;
                          setSelectedArtistId(aId);
                          const a = artists.find((art) => art.id === aId);
                          if (a) {
                            setFormArtist(a.stageName);
                            setFormStyle(a.style || formStyle);
                          }
                        }}
                        className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 font-semibold focus:outline-none focus:border-amber-500"
                      >
                        {artists.map((a) => {
                          const count = projects.filter(
                            (p) => (p.artistId && p.artistId === a.id) || p.artist.toLowerCase() === a.stageName.toLowerCase()
                          ).length;
                          return (
                            <option key={a.id} value={a.id}>
                              {a.stageName} — {a.style || 'Geral'} ({count} {count === 1 ? 'música gravada' : 'músicas gravadas'})
                            </option>
                          );
                        })}
                        {artists.length === 0 && (
                          <option value="">Nenhum artista cadastrado ainda (clique em Novo Artista)</option>
                        )}
                      </select>

                      {/* DETECÇÃO EM TEMPO REAL: Se o artista já grava conosco */}
                      {isModalArtistRecurring ? (
                        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/40 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🎙️</span>
                            <div>
                              <strong className="text-amber-300 text-xs block">
                                Este Artista Já Grava Conosco!
                              </strong>
                              <span className="text-[10px] text-zinc-400">
                                Para não criar projetos duplicados ou confusão, veja o catálogo que ele já possui no estúdio:
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {modalArtistExistingProjects.map((ep) => (
                              <span
                                key={ep.id}
                                className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-750 text-[10px] text-zinc-300 flex items-center gap-1"
                              >
                                <span>🎵 {ep.name}</span>
                                <span className="text-amber-400 font-mono">({ep.status})</span>
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-emerald-300">
                            ✓ Esta nova música será adicionada à discografia de <strong>{currentModalArtistName}</strong> sem duplicar o artista.
                          </p>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
                          <span className="text-emerald-400">⭐</span>
                          <span>
                            Artista cadastrado no estúdio. Esta será a primeira faixa musical dele(a) no sistema.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODO 2: CADASTRAR NOVO ARTISTA DIRETAMENTE */}
                  {artistSelectionMode === 'new' && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-zinc-900 to-zinc-900 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✨</span>
                        <div>
                          <strong className="text-emerald-300 text-xs block">
                            Novo Artista (Cadastro Imediato)
                          </strong>
                          <span className="text-[10px] text-zinc-400">
                            O artista será registrado na base de dados e vinculado a este projeto.
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                            Nome Artístico *
                          </label>
                          <input
                            type="text"
                            required={artistSelectionMode === 'new'}
                            value={newArtistName}
                            onChange={(e) => {
                              setNewArtistName(e.target.value);
                              setFormArtist(e.target.value);
                            }}
                            placeholder="Ex: MC Kevinho"
                            className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                            Estilo Principal
                          </label>
                          <input
                            type="text"
                            value={newArtistStyle}
                            onChange={(e) => {
                              setNewArtistStyle(e.target.value);
                              setFormStyle(e.target.value);
                            }}
                            placeholder="Ex: Afrobeat, Trap, Rap..."
                            className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                            Microfone Recomendado
                          </label>
                          <input
                            type="text"
                            value={newArtistPreferredMic}
                            onChange={(e) => setNewArtistPreferredMic(e.target.value)}
                            placeholder="Ex: Neumann U87, Shure SM7B..."
                            className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                            Telefone / WhatsApp (Opcional)
                          </label>
                          <input
                            type="text"
                            value={newArtistPhone}
                            onChange={(e) => setNewArtistPhone(e.target.value)}
                            placeholder="Ex: +351 912 345 678"
                            className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Estilo Musical da Faixa
                  </label>
                  <input
                    type="text"
                    value={formStyle}
                    onChange={(e) => setFormStyle(e.target.value)}
                    placeholder="Ex: Afrobeat, Kizomba, Trap..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    BPM
                  </label>
                  <input
                    type="number"
                    value={formBpm}
                    onChange={(e) => setFormBpm(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Tom / Key
                  </label>
                  <input
                    type="text"
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    placeholder="Ex: F#m, Am, Dm..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Ideia">Ideia</option>
                    <option value="Produção">Produção</option>
                    <option value="Gravação">Gravação</option>
                    <option value="Mixagem">Mixagem</option>
                    <option value="Masterização">Masterização</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Arquivado">Arquivado</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Prazo Limite
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Progresso: {formProgress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Seção de Orçamento & Entrega da Música */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-950 to-zinc-900 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      Orçamento & Pagamento do Artista
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Cálculo automático de saldo e percentagem
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1 text-[11px]">
                        Valor Total do Projeto (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formBudgetTotal}
                        onChange={(e) => setFormBudgetTotal(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1 text-[11px]">
                        Valor Já Pago (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formBudgetPaid}
                        onChange={(e) => setFormBudgetPaid(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1 text-[11px]">
                        Método de Pagamento
                      </label>
                      <select
                        value={formPaymentMethod}
                        onChange={(e) => setFormPaymentMethod(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="MB Way">MB Way</option>
                        <option value="Transferência Bancária">Transferência Bancária</option>
                        <option value="Dinheiro">Dinheiro (Presencial)</option>
                        <option value="Multicaixa Express">Multicaixa Express</option>
                        <option value="PayPal">PayPal</option>
                      </select>
                    </div>
                  </div>

                  {/* Atalhos rápidos de % */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-zinc-400">Atalhos rápidos:</span>
                      <button
                        type="button"
                        onClick={() => setFormBudgetPaid(0)}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold border border-zinc-700"
                      >
                        0% (Pendente)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormBudgetPaid(Math.round(formBudgetTotal / 2))}
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold border border-amber-500/30"
                      >
                        50% (Metade)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormBudgetPaid(formBudgetTotal)}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30"
                      >
                        100% (Completo)
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-400">
                      Saldo restante:{' '}
                      <strong className="text-rose-400">
                        {Math.max(0, formBudgetTotal - formBudgetPaid)}€
                      </strong>
                    </div>
                  </div>

                  {/* Toggle: Já recebeu a música? */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-200 block text-xs">
                        O artista já recebeu a música finalizada?
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Indica se os áudios/stems já foram entregues ao artista
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormMusicDelivered(!formMusicDelivered)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border ${
                        formMusicDelivered
                          ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-md'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <span>
                        {formMusicDelivered
                          ? '✅ Sim, Música Já Entregue'
                          : '⏳ Não, Música Pendente'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Anotações Gerais
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Instruções de mixagem, referências, preferências do artista..."
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg"
                >
                  {editingProject ? 'Atualizar Projeto' : 'Salvar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Global: Orçamento dos Artistas, Conta do Estúdio & Futuros Equipamentos */}
      {isBudgetModalOpen && (
        <ArtistBudgetManager
          isModal
          projects={projects}
          artists={artists}
          transactions={transactions}
          futureEquipment={futureEquipment}
          onSaveProject={onSaveProject}
          onNavigateToProject={(id) => {
            onSelectProject(id);
            setIsBudgetModalOpen(false);
          }}
          onSaveTransaction={onSaveTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onSaveFutureEquipment={onSaveFutureEquipment}
          onDeleteFutureEquipment={onDeleteFutureEquipment}
          onBuyEquipment={onBuyEquipment}
          onAllocateToEquipment={onAllocateToEquipment}
          initialTab={budgetTab}
          onClose={() => setIsBudgetModalOpen(false)}
        />
      )}

      {/* Modal: Agendamento Rápido de Sessão com Dados da Música Interligados */}
      {isScheduleModalOpen && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎙️</span>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Agendar Sessão de Estúdio Interligada
                  </h3>
                  <span className="text-[10px] text-zinc-400">
                    Música: <strong>{activeProject.name}</strong> • Artista: <strong>{activeProject.artist}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSessionForProject} className="p-5 space-y-4 text-xs">
              {/* Badge de Sincronização Automática */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⚡</span>
                  <span className="text-[11px] text-zinc-300">
                    Sincronizado: <strong>Tom {activeProject.key}</strong> | <strong>{activeProject.bpm} BPM</strong> | <strong>{activeProject.style}</strong>
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Interligado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Tipo de Sessão
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as SessionType)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Gravação">Gravação de Voz / Instrumentos</option>
                    <option value="Mixagem">Mixagem de Áudio</option>
                    <option value="Masterização">Masterização Final</option>
                    <option value="Produção">Produção Musical / Beatmaking</option>
                    <option value="Ensaio">Ensaio / Pré-produção</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Data da Sessão *
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Horário Início
                  </label>
                  <input
                    type="time"
                    required
                    value={sessionStartTime}
                    onChange={(e) => setSessionStartTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Horário Término
                  </label>
                  <input
                    type="time"
                    required
                    value={sessionEndTime}
                    onChange={(e) => setSessionEndTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Objetivo Principal da Sessão
                  </label>
                  <input
                    type="text"
                    value={sessionObjective}
                    onChange={(e) => setSessionObjective(e.target.value)}
                    placeholder={`Gravação da faixa "${activeProject.name}"...`}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Notas Técnicas & Equipamentos (Auto-preenchidas com os dados da música)
                  </label>
                  <textarea
                    rows={2}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Instruções para o operador ou engenheiro de som..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg flex items-center gap-1.5"
                >
                  <span>Confirmar & Inserir na Agenda</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Eliminar Projeto"
        message={`Tens a certeza que desejas eliminar o projeto "${deleteConfirm?.name}"? Esta ação removerá o projeto da base de dados do estúdio.`}
        confirmText="Eliminar Projeto"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (deleteConfirm) {
            await onDeleteProject(deleteConfirm.id);
            showToast('Projeto eliminado com sucesso', 'info');
            if (selectedProjectId === deleteConfirm.id) {
              onSelectProject(null);
            }
            setDeleteConfirm(null);
          }
        }}
        onClose={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
