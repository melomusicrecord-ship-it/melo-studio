import { useState, useMemo } from 'react';
import {
  Stethoscope,
  HelpCircle,
  Headphones,
  Wrench,
  Lightbulb,
  Search,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { DiagnosisIssue } from '../types';
import { INITIAL_DIAGNOSIS_ISSUES } from '../data/initialData';

interface DiagnosisPageProps {
  subFilter: string;
}

export function DiagnosisPage({ subFilter }: DiagnosisPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string>(
    INITIAL_DIAGNOSIS_ISSUES[0].id
  );

  const filteredIssues = useMemo(() => {
    return INITIAL_DIAGNOSIS_ISSUES.filter((issue) => {
      if (subFilter.startsWith('cat-')) {
        const cat = subFilter.replace('cat-', '');
        if (issue.category !== cat) return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          issue.title.toLowerCase().includes(q) ||
          issue.symptoms.some((s) => s.toLowerCase().includes(q)) ||
          issue.proTips.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [subFilter, searchTerm]);

  const activeIssue =
    INITIAL_DIAGNOSIS_ISSUES.find((i) => i.id === selectedIssueId) ||
    filteredIssues[0] ||
    INITIAL_DIAGNOSIS_ISSUES[0] ||
    null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-rose-950/30 border border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-xs font-semibold mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Guia Clínico de Mixagem</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            Tenho um Problema na Minha Mix 🩺
          </h2>
          <p className="text-xs text-zinc-400">
            Identifica o sintoma no teu áudio e descobre o que verificar e experimentar.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Qual é o problema? (ex: sibilância, lama)..."
            className="w-full bg-zinc-900 border border-zinc-750 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/60"
          />
        </div>
      </div>

      {/* Main Grid: Issues List & Detailed Diagnostic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left List of Issues */}
        <div className="lg:col-span-4 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1 mb-1">
            Sintomas Conhecidos ({filteredIssues.length})
          </div>

          {filteredIssues.map((issue) => {
            const isSelected = issue.id === activeIssue.id;
            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                  isSelected
                    ? 'bg-zinc-850 border-rose-500/70 shadow-lg'
                    : 'bg-[#121215] border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-rose-300 border border-zinc-800">
                    {issue.category}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] text-rose-400 font-semibold">
                      Ativo →
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                  {issue.title}
                </h4>
                <p className="text-[11px] text-zinc-400 line-clamp-2">
                  {issue.symptoms[0]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Diagnostic Breakdown Card */}
        <div className="lg:col-span-8">
          {activeIssue && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#121215] border border-zinc-800/90 shadow-2xl space-y-5 animate-in fade-in duration-150">
              {/* Issue title */}
              <div className="border-b border-zinc-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1">
                  Categoria: {activeIssue.category}
                </span>
                <h3 className="text-xl font-black text-white">
                  {activeIssue.title}
                </h3>
              </div>

              {/* Symptoms */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
                <span className="text-xs font-bold text-amber-300 block mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Sintomas Comuns no Estúdio:</span>
                </span>
                <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                  {(activeIssue.symptoms || []).map((sym, idx) => (
                    <li key={idx}>{sym}</li>
                  ))}
                </ul>
              </div>

              {/* Possible Causes (Human non-absolute language) */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-200 block flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-400" />
                  <span>Possíveis Causas (Verifica na Tua Gravação):</span>
                </span>
                <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                  {(activeIssue.possibleCauses || []).map((cause, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-zinc-900/60 p-2 rounded-lg border border-zinc-850">
                      <span className="text-sky-400 font-bold">•</span>
                      <span>{cause}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What to Listen */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-300 block flex items-center gap-1.5">
                  <Headphones className="w-4 h-4" />
                  <span>👂 O Que Deves Ouvir Atentamente:</span>
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {activeIssue.whatToListen}
                </p>
              </div>

              {/* Suggested Tools */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" />
                  <span>Ferramentas Que Podem Ajudar:</span>
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {(activeIssue.suggestedTools || []).map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pro Tip */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">Dica de Ouro do Melo:</span>
                  <p className="leading-relaxed">{activeIssue.proTips}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
