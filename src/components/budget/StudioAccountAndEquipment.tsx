import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Tag,
  Calendar,
  CreditCard,
  Mic,
  Headphones,
  Sliders,
  Volume2,
  Box,
  Layers,
  ArrowRight,
  Filter,
  Search,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  StudioTransaction,
  FutureEquipment,
  FinancialCategory,
  FinancialTransactionType,
  EquipmentPriority,
  Project,
  Artist,
} from '../../types';
import { useToast } from '../Toast';

interface StudioAccountAndEquipmentProps {
  transactions: StudioTransaction[];
  futureEquipment: FutureEquipment[];
  projects: Project[];
  artists: Artist[];
  onSaveTransaction: (tx: StudioTransaction) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onSaveFutureEquipment: (eq: FutureEquipment) => Promise<void>;
  onDeleteFutureEquipment: (id: string) => Promise<void>;
  onBuyEquipment: (eq: FutureEquipment) => Promise<void>;
  onAllocateToEquipment: (eqId: string, amountToAdd: number) => Promise<void>;
  initialTab?: 'account' | 'equipment';
}

export function StudioAccountAndEquipment({
  transactions,
  futureEquipment,
  projects,
  artists,
  onSaveTransaction,
  onDeleteTransaction,
  onSaveFutureEquipment,
  onDeleteFutureEquipment,
  onBuyEquipment,
  onAllocateToEquipment,
  initialTab = 'account',
}: StudioAccountAndEquipmentProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'account' | 'equipment'>(initialTab);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState<string>('all');

  // Modals
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [newTxType, setNewTxType] = useState<FinancialTransactionType>('expense');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txCategory, setTxCategory] = useState<FinancialCategory>('Cabos & Acessórios');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [txPaymentMethod, setTxPaymentMethod] = useState('MB Way');
  const [txArtistName, setTxArtistName] = useState('');
  const [txNotes, setTxNotes] = useState('');

  // Future Equipment Modal
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState<FutureEquipment['category']>('Microfone');
  const [eqTargetPrice, setEqTargetPrice] = useState<string>('');
  const [eqAllocated, setEqAllocated] = useState<string>('0');
  const [eqPriority, setEqPriority] = useState<EquipmentPriority>('Alta');
  const [eqLink, setEqLink] = useState('');
  const [eqNotes, setEqNotes] = useState('');

  // Allocate Modal
  const [allocatingEquipment, setAllocatingEquipment] = useState<FutureEquipment | null>(null);
  const [allocateInputAmount, setAllocateInputAmount] = useState<string>('');

  // Calculate live financial totals
  const financials = useMemo(() => {
    // 1. Total Entradas from transactions
    const totalTxIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // 2. Total Gastos from transactions
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // 3. Saldo Líquido em Conta
    const currentBalance = totalTxIncome - totalExpenses;

    // 4. Total Poupado / Reservado para Novos Equipamentos
    const totalAllocatedForEquipment = futureEquipment
      .filter((e) => e.status !== 'Comprado')
      .reduce((sum, e) => sum + (Number(e.allocatedAmount) || 0), 0);

    // 5. Total de Metas de Equipamentos Ativos
    const totalEquipmentTarget = futureEquipment
      .filter((e) => e.status !== 'Comprado')
      .reduce((sum, e) => sum + (Number(e.targetPrice) || 0), 0);

    // 6. Equipamentos prontos para comprar
    const readyToBuyCount = futureEquipment.filter(
      (e) => e.status !== 'Comprado' && (e.allocatedAmount >= e.targetPrice || currentBalance >= e.targetPrice)
    ).length;

    // 7. Total de equipamentos já comprados
    const boughtCount = futureEquipment.filter((e) => e.status === 'Comprado').length;

    const equipmentProgressPct =
      totalEquipmentTarget > 0
        ? Math.min(100, Math.round((totalAllocatedForEquipment / totalEquipmentTarget) * 100))
        : 0;

    return {
      totalTxIncome,
      totalExpenses,
      currentBalance,
      totalAllocatedForEquipment,
      totalEquipmentTarget,
      readyToBuyCount,
      boughtCount,
      equipmentProgressPct,
    };
  }, [transactions, futureEquipment]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (filterType !== 'all' && tx.type !== filterType) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          (tx.artistName && tx.artistName.toLowerCase().includes(q)) ||
          (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(q)) ||
          (tx.notes && tx.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, searchQuery]);

  // Filtered future equipment
  const filteredEquipment = useMemo(() => {
    return futureEquipment
      .filter((eq) => {
        if (equipmentCategoryFilter !== 'all' && eq.category !== equipmentCategoryFilter) return false;
        return true;
      })
      .sort((a, b) => {
        // Ready to buy first, then priority
        const aReady = a.allocatedAmount >= a.targetPrice;
        const bReady = b.allocatedAmount >= b.targetPrice;
        if (aReady && !bReady) return -1;
        if (!aReady && bReady) return 1;
        return 0;
      });
  }, [futureEquipment, equipmentCategoryFilter]);

  // Open Add Transaction Modal
  const openNewTransaction = (type: FinancialTransactionType) => {
    setNewTxType(type);
    setTxDesc('');
    setTxAmount('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxCategory(type === 'expense' ? 'Cabos & Acessórios' : 'Pagamento de Projeto');
    setTxPaymentMethod('MB Way');
    setTxArtistName('');
    setTxNotes('');
    setIsNewTxModalOpen(true);
  };

  // Submit New Transaction
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(txAmount);
    if (!val || val <= 0) {
      showToast('Por favor insere um valor financeiro válido.', 'error');
      return;
    }
    if (!txDesc.trim()) {
      showToast('Por favor insere a descrição da movimentação.', 'error');
      return;
    }

    const newTx: StudioTransaction = {
      id: 'tx-' + Date.now(),
      description: txDesc.trim(),
      amount: Math.abs(val),
      type: newTxType,
      category: txCategory,
      date: txDate,
      artistName: txArtistName.trim() || undefined,
      paymentMethod: txPaymentMethod,
      notes: txNotes.trim() || undefined,
    };

    await onSaveTransaction(newTx);
    setIsNewTxModalOpen(false);
    showToast(
      newTxType === 'income'
        ? `Receita de ${val} € registrada com sucesso! 📥`
        : `Gasto de ${val} € registrado na conta do estúdio! 📤`,
      newTxType === 'income' ? 'success' : 'info'
    );
  };

  // Submit New Equipment
  const handleSubmitEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(eqTargetPrice);
    if (!target || target <= 0) {
      showToast('Insere um valor de preço meta válido.', 'error');
      return;
    }
    if (!eqName.trim()) {
      showToast('Insere o nome do equipamento desejado.', 'error');
      return;
    }

    const alloc = Math.max(0, parseFloat(eqAllocated) || 0);

    const newEq: FutureEquipment = {
      id: 'fe-' + Date.now(),
      name: eqName.trim(),
      category: eqCategory,
      targetPrice: target,
      allocatedAmount: alloc,
      priority: eqPriority,
      status: alloc >= target ? 'Pronto para Comprar' : 'Poupando',
      linkOrStore: eqLink.trim() || undefined,
      notes: eqNotes.trim() || undefined,
    };

    await onSaveFutureEquipment(newEq);
    setIsNewEquipmentModalOpen(false);
    showToast(`Equipamento "${newEq.name}" adicionado à meta de compras! 🎯`, 'success');
  };

  // Handle Buy Equipment
  const handleBuyEquipmentAction = async (eq: FutureEquipment) => {
    if (confirm(`Desejas confirmar a compra de "${eq.name}" por ${eq.targetPrice} €?\n\nIsto registrará um gasto de equipamento e debitará o valor do saldo da conta.`)) {
      await onBuyEquipment(eq);
      showToast(`Parabéns! "${eq.name}" comprado e registrado como despesa do estúdio! 🚀🎉`, 'success');
    }
  };

  // Handle Allocate Funds to equipment
  const handleConfirmAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingEquipment) return;
    const amount = parseFloat(allocateInputAmount);
    if (!amount || amount <= 0) {
      showToast('Insere um valor válido para guardar para este equipamento.', 'error');
      return;
    }

    await onAllocateToEquipment(allocatingEquipment.id, amount);
    setAllocatingEquipment(null);
    setAllocateInputAmount('');
    showToast(`+${amount} € guardados para a compra de "${allocatingEquipment.name}"! 💰`, 'success');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Microfone':
        return <Mic className="w-4 h-4 text-amber-400" />;
      case 'Fones':
        return <Headphones className="w-4 h-4 text-sky-400" />;
      case 'Interface / Placa':
        return <Sliders className="w-4 h-4 text-emerald-400" />;
      case 'Monitores':
        return <Volume2 className="w-4 h-4 text-indigo-400" />;
      case 'Acústica':
        return <Layers className="w-4 h-4 text-purple-400" />;
      default:
        return <Box className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div id="studio-account-equipment-hub" className="space-y-6">
      {/* Top Banner: O Que Tem na Conta do Estúdio */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#141418] to-zinc-950 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Gestão de Caixa & Fundo de Equipamentos</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Conta do Estúdio & Metas de Equipamento</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-emerald-400 border border-zinc-700 font-semibold">
                Tempo Real
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-350 max-w-2xl leading-relaxed">
              Consulte exatamente <strong>o que tem na conta</strong>, o total que <strong>entrou</strong> de projetos e vendas,
              os <strong>gastos efetuados</strong> e o valor guardado para <strong>comprar futuros equipamentos</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openNewTransaction('expense')}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
              title="Registrar um novo gasto / despesa do estúdio"
            >
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>+ Novo Gasto</span>
            </button>
            <button
              onClick={() => openNewTransaction('income')}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
              title="Registrar nova entrada ou receita"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>+ Entrada / Receita</span>
            </button>
          </div>
        </div>

        {/* Big Balance & Financial Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
          {/* Saldo Líquido Atual em Conta */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-emerald-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Saldo Atual na Conta
            </span>
            <div className="mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {financials.currentBalance.toLocaleString()} €
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                {financials.currentBalance >= 0 ? '🟢 Saldo positivo disponível' : '🔴 Atenção: saldo negativo'}
              </span>
            </div>
          </div>

          {/* Total que Entrou */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Total que Entrou
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">
                +{financials.totalTxIncome.toLocaleString()} €
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Projetos pagos e receitas extras
              </span>
            </div>
          </div>

          {/* Total de Gastos */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              Total de Gastos (Saídas)
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black text-rose-400">
                -{financials.totalExpenses.toLocaleString()} €
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Cabos, equipamentos e manutenção
              </span>
            </div>
          </div>

          {/* Fundo de Futuros Equipamentos */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              Fundo p/ Futuros Equipamentos
            </span>
            <div className="mt-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-amber-300">
                  {financials.totalAllocatedForEquipment.toLocaleString()} €
                </span>
                <span className="text-[10px] text-amber-400/80 font-bold">
                  {financials.equipmentProgressPct}% da meta
                </span>
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${financials.equipmentProgressPct}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 block mt-1">
                {financials.readyToBuyCount > 0 ? (
                  <span className="text-emerald-400 font-bold">
                    🚀 {financials.readyToBuyCount} pronto para comprar!
                  </span>
                ) : (
                  `Meta total: ${financials.totalEquipmentTarget.toLocaleString()} €`
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Extrato & Gastos vs Futuros Equipamentos */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 gap-3">
        <div className="flex items-center gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            id="tab-account-extrato"
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'account'
                ? 'bg-emerald-500 text-black shadow-lg scale-[1.02]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>🏦 O Que Tem na Conta & Gastos ({transactions.length})</span>
          </button>
          <button
            id="tab-future-equipment"
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'equipment'
                ? 'bg-amber-500 text-black shadow-lg scale-[1.02]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>🎛️ Futuros Equipamentos & Metas ({futureEquipment.length})</span>
            {financials.readyToBuyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-black">
                {financials.readyToBuyCount} Pronto
              </span>
            )}
          </button>
        </div>

        {activeTab === 'equipment' && (
          <button
            onClick={() => setIsNewEquipmentModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Adicionar Futuro Equipamento</span>
          </button>
        )}
      </div>

      {/* TAB 1: O QUE TEM NA CONTA & GASTOS (EXTRATO) */}
      {activeTab === 'account' && (
        <div className="space-y-4">
          {/* Controls: Search and Type Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121215] p-3 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar movimentação, artista, categoria ou método..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'all'
                    ? 'bg-zinc-750 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Todas ({transactions.length})
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  filterType === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-emerald-400'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Entrou ({transactions.filter((t) => t.type === 'income').length})</span>
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  filterType === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-rose-400'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>Gastos ({transactions.filter((t) => t.type === 'expense').length})</span>
              </button>
            </div>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#121215] border border-zinc-800 space-y-3">
              <DollarSign className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhuma movimentação encontrada</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Não existem registros para este filtro. Registre um gasto ou uma receita do estúdio acima.
              </p>
            </div>
          ) : (
            <div className="bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="divide-y divide-zinc-850">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <div
                      key={tx.id}
                      className="p-4 hover:bg-zinc-900/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isIncome
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                              : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {isIncome ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-zinc-100">{tx.description}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isIncome
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {isIncome ? 'ENTROU' : 'GASTO'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                              {tx.category}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              {tx.date}
                            </span>
                            {tx.artistName && (
                              <span className="flex items-center gap-1">
                                <span className="text-zinc-500">Artista:</span>
                                <strong className="text-zinc-300">{tx.artistName}</strong>
                              </span>
                            )}
                            {tx.paymentMethod && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-zinc-500" />
                                {tx.paymentMethod}
                              </span>
                            )}
                          </div>

                          {tx.notes && (
                            <p className="text-[11px] text-zinc-400 italic bg-zinc-900/70 px-2.5 py-1 rounded-lg border border-zinc-800/80 inline-block">
                              📝 {tx.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-center">
                        <div className="text-right">
                          <span
                            className={`text-lg font-black tracking-tight block ${
                              isIncome ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'} {tx.amount.toLocaleString()} €
                          </span>
                          <span className="text-[10px] text-zinc-500 block">
                            {isIncome ? 'Recebido' : 'Gasto pago'}
                          </span>
                        </div>

                        <button
                          onClick={async () => {
                            if (confirm(`Desejas eliminar esta movimentação de "${tx.description}"?`)) {
                              await onDeleteTransaction(tx.id);
                              showToast('Movimentação eliminada com sucesso', 'info');
                            }
                          }}
                          className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Excluir movimentação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FUTUROS EQUIPAMENTOS & METAS DE COMPRA */}
      {activeTab === 'equipment' && (
        <div className="space-y-5">
          {/* Explanation Callout Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                🎯
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  Metas de Aquisição para Modernização do Estúdio
                </h4>
                <p className="text-xs text-zinc-350">
                  Planeje os próximos microfones, monitores, fones e interfaces. Conforme o estúdio recebe pagamentos dos artistas, guarde e aloque valores até atingir a meta!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-xs font-semibold text-zinc-300">
                Fundo do Estúdio: <strong className="text-amber-400 font-bold">{financials.totalAllocatedForEquipment} €</strong>
              </span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setEquipmentCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                equipmentCategoryFilter === 'all'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Todos ({futureEquipment.length})
            </button>
            {['Microfone', 'Fones', 'Interface / Placa', 'Monitores', 'Acústica', 'Pré-amp / Outboard'].map((cat) => (
              <button
                key={cat}
                onClick={() => setEquipmentCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  equipmentCategoryFilter === cat
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat} ({futureEquipment.filter((e) => e.category === cat).length})
              </button>
            ))}
          </div>

          {/* Equipment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEquipment.map((eq) => {
              const isBought = eq.status === 'Comprado';
              const isReady = !isBought && (eq.allocatedAmount >= eq.targetPrice || financials.currentBalance >= eq.targetPrice);
              const percent = eq.targetPrice > 0 ? Math.min(100, Math.round((eq.allocatedAmount / eq.targetPrice) * 100)) : 0;
              const missing = Math.max(0, eq.targetPrice - eq.allocatedAmount);

              return (
                <div
                  key={eq.id}
                  className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isBought
                      ? 'bg-zinc-950/60 border-zinc-800/80 opacity-70'
                      : isReady
                      ? 'bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border-emerald-500/50 shadow-xl'
                      : 'bg-[#121215] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          {getCategoryIcon(eq.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">
                              {eq.category}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                eq.priority === 'Alta'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : eq.priority === 'Média'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              Prioridade {eq.priority}
                            </span>
                          </div>
                          <h3 className="font-bold text-white text-base mt-0.5 leading-snug">
                            {eq.name}
                          </h3>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isBought ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Comprado ✅
                          </span>
                        ) : isReady ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 text-[10px] font-black animate-pulse flex items-center gap-1 shadow-md">
                            <Sparkles className="w-3 h-3 text-emerald-300" />
                            Pronto p/ Comprar! 🚀
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-amber-400 border border-amber-500/30 text-[10px] font-semibold">
                            Poupando ({percent}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Technical Notes / Description */}
                    {eq.notes && (
                      <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
                        {eq.notes}
                      </p>
                    )}

                    {/* Financial Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-zinc-850 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">
                          Já guardado: <strong className="text-white font-bold">{eq.allocatedAmount.toLocaleString()} €</strong>
                        </span>
                        <span className="text-zinc-300 font-bold">
                          Meta: <span className="text-amber-400">{eq.targetPrice.toLocaleString()} €</span>
                        </span>
                      </div>

                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isReady || isBought ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{percent}% do valor atingido</span>
                        {!isBought && (
                          <span className={isReady ? 'text-emerald-400 font-semibold' : 'text-zinc-400'}>
                            {missing === 0 ? 'Meta atingida!' : `Falta ${missing} €`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!isBought && (
                        <button
                          onClick={() => {
                            setAllocatingEquipment(eq);
                            setAllocateInputAmount('50');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Guardar mais dinheiro para este equipamento"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                          <span>Guardar Saldo</span>
                        </button>
                      )}

                      {eq.linkOrStore && (
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 text-zinc-600" />
                          {eq.linkOrStore}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isBought && (
                        <button
                          onClick={() => handleBuyEquipmentAction(eq)}
                          className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                            isReady
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                          }`}
                          title="Efetuar a compra e registrar no caixa do estúdio"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Comprar Agora</span>
                        </button>
                      )}

                      <button
                        onClick={async () => {
                          if (confirm(`Desejas remover "${eq.name}" das metas de futuros equipamentos?`)) {
                            await onDeleteFutureEquipment(eq.id);
                            showToast('Equipamento removido da lista', 'info');
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remover meta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR NOVA TRANSAÇÃO (GASTO OU ENTRADA) */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#141418] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#18181d]">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    newTxType === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {newTxType === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-white text-sm">
                  {newTxType === 'income' ? 'Registrar Nova Entrada (Receita)' : 'Registrar Novo Gasto (Despesa)'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewTxModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="p-5 space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setNewTxType('expense');
                    setTxCategory('Cabos & Acessórios');
                  }}
                  className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    newTxType === 'expense'
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Gasto (Despesa)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTxType('income');
                    setTxCategory('Pagamento de Projeto');
                  }}
                  className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    newTxType === 'income'
                      ? 'bg-emerald-500 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Entrou (Receita)</span>
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Descrição da Movimentação *
                </label>
                <input
                  type="text"
                  required
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder={
                    newTxType === 'expense'
                      ? 'Ex: Cabo XLR Mogami 5m, Licença de Plugin, Almofadas de Fone...'
                      : 'Ex: Sessão de Gravação Avulsa, Venda de Beat Instrumental...'
                  }
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Valor (€) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Ex: 50"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Categoria
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as FinancialCategory)}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  {newTxType === 'expense' ? (
                    <>
                      <option value="Equipamento de Estúdio">Equipamento de Estúdio</option>
                      <option value="Cabos & Acessórios">Cabos & Acessórios</option>
                      <option value="Software & Plugins">Software & Plugins</option>
                      <option value="Manutenção & Reparos">Manutenção & Reparos</option>
                      <option value="Tratamento Acústico">Tratamento Acústico</option>
                      <option value="Custos Operacionais">Custos Operacionais</option>
                      <option value="Outro">Outro Gasto</option>
                    </>
                  ) : (
                    <>
                      <option value="Pagamento de Projeto">Pagamento de Projeto / Música</option>
                      <option value="Sessão de Gravação">Sessão de Gravação de Voz</option>
                      <option value="Venda de Beat / Instrumental">Venda de Beat / Instrumental</option>
                      <option value="Aporte / Entrada Avulsa">Aporte / Entrada Avulsa</option>
                      <option value="Outro">Outra Receita</option>
                    </>
                  )}
                </select>
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Método de Pagamento
                  </label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="MB Way">MB Way</option>
                    <option value="Multicaixa">Multicaixa</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão">Cartão</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Artista / Origem (Opcional)
                  </label>
                  <input
                    type="text"
                    value={txArtistName}
                    onChange={(e) => setTxArtistName(e.target.value)}
                    placeholder="Ex: Jay Santos"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Notas / Observações
                </label>
                <textarea
                  rows={2}
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Detalhes adicionais da movimentação..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-black shadow-lg flex items-center gap-1.5 ${
                    newTxType === 'income' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400 text-white'
                  }`}
                >
                  <span>{newTxType === 'income' ? 'Salvar Entrada' : 'Salvar Gasto'}</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADICIONAR FUTURO EQUIPAMENTO */}
      {isNewEquipmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#141418] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#18181d]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <h3 className="font-bold text-white text-sm">
                  Adicionar Futuro Equipamento à Meta
                </h3>
              </div>
              <button
                onClick={() => setIsNewEquipmentModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEquipment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Nome do Equipamento *
                </label>
                <input
                  type="text"
                  required
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  placeholder="Ex: Microfone Neumann TLM 103, Interface Apollo Twin..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={eqCategory}
                    onChange={(e) => setEqCategory(e.target.value as FutureEquipment['category'])}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Microfone">Microfone</option>
                    <option value="Fones">Fones de Referência</option>
                    <option value="Interface / Placa">Interface / Placa de Áudio</option>
                    <option value="Monitores">Monitores de Áudio</option>
                    <option value="Pré-amp / Outboard">Pré-amp / Outboard</option>
                    <option value="Acústica">Tratamento Acústico</option>
                    <option value="Acessórios">Cabos & Acessórios</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={eqPriority}
                    onChange={(e) => setEqPriority(e.target.value as EquipmentPriority)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Alta">Alta (Urgente)</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Preço Estimado (€) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={eqTargetPrice}
                    onChange={(e) => setEqTargetPrice(e.target.value)}
                    placeholder="Ex: 850"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Valor Já Guardado (€)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={eqAllocated}
                    onChange={(e) => setEqAllocated(e.target.value)}
                    placeholder="Ex: 100"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Loja ou Link de Referência (Opcional)
                </label>
                <input
                  type="text"
                  value={eqLink}
                  onChange={(e) => setEqLink(e.target.value)}
                  placeholder="Ex: Thomann / Music Store / Loja Local"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Por que precisamos deste equipamento?
                </label>
                <textarea
                  rows={2}
                  value={eqNotes}
                  onChange={(e) => setEqNotes(e.target.value)}
                  placeholder="Ex: Melhora a captação de agudos dos vocais femininos de Kizomba..."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewEquipmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg flex items-center gap-1.5"
                >
                  <span>Adicionar à Meta</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GUARDAR / ALOCAR SALDO PARA UM EQUIPAMENTO ESPECÍFICO */}
      {allocatingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#141418] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#18181d]">
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <h3 className="font-bold text-white text-sm">
                  Guardar Saldo para Equipamento
                </h3>
              </div>
              <button
                onClick={() => setAllocatingEquipment(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAllocate} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Meta</span>
                <strong className="text-sm text-white block">{allocatingEquipment.name}</strong>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-zinc-400">Preço Meta:</span>
                  <span className="text-amber-400 font-bold">{allocatingEquipment.targetPrice} €</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Já Alocado:</span>
                  <span className="text-white font-bold">{allocatingEquipment.allocatedAmount} €</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Quanto deseja guardar para este item? (€) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={allocateInputAmount}
                  onChange={(e) => setAllocateInputAmount(e.target.value)}
                  placeholder="Ex: 50"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 font-bold text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAllocatingEquipment(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-lg flex items-center gap-1.5"
                >
                  <span>Confirmar Alocação</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
