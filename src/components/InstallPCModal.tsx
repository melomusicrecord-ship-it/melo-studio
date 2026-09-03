import { useState } from 'react';
import {
  Monitor,
  CheckCircle2,
  X,
  Wifi,
  WifiOff,
  HardDrive,
  Download,
  Zap,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface InstallPCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallPCModal({ isOpen, onClose }: InstallPCModalProps) {
  const { isOnline, isInstalled, isInstallable, platform, promptInstall } = usePWA();
  const [installing, setInstalling] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    setFeedbackMsg(null);
    const success = await promptInstall();
    setInstalling(false);
    if (success) {
      setFeedbackMsg('Aplicativo instalado com sucesso no seu computador!');
    } else {
      setFeedbackMsg('Siga o passo a passo abaixo para instalar diretamente pelo navegador.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#111114] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-[#16161a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Instalar App no PC (100% Offline)</span>
                {isInstalled && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Instalado
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-400">
                Execute o MELO STUDIO HUB como um programa de desktop no Windows, Mac ou Linux.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-zinc-300">
          {/* Status Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Pronto para uso sem internet
                </p>
                <p className="text-[11px] text-zinc-400">
                  Banco de dados local (IndexedDB) e cache de interface preparados no seu disco.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-[11px] font-medium shrink-0">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300">Rede Ativa</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-300">Modo Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Install Action (if supported by browser) */}
          {isInstallable && !isInstalled && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Instalação Direta com 1 Clique
                  </h3>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    O teu navegador permite instalar o aplicativo agora mesmo.
                  </p>
                </div>
                <button
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{installing ? 'Instalando...' : 'Instalar no Computador'}</span>
                </button>
              </div>

              {feedbackMsg && (
                <p className="text-[11px] text-amber-300 font-medium">{feedbackMsg}</p>
              )}
            </div>
          )}

          {isInstalled && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-300 text-xs">
                  O MELO STUDIO HUB já está instalado neste dispositivo!
                </p>
                <p className="text-[11px] text-emerald-200/80">
                  Podes abri-lo a qualquer momento direto pelo menu Iniciar / Aplicativos sem precisar de navegador ou internet.
                </p>
              </div>
            </div>
          )}

          {/* Benefits of Installing on PC */}
          <div>
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-2.5 text-zinc-400">
              Vantagens no Estúdio de Produção
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>100% Offline</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Não depende de sinal de internet. Grave e consulte chains mesmo em estúdios isolados.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-xs">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Janela Exclusiva</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Abre em janela própria de desktop, sem abas, sem distrações e com atalho na Área de Trabalho.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Gravação Local</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Todos os projetos, sessões e históricos ficam salvos localmente com backup instantâneo em JSON.
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions for Desktop Browsers */}
          <div>
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-2.5 text-zinc-400">
              Como Instalar no Navegador (Windows / Mac / Linux)
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-zinc-200">
                    Pelo ícone na barra de endereços (Google Chrome, Brave ou Edge)
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Olhe para a direita da barra de navegação (onde digita o link do site): clique no ícone de <strong className="text-zinc-200">Monitor com seta</strong> ou <strong className="text-zinc-200">Instalar aplicativo</strong> e confirme.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold text-zinc-200">
                    Pelo menu de opções do navegador
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Clique nos <strong className="text-zinc-200">três pontos (⋮)</strong> no canto superior direito do navegador &gt; clique em <strong className="text-zinc-200">"Instalar MELO STUDIO HUB..."</strong> (ou "Salvar e compartilhar" &gt; "Instalar página como app").
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-semibold text-zinc-200">
                    No macOS (Safari Sonoma ou superior)
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    No menu superior do Mac, clique em <strong className="text-zinc-200">Arquivo &gt; Adicionar ao Dock</strong> para fixar o MELO STUDIO HUB como um app de Mac.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-[#16161a] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Sistema PWA Offline com suporte a atalhos e teclado</span>
          </div>

          <div className="flex items-center gap-2">
            {isInstallable && !isInstalled && (
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar Agora</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
