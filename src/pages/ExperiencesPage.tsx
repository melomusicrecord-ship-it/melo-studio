import { useState, useMemo, FormEvent } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  Star,
  Trash2,
  Edit3,
  Copy,
  Check,
  Plug,
  FolderKanban,
  GitMerge,
  Calendar,
  Sparkles,
  Award,
  Filter,
} from 'lucide-react';
import { Experience, Project, ProcessingChain, PluginItem } from '../types';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface ExperiencesPageProps {
  experiences: Experience[];
  projects: Project[];
  chains: ProcessingChain[];
  plugins: PluginItem[];
  subFilter?: string;
  onSaveExperience: (exp: Experience) => Promise<void>;
  onDeleteExperience: (id: string) => Promise<void>;
}

export function ExperiencesPage({
  experiences,
  projects,
  chains,
  plugins,
  subFilter = 'all',
  onSaveExperience,
  onDeleteExperience,
}: ExperiencesPageProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formProjectId, setFormProjectId] = useState('');
  const [formProjectName, setFormProjectName] = useState('');
  const [formChainId, setFormChainId] = useState('');
  const [formChainName, setFormChainName] = useState('');
  const [formPluginName, setFormPluginName] = useState('');
  const [formProblem, setFormProblem] = useState('');
  const [formSolution, setFormSolution] = useState('');
  const [formResult, setFormResult] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formNotes, setFormNotes] = useState('');

  // Handle opening modal for new or edit
  const handleOpenCreateModal = () => {
    setEditingExp(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormProjectId('');
    setFormProjectName('');
    setFormChainId('');
    setFormChainName('');
    setFormPluginName('');
    setFormProblem('');
    setFormSolution('');
    setFormResult('');
    setFormRating(5);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exp: Experience) => {
    setEditingExp(exp);
    setFormDate(exp.date || new Date().toISOString().split('T')[0]);
    setFormProjectId(exp.projectId || '');
    setFormProjectName(exp.projectName || '');
    setFormChainId(exp.chainId || '');
    setFormChainName(exp.chainName || '');
    setFormPluginName(exp.pluginName || '');
    setFormProblem(exp.problem || '');
    setFormSolution(exp.solution || '');
    setFormResult(exp.result || '');
    setFormRating(exp.rating || 5);
    setFormNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  // Save experience
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formProblem.trim() || !formSolution.trim()) {
      showToast('Preenche pelo menos o problema e a solução testada.', 'warning');
      return;
    }

    const expData: Experience = {
      id: editingExp ? editingExp.id : 'exp-' + Date.now(),
      date: formDate,
      projectId: formProjectId || undefined,
      projectName: formProjectName.trim() || undefined,
      chainId: formChainId || undefined,
      chainName: formChainName.trim() || undefined,
      pluginName: formPluginName.trim() || undefined,
      problem: formProblem.trim(),
      solution: formSolution.trim(),
      result: formResult.trim() || 'Teste documentado com sucesso.',
      rating: formRating,
      notes: formNotes.trim() || undefined,
    };

    await onSaveExperience(expData);
    setIsModalOpen(false);
    showToast(editingExp ? 'Experiência atualizada!' : 'Experiência registrada no laboratório!', 'success');
  };

  // Copy summary
  const handleCopySummary = (exp: Experience) => {
    const text = `🧪 EXPERIÊNCIA DE ESTÚDIO [${exp.date}]\n` +
      (exp.projectName ? `📁 Projeto: ${exp.projectName}\n` : '') +
      (exp.chainName ? `🎛️ Cadeia: ${exp.chainName}\n` : '') +
      (exp.pluginName ? `🔌 Plugin(s): ${exp.pluginName}\n` : '') +
      `⭐ Avaliação: ${'★'.repeat(exp.rating)}${'☆'.repeat(5 - exp.rating)} (${exp.rating}/5)\n\n` +
      `🔴 PROBLEMA:\n${exp.problem}\n\n` +
      `🟢 SOLUÇÃO:\n${exp.solution}\n\n` +
      `🔵 RESULTADO:\n${exp.result}\n` +
      (exp.notes ? `\n💡 NOTAS / REGRA DE OURO:\n${exp.notes}\n` : '');

    navigator.clipboard.writeText(text);
    setCopiedId(exp.id);
    showToast('Resumo copiado para a área de transferência!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered experiences
  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      // Subnav filter
      if (subFilter === 'rating-5' && exp.rating < 5) return false;
      if (subFilter === 'vocal' && !exp.problem.toLowerCase().includes('vocal') && !exp.chainName?.toLowerCase().includes('vocal') && !exp.solution.toLowerCase().includes('vocal')) return false;
      if (subFilter === 'mix' && !exp.problem.toLowerCase().includes('mix') && !exp.chainName?.toLowerCase().includes('mix') && !exp.solution.toLowerCase().includes('master')) return false;
      if (subFilter === 'plugins' && !exp.pluginName) return false;

      // Rating filter
      if (ratingFilter !== 'all' && exp.rating < ratingFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesProblem = exp.problem?.toLowerCase().includes(query);
        const matchesSolution = exp.solution?.toLowerCase().includes(query);
        const matchesResult = exp.result?.toLowerCase().includes(query);
        const matchesPlugin = exp.pluginName?.toLowerCase().includes(query);
        const matchesProject = exp.projectName?.toLowerCase().includes(query);
        const matchesChain = exp.chainName?.toLowerCase().includes(query);
        const matchesNotes = exp.notes?.toLowerCase().includes(query);
        return matchesProblem || matchesSolution || matchesResult || matchesPlugin || matchesProject || matchesChain || matchesNotes;
      }

      return true;
    });
  }, [experiences, subFilter, ratingFilter, searchTerm]);

  // Quick stats
  const stats = useMemo(() => {
    const total = experiences.length;
    const goldCount = experiences.filter((e) => e.rating === 5).length;
    const avgRating = total > 0 ? (experiences.reduce((acc, e) => acc + (e.rating || 0), 0) / total).toFixed(1) : '5.0';
    return { total, goldCount, avgRating };
  }, [experiences]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Laboratório de Experiências
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Regista testes A/B, shootouts de microfones, combinações de plugins e soluções sonoras testadas
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-new-experience"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Experiência</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
          <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Total de Testes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{stats.total}</span>
            <span className="text-xs text-zinc-500">experimentos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
          <span className="text-xs text-amber-400 font-medium uppercase tracking-wider block">Fórmulas 5 Estrelas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400">{stats.goldCount}</span>
            <span className="text-xs text-amber-500/70">aprovadas</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
          <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Média de Eficácia</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{stats.avgRating}</span>
            <span className="text-xs text-zinc-500">/ 5.0</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
          <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Foco Científico</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-semibold text-emerald-400">Método de Produção</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#121215] border border-zinc-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar problema, plugin, projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1 shrink-0 ml-1">
            <Filter className="w-3.5 h-3.5" />
            Classificação:
          </span>
          <button
            onClick={() => setRatingFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              ratingFilter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setRatingFilter(5)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 ${
              ratingFilter === 5
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>5 Estrelas</span>
          </button>
          <button
            onClick={() => setRatingFilter(4)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              ratingFilter === 4
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            4+ Estrelas
          </button>
        </div>
      </div>

      {/* Experiences Grid */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-[#121215]/50">
          <FlaskConical className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">Nenhuma experiência encontrada</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Regista o teu primeiro teste A/B para nunca esqueceres as soluções que funcionaram na perfeição.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registar Experiência
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExperiences.map((exp) => (
            <div
              key={exp.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-xl"
            >
              <div className="space-y-4">
                {/* Card Top: Badges, Date & Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {exp.projectName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        <FolderKanban className="w-3 h-3 text-amber-400" />
                        {exp.projectName}
                      </span>
                    )}
                    {exp.chainName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        <GitMerge className="w-3 h-3 text-cyan-400" />
                        {exp.chainName}
                      </span>
                    )}
                    {exp.pluginName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-800/50">
                        <Plug className="w-3 h-3 text-amber-400" />
                        {exp.pluginName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= exp.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Problem Box */}
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30">
                  <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block mb-1">
                    🔴 Problema Inicial
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    {exp.problem}
                  </p>
                </div>

                {/* Solution Box */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                    🟢 Solução / Teste Aplicado
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    {exp.solution}
                  </p>
                </div>

                {/* Result Box */}
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/30">
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                    🔵 Resultado Sonoro
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    {exp.result}
                  </p>
                </div>

                {/* Notes / Golden Rule */}
                {exp.notes && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30">
                    <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3" />
                      Regra de Ouro / Aprendizado
                    </span>
                    <p className="text-xs text-zinc-300 italic">
                      "{exp.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800/80">
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {exp.date}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopySummary(exp)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Copiar Resumo"
                  >
                    {copiedId === exp.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(exp)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(exp.id)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Experience */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#16161a]">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-400" />
                {editingExp ? 'Editar Experiência de Estúdio' : 'Registar Nova Experiência'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Data do Teste
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Eficácia / Avaliação ({formRating}/5)
                  </label>
                  <div className="flex items-center gap-1 py-1.5 px-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="cursor-pointer p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= formRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Projeto Relacionado (Opcional)
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setFormProjectId(id);
                      const proj = projects.find((p) => p.id === id);
                      if (proj) setFormProjectName(proj.name);
                    }}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Nenhum / Teste Geral</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Cadeia Associada (Opcional)
                  </label>
                  <select
                    value={formChainId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setFormChainId(id);
                      const ch = chains.find((c) => c.id === id);
                      if (ch) setFormChainName(ch.name);
                    }}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Nenhuma / Sem cadeia</option>
                    {chains.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Plugin(s) ou Equipamento Testado
                </label>
                <input
                  type="text"
                  placeholder="Ex: Decapitator + CLA-2A, Shure SM7B vs Neumann U87"
                  value={formPluginName}
                  onChange={(e) => setFormPluginName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Problema Sonoro Identificado *
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: O vocal soava fino e sumia no refrão quando o beat entrava com os 808s..."
                  value={formProblem}
                  onChange={(e) => setFormProblem(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Solução / Teste Aplicado *
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Coloquei compressão paralela no barramento com ataque rápido e saturei suavemente em 3kHz..."
                  value={formSolution}
                  onChange={(e) => setFormSolution(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Resultado Auditivo Obtido
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: A voz saltou para a frente da mix sem soar agressiva aos ouvidos..."
                  value={formResult}
                  onChange={(e) => setFormResult(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Regra de Ouro / Notas de Aprendizado
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Em Kizomba, usar sempre saturação suave antes do limiter para colar com o beat..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-500 resize-none"
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingExp ? 'Salvar Alterações' : 'Registar Experiência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Eliminar Experiência"
        message="Tens a certeza que queres eliminar este teste do teu laboratório de estúdio? Esta ação não pode ser desfeita."
        confirmText="Eliminar Experiência"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (deleteConfirmId) {
            await onDeleteExperience(deleteConfirmId);
            showToast('Experiência eliminada', 'info');
            setDeleteConfirmId(null);
          }
        }}
        onClose={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
