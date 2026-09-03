import { useState, useMemo, type FormEvent } from 'react';
import {
  Plug,
  Plus,
  Star,
  Flame,
  CheckSquare,
  Square,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  X,
  Check,
  Tag,
} from 'lucide-react';
import { PluginItem, PluginCategory } from '../types';
import { useToast } from '../components/Toast';

interface PluginsPageProps {
  plugins: PluginItem[];
  subFilter: string;
  onSavePlugin: (plugin: PluginItem) => Promise<void>;
  onDeletePlugin: (id: string) => Promise<void>;
}

const CATEGORIES: PluginCategory[] = [
  'EQ',
  'Compressor',
  'Limiter',
  'De-Esser',
  'Noise Reduction',
  'Gate',
  'Saturation',
  'Distortion',
  'Transient Shaper',
  'Reverb',
  'Delay',
  'Chorus',
  'Flanger',
  'Phaser',
  'Stereo',
  'Exciter',
  'Clipper',
  'Metering',
  'Utility',
  'Synth',
  'Sampler',
  'Instrument',
  'Outro',
];

const MANUFACTURERS = [
  'Waves',
  'FabFilter',
  'Soundtoys',
  'Valhalla DSP',
  'Universal Audio',
  'iZotope',
  'SSL',
  'Softube',
  'Slate Digital',
  'Arturia',
  'Antares',
  'Tokyo Dawn Labs',
  'Analog Obsession',
  'SIR Audio Tools',
  'Image-Line / FL Studio',
  'Outro',
];

export function PluginsPage({
  plugins,
  subFilter,
  onSavePlugin,
  onDeletePlugin,
}: PluginsPageProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState<PluginItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formManufacturer, setFormManufacturer] = useState('Waves');
  const [formCategory, setFormCategory] = useState<PluginCategory>('Compressor');
  const [formOwned, setFormOwned] = useState(true);
  const [formFavorite, setFormFavorite] = useState(false);
  const [formMostUsed, setFormMostUsed] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  const filteredPlugins = useMemo(() => {
    return plugins.filter((p) => {
      // Subfilter
      if (subFilter === 'owned' && !p.owned) return false;
      if (subFilter === 'favorites' && !p.favorite) return false;
      if (subFilter === 'mostUsed' && !p.mostUsed) return false;
      if (subFilter.startsWith('cat-')) {
        const cat = subFilter.replace('cat-', '');
        if (p.category !== cat) return false;
      }

      // Manufacturer filter
      if (selectedManufacturer !== 'all' && p.manufacturer !== selectedManufacturer) {
        return false;
      }

      // Category dropdown filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [plugins, subFilter, selectedManufacturer, selectedCategory, searchTerm]);

  const openCreateModal = () => {
    setEditingPlugin(null);
    setFormName('');
    setFormManufacturer('Waves');
    setFormCategory('Compressor');
    setFormOwned(true);
    setFormFavorite(false);
    setFormMostUsed(false);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: PluginItem) => {
    setEditingPlugin(p);
    setFormName(p.name);
    setFormManufacturer(p.manufacturer);
    setFormCategory(p.category);
    setFormOwned(p.owned);
    setFormFavorite(p.favorite);
    setFormMostUsed(p.mostUsed);
    setFormNotes(p.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Insira o nome do plugin', 'warning');
      return;
    }

    const item: PluginItem = {
      id: editingPlugin ? editingPlugin.id : 'plug-' + Date.now(),
      name: formName.trim(),
      manufacturer: formManufacturer,
      category: formCategory,
      owned: formOwned,
      favorite: formFavorite,
      mostUsed: formMostUsed,
      notes: formNotes,
    };

    await onSavePlugin(item);
    setIsModalOpen(false);
    showToast(editingPlugin ? 'Plugin atualizado!' : 'Novo plugin adicionado à biblioteca!', 'success');
  };

  // Instant toggles
  const handleToggleOwned = async (p: PluginItem) => {
    const updated = { ...p, owned: !p.owned };
    await onSavePlugin(updated);
    showToast(updated.owned ? `Marcado como "Eu Tenho": ${p.name}` : `Removido de "Eu Tenho": ${p.name}`, 'info');
  };

  const handleToggleFavorite = async (p: PluginItem) => {
    const updated = { ...p, favorite: !p.favorite };
    await onSavePlugin(updated);
  };

  const handleToggleMostUsed = async (p: PluginItem) => {
    const updated = { ...p, mostUsed: !p.mostUsed };
    await onSavePlugin(updated);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Queres excluir o plugin "${name}" da biblioteca?`)) {
      await onDeletePlugin(id);
      showToast('Plugin excluído', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar plugins por nome, marca ou nota..."
              className="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <select
            value={selectedManufacturer}
            onChange={(e) => setSelectedManufacturer(e.target.value)}
            className="bg-[#121215] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">Todos os Fabricantes</option>
            {MANUFACTURERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#121215] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">Todas as Categorias</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Plugin</span>
        </button>
      </div>

      {/* Summary Counters */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-medium">
        <span>{filteredPlugins.length} plugins listados</span>
        <span className="text-zinc-500 text-[11px]">
          {plugins.filter((p) => p.owned).length} marcados com "Eu Tenho"
        </span>
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredPlugins.map((plugin) => (
          <div
            key={plugin.id}
            className="p-4 rounded-xl bg-[#121215] border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-sky-400 border border-zinc-800">
                  {plugin.category}
                </span>

                <div className="flex items-center gap-1">
                  {/* Most used toggle */}
                  <button
                    onClick={() => handleToggleMostUsed(plugin)}
                    className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                      plugin.mostUsed ? 'text-amber-500' : 'text-zinc-600'
                    }`}
                    title="Mais usado"
                  >
                    <Flame className="w-3.5 h-3.5" />
                  </button>

                  {/* Favorite toggle */}
                  <button
                    onClick={() => handleToggleFavorite(plugin)}
                    className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                      plugin.favorite ? 'text-amber-400' : 'text-zinc-600'
                    }`}
                    title="Favorito"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        plugin.favorite ? 'fill-amber-400' : ''
                      }`}
                    />
                  </button>

                  {/* Edit & Delete */}
                  <button
                    onClick={() => openEditModal(plugin)}
                    className="p-1 text-zinc-500 hover:text-zinc-300"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plugin.id, plugin.name)}
                    className="p-1 text-zinc-600 hover:text-rose-400"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-0.5">
                {plugin.name}
              </h4>
              <span className="text-xs text-zinc-400 block font-medium mb-2">
                {plugin.manufacturer}
              </span>

              {plugin.notes && (
                <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-850 line-clamp-3">
                  {plugin.notes}
                </p>
              )}
            </div>

            {/* Bottom 26: Sistema Eu Tenho instant toggle */}
            <div className="mt-3 pt-3 border-t border-zinc-850 flex items-center justify-between">
              <button
                onClick={() => handleToggleOwned(plugin)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  plugin.owned
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                }`}
              >
                {plugin.owned ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tenho</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Não possuo</span>
                  </>
                )}
              </button>

              {plugin.mostUsed && (
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                  <Flame className="w-3 h-3" />
                  <span>Em alta</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="py-16 text-center text-zinc-500 text-xs">
          <Plug className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p>Nenhum plugin encontrado com os filtros selecionados.</p>
        </div>
      )}

      {/* Create / Edit Plugin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
              <h3 className="font-bold text-white text-sm">
                {editingPlugin ? 'Editar Plugin' : 'Cadastrar Plugin'}
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
                  Nome do Plugin *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Pro-Q 4, CLA-76, Decapitator..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Fabricante
                  </label>
                  <input
                    type="text"
                    value={formManufacturer}
                    onChange={(e) => setFormManufacturer(e.target.value)}
                    placeholder="Ex: FabFilter, Waves..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as PluginCategory)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkbox tags */}
              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formOwned}
                    onChange={(e) => setFormOwned(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span className="text-zinc-300 font-medium">Eu Possuo Este Plugin</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFavorite}
                    onChange={(e) => setFormFavorite(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span className="text-zinc-300 font-medium">Favorito</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formMostUsed}
                    onChange={(e) => setFormMostUsed(e.target.checked)}
                    className="accent-rose-500"
                  />
                  <span className="text-zinc-300 font-medium">Mais Usado</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Notas de Utilização / Timbre
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Excelente para segurar os transientes no vocal e na caixa..."
                  rows={3}
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
                  {editingPlugin ? 'Atualizar Plugin' : 'Salvar Plugin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
