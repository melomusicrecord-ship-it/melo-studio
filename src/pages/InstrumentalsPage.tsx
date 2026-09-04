import { useState, useMemo, type FormEvent } from 'react';
import {
  Music2,
  Plus,
  Star,
  Search,
  Tag,
  Trash2,
  Edit,
  X,
  Play,
  Volume2,
} from 'lucide-react';
import { Instrumental, InstrumentalStatus } from '../types';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface InstrumentalsPageProps {
  instrumentals: Instrumental[];
  subFilter: string;
  onSaveInstrumental: (inst: Instrumental) => Promise<void>;
  onDeleteInstrumental: (id: string) => Promise<void>;
}

export function InstrumentalsPage({
  instrumentals,
  subFilter,
  onSaveInstrumental,
  onDeleteInstrumental,
}: InstrumentalsPageProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [editingInst, setEditingInst] = useState<Instrumental | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formStyle, setFormStyle] = useState('Afrobeat');
  const [formBpm, setFormBpm] = useState(104);
  const [formKey, setFormKey] = useState('Am');
  const [formStatus, setFormStatus] = useState<InstrumentalStatus>('Disponível');
  const [formPrice, setFormPrice] = useState(150);
  const [formTags, setFormTags] = useState('Guitar, Trumpet, Dance');
  const [formNotes, setFormNotes] = useState('');

  const filteredInstrumentals = useMemo(() => {
    return instrumentals.filter((item) => {
      const itemTitle = item.title || item.name || '';
      const itemStatus = item.status || 'Disponível';
      const itemTags = item.tags || [];

      if (subFilter === 'favorites' && !item.favorite) return false;
      if (subFilter === 'available' && itemStatus !== 'Disponível') return false;
      if (subFilter === 'sold' && itemStatus !== 'Vendido') return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          itemTitle.toLowerCase().includes(q) ||
          item.style.toLowerCase().includes(q) ||
          itemTags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [instrumentals, subFilter, searchTerm]);

  const openCreateModal = () => {
    setEditingInst(null);
    setFormTitle('');
    setFormStyle('Afrobeat');
    setFormBpm(104);
    setFormKey('Am');
    setFormStatus('Disponível');
    setFormPrice(150);
    setFormTags('Guitar, Percussion, Club');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (inst: Instrumental) => {
    setEditingInst(inst);
    setFormTitle(inst.title || inst.name);
    setFormStyle(inst.style);
    setFormBpm(inst.bpm);
    setFormKey(inst.key);
    setFormStatus(inst.status || 'Disponível');
    setFormPrice(inst.price || 0);
    setFormTags((inst.tags || []).join(', '));
    setFormNotes(inst.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Insira o título do beat', 'warning');
      return;
    }

    const item: Instrumental = {
      id: editingInst ? editingInst.id : 'beat-' + Date.now(),
      name: formTitle.trim(),
      title: formTitle.trim(),
      style: formStyle,
      bpm: Number(formBpm) || 120,
      key: formKey.trim() || 'C',
      status: formStatus,
      price: Number(formPrice) || 0,
      favorite: editingInst ? editingInst.favorite : false,
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: formNotes,
      createdAt: editingInst ? editingInst.createdAt : new Date().toISOString().split('T')[0],
    };

    await onSaveInstrumental(item);
    setIsModalOpen(false);
    showToast(editingInst ? 'Beat atualizado!' : 'Novo instrumental cadastrado!', 'success');
  };

  const handleToggleFavorite = async (inst: Instrumental) => {
    const updated = { ...inst, favorite: !inst.favorite };
    await onSaveInstrumental(updated);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar instrumentais por título, estilo ou tag..."
            className="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Instrumental</span>
        </button>
      </div>

      {/* Grid of Beats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInstrumentals.map((inst) => (
          <div
            key={inst.id}
            className="p-5 rounded-xl bg-[#121215] border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    inst.status === 'Disponível'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : inst.status === 'Vendido'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {inst.status}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(inst)}
                    className="p-1 text-zinc-500 hover:text-amber-400"
                    title="Favoritar"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        inst.favorite ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => openEditModal(inst)}
                    className="p-1 text-zinc-500 hover:text-zinc-300"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(inst.id, inst.title || inst.name)}
                    className="p-1 text-zinc-600 hover:text-rose-400"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-white mb-0.5">
                {inst.title || inst.name}
              </h3>
              <p className="text-xs text-zinc-400 font-medium mb-3">
                {inst.style} • <span className="text-amber-300">{inst.bpm} BPM</span> •{' '}
                <span className="text-sky-300">{inst.key}</span>
              </p>

              {inst.tags && inst.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {inst.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {inst.notes && (
                <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  {inst.notes}
                </p>
              )}
            </div>

            {inst.price && (
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Valor de Licença</span>
                <span className="font-mono font-bold text-white text-sm">
                  ${inst.price} USD
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredInstrumentals.length === 0 && (
        <div className="py-16 text-center text-zinc-500 text-xs">
          <Music2 className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p>Nenhum instrumental cadastrado nesta categoria.</p>
        </div>
      )}

      {/* Modal: Create/Edit Instrumental */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
              <h3 className="font-bold text-white text-sm">
                {editingInst ? 'Editar Beat' : 'Cadastrar Instrumental'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Título do Beat *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Luanda Sunset"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Estilo
                  </label>
                  <input
                    type="text"
                    value={formStyle}
                    onChange={(e) => setFormStyle(e.target.value)}
                    placeholder="Afrobeat, Kizomba, Trap..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
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
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
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
                    placeholder="Am, F#m, Dm..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as InstrumentalStatus)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Reservado">Reservado</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Em produção">Em produção</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Guitar, Log Drum, Smooth..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Preço Base ($ USD)
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Anotações / Instrumentos Usados
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Guitarra gravada ao vivo, basslines analógicas..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-purple-500"
                />
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
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold shadow-lg"
                >
                  {editingInst ? 'Atualizar Instrumental' : 'Salvar Instrumental'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Eliminar Instrumental"
        message={`Tens a certeza que queres eliminar o beat/instrumental "${deleteConfirm?.title}"?`}
        confirmText="Eliminar Beat"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (deleteConfirm) {
            await onDeleteInstrumental(deleteConfirm.id);
            showToast('Instrumental eliminado com sucesso', 'info');
            setDeleteConfirm(null);
          }
        }}
        onClose={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
