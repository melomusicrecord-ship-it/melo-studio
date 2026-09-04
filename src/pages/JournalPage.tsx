import { useState, type FormEvent } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  Sparkles,
  Smile,
  Frown,
  CheckCircle2,
  Trash2,
  X,
  Lightbulb,
} from 'lucide-react';
import { JournalEntry, Project } from '../types';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface JournalPageProps {
  journal: JournalEntry[];
  projects: Project[];
  subFilter: string;
  onSaveEntry: (entry: JournalEntry) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

export function JournalPage({
  journal,
  projects,
  subFilter,
  onSaveEntry,
  onDeleteEntry,
}: JournalPageProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formLearned, setFormLearned] = useState('');
  const [formWorkedWell, setFormWorkedWell] = useState('');
  const [formWentWrong, setFormWentWrong] = useState('');
  const [formHowSolved, setFormHowSolved] = useState('');
  const [formNextStep, setFormNextStep] = useState('');
  const [formRestedEars, setFormRestedEars] = useState(true);
  const [formProject, setFormProject] = useState(projects[0]?.name || '');

  const handleSaveForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formLearned.trim()) {
      showToast('Preencha o que aprendeu hoje', 'warning');
      return;
    }

    const newEntry: JournalEntry = {
      id: 'journal-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      learnedToday: formLearned.trim(),
      workedWell: formWorkedWell.trim(),
      whatWorkedWell: formWorkedWell.trim(),
      needsImprovement: formWentWrong.trim(),
      whatWentWrong: formWentWrong.trim(),
      howResolved: formHowSolved.trim(),
      nextStep: formNextStep.trim(),
      restedEars: formRestedEars,
      relatedProject: formProject.trim() || undefined,
    };

    await onSaveEntry(newEntry);
    setIsModalOpen(false);
    setFormLearned('');
    setFormWorkedWell('');
    setFormWentWrong('');
    setFormHowSolved('');
    setFormNextStep('');
    showToast('Anotação registrada no teu diário!', 'success');
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Diário do Produtor Musical</span>
          </h2>
          <p className="text-xs text-zinc-400">
            "Registra o que aprendes, o que deu certo e o que precisas testar amanhã."
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Escrever no Diário</span>
        </button>
      </div>

      {/* List of Entries */}
      <div className="space-y-4">
        {journal.map((entry) => (
          <div
            key={entry.id}
            className="p-5 rounded-xl bg-[#121215] border border-zinc-800/90 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {entry.date}
                </span>
                {entry.relatedProject && (
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {entry.relatedProject}
                  </span>
                )}
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    entry.restedEars
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-rose-500/10 text-rose-300'
                  }`}
                >
                  {entry.restedEars ? '👂 Ouvidos descansados' : '⚠️ Ouvidos fadigados'}
                </span>
              </div>

              <button
                onClick={() => handleDelete(entry.id)}
                className="p-1 text-zinc-600 hover:text-rose-400"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
                <span className="text-amber-400 font-bold block mb-1">
                  💡 O que aprendi hoje:
                </span>
                <p className="text-zinc-200 leading-relaxed">{entry.learnedToday}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
                <span className="text-emerald-400 font-bold block mb-1">
                  ✓ O que funcionou bem:
                </span>
                <p className="text-zinc-200 leading-relaxed">{entry.whatWorkedWell}</p>
              </div>

              {entry.whatWentWrong && (
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
                  <span className="text-rose-400 font-bold block mb-1">
                    ⚠️ O que deu errado:
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{entry.whatWentWrong}</p>
                </div>
              )}

              {entry.howResolved && (
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
                  <span className="text-sky-400 font-bold block mb-1">
                    🔧 Como resolvi:
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{entry.howResolved}</p>
                </div>
              )}
            </div>

            {entry.nextStep && (
              <div className="text-xs text-zinc-400 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-850 flex items-center gap-2">
                <span className="font-semibold text-zinc-300">Próximo passo:</span>
                <span>{entry.nextStep}</span>
              </div>
            )}
          </div>
        ))}

        {journal.length === 0 && (
          <div className="py-16 text-center text-zinc-500 text-xs">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p>Nenhuma anotação no diário ainda.</p>
          </div>
        )}
      </div>

      {/* Modal: Create Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
              <h3 className="font-bold text-white text-sm">
                Registrar no Diário de Produção
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-amber-300 mb-1">
                  O que aprendi hoje? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formLearned}
                  onChange={(e) => setFormLearned(e.target.value)}
                  placeholder="Ex: Em kicks de Afrobeats, cortar em 40Hz e dar boost estreito em 65Hz dá muito mais firmeza..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 mb-1">
                  O que funcionou bem?
                </label>
                <input
                  type="text"
                  value={formWorkedWell}
                  onChange={(e) => setFormWorkedWell(e.target.value)}
                  placeholder="Ex: Saturação paralela com Decapitator na caixa..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-rose-300 mb-1">
                    O que deu errado?
                  </label>
                  <input
                    type="text"
                    value={formWentWrong}
                    onChange={(e) => setFormWentWrong(e.target.value)}
                    placeholder="Ex: O reverb estava turvando a voz..."
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sky-300 mb-1">
                    Como resolvi?
                  </label>
                  <input
                    type="text"
                    value={formHowSolved}
                    onChange={(e) => setFormHowSolved(e.target.value)}
                    placeholder="Ex: Abbey Road Reverb Trick (HPF 600Hz, LPF 6kHz)"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Próximo passo / O que testar amanhã?
                </label>
                <input
                  type="text"
                  value={formNextStep}
                  onChange={(e) => setFormNextStep(e.target.value)}
                  placeholder="Ex: Testar compressão opto no backing vocal..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formRestedEars}
                    onChange={(e) => setFormRestedEars(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Estava com os ouvidos descansados</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg"
                >
                  Salvar no Diário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Eliminar Anotação"
        message="Tens a certeza que queres eliminar esta anotação do diário de produção?"
        confirmText="Eliminar Anotação"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (deleteConfirmId) {
            await onDeleteEntry(deleteConfirmId);
            showToast('Anotação eliminada com sucesso', 'info');
            setDeleteConfirmId(null);
          }
        }}
        onClose={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
