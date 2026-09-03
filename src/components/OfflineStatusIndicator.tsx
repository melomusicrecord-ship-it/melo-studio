import { useState, useRef, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  HardDrive,
  Monitor,
  ChevronDown,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface OfflineStatusIndicatorProps {
  onOpenInstallModal: () => void;
}

export function OfflineStatusIndicator({ onOpenInstallModal }: OfflineStatusIndicatorProps) {
  const { isOnline, isReadyForOffline, isInstalled, isInstallable } = usePWA();
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Subtle Status Pill / Indicator Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
          isOnline
            ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/30 text-amber-300'
        }`}
        title="Status do Sistema e Modo Offline (Clique para detalhes)"
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
        <span className="hidden sm:inline font-medium">
          {isReadyForOffline
            ? isOnline
              ? 'Online • Pronto Offline'
              : 'Modo Offline Ativo'
            : 'Carregando Sistema...'}
        </span>

        <span className="sm:hidden font-medium">
          {isOnline ? 'Pronto' : 'Offline'}
        </span>

        <ChevronDown
          className={`w-3 h-3 transition-transform text-zinc-400 group-hover:text-zinc-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#121215] border border-zinc-750 rounded-xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-xs">Status do Studio Hub</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Diagnostics items */}
          <div className="py-2.5 space-y-2 text-zinc-300">
            {/* Network check using navigator.onLine */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-[11px] font-semibold text-white">
                  Conexão de Rede (navigator.onLine)
                </p>
                <p className="text-[10px] text-zinc-400">
                  {isOnline
                    ? 'Conectado à internet. Sincronização local pronta.'
                    : 'Sem conexão. O app está operando normalmente offline.'}
                </p>
              </div>
            </div>

            {/* Offline Readiness Check */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-white">
                  Estado de Carregamento
                </p>
                <p className="text-[10px] text-zinc-400">
                  {isReadyForOffline
                    ? 'Aplicação 100% carregada em cache e pronta para uso sem rede.'
                    : 'Inicializando componentes do estúdio...'}
                </p>
              </div>
            </div>

            {/* Storage Check */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
              <HardDrive className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-white">
                  Banco Local (IndexedDB)
                </p>
                <p className="text-[10px] text-zinc-400">
                  Projetos, cadeias de plugins e notas são gravados no disco local do teu aparelho.
                </p>
              </div>
            </div>
          </div>

          {/* Footer / PC Install Link */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] text-zinc-400">
              {isInstalled ? 'App instalado como desktop' : 'Disponível para instalar no PC'}
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenInstallModal();
              }}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
            >
              <Monitor className="w-3 h-3" />
              <span>{isInstalled ? 'Ver App PC' : 'Instalar no PC'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
