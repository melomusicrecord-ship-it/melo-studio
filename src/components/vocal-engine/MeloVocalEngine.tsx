import { useState } from 'react';
import {
  Mic,
  Sparkles,
  Sliders,
  Wand2,
  BookOpen,
  Activity,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  ChevronDown,
  RefreshCw,
  FolderKanban,
  Download,
  Upload,
  Check,
} from 'lucide-react';
import {
  VocalChainPreset,
  VocalExperienceLevel,
  PluginItem,
  Project,
} from '../../types';
import {
  VOCAL_STYLE_PRESETS,
  VOCAL_FLOW_STEPS,
  PLUGIN_KNOWLEDGE_BASE,
} from '../../data/vocalEngineData';
import { VocalChainVisualizer } from './VocalChainVisualizer';
import { VocalDiagnosisView } from './VocalDiagnosisView';
import { VocalFrequencyMap } from './VocalFrequencyMap';
import { VocalFlowGuide } from './VocalFlowGuide';
import { VocalFinalChecklistModal } from './VocalFinalChecklistModal';
import { PluginDetailModal } from './PluginDetailModal';
import { VocalGeneratorModal } from './VocalGeneratorModal';
import { useToast } from '../Toast';

interface MeloVocalEngineProps {
  plugins: PluginItem[];
  projects?: Project[];
  onAssociateWithProject?: (projectId: string, chainTarget: string, chainTitle: string) => Promise<void>;
}

export function MeloVocalEngine({
  plugins,
  projects = [],
  onAssociateWithProject,
}: MeloVocalEngineProps) {
  const { showToast } = useToast();

  // Engine Active Sub-View Tab
  const [activeTab, setActiveTab] = useState<
    'chain' | 'flow' | 'diagnosis' | 'frequency' | 'plugins' | 'checklist'
  >('chain');

  // Active Chain Preset
  const [activePreset, setActivePreset] = useState<VocalChainPreset>(VOCAL_STYLE_PRESETS[0]);
  const [experienceLevel, setExperienceLevel] = useState<VocalExperienceLevel>('Produtor');

  // Modals
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedPluginForModal, setSelectedPluginForModal] = useState<string | null>(null);
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [targetType, setTargetType] = useState<string>('leadVocal');

  // Plugin library filter in plugins tab
  const [pluginSearchTerm, setPluginSearchTerm] = useState('');
  const [pluginManufacturerFilter, setPluginManufacturerFilter] = useState('all');

  const filteredPluginKnowledge = PLUGIN_KNOWLEDGE_BASE.filter((p) => {
    const matchesSearch =
      p.pluginName.toLowerCase().includes(pluginSearchTerm.toLowerCase()) ||
      p.whatItDoes.toLowerCase().includes(pluginSearchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(pluginSearchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (pluginManufacturerFilter === 'all') return true;
    return p.manufacturer.toLowerCase() === pluginManufacturerFilter.toLowerCase();
  });

  const handleApplySolutionFromDiagnosis = (problem: any) => {
    showToast(`Solução carregada para a cadeia: ${problem.title}`, 'success');
    setActiveTab('chain');
  };

  const handleAssociateProject = async () => {
    if (!selectedProjectId || !onAssociateWithProject) return;
    try {
      await onAssociateWithProject(selectedProjectId, targetType, activePreset.title);
      showToast(`Cadeia "${activePreset.title}" associada ao projeto com sucesso!`, 'success');
      setIsAssociateModalOpen(false);
    } catch (e) {
      showToast('Erro ao associar cadeia ao projeto', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Masthead */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#141419] to-zinc-950 border border-amber-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Melo Studio Hub • Vocal Processing System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>🎙️ MELO VOCAL ENGINE</span>
            </h1>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Orientação profissional em mixagem, tratamento, dinâmica e masterização vocal. 
              Domine cadeias completas com Waves e FabFilter, entendendo o porquê acústico de cada inserção.
            </p>
          </div>

          {/* Quick Actions & Experience Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Experience Level Selector */}
            <div className="p-1 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-1">
              {(['Iniciante', 'Produtor', 'Engineer'] as VocalExperienceLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setExperienceLevel(lvl)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    experienceLevel === lvl
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {lvl === 'Iniciante' && '🟢 '}
                  {lvl === 'Produtor' && '🟡 '}
                  {lvl === 'Engineer' && '🔴 '}
                  {lvl}
                </button>
              ))}
            </div>

            {/* Smart Generator Button */}
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Wand2 className="w-4 h-4" />
              <span>Gerar Cadeia</span>
            </button>

            {/* Associate with Project Button */}
            {projects.length > 0 && onAssociateWithProject && (
              <button
                onClick={() => setIsAssociateModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <FolderKanban className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Vincular a Projeto</span>
              </button>
            )}
          </div>
        </div>

        {/* Preset Selector Strip (Quick Styles) */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-zinc-400 uppercase font-mono shrink-0 mr-1">
            Estilos:
          </span>
          {VOCAL_STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setActivePreset(preset);
                setActiveTab('chain');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activePreset.id === preset.id
                  ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
              }`}
            >
              {preset.title.split('—')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-800 scrollbar-thin">
        {[
          { id: 'chain', label: '🎛️ Cadeia Ativa', desc: activePreset.title },
          { id: 'flow', label: '📚 16 Etapas do Vocal', desc: 'Guia definitivo' },
          { id: 'diagnosis', label: '🎯 Diagnóstico Vocal', desc: '22 problemas reais' },
          { id: 'frequency', label: '📊 Mapa de Frequências', desc: '20Hz a 20kHz' },
          { id: 'plugins', label: '📖 Banco de Plugins', desc: 'Waves & FabFilter' },
          { id: 'checklist', label: '✅ Check Final & Master', desc: 'Auditoria técnica' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 rounded-t-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 flex flex-col items-start ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-400 bg-zinc-900/50'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] text-zinc-500 font-normal">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Active Tab View Content */}
      {activeTab === 'chain' && (
        <VocalChainVisualizer
          chain={activePreset}
          experienceLevel={experienceLevel}
          onOpenPluginModal={(name) => setSelectedPluginForModal(name)}
          onSaveChain={() => showToast('Cadeia salva no seu perfil local!', 'success')}
        />
      )}

      {activeTab === 'flow' && (
        <VocalFlowGuide
          onOpenPluginModal={(name) => setSelectedPluginForModal(name)}
        />
      )}

      {activeTab === 'diagnosis' && (
        <VocalDiagnosisView
          onSelectSolution={handleApplySolutionFromDiagnosis}
          onOpenPluginModal={(name) => setSelectedPluginForModal(name)}
        />
      )}

      {activeTab === 'frequency' && (
        <VocalFrequencyMap />
      )}

      {activeTab === 'checklist' && (
        <VocalFinalChecklistModal />
      )}

      {activeTab === 'plugins' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-2xl bg-[#121216] border border-zinc-800 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Base de Conhecimento Técnico • FabFilter, Waves & Clássicos</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              📖 Enciclopédia de Plugins Vocais
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-3xl">
              Aprenda o propósito exato, dosagens recomendadas, perigos de sobreprocessamento e alternativas para cada processador.
            </p>

            {/* Search and Manufacturer filter */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pluginSearchTerm}
                  onChange={(e) => setPluginSearchTerm(e.target.value)}
                  placeholder="Pesquisar plugin (ex: Pro-Q 3, CLA-76, R-Vox, Saturn 2, H-Delay)..."
                  className="w-full bg-zinc-950 border border-zinc-750 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['all', 'FabFilter', 'Waves', 'Soundtoys', 'Valhalla DSP'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPluginManufacturerFilter(m)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                      pluginManufacturerFilter === m
                        ? 'bg-amber-500 text-black border-amber-400 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {m === 'all' ? 'Todos os Fabricantes' : m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Plugin Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPluginKnowledge.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPluginForModal(item.pluginName)}
                className="p-5 rounded-2xl bg-[#121216] border border-zinc-800 hover:border-amber-500/50 hover:bg-[#15151b] cursor-pointer transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-white text-base tracking-tight">{item.pluginName}</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {item.manufacturer}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">{item.category}</span>

                  <p className="text-zinc-300 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {item.whatItDoes}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 text-[11px]">Ver guia pedagógico completo</span>
                  <span className="text-amber-400 font-bold">Abrir ficha →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generator Modal */}
      <VocalGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        ownedPlugins={plugins}
        onApplyGeneratedChain={(newChain) => {
          setActivePreset(newChain);
          setActiveTab('chain');
          showToast(`Cadeia "${newChain.title}" gerada e carregada!`, 'success');
        }}
      />

      {/* Plugin Knowledge Detail Modal */}
      {selectedPluginForModal && (
        <PluginDetailModal
          pluginName={selectedPluginForModal}
          isOpen={true}
          onClose={() => setSelectedPluginForModal(null)}
        />
      )}

      {/* Modal: Associate with Project */}
      {isAssociateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-800 bg-[#16161c]">
              <h3 className="font-bold text-white text-sm">Vincular Cadeia a um Projeto</h3>
              <p className="text-zinc-400 text-xs">Associe esta cadeia aos canais do seu projeto</p>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Selecione o Projeto
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.artist} - {p.style})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Slot do Projeto
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="leadVocal">Lead Vocal Chain</option>
                  <option value="backingVocal">Backing Vocal Chain</option>
                  <option value="adlibs">Adlib Chain</option>
                  <option value="vocalBus">Vocal Bus Chain</option>
                  <option value="fxChain">FX Sends Chain</option>
                  <option value="masterChain">Master Chain</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
                <span className="font-bold text-amber-400 block mb-1">Cadeia Atual:</span>
                <span className="text-white font-semibold">{activePreset.title}</span>
                <span className="text-zinc-400 block text-[11px] mt-0.5">{activePreset.steps.length} slots de processamento</span>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-[#141418] flex items-center justify-between">
              <button
                onClick={() => setIsAssociateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssociateProject}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
              >
                Confirmar Vínculo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
