import React, { useState, useMemo, FormEvent } from 'react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  Check,
  X,
  Edit3,
  Copy,
  FolderKanban,
  Music,
  Share2,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  Sparkles,
  Phone,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Users,
} from 'lucide-react';
import {
  Project,
  Artist,
  ProjectBudget,
  PaymentStatus,
  StudioTransaction,
  FutureEquipment,
} from '../../types';
import { useToast } from '../Toast';
import { StudioAccountAndEquipment } from './StudioAccountAndEquipment';

interface ArtistBudgetManagerProps {
  projects: Project[];
  artists: Artist[];
  transactions?: StudioTransaction[];
  futureEquipment?: FutureEquipment[];
  onSaveProject: (project: Project) => Promise<void>;
  onNavigateToProject?: (projectId: string) => void;
  onSaveTransaction?: (tx: StudioTransaction) => Promise<void>;
  onDeleteTransaction?: (id: string) => Promise<void>;
  onSaveFutureEquipment?: (eq: FutureEquipment) => Promise<void>;
  onDeleteFutureEquipment?: (id: string) => Promise<void>;
  onBuyEquipment?: (eq: FutureEquipment) => Promise<void>;
  onAllocateToEquipment?: (eqId: string, amountToAdd: number) => Promise<void>;
  onClose?: () => void;
  isModal?: boolean;
  initialTab?: 'artists' | 'account' | 'equipment';
}

export function ArtistBudgetManager({
  projects,
  artists,
  transactions = [],
  futureEquipment = [],
  onSaveProject,
  onNavigateToProject,
  onSaveTransaction,
  onDeleteTransaction,
  onSaveFutureEquipment,
  onDeleteFutureEquipment,
  onBuyEquipment,
  onAllocateToEquipment,
  onClose,
  isModal = false,
  initialTab = 'artists',
}: ArtistBudgetManagerProps) {
  const { showToast } = useToast();
  const [mainTab, setMainTab] = useState<'artists' | 'account' | 'equipment'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState<
    'all' | 'complete' | 'half' | 'pending' | 'delivered' | 'not-delivered'
  >('all');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states for editing budget
  const [formTotal, setFormTotal] = useState<number>(250);
  const [formPaid, setFormPaid] = useState<number>(125);
  const [formCurrency, setFormCurrency] = useState<string>('€');
  const [formDelivered, setFormDelivered] = useState<boolean>(false);
  const [formDeliveryDate, setFormDeliveryDate] = useState<string>('');
  const [formDeliveryNotes, setFormDeliveryNotes] = useState<string>('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<string>('MB Way');
  const [formNotes, setFormNotes] = useState<string>('');

  // 1. FILTER: STRICTLY ARTISTS WHO HAVE PROJECTS WITH US
  // "E NO ORÇAMENTO SÓ APARECEM TODOS OS ARTISTAS QUE TEM PROJECTO CONOSCO"
  const artistsWithProjects = useMemo(() => {
    // Map each project to an artist
    return artists.filter((artist) => {
      return projects.some((p) => {
        const matchesName =
          p.artist.trim().toLowerCase() === artist.stageName.trim().toLowerCase();
        const matchesId = p.artistId && p.artistId === artist.id;
        return matchesName || matchesId;
      });
    });
  }, [artists, projects]);

  // Aggregate project data per artist
  const artistBudgetData = useMemo(() => {
    return artistsWithProjects.map((artist) => {
      // Find all projects belonging to this artist
      const artistProjects = projects.filter((p) => {
        const matchesName =
          p.artist.trim().toLowerCase() === artist.stageName.trim().toLowerCase();
        const matchesId = p.artistId && p.artistId === artist.id;
        return matchesName || matchesId;
      });

      // Calculate totals
      let totalBudget = 0;
      let totalPaid = 0;
      let deliveredCount = 0;

      artistProjects.forEach((p) => {
        const budget = p.budget;
        const total = budget?.totalAmount ?? 200;
        const paid = budget?.paidAmount ?? (budget?.paymentStatus === 'Completo' ? total : 0);
        totalBudget += total;
        totalPaid += paid;
        if (budget?.musicDelivered) {
          deliveredCount += 1;
        }
      });

      const overallPercentage =
        totalBudget > 0 ? Math.min(100, Math.round((totalPaid / totalBudget) * 100)) : 0;

      return {
        artist,
        projects: artistProjects,
        totalBudget,
        totalPaid,
        balancePending: Math.max(0, totalBudget - totalPaid),
        overallPercentage,
        deliveredCount,
        allDelivered: deliveredCount === artistProjects.length && artistProjects.length > 0,
      };
    });
  }, [artistsWithProjects, projects]);

  // Filtered by search & payment status
  const filteredData = useMemo(() => {
    return artistBudgetData.filter(({ artist, projects, overallPercentage, allDelivered, deliveredCount }) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesArtist =
          artist.stageName.toLowerCase().includes(q) ||
          (artist.fullName || '').toLowerCase().includes(q);
        const matchesProject = projects.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.style.toLowerCase().includes(q) ||
            (p.budget?.notes || '').toLowerCase().includes(q)
        );
        if (!matchesArtist && !matchesProject) return false;
      }

      // Filter
      if (filterPayment === 'complete') {
        return overallPercentage >= 100;
      }
      if (filterPayment === 'half') {
        return overallPercentage >= 40 && overallPercentage <= 60;
      }
      if (filterPayment === 'pending') {
        return overallPercentage === 0;
      }
      if (filterPayment === 'delivered') {
        return deliveredCount > 0;
      }
      if (filterPayment === 'not-delivered') {
        return !allDelivered;
      }

      return true;
    });
  }, [artistBudgetData, searchTerm, filterPayment]);

  // Global KPIs across all projects
  const globalKPIs = useMemo(() => {
    let grandTotal = 0;
    let grandPaid = 0;
    let totalProjectsWithBudget = 0;
    let totalDelivered = 0;

    projects.forEach((p) => {
      // Only count projects belonging to known artists with projects
      const belongs = artistsWithProjects.some(
        (a) =>
          a.stageName.trim().toLowerCase() === p.artist.trim().toLowerCase() ||
          a.id === p.artistId
      );
      if (belongs) {
        totalProjectsWithBudget += 1;
        const total = p.budget?.totalAmount ?? 200;
        const paid =
          p.budget?.paidAmount ?? (p.budget?.paymentStatus === 'Completo' ? total : 0);
        grandTotal += total;
        grandPaid += paid;
        if (p.budget?.musicDelivered) {
          totalDelivered += 1;
        }
      }
    });

    const pending = Math.max(0, grandTotal - grandPaid);
    const globalPercent = grandTotal > 0 ? Math.round((grandPaid / grandTotal) * 100) : 0;

    return {
      grandTotal,
      grandPaid,
      pending,
      globalPercent,
      totalProjectsWithBudget,
      totalDelivered,
    };
  }, [projects, artistsWithProjects]);

  // Open Edit Modal for a specific project
  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    const b = project.budget;
    const total = b?.totalAmount ?? 250;
    const paid = b?.paidAmount ?? (b?.paymentStatus === 'Completo' ? total : 0);
    setFormTotal(total);
    setFormPaid(paid);
    setFormCurrency(b?.currency || '€');
    setFormDelivered(Boolean(b?.musicDelivered));
    setFormDeliveryDate(b?.deliveryDate || '');
    setFormDeliveryNotes(b?.deliveryStatusNotes || '');
    setFormPaymentMethod(b?.paymentMethod || 'MB Way');
    setFormNotes(b?.notes || '');
  };

  // Quick 100% Complete Action
  const handleQuickPayComplete = async (project: Project) => {
    const total = project.budget?.totalAmount ?? 250;
    const updatedBudget: ProjectBudget = {
      totalAmount: total,
      paidAmount: total,
      percentagePaid: 100,
      paymentStatus: 'Completo',
      currency: project.budget?.currency || '€',
      musicDelivered: project.budget?.musicDelivered ?? false,
      deliveryDate: project.budget?.deliveryDate,
      deliveryStatusNotes: project.budget?.deliveryStatusNotes,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: project.budget?.paymentMethod || 'MB Way',
      notes: project.budget?.notes || 'Pagamento integral de 100% confirmado.',
    };

    const updated = { ...project, budget: updatedBudget };
    await onSaveProject(updated);
    showToast(`100% Pago confirmado para "${project.name}" (${project.artist})! 🎉`, 'success');
  };

  // Quick 50% Half Action
  const handleQuickPayHalf = async (project: Project) => {
    const total = project.budget?.totalAmount ?? 250;
    const half = Math.round(total / 2);
    const updatedBudget: ProjectBudget = {
      totalAmount: total,
      paidAmount: half,
      percentagePaid: 50,
      paymentStatus: 'Metade',
      currency: project.budget?.currency || '€',
      musicDelivered: project.budget?.musicDelivered ?? false,
      deliveryDate: project.budget?.deliveryDate,
      deliveryStatusNotes: project.budget?.deliveryStatusNotes,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: project.budget?.paymentMethod || 'MB Way',
      notes: project.budget?.notes || '50% (Metade) liquidado. Saldo restante na entrega.',
    };

    const updated = { ...project, budget: updatedBudget };
    await onSaveProject(updated);
    showToast(`50% (Metade) pago registrado para "${project.name}" (${project.artist})! 💰`, 'info');
  };

  // Quick Toggle Music Delivery (Sim / Não)
  const handleQuickToggleDelivery = async (project: Project) => {
    const currentStatus = Boolean(project.budget?.musicDelivered);
    const nextStatus = !currentStatus;
    const total = project.budget?.totalAmount ?? 250;
    const paid = project.budget?.paidAmount ?? 0;
    const percent = total > 0 ? Math.round((paid / total) * 100) : 0;

    let statusType: PaymentStatus = 'Pendente';
    if (percent >= 100) statusType = 'Completo';
    else if (percent >= 45 && percent <= 55) statusType = 'Metade';
    else if (percent > 0) statusType = 'Parcial';

    const updatedBudget: ProjectBudget = {
      totalAmount: total,
      paidAmount: paid,
      percentagePaid: percent,
      paymentStatus: project.budget?.paymentStatus || statusType,
      currency: project.budget?.currency || '€',
      musicDelivered: nextStatus,
      deliveryDate: nextStatus ? new Date().toISOString().split('T')[0] : undefined,
      deliveryStatusNotes: nextStatus
        ? 'Música entregue com sucesso ao artista.'
        : 'Entrega pendente / Em fase de produção.',
      paymentDate: project.budget?.paymentDate,
      paymentMethod: project.budget?.paymentMethod,
      notes: project.budget?.notes,
    };

    const updated = { ...project, budget: updatedBudget };
    await onSaveProject(updated);
    showToast(
      nextStatus
        ? `✅ Música "${project.name}" marcada como ENTREGUE ao artista!`
        : `⏳ Música "${project.name}" marcada como PENDENTE de entrega.`,
      nextStatus ? 'success' : 'info'
    );
  };

  // Save Edit Form
  const handleSaveEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const total = Math.max(0, Number(formTotal) || 0);
    const paid = Math.max(0, Number(formPaid) || 0);
    const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

    let pStatus: PaymentStatus = 'Pendente';
    if (percent >= 100) pStatus = 'Completo';
    else if (percent >= 45 && percent <= 55) pStatus = 'Metade';
    else if (percent > 0) pStatus = 'Parcial';

    const updatedBudget: ProjectBudget = {
      totalAmount: total,
      paidAmount: paid,
      percentagePaid: percent,
      paymentStatus: pStatus,
      currency: formCurrency,
      musicDelivered: formDelivered,
      deliveryDate: formDelivered ? formDeliveryDate || new Date().toISOString().split('T')[0] : undefined,
      deliveryStatusNotes: formDeliveryNotes.trim() || undefined,
      paymentDate: paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
      paymentMethod: formPaymentMethod,
      notes: formNotes.trim() || undefined,
    };

    const updated = { ...editingProject, budget: updatedBudget };
    await onSaveProject(updated);
    setEditingProject(null);
    showToast('Orçamento e status do projeto atualizados com sucesso!', 'success');
  };

  // Copy receipt / summary to WhatsApp
  const handleCopyReceipt = (artist: Artist, project: Project) => {
    const b = project.budget;
    const total = b?.totalAmount ?? 200;
    const paid = b?.paidAmount ?? 0;
    const pending = Math.max(0, total - paid);
    const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
    const curr = b?.currency || '€';
    const isDelivered = b?.musicDelivered;

    const receiptText = `🎵 *MELO STUDIO HUB - RESUMO DE ORÇAMENTO* 🎵
------------------------------------------
👤 *Artista:* ${artist.stageName} ${artist.fullName ? `(${artist.fullName})` : ''}
🎼 *Projeto:* ${project.name} (${project.style})
💰 *Valor Total:* ${total.toLocaleString()} ${curr}
✅ *Valor Pago:* ${paid.toLocaleString()} ${curr} (${percent}% - ${b?.paymentStatus || 'Parcial'})
⏳ *Saldo Restante:* ${pending.toLocaleString()} ${curr}
📦 *Música Entregue:* ${isDelivered ? 'SIM (Entregue ✅)' : 'NÃO (Em Produção ⏳)'}
${b?.paymentMethod ? `💳 *Método:* ${b.paymentMethod}` : ''}
${b?.deliveryDate ? `📅 *Data de Entrega:* ${b.deliveryDate}` : ''}
${b?.notes ? `📝 *Observações:* ${b.notes}` : ''}
------------------------------------------
_Obrigado pela preferência e confiança no nosso trabalho!_`;

    navigator.clipboard.writeText(receiptText);
    showToast('Resumo copiado! Podes colar diretamente no WhatsApp do artista. 📲', 'success');
  };

  // Live Studio Financial Summary
  const studioFinancialSummary = useMemo(() => {
    const totalTxIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const currentBalance = totalTxIncome - totalExpenses;

    const totalAllocatedForEquipment = futureEquipment
      .filter((e) => e.status !== 'Comprado')
      .reduce((sum, e) => sum + (Number(e.allocatedAmount) || 0), 0);

    const readyEquipmentCount = futureEquipment.filter(
      (e) => e.status !== 'Comprado' && (e.allocatedAmount >= e.targetPrice || currentBalance >= e.targetPrice)
    ).length;

    return {
      currentBalance,
      totalTxIncome,
      totalExpenses,
      totalAllocatedForEquipment,
      readyEquipmentCount,
    };
  }, [transactions, futureEquipment]);

  return (
    <div className={`space-y-6 ${isModal ? 'p-2' : ''}`}>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#141418] to-zinc-900 border border-amber-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Gestão Financeira, Caixa & Futuros Equipamentos</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Conta do Estúdio, Orçamentos & Equipamentos</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700 font-semibold">
                {artistsWithProjects.length} Artistas com Projetos
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-350 max-w-2xl leading-relaxed">
              Consulte <strong>o que tem na conta</strong>, acompanhe <strong>se tem gastos</strong>, veja <strong>quanto entrou</strong> e controle o fundo reservado para <strong>comprar futuros equipamentos</strong>.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="self-start md:self-center p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-750 text-zinc-400 hover:text-white transition-all"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Global KPI Metrics: 6 Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-5 border-t border-zinc-800/80">
          {/* Saldo na Conta */}
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-emerald-500/40 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Saldo na Conta
            </span>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-black text-white">
                {studioFinancialSummary.currentBalance.toLocaleString()} €
              </span>
              <span className="text-[10px] text-emerald-400/90 block font-medium">
                {studioFinancialSummary.currentBalance >= 0 ? '🟢 Caixa positivo' : '🔴 Caixa negativo'}
              </span>
            </div>
          </div>

          {/* Total que Entrou */}
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Total que Entrou
            </span>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-black text-emerald-400">
                +{studioFinancialSummary.totalTxIncome.toLocaleString()} €
              </span>
              <span className="text-[10px] text-zinc-500 block">
                Receitas do estúdio
              </span>
            </div>
          </div>

          {/* Total de Gastos */}
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Total de Gastos
            </span>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-black text-rose-400">
                -{studioFinancialSummary.totalExpenses.toLocaleString()} €
              </span>
              <span className="text-[10px] text-zinc-500 block">
                Despesas e compras
              </span>
            </div>
          </div>

          {/* Fundo p/ Futuros Equipamentos */}
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-amber-500/40 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              Fundo Equipamentos
            </span>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-black text-amber-300">
                {studioFinancialSummary.totalAllocatedForEquipment.toLocaleString()} €
              </span>
              <span className="text-[10px] text-zinc-400 block">
                {studioFinancialSummary.readyEquipmentCount > 0 ? (
                  <span className="text-emerald-400 font-bold">🚀 {studioFinancialSummary.readyEquipmentCount} pronto!</span>
                ) : (
                  'Guardado p/ metas'
                )}
              </span>
            </div>
          </div>

          {/* Total Orçado em Músicas */}
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              Orçado em Músicas
            </span>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-black text-white">
                {globalKPIs.grandTotal.toLocaleString()} €
              </span>
              <span className="text-[10px] text-zinc-500 block">
                {globalKPIs.totalProjectsWithBudget} projetos
              </span>
            </div>
          </div>

          {/* Músicas Entregues */}
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-sky-900/40 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-sky-400 flex items-center gap-1">
              <Music className="w-3.5 h-3.5" />
              Músicas Entregues
            </span>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-black text-white">
                {globalKPIs.totalDelivered} / {globalKPIs.totalProjectsWithBudget}
              </span>
              <span className="text-[10px] text-sky-300/80 block">
                {globalKPIs.totalDelivered === globalKPIs.totalProjectsWithBudget &&
                globalKPIs.totalProjectsWithBudget > 0
                  ? 'Todas entregues! 📦'
                  : `${globalKPIs.totalProjectsWithBudget - globalKPIs.totalDelivered} pendentes`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Main Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#121215] border border-zinc-800 rounded-2xl overflow-x-auto">
        <button
          id="tab-btn-artists-budget"
          onClick={() => setMainTab('artists')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            mainTab === 'artists'
              ? 'bg-amber-500 text-black shadow-lg scale-[1.01]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Orçamento dos Artistas ({artistsWithProjects.length})</span>
        </button>

        <button
          id="tab-btn-studio-account"
          onClick={() => setMainTab('account')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            mainTab === 'account'
              ? 'bg-emerald-500 text-black shadow-lg scale-[1.01]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>🏦 O Que Tem na Conta & Gastos ({transactions.length})</span>
        </button>

        <button
          id="tab-btn-studio-equipment"
          onClick={() => setMainTab('equipment')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            mainTab === 'equipment'
              ? 'bg-amber-500 text-black shadow-lg scale-[1.01]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>🎛️ Futuros Equipamentos & Metas ({futureEquipment.length})</span>
          {studioFinancialSummary.readyEquipmentCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-black">
              {studioFinancialSummary.readyEquipmentCount} Pronto!
            </span>
          )}
        </button>
      </div>

      {/* VIEW: O QUE TEM NA CONTA / GASTOS OU FUTUROS EQUIPAMENTOS */}
      {mainTab !== 'artists' && (
        <StudioAccountAndEquipment
          transactions={transactions}
          futureEquipment={futureEquipment}
          projects={projects}
          artists={artists}
          onSaveTransaction={onSaveTransaction || (async () => {})}
          onDeleteTransaction={onDeleteTransaction || (async () => {})}
          onSaveFutureEquipment={onSaveFutureEquipment || (async () => {})}
          onDeleteFutureEquipment={onDeleteFutureEquipment || (async () => {})}
          onBuyEquipment={onBuyEquipment || (async () => {})}
          onAllocateToEquipment={onAllocateToEquipment || (async () => {})}
          initialTab={mainTab === 'equipment' ? 'equipment' : 'account'}
        />
      )}

      {/* VIEW: ORÇAMENTO DOS ARTISTAS COM PROJETOS */}
      {mainTab === 'artists' && (
        <div className="space-y-6">
          {/* Controls: Search and Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar artista com projeto, música ou nota..."
                className="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              {[
                { id: 'all', label: 'Todos com Projeto' },
                { id: 'complete', label: '🟢 100% Completo' },
                { id: 'half', label: '🟡 50% Metade' },
                { id: 'pending', label: '🔴 0% Pendente' },
                { id: 'delivered', label: '📦 Música Entregue' },
                { id: 'not-delivered', label: '⏳ Música Pendente' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterPayment(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    filterPayment === tab.id
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

      {/* Artists with Projects Budget List */}
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredData.map(({ artist, projects: aProjects, totalBudget, totalPaid, balancePending, overallPercentage, deliveredCount, allDelivered }) => (
            <div
              key={artist.id}
              className="bg-[#121215] border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {/* Header: Artist Info */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 via-zinc-800 to-zinc-900 border border-amber-500/40 flex items-center justify-center font-black text-amber-300 text-base shadow-inner shrink-0">
                      {artist.stageName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {artist.stageName}
                        </h3>
                        {artist.favorite && <span className="text-amber-400 text-xs">⭐</span>}
                      </div>
                      {artist.fullName && (
                        <span className="text-[11px] text-zinc-400 block font-normal">
                          {artist.fullName}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                        <span className="text-amber-400/90 font-medium">{artist.style}</span>
                        {artist.contactPhone && (
                          <span className="flex items-center gap-1 text-zinc-400">
                            • <Phone className="w-3 h-3 text-emerald-400" /> {artist.contactPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Badges: Payment & Delivery */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                        overallPercentage >= 100
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : overallPercentage >= 40 && overallPercentage <= 60
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : overallPercentage > 0
                          ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {overallPercentage >= 100 ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {overallPercentage >= 100
                          ? '100% Pago Completo'
                          : overallPercentage === 50
                          ? '50% Metade Paga'
                          : overallPercentage > 0
                          ? `${overallPercentage}% Pago`
                          : 'Pendente (0%)'}
                      </span>
                    </div>

                    <div
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        allDelivered
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : deliveredCount > 0
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-zinc-850 text-zinc-400 border-zinc-750'
                      }`}
                    >
                      {allDelivered
                        ? 'Música Entregue: SIM ✅'
                        : deliveredCount > 0
                        ? `Música: ${deliveredCount}/${aProjects.length} Entregues`
                        : 'Música Entregue: NÃO ⏳'}
                    </div>
                  </div>
                </div>

                {/* Visual Overall Payment Bar */}
                <div className="mb-4 bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-400 font-medium">Orçamento Consolidado do Artista:</span>
                    <span className="font-bold text-white">
                      <span className="text-emerald-400">{totalPaid.toLocaleString()} €</span>
                      <span className="text-zinc-500 font-normal"> / {totalBudget.toLocaleString()} €</span>
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        overallPercentage >= 100
                          ? 'bg-emerald-500'
                          : overallPercentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${overallPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1 text-zinc-500">
                    <span>
                      {balancePending > 0 ? (
                        <span className="text-rose-400 font-semibold">
                          Falta pagar: {balancePending.toLocaleString()} €
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">Sem saldo devedor</span>
                      )}
                    </span>
                    <span>{overallPercentage}% liquidado</span>
                  </div>
                </div>

                {/* Individual Projects List for this Artist */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Músicas / Projetos Vinculados ({aProjects.length})
                  </span>

                  {aProjects.map((project) => {
                    const pBudget = project.budget;
                    const pTotal = pBudget?.totalAmount ?? 250;
                    const pPaid =
                      pBudget?.paidAmount ?? (pBudget?.paymentStatus === 'Completo' ? pTotal : 0);
                    const pPending = Math.max(0, pTotal - pPaid);
                    const pPercent = pTotal > 0 ? Math.round((pPaid / pTotal) * 100) : 0;
                    const isDelivered = Boolean(pBudget?.musicDelivered);

                    return (
                      <div
                        key={project.id}
                        className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5 transition-all hover:border-zinc-700"
                      >
                        {/* Project Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-xs sm:text-sm">
                                {project.name}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-300">
                                {project.style}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {project.bpm} BPM • {project.key}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-500">
                              Status da Produção: <strong className="text-zinc-300">{project.status}</strong>
                            </span>
                          </div>

                          {/* Music Delivery Badge / Toggle Button */}
                          <button
                            onClick={() => handleQuickToggleDelivery(project)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border ${
                              isDelivered
                                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                                : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-750 hover:border-amber-500/50'
                            }`}
                            title="Clique para alternar se a música já foi entregue ou não"
                          >
                            {isDelivered ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Música Entregue: SIM</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Música Entregue: NÃO</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Project Financial Values */}
                        <div className="grid grid-cols-3 gap-2 bg-[#16161b] p-2.5 rounded-lg border border-zinc-850 text-center">
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Total Orçado</span>
                            <span className="text-xs font-bold text-white">
                              {pTotal.toLocaleString()} {pBudget?.currency || '€'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Já Pago</span>
                            <span className="text-xs font-bold text-emerald-400">
                              {pPaid.toLocaleString()} {pBudget?.currency || '€'} ({pPercent}%)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Restante</span>
                            <span
                              className={`text-xs font-bold ${
                                pPending > 0 ? 'text-rose-400' : 'text-zinc-400'
                              }`}
                            >
                              {pPending.toLocaleString()} {pBudget?.currency || '€'}
                            </span>
                          </div>
                        </div>

                        {/* Payment & Delivery Details */}
                        {(pBudget?.deliveryStatusNotes || pBudget?.notes || pBudget?.deliveryDate) && (
                          <div className="text-[11px] text-zinc-400 bg-zinc-900/50 p-2 rounded-lg border border-zinc-850/80 space-y-0.5">
                            {pBudget?.deliveryDate && (
                              <div className="flex items-center gap-1.5 text-sky-300">
                                <Calendar className="w-3 h-3" />
                                <span>Data de entrega da música: {pBudget.deliveryDate}</span>
                              </div>
                            )}
                            {pBudget?.deliveryStatusNotes && (
                              <p className="text-zinc-350 italic">
                                "{pBudget.deliveryStatusNotes}"
                              </p>
                            )}
                            {pBudget?.notes && (
                              <p className="text-zinc-450 text-[10px]">
                                Acordo: {pBudget.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Project Quick Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-zinc-850">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuickPayHalf(project)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all ${
                                pPercent === 50
                                  ? 'bg-amber-500 text-zinc-950 border-amber-400'
                                  : 'bg-zinc-900 hover:bg-zinc-850 text-amber-400 border-zinc-750'
                              }`}
                              title="Marcar 50% (Metade) do orçamento pago"
                            >
                              <span>50% Metade</span>
                            </button>

                            <button
                              onClick={() => handleQuickPayComplete(project)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all ${
                                pPercent >= 100
                                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                                  : 'bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border-zinc-750'
                              }`}
                              title="Marcar 100% Completo pago"
                            >
                              <span>100% Completo</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyReceipt(artist, project)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-750 flex items-center gap-1 transition-all"
                              title="Copiar resumo financeiro para enviar ao artista"
                            >
                              <Copy className="w-3 h-3 text-amber-400" />
                              <span className="hidden sm:inline">Copiar</span> Resumo
                            </button>

                            <button
                              onClick={() => handleOpenEdit(project)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-750 flex items-center gap-1 transition-all"
                              title="Editar valores, método e dados do orçamento"
                            >
                              <Edit3 className="w-3 h-3 text-sky-400" />
                              <span>Editar</span>
                            </button>

                            {onNavigateToProject && (
                              <button
                                onClick={() => onNavigateToProject(project.id)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                                title="Ver projeto"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-[#121215] border border-zinc-800 rounded-2xl">
          <FolderKanban className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            {searchTerm || filterPayment !== 'all'
              ? 'Nenhum artista com projeto corresponde aos filtros'
              : 'Nenhum artista tem projetos cadastrados ainda'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {searchTerm || filterPayment !== 'all'
              ? 'Tente remover a pesquisa ou alterar o filtro de pagamento / entrega acima.'
              : 'Neste painel aparecem apenas os artistas que possuem projetos no estúdio. Crie um projeto vinculado a um artista para gerenciar seu orçamento.'}
          </p>
        </div>
      )}
        </div>
      )}

      {/* Modal: Edit Budget Details for a Project */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#16161a]">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Editar Orçamento & Entrega</span>
                </h3>
                <span className="text-xs text-zinc-400">
                  {editingProject.name} • Artista: <strong>{editingProject.artist}</strong>
                </span>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBudget} className="p-5 space-y-4 text-xs">
              {/* Row 1: Total Amount & Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Valor Total do Orçamento *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    value={formTotal}
                    onChange={(e) => setFormTotal(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Moeda</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-100 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="€">EUR (€)</option>
                    <option value="Kz">Kwanza (Kz)</option>
                    <option value="R$">Real (R$)</option>
                    <option value="$">Dólar ($)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Quick Percentage Presets */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5">
                  Predefinição Rápida de Pagamento (%):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormPaid(0)}
                    className={`py-1.5 rounded-xl font-bold border transition-all ${
                      formPaid === 0
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    0% Pendente
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPaid(Math.round(formTotal * 0.25))}
                    className={`py-1.5 rounded-xl font-bold border transition-all ${
                      formPaid === Math.round(formTotal * 0.25)
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    25% Sinal
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPaid(Math.round(formTotal * 0.5))}
                    className={`py-1.5 rounded-xl font-bold border transition-all ${
                      formPaid === Math.round(formTotal * 0.5)
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    50% Metade
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPaid(formTotal)}
                    className={`py-1.5 rounded-xl font-bold border transition-all ${
                      formPaid === formTotal && formTotal > 0
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    100% Completo
                  </button>
                </div>
              </div>

              {/* Row 3: Paid Amount & Calculation */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Valor Já Pago ({formCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={formPaid}
                    onChange={(e) => setFormPaid(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Percentual & Saldo Restante
                  </label>
                  <div className="py-2 text-xs">
                    <span className="font-bold text-white block">
                      {formTotal > 0 ? Math.round((formPaid / formTotal) * 100) : 0}% Liquidado
                    </span>
                    <span className="text-[11px] text-rose-400">
                      Falta: {Math.max(0, formTotal - formPaid).toLocaleString()} {formCurrency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: SE JÁ RECEBEU TAMBÉM A MÚSICA OU NÃO */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-xs block">
                      O Artista já recebeu a música?
                    </label>
                    <span className="text-[11px] text-zinc-400 block">
                      Status de envio do arquivo final (WAV / MP3) ao artista
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormDelivered(false)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        !formDelivered
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      NÃO (Pendente)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDelivered(true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        formDelivered
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      SIM (Entregue)
                    </button>
                  </div>
                </div>

                {formDelivered && (
                  <div className="pt-2 border-t border-zinc-850 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Data em que recebeu:
                      </label>
                      <input
                        type="date"
                        value={formDeliveryDate}
                        onChange={(e) => setFormDeliveryDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-1.5 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Formato / Detalhe de Entrega:
                      </label>
                      <input
                        type="text"
                        value={formDeliveryNotes}
                        onChange={(e) => setFormDeliveryNotes(e.target.value)}
                        placeholder="Ex: Master WAV 24-bit + MP3 320k"
                        className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-1.5 text-zinc-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 5: Payment Method */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Método de Pagamento Utilizado
                </label>
                <select
                  value={formPaymentMethod}
                  onChange={(e) => setFormPaymentMethod(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="MB Way">MB Way</option>
                  <option value="Multicaixa Express">Multicaixa Express</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Dinheiro em Mão">Dinheiro em Mão</option>
                  <option value="PayPal">PayPal</option>
                  <option value="PIX">PIX</option>
                  <option value="Outro">Outro Acordo</option>
                </select>
              </div>

              {/* Row 6: Notes */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Observações / Notas do Acordo
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: 50% pago no início e 50% na entrega final da master."
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Orçamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
