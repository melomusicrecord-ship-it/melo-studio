import { useState } from 'react';
import {
  GraduationCap,
  Sliders,
  Activity,
  Lightbulb,
  Headphones,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<'compressors' | 'frequencies' | 'rules'>('compressors');

  const compressorTypes = [
    {
      name: 'FET (Field Effect Transistor)',
      badge: 'Ultra-Rápido & Agressivo',
      color: 'rose',
      examples: 'Universal Audio 1176, Waves CLA-76, Arturia FET-76',
      character: 'Ataque ultra veloz (microsegundos), saturação harmônica pronunciada e agressividade orgânica.',
      bestFor: 'Picos de Lead Vocal, Caixas (Snare), Baixo elétrico que precisa de mordida e bumbo com punch.',
      proTip: 'No 1176, o ataque 7 é o mais RÁPIDO e o 1 é o mais LENTO. Começa com Attack 3 e Release 7 para vocais mordazes.',
    },
    {
      name: 'Opto (Optical)',
      badge: 'Musical & Suave',
      color: 'amber',
      examples: 'Teletronix LA-2A, Tube-Tech CL 1B, Waves CLA-2A',
      character: 'Curva não-linear governada por fotocélula de luz. Release de dois estágios que soa invisível e muito natural.',
      bestFor: 'Corpo de vocais melódicos, backing vocals, baixo contínuo e instrumentos acústicos.',
      proTip: 'Use em série após o FET 1176: o FET corta os transientes rápidos de 3dB e o Opto nivela os 2-4dB de dinâmica média musical.',
    },
    {
      name: 'VCA (Voltage Controlled Amplifier)',
      badge: 'Cirúrgico & Transparente',
      color: 'sky',
      examples: 'SSL G-Master Bus, dbx 160, API 2500, Elysia mpressor',
      character: 'Extremamente preciso, controle milimétrico sobre attack e release, punch de transiente e excelente cola estereofônica.',
      bestFor: 'Mix Bus, Drum Bus, kicks percussivos de Afrobeat/Kuduro e instrumentos de ataque.',
      proTip: 'No Mix Bus SSL: Attack lento (30ms) para deixar passar o transiente, Release rápido ou Auto, e redução de ganho de apenas 1.5dB a 2.5dB.',
    },
    {
      name: 'Vari-Mu (Variable Mu / Tube)',
      badge: 'Calor & Cola Valvulada',
      color: 'purple',
      examples: 'Fairchild 660/670, Manley Variable Mu, Klanghelm MJUC',
      character: 'Compressão via ganho da própria válvula. O ratio aumenta conforme a intensidade do sinal.',
      bestFor: 'Mastering, cola suave de busses acústicos, vocais clássicos sedosos.',
      proTip: 'Ideal no final de cadeias de mix bus para selar as frequências médias sem achatar a dinâmica.',
    },
  ];

  const frequencySpectrum = [
    {
      band: 'Sub-Grave (20Hz - 60Hz)',
      desc: 'Peso físico nos alto-falantes e clubes. Rumble inaudível em fones pequenos.',
      advice: 'Corta com High-Pass filter em 25-30Hz em tudo que não for Kick ou 808. Deixa o sub estritamente em MONO.',
      color: 'border-purple-500/40 bg-purple-500/5',
    },
    {
      band: 'Graves (60Hz - 250Hz)',
      desc: 'Corpo e fundamental do bumbo, do baixo e do 808. Calor rítmico.',
      advice: 'Decide quem mora em 60-80Hz (Kick ou 808) e faça o corte complementar no outro instrumento para evitar embolar.',
      color: 'border-sky-500/40 bg-sky-500/5',
    },
    {
      band: 'Médio-Graves (250Hz - 500Hz)',
      desc: 'Área crítica: Dá peso e calor acústico, mas é onde a temida "LAMA" da mixagem se acumula.',
      advice: 'Um pequeno corte estreito (-1.5dB a -3dB) em 300-450Hz na maioria dos instrumentos limpa o som instantaneamente.',
      color: 'border-amber-500/40 bg-amber-500/5',
    },
    {
      band: 'Médios (500Hz - 2kHz)',
      desc: 'Onde mora a energia do corpo vocal e a inteligibilidade do ser humano.',
      advice: 'Cuidado com excesso em 1kHz (som de rádio / telefone / nasal). Equilibre com instrumentos de apoio.',
      color: 'border-yellow-500/40 bg-yellow-500/5',
    },
    {
      band: 'Médio-Agudos (2kHz - 6kHz)',
      desc: 'Articulação, definição da palheta, ataque da baqueta e presença vocal na cara.',
      advice: 'Zona sensível ao ouvido humano. Cuidado com sibilância (4.5k-7k) e aspereza. Use de-essers inteligentes.',
      color: 'border-rose-500/40 bg-rose-500/5',
    },
    {
      band: 'Agudos & Ar (6kHz - 20kHz)',
      desc: 'Brilho, abertura tridimensional, sofisticação e fidelidade de estúdio.',
      advice: 'Um boost sutil de High Shelf em 10-12kHz abre o vocal sem torná-lo estridente.',
      color: 'border-emerald-500/40 bg-emerald-500/5',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-sky-400" />
            <span>Enciclopédia de Engenharia de Som</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Conceitos essenciais de compressores, frequências e boas práticas no estúdio.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('compressors')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'compressors'
                ? 'bg-zinc-800 text-amber-300'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Compressores
          </button>
          <button
            onClick={() => setActiveTab('frequencies')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'frequencies'
                ? 'bg-zinc-800 text-amber-300'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Espectro de Hz
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'rules'
                ? 'bg-zinc-800 text-amber-300'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Regras de Ouro
          </button>
        </div>
      </div>

      {/* Tab 1: Compressors */}
      {activeTab === 'compressors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compressorTypes.map((comp) => (
            <div
              key={comp.name}
              className="p-5 rounded-xl bg-[#121215] border border-zinc-800/90 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">{comp.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-amber-300 border border-zinc-800">
                  {comp.badge}
                </span>
              </div>

              <div className="text-xs text-zinc-400">
                <strong className="text-zinc-300">Emulações Clássicas:</strong> {comp.examples}
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
                {comp.character}
              </p>

              <div className="text-xs text-zinc-400">
                <span className="text-emerald-400 font-bold block mb-0.5">Onde Brilha:</span>
                <span>{comp.bestFor}</span>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
                <span className="font-bold text-amber-300 block mb-0.5">💡 Dica Prática:</span>
                <span>{comp.proTip}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Frequencies */}
      {activeTab === 'frequencies' && (
        <div className="space-y-3">
          {frequencySpectrum.map((band) => (
            <div
              key={band.band}
              className={`p-4 rounded-xl border ${band.color} space-y-1.5`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{band.band}</h4>
              </div>
              <p className="text-xs text-zinc-300">{band.desc}</p>
              <p className="text-xs text-amber-300/90 font-medium">
                🎯 Como Tratar: {band.advice}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Golden Rules */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ouvido & Monitoração</span>
            </h3>
            <ul className="space-y-2 text-zinc-300 leading-relaxed list-disc list-inside">
              <li>Mistura em volumes baixos onde você consiga conversar sem gritar. O volume alto mascara erros de equilíbrio espectral.</li>
              <li>Faz pausas de 10 minutos a cada 50 minutos de mixagem intensa. Ouvido cansado compensa agudos falsos.</li>
              <li>Usa sempre faixas de referência comercial do mesmo gênero no mesmo volume de audição.</li>
              <li>Testa em mono para garantir que as fases do instrumental e backing vocals não se cancelam.</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
            <h3 className="font-bold text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Cadeias & Processamento</span>
            </h3>
            <ul className="space-y-2 text-zinc-300 leading-relaxed list-disc list-inside">
              <li>EQ Subtrativo antes da Compressão: Remove ressonâncias ruins antes de empurrá-las para dentro do compressor.</li>
              <li>Compressão em série: É infinitamente melhor usar dois compressores reduzindo 2dB cada do que um único compressor reduzindo 6dB.</li>
              <li>Ganho de Entrada (Gain Staging): Deixa as faixas entrarem nos plugins entre -18dBFS e -12dBFS de pico para as emulações analógicas responderem no doce spot.</li>
              <li>Se não sabes o que um plugin está a fazer, desliga-o imediatamente com A/B Bypass.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
