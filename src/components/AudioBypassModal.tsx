import { useState } from 'react';
import { X, Headphones, Check, Sparkles } from 'lucide-react';
import { useToast } from './Toast';

interface AudioBypassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToExperience?: (data: { before: string; after: string; note: string }) => void;
}

export function AudioBypassModal({
  isOpen,
  onClose,
  onSaveToExperience,
}: AudioBypassModalProps) {
  const { showToast } = useToast();
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A');
  const [beforeText, setBeforeText] = useState('');
  const [afterText, setAfterText] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!beforeText && !afterText) {
      showToast('Preencha ao menos uma observação de Antes ou Depois', 'warning');
      return;
    }
    if (onSaveToExperience) {
      onSaveToExperience({
        before: beforeText,
        after: afterText,
        note: description,
      });
    }
    showToast('Registro de escuta A/B salvo com sucesso!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Registro de Escuta Crítica (A/B)</h3>
              <p className="text-[11px] text-zinc-400">Compare mentalmente o Bypass com ouvidos frescos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
            <span className="font-semibold text-amber-300 block mb-1">👂 Regra de Ouro do Estúdio:</span>
            "O teu ouvido acostuma rápido com volume e brilho falso. Desativa o plugin (Bypass) e certifica-te de que a faixa ficou realmente melhor, e não apenas mais alta."
          </div>

          {/* Toggle Switch */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveSide('A')}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                activeSide === 'A'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm border border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              [ A ] — ANTES (Bypass / Cru)
            </button>
            <button
              onClick={() => setActiveSide('B')}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                activeSide === 'B'
                  ? 'bg-sky-500/20 text-sky-300 shadow-sm border border-sky-500/40'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              [ B ] — DEPOIS (Processado)
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Estado [A] — O que ouves sem o plugin (Bypass)?
              </label>
              <textarea
                value={beforeText}
                onChange={(e) => setBeforeText(e.target.value)}
                placeholder="Ex: O vocal soava distante, com picos dinâmicos que incomodavam no refrão..."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Estado [B] — O que ouves com o plugin ativo?
              </label>
              <textarea
                value={afterText}
                onChange={(e) => setAfterText(e.target.value)}
                placeholder="Ex: O vocal ganhou corpo aveludado e ficou firme na frente do beat sem estourar..."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Conclusão & Decisão
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Manter processamento, mas reduzir o mix wet para 70%."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-800 bg-[#0c0c0e] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar Registro</span>
          </button>
        </div>
      </div>
    </div>
  );
}
