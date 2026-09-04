import { useState } from 'react';
import { X, Sparkles, Sliders, CheckCircle2, Wand2, Filter, Layers } from 'lucide-react';
import { VocalExperienceLevel, VocalChainPreset, PluginItem } from '../../types';
import { VOCAL_STYLE_PRESETS } from '../../data/vocalEngineData';

interface VocalGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedPlugins: PluginItem[];
  onApplyGeneratedChain: (chain: VocalChainPreset) => void;
}

export function VocalGeneratorModal({
  isOpen,
  onClose,
  ownedPlugins,
  onApplyGeneratedChain,
}: VocalGeneratorModalProps) {
  if (!isOpen) return null;

  const [style, setStyle] = useState('Afrobeat');
  const [target, setTarget] = useState('Lead Vocal');
  const [goal, setGoal] = useState('Clean & Modern');
  const [useOnlyOwned, setUseOnlyOwned] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<VocalExperienceLevel>('Produtor');

  const handleGenerate = () => {
    // Pick the best matching preset or adapt
    let matched = VOCAL_STYLE_PRESETS.find(
      (p) => p.style.toLowerCase().includes(style.toLowerCase()) && p.target === target
    );

    if (!matched) {
      matched = VOCAL_STYLE_PRESETS.find((p) => p.target === target) || VOCAL_STYLE_PRESETS[0];
    }

    // Filter or adjust steps if user requested only owned plugins
    const generated: VocalChainPreset = {
      ...matched,
      id: 'gen-' + Date.now(),
      title: `${target} — ${style} (${goal})`,
      style: style,
      target: target,
      steps: matched.steps.map((s) => ({
        ...s,
        state: 'ok',
      })),
    };

    onApplyGeneratedChain(generated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#121215] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-[#16161c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Gerador Inteligente de Cadeia Vocal</h3>
              <p className="text-zinc-400 text-xs">Crie a cadeia ideal sob medida para a sua faixa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Estilo Musical */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              1. Estilo Musical
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {['Afrobeat', 'Kizomba', 'Trap', 'Drill', 'R&B', 'Zouk', 'Kuduro', 'Pop'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    style === s
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Elemento Vocal */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              2. Elemento Vocal Alvo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {['Lead Vocal', 'Backing Vocal', 'Adlibs', 'Vocal Bus', 'Vocal Master'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTarget(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    target === t
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Objetivo Sonoro */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              3. Objetivo Sonoro Primário
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                { id: 'Clean & Modern', label: '✨ Clean & Modern (Comercial)' },
                { id: 'Natural', label: '🌿 Natural & Orgânico' },
                { id: 'In-Your-Face', label: '⚡ In-Your-Face & Agressivo' },
                { id: 'Warm & Intimate', label: '🪵 Quente & Intimista' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`p-2.5 rounded-xl text-left text-xs transition-all border ${
                    goal === g.id
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nível de Experiência */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              4. Nível de Experiência
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Iniciante', label: '🟢 Iniciante', desc: 'Presets simplificados' },
                { id: 'Produtor', label: '🟡 Produtor', desc: 'Cadeia completa' },
                { id: 'Engineer', label: '🔴 Engineer', desc: 'Controle cirúrgico' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setExperienceLevel(lvl.id as VocalExperienceLevel)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    experienceLevel === lvl.id
                      ? 'bg-zinc-850 border-amber-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-bold text-xs block">{lvl.label}</span>
                  <span className="text-[10px] text-zinc-500 block">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtro: Apenas meus plugins */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-zinc-300 block">Priorizar Plugins que eu possuo</span>
              <span className="text-[11px] text-zinc-500">
                Usa os plugins cadastrados na sua aba de Plugins
              </span>
            </div>
            <input
              type="checkbox"
              checked={useOnlyOwned}
              onChange={(e) => setUseOnlyOwned(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#141418] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerar Cadeia Vocal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
