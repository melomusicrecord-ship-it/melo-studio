import { useState, useMemo, FormEvent } from 'react';
import {
  Library,
  Plus,
  Search,
  Tag,
  Copy,
  Check,
  Edit3,
  Trash2,
  Calendar,
  FileText,
  Sliders,
  Bookmark,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { LibraryItem } from '../types';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface LibraryPageProps {
  library: LibraryItem[];
  subFilter?: string;
  onSaveItem: (item: LibraryItem) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export function LibraryPage({
  library,
  subFilter = 'all',
  onSaveItem,
  onDeleteItem,
}: LibraryPageProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<LibraryItem['type']>('Nota de Estúdio');
  const [formTags, setFormTags] = useState('');
  const [formContent, setFormContent] = useState('');

  const typeOptions: LibraryItem['type'][] = [
    'Nota de Estúdio',
    'Template',
    'Tutorial',
    'Preset',
    'Referência',
    'Configuração',
  ];

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormType('Nota de Estúdio');
    setFormTags('');
    setFormContent('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: LibraryItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormType(item.type);
    setFormTags(item.tags ? item.tags.join(', ') : '');
    setFormContent(item.content);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Preenche o título e o conteúdo do documento.', 'warning');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updatedItem: LibraryItem = {
      id: editingItem ? editingItem.id : 'lib-' + Date.now(),
      title: formTitle.trim(),
      type: formType,
      content: formContent.trim(),
      tags: tagsArray,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    await onSaveItem(updatedItem);
    if (selectedItem?.id === updatedItem.id) {
      setSelectedItem(updatedItem);
    }
    setIsModalOpen(false);
    showToast(editingItem ? 'Documento atualizado!' : 'Item adicionado à biblioteca!', 'success');
  };

  const handleCopyContent = (item: LibraryItem) => {
    navigator.clipboard.writeText(`${item.title}\n[${item.type}]\n\n${item.content}`);
    setCopiedId(item.id);
    showToast('Conteúdo copiado para a área de transferência!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return library.filter((item) => {
      // Subnav filter
      if (subFilter.startsWith('type-')) {
        const requiredType = subFilter.replace('type-', '');
        if (item.type !== requiredType) return false;
      }

      // Local type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesContent = item.content?.toLowerCase().includes(q);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesType = item.type?.toLowerCase().includes(q);
        return matchesTitle || matchesContent || matchesTags || matchesType;
      }

      return true;
    });
  }, [library, subFilter, typeFilter, searchTerm]);

  // Keep first item selected if none selected or if selected was deleted
  const currentActiveItem = useMemo(() => {
    if (selectedItem && filteredItems.some((i) => i.id === selectedItem.id)) {
      return filteredItems.find((i) => i.id === selectedItem.id) || null;
    }
    return filteredItems[0] || null;
  }, [selectedItem, filteredItems]);

  const getTypeBadgeColor = (type: LibraryItem['type']) => {
    switch (type) {
      case 'Template':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Tutorial':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Preset':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Referência':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      case 'Configuração':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Nota de Estúdio':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Biblioteca & Referências
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Checklists de masterização, tabelas de frequências de ouro, tutoriais de mixagem e notas de estúdio
            </p>
          </div>
        </div>

        <button
          id="btn-new-library-item"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Documento</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
          <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Acervo Total</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{library.length}</span>
            <span className="text-xs text-zinc-500">documentos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
          <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider block">Templates</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400">
              {library.filter((i) => i.type === 'Template').length}
            </span>
            <span className="text-xs text-emerald-500/70">guias práticos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
          <span className="text-xs text-blue-400 font-medium uppercase tracking-wider block">Notas & Frequências</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-blue-400">
              {library.filter((i) => i.type === 'Nota de Estúdio').length}
            </span>
            <span className="text-xs text-blue-500/70">fichas técnicas</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
          <span className="text-xs text-cyan-400 font-medium uppercase tracking-wider block">Tutoriais</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-cyan-400">
              {library.filter((i) => i.type === 'Tutorial').length}
            </span>
            <span className="text-xs text-cyan-500/70">técnicas</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#121215] border border-zinc-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por título, tag, conteúdo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              typeFilter === 'all'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            Todos
          </button>
          {typeOptions.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Master/Detail Layout */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-[#121215]/50">
          <Library className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">Nenhum documento encontrado</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Adiciona checklists, tabelas de frequências ou manuais de estúdio à tua biblioteca.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Documento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of items */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block px-1">
              Documentos Disponíveis ({filteredItems.length})
            </span>
            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredItems.map((item) => {
                const isSelected = currentActiveItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-950/30'
                        : 'bg-[#121215] border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getTypeBadgeColor(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.updatedAt}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold mt-2 ${
                        isSelected ? 'text-blue-300' : 'text-zinc-200'
                      }`}
                    >
                      {item.title}
                    </h4>

                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Full Document Reader View */}
          <div className="lg:col-span-7">
            {currentActiveItem ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#121215] border border-zinc-800/90 shadow-2xl space-y-6 sticky top-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getTypeBadgeColor(
                          currentActiveItem.type
                        )}`}
                      >
                        {currentActiveItem.type}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Atualizado em {currentActiveItem.updatedAt}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {currentActiveItem.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyContent(currentActiveItem)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                      title="Copiar Conteúdo"
                    >
                      {copiedId === currentActiveItem.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(currentActiveItem)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          id: currentActiveItem.id,
                          title: currentActiveItem.title,
                        })
                      }
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 text-xs transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Document Tags */}
                {currentActiveItem.tags && currentActiveItem.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-zinc-500" />
                    {currentActiveItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Formatted Content Viewer */}
                <div className="bg-zinc-950/70 p-5 sm:p-6 rounded-xl border border-zinc-800/80 font-mono text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto select-text shadow-inner">
                  {currentActiveItem.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 px-4 rounded-2xl bg-[#121215] border border-zinc-800 text-zinc-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                <p>Seleciona um documento da lista para visualizar os detalhes.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Document */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#16161a]">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Library className="w-5 h-5 text-blue-400" />
                {editingItem ? 'Editar Documento' : 'Novo Documento da Biblioteca'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Título do Documento *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tabela de EQ para Baterias de Drill, Checklist de Master..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tipo de Conteúdo
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: eq, master, vocal, compressor"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Conteúdo / Instruções / Valores *
                </label>
                <textarea
                  rows={10}
                  placeholder="Digita aqui o procedimento passo a passo, tabela de frequências, notas de routing na DAW..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 font-mono text-xs focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {editingItem ? 'Salvar Alterações' : 'Adicionar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Eliminar Documento"
        message={`Tens a certeza que queres eliminar o documento "${deleteConfirm?.title}" da tua biblioteca?`}
        confirmText="Eliminar Documento"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (deleteConfirm) {
            await onDeleteItem(deleteConfirm.id);
            showToast('Documento eliminado da biblioteca', 'info');
            setDeleteConfirm(null);
          }
        }}
        onClose={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
