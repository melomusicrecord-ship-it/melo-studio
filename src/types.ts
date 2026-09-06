export type ProjectStatus =
  | 'Ideia'
  | 'Produção'
  | 'Gravação'
  | 'Mixagem'
  | 'Masterização'
  | 'Finalizado'
  | 'Arquivado';

export type PaymentStatus =
  | 'Pendente'
  | 'Metade'
  | 'Completo'
  | 'Parcial';

export type FinancialTransactionType = 'income' | 'expense';

export type FinancialCategory =
  | 'Pagamento de Projeto'
  | 'Sessão de Gravação'
  | 'Venda de Beat / Instrumental'
  | 'Equipamento de Estúdio'
  | 'Cabos & Acessórios'
  | 'Software & Plugins'
  | 'Manutenção & Reparos'
  | 'Tratamento Acústico'
  | 'Custos Operacionais'
  | 'Aporte / Entrada Avulsa'
  | 'Outro';

export interface StudioTransaction {
  id: string;
  description: string;
  amount: number;
  type: FinancialTransactionType; // 'income' (entrou) | 'expense' (gasto)
  category: FinancialCategory;
  date: string; // YYYY-MM-DD
  artistName?: string;
  projectName?: string;
  projectId?: string;
  paymentMethod?: string; // 'MB Way' | 'Multicaixa' | 'Transferência Bancária' | 'Dinheiro' | 'Cartão' | 'PayPal'
  equipmentTargetId?: string;
  notes?: string;
}

export type EquipmentPriority = 'Alta' | 'Média' | 'Baixa';
export type EquipmentStatus = 'Planejamento' | 'Poupando' | 'Pronto para Comprar' | 'Comprado';

export interface FutureEquipment {
  id: string;
  name: string;
  category:
    | 'Microfone'
    | 'Monitores'
    | 'Interface / Placa'
    | 'Pré-amp / Outboard'
    | 'Fones'
    | 'Acústica'
    | 'Acessórios'
    | 'Outro';
  targetPrice: number;
  allocatedAmount: number; // quanto já foi poupado / guardado especificamente para este item
  priority: EquipmentPriority;
  status: EquipmentStatus;
  linkOrStore?: string;
  notes?: string;
  boughtDate?: string;
}

export interface ProjectBudget {
  totalAmount: number; // Valor total orçado (ex: 250, 300)
  paidAmount: number; // Valor já pago pelo artista (ex: 125, 250, 0)
  percentagePaid: number; // 0% a 100% (ex: 100 para completo, 50 para metade, etc.)
  paymentStatus: PaymentStatus; // 'Completo' | 'Metade' | 'Pendente' | 'Parcial'
  currency?: string; // '€' | '$' | 'Kz' | 'R$'
  musicDelivered: boolean; // Se o artista já recebeu a música ou não (true / false)
  deliveryDate?: string; // Data da entrega da música
  deliveryStatusNotes?: string; // Ex: 'Entregue em WAV 24-bit e MP3 320kbps'
  paymentDate?: string; // Data do último pagamento recebido
  paymentMethod?: string; // 'MB Way' | 'Multicaixa' | 'Transferência Bancária' | 'Dinheiro' | 'PayPal'
  notes?: string; // Notas ou acordo financeiro
}

export interface Project {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  style: string;
  bpm: number;
  key: string;
  status: ProjectStatus;
  createdAt: string;
  deadline?: string;
  notes?: string;
  coverUrl?: string;
  favorite?: boolean;
  progress?: number;
  tags?: string[];
  chainIds?: string[];
  projectChains?: {
    leadVocal?: string;
    backingVocal?: string;
    adlibs?: string;
    vocalBus?: string;
    fxChain?: string;
    masterChain?: string;
  };
  vocalNotes?: string;
  budget?: ProjectBudget;
}

export interface Artist {
  id: string;
  stageName: string;
  realName?: string;
  fullName?: string;
  phone?: string;
  contactPhone?: string;
  email?: string;
  style: string;
  mainStyles?: string[];
  vocalTone?: string;
  preferredMic?: string;
  notes?: string;
  favorite?: boolean;
  avatarUrl?: string;
}

export type SessionStatus =
  | 'Agendada'
  | 'Confirmada'
  | 'Em andamento'
  | 'Concluída'
  | 'Cancelada';

export type SessionType =
  | 'Gravação'
  | 'Mixagem'
  | 'Masterização'
  | 'Produção'
  | 'Reunião'
  | 'Entrega'
  | 'Outro';

export interface Session {
  id: string;
  projectId?: string;
  projectName?: string;
  artistId?: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: SessionType;
  objective: string;
  notes?: string;
  status: SessionStatus;
  checklist?: Record<string, boolean>;
}

export type InstrumentalMood =
  | '🔥 Energético'
  | '😊 Feliz'
  | '❤️ Romântico'
  | '😢 Sad'
  | '🌙 Melancólico'
  | '💭 Sentimental'
  | '💪 Motivacional'
  | '🌊 Relaxado'
  | '🌑 Dark'
  | '✨ Atmosférico';

export interface ArrangementItem {
  id: string;
  time: string;
  section: string;
  note?: string;
}

export type InstrumentalStatus = 'Disponível' | 'Reservado' | 'Vendido' | 'Em produção';

export interface Instrumental {
  id: string;
  name: string;
  title?: string;
  style: string;
  bpm: number;
  key: string;
  mood?: InstrumentalMood;
  status?: InstrumentalStatus;
  price?: number;
  tags?: string[];
  chordProgression?: string;
  melody?: string;
  bassline?: string;
  drums?: string;
  structure?: ArrangementItem[];
  reference?: string;
  notes?: string;
  favorite?: boolean;
  createdAt: string;
}

export type PluginCategory =
  | 'EQ'
  | 'Dynamic EQ'
  | 'Compressor'
  | 'Limiter'
  | 'De-Esser'
  | 'Noise Reduction'
  | 'Gate'
  | 'Saturation'
  | 'Console'
  | 'Filter'
  | 'Distortion'
  | 'Transient Shaper'
  | 'Reverb'
  | 'Delay'
  | 'Chorus'
  | 'Flanger'
  | 'Phaser'
  | 'Stereo'
  | 'Exciter'
  | 'Clipper'
  | 'Metering'
  | 'Utility'
  | 'Pitch Correction'
  | 'Synth'
  | 'Sampler'
  | 'Instrument'
  | 'Outro';

export interface PluginItem {
  id: string;
  name: string;
  manufacturer: string;
  category: PluginCategory;
  type?: string;
  version?: string;
  owned: boolean;
  favorite: boolean;
  mostUsed: boolean;
  notes?: string;
  tags?: string[];
}

export type ChainTarget =
  | 'Lead Vocal'
  | 'Backing Vocal'
  | 'Adlibs'
  | 'Rap Vocal'
  | 'Kick'
  | 'Snare'
  | 'Hi-Hat'
  | 'Percussion'
  | '808'
  | 'Drum Bus'
  | 'Bass'
  | 'Piano'
  | 'Keys'
  | 'Guitar'
  | 'Strings'
  | 'Pad'
  | 'Synth'
  | 'Melody'
  | 'Instrumental Bus'
  | 'Vocal Bus'
  | 'Mix Bus'
  | 'Master';

export type ChainLevel = 'Iniciante' | 'Intermediário' | 'Avançado';
export type ChainVersion = 'Essencial' | 'Completa' | 'Avançada';
export type RoutingType = 'Serial' | 'Parallel' | 'Sends';

export type ChainGoal =
  | 'Limpar'
  | 'Controlar dinâmica'
  | 'Dar presença'
  | 'Dar brilho'
  | 'Dar corpo'
  | 'Dar espaço'
  | 'Criar efeito'
  | 'Preparar para mix'
  | 'Finalizar';

export interface AlternativePlugins {
  pro: string;
  alt: string;
  free: string;
  native: string;
}

export interface GuideQuestion {
  question: string;
  ifYes: string;
  ifNo: string;
}

export interface RoutingDetails {
  type: 'Serial' | 'Parallel' | 'Send / Aux' | 'Sidechain' | 'Mid/Side';
  busName?: string;
  notes?: string;
}

export interface ChainStep {
  id: string;
  order: number;
  pluginName: string;
  manufacturer: string;
  category: string;
  objective: string;
  whyIsItHere: string;
  whatToHear: string;
  whatToHearBefore?: string;
  whatToHearAfter?: string;
  guideQuestion?: GuideQuestion;
  pedagogicalTip?: string;
  whenNotToUse: string;
  alternatives: AlternativePlugins;
  techniqueTip?: string;
  routingDetails?: RoutingDetails;
  myNote?: string;
  completed?: boolean;
  favorite?: boolean;
}

export interface ProcessingChain {
  id: string;
  name: string;
  target: ChainTarget;
  style: string;
  goal: string;
  level: ChainLevel;
  versionType?: ChainVersion;
  version?: ChainVersion;
  routingType: RoutingType;
  steps: ChainStep[];
  notes?: string;
  favorite?: boolean;
  isCustom?: boolean;
  updatedAt: string;
}

export interface DiagnosisIssue {
  id: string;
  title: string;
  category: 'Vocal' | 'Graves' | 'Bateria' | 'Mix Geral' | 'Espaço & Imagem';
  symptoms: string[];
  possibleCauses: string[];
  whatToListen: string;
  suggestedTools: string[];
  proTips: string;
}

export interface Experience {
  id: string;
  projectId?: string;
  projectName?: string;
  chainId?: string;
  chainName?: string;
  pluginName?: string;
  problem: string;
  solution: string;
  result: string;
  rating: number; // 1 to 5
  notes?: string;
  date: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  learnedToday: string;
  workedWell?: string;
  whatWorkedWell?: string;
  needsImprovement?: string;
  whatWentWrong?: string;
  howResolved?: string;
  nextStep?: string;
  restedEars?: boolean;
  relatedProject?: string;
  discoveredPlugin?: string;
  testedTechnique?: string;
  tags?: string[];
}

export type LearningStatus = 'Não iniciado' | 'Estudando' | 'Praticando' | 'Dominado';

export interface LearningTopic {
  id: string;
  name: string;
  description: string;
  status: LearningStatus;
  keyConcepts: string[];
  notes?: string;
}

export interface LearningCategory {
  id: string;
  title: string;
  topics: LearningTopic[];
}

export interface LibraryItem {
  id: string;
  title: string;
  type: 'Preset' | 'Referência' | 'Tutorial' | 'Nota de Estúdio' | 'Template' | 'Configuração';
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface StudioSettings {
  studioName: string;
  producerName: string;
  mainDaw: string;
  favoriteStyles: string[];
  theme: 'dark';
  language: 'pt';
  dateFormat: string;
  useOnlyOwnedPlugins: boolean;
  nativeDaw: string;
  onboarded: boolean;
}

export interface StudioStats {
  projectsCount: number;
  completedProjectsCount: number;
  sessionsCount: number;
  chainsCount: number;
  pluginsCount: number;
  ownedPluginsCount: number;
  ideasCount: number;
  experiencesCount: number;
}

// ==========================================
// 🎙️ MELO VOCAL ENGINE TYPES
// ==========================================

export type VocalExperienceLevel = 'Iniciante' | 'Produtor' | 'Engineer';
export type ChainStepState = 'ok' | 'warning' | 'critical' | 'bypass';

export interface VocalFlowStep {
  id: string;
  stepNumber: string;
  title: string;
  stage: string;
  objective: string;
  recommendedPlugins: {
    name: string;
    manufacturer: string;
    role: string;
  }[];
  position: string;
  parameters: string;
  dosage: {
    initialValue: string;
    suggestedRange: string;
    earGuide: string;
    warning?: string;
  };
  whatToHear: string;
  risks: string;
  whenNotToUse: string;
  alternatives: string[];
}

export interface VocalProblem {
  id: string;
  title: string;
  region: string;
  firstTool: string;
  acaoRecomendada: string;
  faixaInicial: string;
  oQueOuvir: string;
  oQueEvitar: string;
  alternatives: string[];
  recommendedAction?: string;
  initialRange?: string;
  whatToListen?: string;
  whatToAvoid?: string;
}

export interface VocalFreqZone {
  range: string;
  name: string;
  description: string;
  primaryAction: string;
  warning: string;
  icon?: string;
}

export interface PluginKnowledgeItem {
  id: string;
  pluginName: string;
  manufacturer: string;
  category: string;
  circuitTopology?: string; // ex: 'Óptico (T4 Optical Cell)', 'FET (Field Effect Transistor)', 'VCA', 'Digital Cirúrgico'
  hardwareOrigin?: string; // ex: 'Teletronix LA-2A (1965)', 'UREI 1176LN Peak Limiter', etc.
  keyParameters?: { name: string; description: string; optimalRange?: string }[];
  whatItDoes: string;
  whenToUse: string;
  whenNotToUse: string;
  whyUseIt: string;
  whatIfNotUsed: string;
  whatIfOverused: string;
  whatToHear: string;
  commonMistakes: string;
  practicalExample: string;
  alternatives: string[];
  recommendedPositions: string[];
  vocalTypes: string[];
  styles: string[];
  suggestedDosage: {
    light: string;
    moderate: string;
    heavy: string;
    veryHeavy?: string;
    safetyNotice?: string;
  };
}

export interface PluginComparison {
  id: string;
  title: string;
  category: string;
  pluginA: string;
  pluginB: string;
  summary: string;
  conceptDifference: string;
  comparisonPoints: {
    label: string;
    a: string;
    b: string;
  }[];
  whenToPickA: string;
  whenToPickB: string;
  comboStrategy: string; // Como usá-los juntos na cadeia
}

export interface TrainerChallenge {
  id: string;
  title: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Master';
  category: string;
  context: string; // O cenário de estúdio
  question: string; // A decisão técnica a tomar
  audioDescription: string; // O que o produtor está ouvindo
  options: {
    id: string;
    plugin: string;
    reason: string;
    isCorrect: boolean;
  }[];
  correctExplanation: string; // Explicação aprofundada do porquê esse plugin é a escolha ideal
  whyOthersFail: {
    plugin: string;
    why: string;
  }[];
  goldenRule: string; // Regra de ouro da engenharia de áudio
}

export interface VocalChainPreset {
  id: string;
  title: string;
  target: string;
  style: string;
  description: string;
  characteristics: string[];
  focus: string[];
  steps: {
    number: string;
    plugin: string;
    manufacturer: string;
    role: string;
    why: string;
    how: string;
    initialDosage: string;
    whatToHear: string;
    state?: ChainStepState;
  }[];
}

