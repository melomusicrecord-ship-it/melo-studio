import { useState, useMemo, type FormEvent } from 'react';
import {
  Users,
  Plus,
  Star,
  Search,
  Mic,
  Music,
  Trash2,
  Edit,
  X,
  Phone,
  Mail,
  Instagram,
} from 'lucide-react';
import { Artist } from '../types';
import { useToast } from '../components/Toast';

interface ArtistsPageProps {
  artists: Artist[];
  subFilter: string;
  onSaveArtist: (artist: Artist) => Promise<void>;
  onDeleteArtist: (id: string) => Promise<void>;
}

export function ArtistsPage({
  artists,
  subFilter,
  onSaveArtist,
  onDeleteArtist,
}: ArtistsPageProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

  // Form state
  const [formStageName, setFormStageName] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formStyles, setFormStyles] = useState('Afrobeat, Kizomba');
  const [formTone, setFormTone] = useState('Voz suave, médio-grave');
  const [formMic, setFormMic] = useState('Neumann TLM 103');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      if (subFilter === 'favorites' && !a.favorite) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const stylesList = a.mainStyles || [a.style];
        return (
          a.stageName.toLowerCase().includes(q) ||
          stylesList.some((s) => s.toLowerCase().includes(q)) ||
          (a.notes || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [artists, subFilter, searchTerm]);

  const openCreateModal = () => {
    setEditingArtist(null);
    setFormStageName('');
    setFormFullName('');
    setFormStyles('Afrobeat, Kizomba');
    setFormTone('Voz encorpada, médio-grave');
    setFormMic('Neumann TLM 103');
    setFormPhone('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (a: Artist) => {
    setEditingArtist(a);
    setFormStageName(a.stageName);
    setFormFullName(a.fullName || a.realName || '');
    setFormStyles((a.mainStyles || [a.style]).join(', '));
    setFormTone(a.vocalTone || '');
    setFormMic(a.preferredMic || '');
    setFormPhone(a.contactPhone || a.phone || '');
    setFormNotes(a.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formStageName.trim()) {
      showToast('Insira o nome artístico', 'warning');
      return;
    }

    const stylesArr = formStyles.split(',').map((s) => s.trim()).filter(Boolean);

    const artistData: Artist = {
      id: editingArtist ? editingArtist.id : 'art-' + Date.now(),
      stageName: formStageName.trim(),
      fullName: formFullName.trim(),
      realName: formFullName.trim(),
      style: stylesArr[0] || 'Afrobeat',
      mainStyles: stylesArr,
      vocalTone: formTone.trim(),
      preferredMic: formMic.trim(),
      contactPhone: formPhone.trim(),
      phone: formPhone.trim(),
      favorite: editingArtist ? editingArtist.favorite : false,
      notes: formNotes,
    };

    await onSaveArtist(artistData);
    setIsModalOpen(false);
    showToast(editingArtist ? 'Artista atualizado!' : 'Novo artista cadastrado!', 'success');
  };

  const handleToggleFavorite = async (a: Artist) => {
    const updated = { ...a, favorite: !a.favorite };
    await onSaveArtist(updated);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Queres mesmo excluir o perfil do artista "${name}"?`)) {
      await onDeleteArtist(id);
      showToast('Artista excluído', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar artista ou estilo..."
            className="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Artista</span>
        </button>
      </div>

      {/* Grid of Artists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArtists.map((artist) => (
          <div
            key={artist.id}
            className="p-5 rounded-xl bg-[#121215] border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-zinc-800 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-sm">
                  {artist.stageName.charAt(0)}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(artist)}
                    className="p-1 text-zinc-500 hover:text-amber-400"
                    title="Favoritar"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        artist.favorite ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => openEditModal(artist)}
                    className="p-1 text-zinc-500 hover:text-zinc-300"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(artist.id, artist.stageName)}
                    className="p-1 text-zinc-600 hover:text-rose-400"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-white mb-0.5">
                {artist.stageName}
              </h3>
              {artist.fullName && (
                <span className="text-xs text-zinc-500 block mb-2">
                  {artist.fullName}
                </span>
              )}

              <div className="flex flex-wrap gap-1 mb-3">
                {artist.mainStyles.map((st, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-900 text-amber-300/90 border border-zinc-800"
                  >
                    {st}
                  </span>
                ))}
              </div>

              <div className="space-y-1.5 text-xs bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
                {artist.vocalTone && (
                  <div>
                    <span className="text-zinc-500 text-[11px] block">Timbre Vocal:</span>
                    <span className="text-zinc-200">{artist.vocalTone}</span>
                  </div>
                )}
                {artist.preferredMic && (
                  <div>
                    <span className="text-zinc-500 text-[11px] block">Microfone Preferido:</span>
                    <span className="text-sky-300 font-medium">{artist.preferredMic}</span>
                  </div>
                )}
              </div>

              {artist.notes && (
                <p className="text-xs text-zinc-400 italic mt-3 leading-relaxed line-clamp-2">
                  "{artist.notes}"
                </p>
              )}
            </div>

            {artist.contactPhone && (
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-400">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{artist.contactPhone}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredArtists.length === 0 && (
        <div className="py-16 text-center text-zinc-500 text-xs">
          <Users className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p>Nenhum artista cadastrado.</p>
        </div>
      )}

      {/* Modal: Create/Edit Artist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
              <h3 className="font-bold text-white text-sm">
                {editingArtist ? 'Editar Artista' : 'Cadastrar Artista'}
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
                  Nome Artístico *
                </label>
                <input
                  type="text"
                  required
                  value={formStageName}
                  onChange={(e) => setFormStageName(e.target.value)}
                  placeholder="Ex: Jay Santos"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Nome Real / Completo
                </label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Ex: Jaylson Ferreira Santos"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Estilos Principais (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={formStyles}
                  onChange={(e) => setFormStyles(e.target.value)}
                  placeholder="Afrobeat, Kizomba, R&B"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Timbre e Características Vocais
                </label>
                <input
                  type="text"
                  value={formTone}
                  onChange={(e) => setFormTone(e.target.value)}
                  placeholder="Ex: Voz encorpada, médio-grave, precisa de de-esser leve"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Microfone Que Mais Combina
                </label>
                <input
                  type="text"
                  value={formMic}
                  onChange={(e) => setFormMic(e.target.value)}
                  placeholder="Ex: Neumann TLM 103, Shure SM7B..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Contacto Telefónico / WhatsApp
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+244 9..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Notas de Captação e Preferências
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Gosta de pouca reverb no fone, rende mais à noite..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg"
                >
                  {editingArtist ? 'Atualizar Artista' : 'Salvar Artista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
