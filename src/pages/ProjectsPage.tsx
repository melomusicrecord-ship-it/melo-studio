import { useState, useMemo, type FormEvent, type MouseEvent } from 'react';
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
} from 'lucide-react';
import { Project, ProjectStatus, Artist, Session, ProcessingChain } from '../types';
import { useToast } from '../components/Toast';

interface ProjectsPageProps {
  projects: Project[];
  artists: Artist[];
  sessions: Session[];
  chains: ProcessingChain[];
  subFilter: string;
  selectedProjectId?: string;
  onSelectProject: (id: string | null) => void;
  onSaveProject: (project: Project) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export function ProjectsPage({
  projects,
  artists,
  sessions,
  chains,
  subFilter,
  selectedProjectId,
  onSelectProject,
  onSaveProject,
  onDeleteProject,
}: ProjectsPageProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [detailTab, setDetailTab] = useState<
    'overview' | 'sessions' | 'vocal' | 'mix' | 'master' | 'notes'
  >('overview');

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
  }, [projects, subFilter, searchTerm]);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormName('');
    setFormArtist(artists[0]?.stageName || 'Novo Artista');
    setFormStyle('Afrobeat');
    setFormBpm(105);
    setFormKey('Am');
    setFormStatus('Produção');
    setFormDeadline('');
    setFormNotes('');
    setFormProgress(20);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setFormName(p.name);
    setFormArtist(p.artist);
    setFormStyle(p.style);
    setFormBpm(p.bpm);
    setFormKey(p.key);
    setFormStatus(p.status);
    setFormDeadline(p.deadline || '');
    setFormNotes(p.notes || '');
    setFormProgress(p.progress || 0);
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Insira o nome da música / projeto', 'warning');
      return;
    }

    const projectData: Project = {
      id: editingProject ? editingProject.id : 'proj-' + Date.now(),
      name: formName.trim(),
      artist: formArtist.trim(),
      style: formStyle,
      bpm: Number(formBpm) || 120,
      key: formKey.trim() || 'C',
      status: formStatus,
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString().split('T')[0],
      deadline: formDeadline || undefined,
      notes: formNotes,
      progress: formProgress,
      favorite: editingProject ? editingProject.favorite : false,
    };

    await onSaveProject(projectData);
    setIsModalOpen(false);
    showToast(editingProject ? 'Projeto atualizado!' : 'Novo projeto criado com sucesso!', 'success');
  };

  const handleToggleFavorite = async (p: Project, e: MouseEvent) => {
    e.stopPropagation();
    const updated = { ...p, favorite: !p.favorite };
    await onSaveProject(updated);
    showToast(updated.favorite ? 'Projeto favoritado ⭐' : 'Removido dos favoritos', 'info');
  };

  const handleDelete = async (id: string, name: string, e: MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Tens certeza que desejas excluir o projeto "${name}"?`)) {
      await onDeleteProject(id);
      showToast('Projeto excluído', 'info');
      if (selectedProjectId === id) {
        onSelectProject(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome, artista ou estilo..."
            className="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Projeto de Música</span>
        </button>
      </div>

      {/* Main Grid: Projects List & Project Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Projects Cards List */}
        <div className={`${activeProject ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-medium">
            <span>{filteredProjects.length} projetos encontrados</span>
            {activeProject && (
              <button
                onClick={() => onSelectProject(null)}
                className="text-amber-400 hover:underline"
              >
                Ver em grade ampla
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-[75vh] overflow-y-auto pr-1">
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
                      <span>Progresso</span>
                      <span>{p.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${p.progress || 0}%` }}
                      />
                    </div>
                  </div>
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

                {detailTab === 'sessions' && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-zinc-500 uppercase">
                      Sessões vinculadas a esta música
                    </div>
                    {sessions
                      .filter((s) => s.projectId === activeProject.id)
                      .map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-white block">{s.type}: {s.objective}</span>
                            <span className="text-zinc-400 text-[11px]">
                              {s.date} às {s.startTime} • Status: {s.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    {sessions.filter((s) => s.projectId === activeProject.id).length === 0 && (
                      <div className="text-zinc-500 py-4">Nenhuma sessão associada diretamente a este projeto.</div>
                    )}
                  </div>
                )}

                {detailTab === 'vocal' && (
                  <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-2">
                    <span className="font-bold text-zinc-200 block">Checklist Vocal:</span>
                    <div className="space-y-1 text-zinc-400">
                      <div>✓ Lead Vocal registrado em 24-bit / 48kHz</div>
                      <div>✓ Comping das melhores frases concluído</div>
                      <div>✓ Afinação de apoio em tom {activeProject.key}</div>
                      <div>✓ De-esser Pro-DS aplicado antes da saturação</div>
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

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Artista
                  </label>
                  <input
                    type="text"
                    value={formArtist}
                    onChange={(e) => setFormArtist(e.target.value)}
                    placeholder="Ex: Jay Santos"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Estilo Musical
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
    </div>
  );
}
