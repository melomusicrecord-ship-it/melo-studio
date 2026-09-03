export type ProjectStatus =
  | 'Ideia'
  | 'Produção'
  | 'Gravação'
  | 'Mixagem'
  | 'Masterização'
  | 'Finalizado'
  | 'Arquivado';

export interface Project {
  id: string;
  name: string;
  artist: string;
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
  | 'Compressor'
  | 'Limiter'
  | 'De-Esser'
  | 'Noise Reduction'
  | 'Gate'
  | 'Saturation'
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

export interface AlternativePlugins {
  pro: string;
  alt: string;
  free: string;
  native: string;
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
  whenNotToUse: string;
  alternatives: AlternativePlugins;
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
