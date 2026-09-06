import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { StudioTransaction, FutureEquipment, Project } from '../../types';

interface StudioFinancialWidgetProps {
  transactions: StudioTransaction[];
  futureEquipment: FutureEquipment[];
  projects: Project[];
  onOpenFinances: (tab?: 'account' | 'equipment') => void;
}

export function StudioFinancialWidget({
  transactions,
  futureEquipment,
  projects,
  onOpenFinances,
}: StudioFinancialWidgetProps) {
  // Financial calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const currentBalance = totalIncome - totalExpenses;

  // Equipment calculations
  const totalAllocatedEquipment = futureEquipment
    .filter((e) => e.status !== 'Comprado')
    .reduce((acc, e) => acc + (Number(e.allocatedAmount) || 0), 0);

  // Next target equipment (highest priority or closest to target)
  const pendingEquipment = futureEquipment.filter((e) => e.status !== 'Comprado');
  const readyEquipment = pendingEquipment.find(
    (e) => e.allocatedAmount >= e.targetPrice || currentBalance >= e.targetPrice
  );
  const nextEquipment = readyEquipment || pendingEquipment[0] || null;

  const nextEquipmentPct =
    nextEquipment && nextEquipment.targetPrice > 0
      ? Math.min(100, Math.round((nextEquipment.allocatedAmount / nextEquipment.targetPrice) * 100))
      : 0;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#121614] via-[#121215] to-[#161418] border border-emerald-500/25 p-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
            <DollarSign className="w-3 h-3" />
            <span>Saúde Financeira do Estúdio</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>O Que Tem na Conta & Fundo de Equipamentos</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenFinances('account')}
            className="px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-zinc-750"
          >
            <span>Ver Extrato & Gastos</span>
          </button>
          <button
            onClick={() => onOpenFinances('equipment')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Futuros Equipamentos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
        {/* Saldo em Conta */}
        <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-emerald-500/30">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Saldo Atual em Conta
          </span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentBalance.toLocaleString()} €
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              {currentBalance >= 0 ? '🟢 Caixa positivo' : '🔴 Caixa negativo'}
            </span>
          </div>
        </div>

        {/* Total que Entrou */}
        <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Total que Entrou
          </span>
          <div className="mt-1">
            <span className="text-lg sm:text-xl font-black text-emerald-400">
              +{totalIncome.toLocaleString()} €
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              Receitas de projetos e vendas
            </span>
          </div>
        </div>

        {/* Total de Gastos */}
        <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
          <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            Total de Gastos
          </span>
          <div className="mt-1">
            <span className="text-lg sm:text-xl font-black text-rose-400">
              -{totalExpenses.toLocaleString()} €
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              Cabos, acessórios e reparos
            </span>
          </div>
        </div>

        {/* Fundo p/ Futuros Equipamentos */}
        <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-amber-500/30">
          <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            Fundo p/ Equipamentos
          </span>
          <div className="mt-1">
            <span className="text-lg sm:text-xl font-black text-amber-300">
              {totalAllocatedEquipment.toLocaleString()} €
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              Guardado para novas aquisições
            </span>
          </div>
        </div>
      </div>

      {/* Next Target Spotlight */}
      {nextEquipment && (
        <div className="mt-4 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-base shrink-0">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-zinc-400">
                  Próxima Meta de Equipamento
                </span>
                {readyEquipment ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    Pronto p/ Comprar! 🚀
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                    {nextEquipmentPct}% poupado
                  </span>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">
                {nextEquipment.name}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right">
              <span className="text-xs text-zinc-400">Meta:</span>{' '}
              <strong className="text-white text-xs font-bold">{nextEquipment.targetPrice} €</strong>
              <div className="w-24 bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${nextEquipmentPct}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => onOpenFinances('equipment')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow active:scale-95"
            >
              Ver Equipamentos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
