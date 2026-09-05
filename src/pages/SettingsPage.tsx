import { useState, type FormEvent, type ChangeEvent } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  HardDrive,
  ShieldCheck,
  Check,
  Sliders,
  Sparkles,
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { StudioSettings } from '../types';
import { studioDB } from '../services/db';
import { useToast } from '../components/Toast';
import { usePWA } from '../hooks/usePWA';
import { ConfirmModal } from '../components/ConfirmModal';

interface SettingsPageProps {
  settings: StudioSettings;
  onSaveSettings: (settings: StudioSettings) => Promise<void>;
  onReloadAllData: () => Promise<void>;
  onOpenInstallModal?: () => void;
}

export function SettingsPage({
  settings,
  onSaveSettings,
  onReloadAllData,
  onOpenInstallModal,
}: SettingsPageProps) {
  const { showToast } = useToast();
  const {
    isOnline,
    actualOnline,
    isForcedOffline,
    toggleOfflineMode,
    isInstalled,
    isServiceWorkerActive,
    cachedAssetsCount,
    isSyncingCache,
    syncOfflineCache,
  } = usePWA();
  const [producerName, setProducerName] = useState(settings.producerName || 'Melo');
  const [studioName, setStudioName] = useState(settings.studioName || 'MELO STUDIO HUB');
  const [mainDaw, setMainDaw] = useState(settings.mainDaw || 'FL Studio');
  const [favoriteStyles, setFavoriteStyles] = useState(
    (settings.favoriteStyles || []).join(', ')
  );
  const [useOnlyOwned, setUseOnlyOwned] = useState(
    settings.useOnlyOwnedPlugins || false
  );
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const updated: StudioSettings = {
      ...settings,
      producerName: producerName.trim() || 'Melo',
      studioName: studioName.trim() || 'MELO STUDIO HUB',
      mainDaw,
      favoriteStyles: favoriteStyles.split(',').map((s) => s.trim()).filter(Boolean),
      useOnlyOwnedPlugins: useOnlyOwned,
    };
    await onSaveSettings(updated);
    showToast('Configurações do estúdio salvas!', 'success');
  };

  // Export JSON backup
  const handleExportBackup = async () => {
    try {
      const jsonString = await studioDB.exportFullBackup();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MELO_STUDIO_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      showToast('Backup completo baixado com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao gerar backup', 'error');
    }
  };

  // Import JSON backup
  const handleImportBackup = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const content = ev.target?.result as string;
        await studioDB.importFullBackup(content);
        await onReloadAllData();
        showToast('Backup restaurado com sucesso!', 'success');
      } catch (err) {
        showToast('Arquivo de backup inválido', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset to factory demo
  const handleResetFactory = () => {
    setIsResetConfirmOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121215] border border-zinc-800/90 shadow-xl space-y-5">
        <div className="border-b border-zinc-800 pb-4">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Perfil & Configurações do Produtor</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Personaliza as informações do teu estúdio e DAW principal.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Nome do Produtor / Engenheiro
              </label>
              <input
                type="text"
                value={producerName}
                onChange={(e) => setProducerName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Nome do Estúdio
              </label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                DAW Principal
              </label>
              <select
                value={mainDaw}
                onChange={(e) => setMainDaw(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="FL Studio">FL Studio</option>
                <option value="Studio One">Studio One</option>
                <option value="Ableton Live">Ableton Live</option>
                <option value="Logic Pro">Logic Pro</option>
                <option value="Reaper">Reaper</option>
                <option value="Pro Tools">Pro Tools</option>
                <option value="Cubase">Cubase</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Gêneros Principais (separados por vírgula)
              </label>
              <input
                type="text"
                value={favoriteStyles}
                onChange={(e) => setFavoriteStyles(e.target.value)}
                placeholder="Afrobeat, Kizomba, Trap, R&B"
                className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={useOnlyOwned}
                onChange={(e) => setUseOnlyOwned(e.target.checked)}
                className="accent-amber-500"
              />
              <span>Ativar filtro "Usar apenas meus plugins" por padrão no Guia de Chains</span>
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg active:scale-95 transition-all"
            >
              Salvar Preferências
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Persistence Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121215] border border-zinc-800/90 shadow-xl space-y-4">
        <div className="border-b border-zinc-800 pb-3">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <span>Armazenamento & Segurança de Dados</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            O MELO STUDIO HUB opera com persistência local de alto rendimento (IndexedDB) no teu navegador. Não precisas de internet para trabalhar no estúdio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          {/* Export */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-200 transition-all group active:scale-95 text-center"
          >
            <Download className="w-5 h-5 text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
            <span className="font-bold">Baixar Backup (JSON)</span>
            <span className="text-[11px] text-zinc-500">Salva todos os projetos, chains e notas</span>
          </button>

          {/* Import */}
          <label className="p-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-200 transition-all group active:scale-95 text-center cursor-pointer">
            <Upload className="w-5 h-5 text-sky-400 group-hover:-translate-y-0.5 transition-transform" />
            <span className="font-bold">Restaurar Backup</span>
            <span className="text-[11px] text-zinc-500">Importar arquivo .JSON anterior</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          {/* Reset Demo */}
          <button
            onClick={handleResetFactory}
            className="p-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-200 transition-all group active:scale-95 text-center"
          >
            <RotateCcw className="w-5 h-5 text-rose-400 group-hover:rotate-45 transition-transform" />
            <span className="font-bold">Dados de Demonstração</span>
            <span className="text-[11px] text-zinc-500">Restaurar cadeias e exemplos de fábrica</span>
          </button>
        </div>
      </div>

      {/* PC Installation & 100% Offline Mode Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121215] border border-zinc-800/90 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-amber-400" />
              <span>Gerenciamento do Modo Offline & PC</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              O MELO STUDIO HUB foi projetado para operar 100% desconectado da internet, mantendo todos os dados no teu disco local.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isForcedOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Offline Forçado (Manual)</span>
                </>
              ) : isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Online (Pronto Offline)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Offline (Sem Conexão)</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Offline Switch & Cache Sync Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Toggle Offline Mode Card */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                {isForcedOffline ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
                <span>Alternar / Forçar Modo Offline</span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {isForcedOffline
                  ? 'Desative para permitir conexão com serviços online.'
                  : 'Ative para testar e usar o estúdio sem nenhuma rede externa.'}
              </p>
            </div>

            <button
              onClick={() => {
                toggleOfflineMode();
                showToast(
                  !isForcedOffline
                    ? 'Modo 100% Offline ativado no estúdio!'
                    : 'Modo Online reestabelecido!',
                  'info'
                );
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isForcedOffline ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
              title={isForcedOffline ? 'Desativar modo offline' : 'Ativar modo offline'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                  isForcedOffline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sync Offline Cache */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-sky-400" />
                <span>Cache de Recursos em Disco</span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {cachedAssetsCount > 0
                  ? `${cachedAssetsCount} arquivos pré-carregados no disco`
                  : 'App Shell salvo no Service Worker'}
              </p>
            </div>

            <button
              onClick={async () => {
                await syncOfflineCache();
                showToast('Recursos offline sincronizados no navegador!', 'success');
              }}
              disabled={isSyncingCache}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCache ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isSyncingCache ? 'Sincronizando...' : 'Sincronizar Cache'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-200">
              {isInstalled
                ? 'Aplicativo já instalado no teu computador'
                : 'Instalação rápida no Windows, Mac ou Linux'}
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xl">
              Permite produzir, gravar notas de mixagem e consultar guias de plugins sem conexão à internet, com atalho na Área de Trabalho e desempenho máximo.
            </p>
          </div>

          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 shadow-md"
            >
              <Monitor className="w-4 h-4" />
              <span>{isInstalled ? 'Ver Detalhes do App' : 'Instalar no PC Agora'}</span>
            </button>
          )}
        </div>
      </div>
      {/* Confirm Reset Factory Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Restaurar Dados de Fábrica"
        message="Tens a certeza que queres restaurar os dados de demonstração de fábrica? Todas as cadeias, plugins e projetos padrão serão recarregados na base de dados."
        confirmText="Restaurar Fábrica"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={async () => {
          await studioDB.resetToFactoryData();
          await onReloadAllData();
          showToast('Dados de fábrica restaurados com sucesso!', 'info');
          setIsResetConfirmOpen(false);
        }}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
