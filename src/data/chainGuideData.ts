import { ProcessingChain, ChainStep, ChainTarget, ChainLevel, ChainGoal } from '../types';

export interface MixElementOption {
  id: ChainTarget;
  label: string;
  icon: string;
  group: 'Vocal' | 'Bateria & Percussão' | 'Harmonia & Graves' | 'Buses & Saída';
  description: string;
  defaultGoal: ChainGoal;
}

export const MIX_ELEMENTS: MixElementOption[] = [
  { id: 'Lead Vocal', label: 'Lead Vocal', icon: '🎤', group: 'Vocal', description: 'Vocal principal da música, foco da mixagem', defaultGoal: 'Dar presença' },
  { id: 'Backing Vocal', label: 'Backing Vocal', icon: '👥', group: 'Vocal', description: 'Segundas vozes e harmonias que complementam o lead', defaultGoal: 'Dar espaço' },
  { id: 'Adlibs', label: 'Adlibs', icon: '✨', group: 'Vocal', description: 'Respostas, interjeições e efeitos expressivos', defaultGoal: 'Criar efeito' },
  { id: 'Kick', label: 'Kick', icon: '🥁', group: 'Bateria & Percussão', description: 'Bumbo de bateria acústica ou eletrônica', defaultGoal: 'Dar corpo' },
  { id: 'Snare', label: 'Snare', icon: '🎯', group: 'Bateria & Percussão', description: 'Caixa, rimshot e claps de marcação rítmica', defaultGoal: 'Dar presença' },
  { id: 'Drum Bus', label: 'Drums Bus', icon: '🎛️', group: 'Bateria & Percussão', description: 'Agrupamento geral de toda a bateria e percussão', defaultGoal: 'Controlar dinâmica' },
  { id: 'Bass', label: 'Bass / 808', icon: '🎸', group: 'Harmonia & Graves', description: 'Baixo elétrico, acústico ou sintetizado / 808', defaultGoal: 'Dar corpo' },
  { id: 'Piano', label: 'Piano', icon: '🎹', group: 'Harmonia & Graves', description: 'Piano acústico, grand piano ou Rhodes elétrico', defaultGoal: 'Limpar' },
  { id: 'Guitar', label: 'Guitar', icon: '🎸', group: 'Harmonia & Graves', description: 'Guitarras rítmicas, solos dedilhados ou licks', defaultGoal: 'Dar brilho' },
  { id: 'Melody', label: 'Melody / Synth', icon: '🎼', group: 'Harmonia & Graves', description: 'Linhas melódicas de sintetizadores, plucks e metais', defaultGoal: 'Dar presença' },
  { id: 'Instrumental Bus', label: 'Instrumental Bus', icon: '🎵', group: 'Buses & Saída', description: 'Canal bus contendo todo o instrumental sem vozes', defaultGoal: 'Preparar para mix' },
  { id: 'Mix Bus', label: 'Mix Bus', icon: '🎚️', group: 'Buses & Saída', description: 'Bus final antes da saída master (Cola da mixagem)', defaultGoal: 'Controlar dinâmica' },
  { id: 'Master', label: 'Master', icon: '🔊', group: 'Buses & Saída', description: 'Cadeia de saída master para finalização e entrega', defaultGoal: 'Finalizar' },
];

export interface StyleOption {
  id: string;
  name: string;
  vibe: string;
}

export const MUSIC_STYLES: StyleOption[] = [
  { id: 'Afrobeat', name: 'Afrobeat', vibe: 'Groove quente, percussão sincopada e vocais cristalinos' },
  { id: 'Afropop', name: 'Afropop', vibe: 'Pop moderno africano, brilho comercial e melodias abertas' },
  { id: 'Kizomba', name: 'Kizomba', vibe: 'Sensual, quente, vocais aveludados e graves profundos' },
  { id: 'Zouk', name: 'Zouk', vibe: 'Envolvente, balanço caribenho e ambiência refinada' },
  { id: 'Trap', name: 'Trap', vibe: '808 pesado, hi-hats rápidos, vocais in-your-face e Auto-Tune' },
  { id: 'Drill', name: 'Drill', vibe: 'Grave deslizante, caixas secas agressivas e presença cortante' },
  { id: 'R&B', name: 'R&B', vibe: 'Suavidade, harmonia rica, compressão óptica e reverb doce' },
  { id: 'Kuduro', name: 'Kuduro', vibe: 'Energia alta a 140 BPM, batida dura, vocais percussivos' },
  { id: 'Afro House', name: 'Afro House', vibe: 'Batida hipnótica, congas, espaço tridimensional e subgrave limpo' },
  { id: 'Deep House', name: 'Deep House', vibe: 'Acordes clássicos de órgão, bumbo arredondado e master dinâmico' },
  { id: 'Hip-Hop', name: 'Hip-Hop', vibe: 'Punch clássico de bumbo/caixa, vocais autoritários e graves cheios' },
];

export interface GoalOption {
  id: ChainGoal;
  label: string;
  icon: string;
  description: string;
}

export const CHAIN_GOALS: GoalOption[] = [
  { id: 'Limpar', label: 'Limpar', icon: '🧹', description: 'Remover ruídos, ressonâncias graves indesejadas e embolação' },
  { id: 'Controlar dinâmica', label: 'Controlar dinâmica', icon: '⚖️', description: 'Domar picos e nivelar a energia entre momentos fracos e fortes' },
  { id: 'Dar presença', label: 'Dar presença', icon: '⚡', description: 'Colocar o elemento bem à frente da mixagem sem subir o volume geral' },
  { id: 'Dar brilho', label: 'Dar brilho', icon: '✨', description: 'Adicionar ar (Air Band), definição e abertura nas frequências agudas' },
  { id: 'Dar corpo', label: 'Dar corpo', icon: '🪵', description: 'Encorpar os graves e médios, trazendo sensação analógica quente' },
  { id: 'Dar espaço', label: 'Dar espaço', icon: '🌌', description: 'Criar profundidade 3D, largura estéreo e caudas envolventes' },
  { id: 'Criar efeito', label: 'Criar efeito', icon: '🎨', description: 'Saturações criativas, modulações, delays rítmicos ou rádio' },
  { id: 'Preparar para mix', label: 'Preparar para mix', icon: '🛠️', description: 'Organizar ganho, headroom e separação de frequências' },
  { id: 'Finalizar', label: 'Finalizar', icon: '🏆', description: 'Volume comercial competitivo, coerência espectral e controle True Peak' },
];

export interface LevelInfo {
  level: ChainLevel;
  title: string;
  color: string;
  badge: string;
  focus: string[];
}

export const LEVEL_INFOS: Record<ChainLevel, LevelInfo> = {
  Iniciante: {
    level: 'Iniciante',
    title: '🟢 Iniciante',
    color: 'emerald',
    badge: 'Foco na Prática & Ouvido',
    focus: ['O que fazer passo a passo', 'Por que cada plugin está na posição', '👂 O que ouvir (Antes vs Depois)', 'Perguntas simples de decisão'],
  },
  Intermediário: {
    level: 'Intermediário',
    title: '🟡 Intermediário',
    color: 'amber',
    badge: 'Técnica & Parâmetros',
    focus: ['Ordem e categorias de plugins', 'Valores de referência (Attack, Release, Ratio)', 'Como calibrar ouvindo o playback', 'Alternativas profissionais de mercado'],
  },
  Avançado: {
    level: 'Avançado',
    title: '🔴 Avançado',
    color: 'rose',
    badge: 'Engenharia & Roteamento',
    focus: ['Routing Serial vs Paralelo vs Sends', 'Processamento Mid/Side e Sidechain', 'Automação de ganhos e efeitos', 'Preservação de transientes e coerência de fase'],
  },
};
