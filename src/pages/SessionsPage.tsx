import { useState, useMemo, type FormEvent } from 'react';
import {
  Mic,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  CheckSquare,
  Square,
  Trash2,
  Edit,
  X,
  Sparkles,
} from 'lucide-react';
import { Session, SessionStatus, SessionType, Artist, Project } from '../types';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface SessionsPageProps {
  sessions: Session[];
  artists: Artist[];
  projects: Project[];
  subFilter: string;
  onSaveSession: (session: Session) => Promise<void>;
  onDeleteSession: (id: string) => Promise<void>;
}

const DEFAULT_CHECKLIST_ITEMS = {
  before: [
    'Projeto preparado',
    'Instrumental preparado',
    'Microfone preparado',
    'Interface configurada',
    'Headphones',
    'Cabos',
    'Projeto DAW criado',
    'Pasta criada',
    'Backup',
  ],
  during: ['Gravação', 'Comping', 'Seleção de takes'],
  after: ['Exportar stems', 'Backup', 'Organizar arquivos', 'Registrar notas'],
};

export function SessionsPage({
  sessions,
  artists,
  projects,
  subFilter,
  onSaveSession,
  onDeleteSession,
}: SessionsPageProps) {
  const { showToast } = useToast();
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions[0]?.id || ''
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  // Form states
  const [formArtist, setFormArtist] = useState(artists[0]?.stageName || '');
  const [formProject, setFormProject] = useState(projects[0]?.name || '');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formEndTime, setFormEndTime] = useState('18:00');
  const [formType, setFormType] = useState<SessionType>('Gravação');
  const [formStatus, setFormStatus] = useState<SessionStatus>('Confirmada');
  const [formObjective, setFormObjective] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (subFilter === 'all' || subFilter === 'timeline' || subFilter === 'checklist') return true;
      if (subFilter === 'Gravação') return s.type === 'Gravação';
      if (subFilter === 'Mixagem') return s.type === 'Mixagem';
      if (subFilter === 'Confirmada') return s.status === 'Confirmada';
      return true;
    });
  }, [sessions, subFilter]);

  const openCreateModal = () => {
    setEditingSession(null);
    setFormArtist(artists[0]?.stageName || '');
    setFormProject(projects[0]?.name || '');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStartTime('14:00');
    setFormEndTime('18:00');
    setFormType('Gravação');
    setFormStatus('Confirmada');
    setFormObjective('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Session) => {
    setEditingSession(s);
    setFormArtist(s.artistName);
    setFormProject(s.projectName || '');
    setFormDate(s.date);
    setFormStartTime(s.startTime);
    setFormEndTime(s.endTime);
    setFormType(s.type);
    setFormStatus(s.status);
    setFormObjective(s.objective);
    setFormNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formArtist.trim() || !formObjective.trim()) {
      showToast('Preencha o artista e o objetivo da sessão', 'warning');
      return;
    }

    const newSession: Session = {
      id: editingSession ? editingSession.id : 'sess-' + Date.now(),
      artistName: formArtist.trim(),
      projectName: formProject.trim(),
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      type: formType,
      status: formStatus,
      objective: formObjective.trim(),
      notes: formNotes,
      checklist: editingSession?.checklist || {
        'Projeto preparado': true,
        'Microfone preparado': true,
      },
    };

    await onSaveSession(newSession);
    setIsModalOpen(false);
    showToast(editingSession ? 'Sessão atualizada!' : 'Sessão agendada com sucesso!', 'success');
  };

  // Toggle checklist item
  const handleToggleChecklist = async (item: string) => {
    if (!activeSession) return;
    const currentList = activeSession.checklist || {};
    const updatedList = { ...currentList, [item]: !currentList[item] };
    const updated = { ...activeSession, checklist: updatedList };
    await onSaveSession(updated);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-rose-400" />
            <span>Sessões & Cronograma do Estúdio</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Organiza gravações com checklist completo antes, durante e depois de cada take.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/10 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Nova Sessão</span>
        </button>
      </div>

      {/* Grid: Sessions list & Active Session Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Sessions List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Sessões Agendadas ({filteredSessions.length})
          </div>

          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {filteredSessions.map((session) => {
              const isSelected = session.id === activeSession?.id;
              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-850 border-rose-500/70 shadow-lg'
                      : 'bg-[#121215] border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        session.status === 'Confirmada'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : session.status === 'Em andamento'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {session.status}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {session.date} • {session.startTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm">
                    {session.artistName}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {session.type} • {session.projectName || 'Música em Produção'}
                  </p>

                  <p className="text-xs text-zinc-300 line-clamp-2 mt-2 bg-zinc-950/40 p-2 rounded-lg border border-zinc-850">
                    {session.objective}
                  </p>
                </div>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Nenhuma sessão agendada nesta categoria.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Session Checklist & Details */}
        {activeSession && (
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-[#121215] border border-zinc-800/90 shadow-2xl space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      {activeSession.type}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {activeSession.date} ({activeSession.startTime} às {activeSession.endTime})
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white">
                    {activeSession.artistName}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Projeto: <strong className="text-zinc-200">{activeSession.projectName || 'Geral'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(activeSession)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    title="Editar sessão"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(activeSession.id)}
                    className="p-2 rounded-lg bg-zinc-900 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                    title="Excluir sessão"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Objective box */}
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs">
                <span className="text-amber-400 font-bold block mb-1">🎯 Objetivo da Sessão:</span>
                <p className="text-zinc-200 leading-relaxed">{activeSession.objective}</p>
                {activeSession.notes && (
                  <p className="text-zinc-400 mt-2 italic text-[11px]">Obs: {activeSession.notes}</p>
                )}
              </div>

              {/* 14. Checklist de Sessão Interativo */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                  <span>📋 Checklist Completo de Estúdio</span>
                  <span className="text-[11px] text-zinc-500 font-normal">
                    Marca os itens à medida que avanças
                  </span>
                </div>

                {/* Antes da Sessão */}
                <div className="space-y-2 bg-zinc-950/50 p-3.5 rounded-xl border border-zinc-850">
                  <span className="text-xs font-bold text-amber-400 block">
                    1. Antes da Sessão (Preparação Técnica)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {DEFAULT_CHECKLIST_ITEMS.before.map((item) => {
                      const isChecked = !!activeSession.checklist?.[item];
                      return (
                        <div
                          key={item}
                          onClick={() => handleToggleChecklist(item)}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                          )}
                          <span className={isChecked ? 'line-through text-zinc-400' : ''}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Durante a Sessão */}
                <div className="space-y-2 bg-zinc-950/50 p-3.5 rounded-xl border border-zinc-850">
                  <span className="text-xs font-bold text-rose-400 block">
                    2. Durante a Sessão (Captação)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
                    {DEFAULT_CHECKLIST_ITEMS.during.map((item) => {
                      const isChecked = !!activeSession.checklist?.[item];
                      return (
                        <div
                          key={item}
                          onClick={() => handleToggleChecklist(item)}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                          )}
                          <span className={isChecked ? 'line-through text-zinc-400' : ''}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Depois da Sessão */}
                <div className="space-y-2 bg-zinc-950/50 p-3.5 rounded-xl border border-zinc-850">
                  <span className="text-xs font-bold text-sky-400 block">
                    3. Depois da Sessão (Organização & Entrega)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {DEFAULT_CHECKLIST_ITEMS.after.map((item) => {
                      const isChecked = !!activeSession.checklist?.[item];
                      return (
                        <div
                          key={item}
                          onClick={() => handleToggleChecklist(item)}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                          )}
                          <span className={isChecked ? 'line-through text-zinc-400' : ''}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Session */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
              <h3 className="font-bold text-white text-sm">
                {editingSession ? 'Editar Sessão' : 'Agendar Sessão de Estúdio'}
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
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Artista *
                  </label>
                  <input
                    type="text"
                    required
                    value={formArtist}
                    onChange={(e) => setFormArtist(e.target.value)}
                    placeholder="Ex: Jay Santos"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Projeto Associado
                  </label>
                  <input
                    type="text"
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    placeholder="Ex: Kizomba da Madrugada"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Data da Sessão
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Tipo de Sessão
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as SessionType)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Gravação">Gravação</option>
                    <option value="Mixagem">Mixagem</option>
                    <option value="Masterização">Masterização</option>
                    <option value="Produção">Produção</option>
                    <option value="Reunião">Reunião</option>
                    <option value="Entrega">Entrega</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Hora Inicial
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Hora Final
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as SessionStatus)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Agendada">Agendada</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Objetivo da Sessão *
                  </label>
                  <input
                    type="text"
                    required
                    value={formObjective}
                    onChange={(e) => setFormObjective(e.target.value)}
                    placeholder="Ex: Gravação de Lead Vocals e 4 dobras em harmonia"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Observações / Configurações Técnicas
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Ex: Microfone valvulado, pré aquecido, headphone mix pronta..."
                    rows={2}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
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
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-lg"
                >
                  {editingSession ? 'Salvar Alterações' : 'Confirmar Sessão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Eliminar Sessão"
        message="Tens a certeza que queres eliminar esta sessão de gravação? Esta ação não pode ser desfeita."
        confirmText="Eliminar Sessão"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (deleteConfirmId) {
            await onDeleteSession(deleteConfirmId);
            showToast('Sessão eliminada com sucesso', 'info');
            if (selectedSessionId === deleteConfirmId) {
              setSelectedSessionId(sessions.find((s) => s.id !== deleteConfirmId)?.id || '');
            }
            setDeleteConfirmId(null);
          }
        }}
        onClose={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
