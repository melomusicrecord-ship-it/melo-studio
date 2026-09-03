import { useState } from 'react';
import { Sliders, Check, ArrowRight, Sparkles } from 'lucide-react';
import { StudioSettings } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (settings: StudioSettings) => void;
  currentSettings: StudioSettings;
  onClose?: () => void;
}

export function OnboardingModal({
  isOpen,
  onComplete,
  currentSettings,
  onClose,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [studioName, setStudioName] = useState(currentSettings.studioName || 'Melo Studio Hub');
  const [producerName, setProducerName] = useState(currentSettings.producerName || 'Melo');
  const [mainDaw, setMainDaw] = useState(currentSettings.mainDaw || 'FL Studio');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    currentSettings.favoriteStyles.length > 0
      ? currentSettings.favoriteStyles
      : ['Afrobeat', 'Kizomba', 'Trap']
  );

  if (!isOpen) return null;

  const daws = ['FL Studio', 'Studio One', 'Ableton Live', 'Logic Pro', 'Reaper', 'Pro Tools', 'Cubase'];
  const stylesList = [
    'Afrobeat',
    'Afropop',
    'Kizomba',
    'Zouk',
    'Kuduro',
    'Trap',
    'Drill',
    'R&B',
    'Hip-Hop',
    'Afro House',
    'Deep House',
    'Dancehall',
    'Pop',
  ];

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleFinish = () => {
    onComplete({
      ...currentSettings,
      studioName: studioName.trim() || 'Melo Studio Hub',
      producerName: producerName.trim() || 'Melo',
      mainDaw,
      favoriteStyles: selectedStyles,
      onboarded: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#121215] border border-zinc-750 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header banner */}
        <div className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 border-b border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              👋 Bem-vindo ao MELO STUDIO HUB
            </h2>
            <p className="text-xs text-amber-300 font-medium">"O teu estúdio. As tuas ideias. O teu método."</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-6 py-2.5 items-center justify-between text-xs text-zinc-400">
          <span>Passo {step} de 3</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full ${
                  i <= step ? 'bg-amber-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Qual é o nome do teu estúdio?
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="Ex: Melo Studio Hub, SoundLab Lisboa..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Como gostarias de ser chamado?
                </label>
                <input
                  type="text"
                  value={producerName}
                  onChange={(e) => setProducerName(e.target.value)}
                  placeholder="Ex: Melo, Prod. Silva..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Qual é o teu DAW principal de trabalho?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {daws.map((daw) => (
                    <button
                      key={daw}
                      type="button"
                      onClick={() => setMainDaw(daw)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        mainDaw === daw
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {daw}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Quais estilos musicais produzes com mais frequência?
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                  {stylesList.map((style) => {
                    const isSelected = selectedStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-400">
                <span className="font-semibold text-emerald-400 block mb-1">
                  ✓ Tudo 100% Offline & Seguro
                </span>
                Os teus projetos, chains e notas ficam salvos no teu próprio navegador com persistência IndexedDB.
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-2 shadow-lg active:scale-95"
            >
              <span>COMEÇAR NO STUDIO</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
