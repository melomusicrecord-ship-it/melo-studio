import { useState, useRef, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  HardDrive,
  Monitor,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Cpu,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface OfflineStatusIndicatorProps {
  onOpenInstallModal: () => void;
}

export function OfflineStatusIndicator({ onOpenInstallModal }: OfflineStatusIndicatorProps) {
  const {
    isOnline,
    actualOnline,
    isForcedOffline,
    toggleOfflineMode,
    isReadyForOffline,
    isServiceWorkerActive,
    cachedAssetsCount,
    isSyncingCache,
    syncOfflineCache,
    isInstalled,
  } = usePWA();

  const [isOpen, setIsOpen] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleManualSync = async () => {
    await syncOfflineCache();
    setSyncSuccessMsg(true);
    setTimeout(() => setSyncSuccessMsg(false), 3500);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Status Pill / Indicator Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border shadow-sm ${
          isOnline
            ? 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-950/60 hover:bg-amber-900/70 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/20'
        }`}
        title="Status do Sistema e Modo Offline (Clique para gerenciar)"
      >
        {/* Pulsing visual dot indicator */}
        <span className="relative flex h-2 w-2 shrink-0">
          {isOnline ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </>
          )}
        </span>

        {/* Text description */}
        <span className="hidden sm:inline font-semibold">
          {isForcedOffline
            ? 'Modo Offline Forçado'
            : !actualOnline
            ? 'Modo Offline (Sem Rede)'
            : 'Online • Pronto Offline'}
        </span>

        <span className="sm:hidden font-semibold">
          {isOnline ? 'Online' : 'Offline'}
        </span>

        <ChevronDown
          className={`w-3 h-3 transition-transform text-zinc-400 group-hover:text-zinc-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-[#121216] border border-zinc-700/80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-xs tracking-wide">
                Diagnóstico & Modo Offline
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isOnline
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}
            >
              {isForcedOffline ? 'Offline Manual' : isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Interactive Offline Toggle Switch */}
          <div className="my-3 p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 flex items-center justify-between gap-3 shadow-inner">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                {isForcedOffline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Forçar / Testar Modo Offline</span>
              </p>
              <p className="text-[10px] text-zinc-400 leading-tight">
                {isForcedOffline
                  ? 'O estúdio está operando 100% com dados e base locais.'
                  : 'Ative para rodar o app sem usar nenhuma conexão de rede.'}
              </p>
            </div>

            <button
              onClick={() => toggleOfflineMode()}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isForcedOffline ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
              title={isForcedOffline ? 'Desativar Modo Offline' : 'Ativar Modo Offline'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                  isForcedOffline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Diagnostics list */}
          <div className="py-1 space-y-2 text-zinc-300">
            {/* Service Worker Status */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <Cpu className={`w-4 h-4 mt-0.5 shrink-0 ${isServiceWorkerActive ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-white">
                    Service Worker (Cache Offline)
                  </p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isServiceWorkerActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                    {isServiceWorkerActive ? 'Ativo e Operacional' : 'Registrado'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Interceta requisições e serve os arquivos do disco mesmo sem sinal de internet.
                </p>
              </div>
            </div>

            {/* IndexedDB Local Storage */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <HardDrive className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-white">
                  Armazenamento Local (IndexedDB)
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Projetos, cadeias, diário e biblioteca ficam salvos no teu aparelho com zero perda de dados.
                </p>
              </div>
            </div>

            {/* Cache Storage info & Sync button */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-white">
                    Recursos em Disco
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {cachedAssetsCount > 0
                      ? `${cachedAssetsCount} arquivos em cache permanente`
                      : 'App Shell salvo no navegador'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleManualSync}
                disabled={isSyncingCache}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold flex items-center gap-1 transition-colors active:scale-95 shrink-0"
                title="Garante que todo o código e estilos estejam baixados no cache"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingCache ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isSyncingCache ? 'Salvando...' : 'Sincronizar'}</span>
              </button>
            </div>

            {syncSuccessMsg && (
              <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium text-center animate-in fade-in">
                ✓ Cache offline sincronizado com sucesso no navegador!
              </div>
            )}
          </div>

          {/* Footer / PC Install Link */}
          <div className="pt-3 mt-2 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] text-zinc-400">
              {isInstalled ? 'App Desktop Instalado' : 'Instalação nativa PC/Mac'}
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenInstallModal();
              }}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isInstalled ? 'Ver Atalhos' : 'Instalar no PC'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

