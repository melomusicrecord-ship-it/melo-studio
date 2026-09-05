import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  Cpu,
  Zap,
  AlertTriangle,
  Layers,
  Send,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  Flame,
  Scale,
  Compass,
  CornerDownRight,
  ShieldAlert,
  ArrowRight,
  Sliders,
  WifiOff,
} from 'lucide-react';
import { EXTENDED_PLUGIN_KNOWLEDGE } from '../../data/pluginGuideData';
import { useToast } from '../Toast';
import { usePWA } from '../../hooks/usePWA';

interface GeminiPluginGuideData {
  pluginName: string;
  headline: string;
  circuitType: string;
  acousticFunction: string;
  primaryUseCases: Array<{
    source: string;
    whyItWorks: string;
    startingSetting: string;
  }>;
  proTips: string[];
  commonMistakes: string[];
  equivalentsAndStock: string[];
  producerRuleOfThumb: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface GeminiPluginLearningGuideProps {
  initialPluginName?: string;
  onSelectForVersus?: (pluginName: string) => void;
  onOpenTrainer?: () => void;
}

const POPULAR_SUGGESTIONS = [
  'FabFilter Pro-Q 3',
  'Waves CLA-76',
  'Waves CLA-2A',
  'Waves Renaissance Vox',
  'Soundtoys Decapitator',
  'Oeksound Soothe2',
  'Valhalla VintageVerb',
  'FabFilter Saturn 2',
  'Waves SSL G-Master Bus',
  'FabFilter Pro-C 2',
  'Waves H-Delay',
  'Celemony Melodyne',
  'Soundtoys MicroShift',
  'Waves PuigTec EQP-1A',
];

const TARGET_SOURCES = [
  'Geral / Todos os Canais',
  'Vocal Lead (Principal)',
  'Backing Vocals & Adlibs',
  'Bateria (Bumbo & Caixa)',
  '808 & Sub-Grave',
  'Guitarras & Teclados',
  'Mix Bus & Master',
];

// In-memory client cache to protect Gemini API quota and provide instant retrieval
const clientGuideCache = new Map<string, GeminiPluginGuideData>();

export function GeminiPluginLearningGuide({
  initialPluginName,
  onSelectForVersus,
  onOpenTrainer,
}: GeminiPluginLearningGuideProps) {
  const { showToast } = useToast();
  const { isOnline } = usePWA();

  const [pluginQuery, setPluginQuery] = useState<string>(initialPluginName || 'FabFilter Pro-Q 3');
  const [selectedSource, setSelectedSource] = useState<string>('Vocal Lead (Principal)');
  const [specificQuestion, setSpecificQuestion] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [guideData, setGuideData] = useState<GeminiPluginGuideData | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  // Real-time Chat with Gemini
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatInput, setCurrentChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Sync if initialPluginName prop changes or initial load (single call on mount)
  const initialLoadDoneRef = useRef(false);
  useEffect(() => {
    if (initialPluginName) {
      setPluginQuery(initialPluginName);
      fetchPluginGuide(initialPluginName, selectedSource);
      initialLoadDoneRef.current = true;
    } else if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      fetchPluginGuide(pluginQuery, selectedSource);
    }
  }, [initialPluginName]);

  // Fetch guide from server or fallback
  const fetchPluginGuide = async (name: string, source: string, question?: string) => {
    if (!name.trim()) return;
    const cacheKey = `${name.toLowerCase().trim()}__${source.toLowerCase()}__${(question || '').toLowerCase()}`;

    // Instant return if in client cache
    if (clientGuideCache.has(cacheKey)) {
      setGuideData(clientGuideCache.get(cacheKey)!);
      setIsAiGenerated(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // If offline, bypass network call directly
    if (isOnline) {
      try {
        const res = await fetch('/api/gemini/plugin-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pluginName: name.trim(),
            targetSource: source,
            specificQuestion: question || undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          clientGuideCache.set(cacheKey, data);
          setGuideData(data);
          setIsAiGenerated(true);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('API Gemini server offline ou erro de rede, usando base local:', err);
      }
    }

    // Fallback if API fails or offline
    const matched = EXTENDED_PLUGIN_KNOWLEDGE.find(
      (p) => p.pluginName.toLowerCase() === name.toLowerCase()
    ) || EXTENDED_PLUGIN_KNOWLEDGE.find(
      (p) => p.pluginName.toLowerCase().includes(name.toLowerCase())
    );

    if (matched) {
      setGuideData({
        pluginName: matched.pluginName,
        headline: matched.whatItDoes.split('.')[0] + '.',
        circuitType: matched.circuitTopology,
        acousticFunction: matched.whatItDoes,
        primaryUseCases: [
          {
            source: source,
            whyItWorks: matched.whyUseIt,
            startingSetting: matched.practicalExample,
          },
          {
            source: 'Mix Geral & Outras Fontes',
            whyItWorks: matched.whenToUse,
            startingSetting: matched.suggestedDosage.moderate,
          },
        ],
        proTips: [
          matched.practicalExample,
          `Ouça: ${matched.whatToHear}`,
          `Atenção: ${matched.suggestedDosage.safetyNotice}`,
        ],
        commonMistakes: [
          matched.commonMistakes,
          `Se abusar: ${matched.whatIfOverused}`,
        ],
        equivalentsAndStock: matched.alternatives,
        producerRuleOfThumb: `Evite o erro clássico: ${matched.commonMistakes}`,
      });
      setIsAiGenerated(false);
    } else {
      // Generic intelligent fallback
      setGuideData({
        pluginName: name,
        headline: `Processador de áudio para modelagem sonora em estúdio.`,
        circuitType: 'Processamento Digital / Emulação Analógica',
        acousticFunction: `O ${name} manipula o envelope, a resposta de fase e a dinâmica da forma de onda. No canal de ${source}, configure com atenção ao ganho de entrada (Gain Staging) mantendo o nível em -18 dBFS.`,
        primaryUseCases: [
          {
            source: source,
            whyItWorks: `Ideal para controlar a energia espectral e o equilíbrio dinâmico na mixagem contemporânea.`,
            startingSetting: `Ajuste com pequenos passos (1 a 3 dB) comparando sempre com o botão Bypass ativo.`,
          },
        ],
        proTips: [
          `Sempre compense o ganho de saída (Make-up) para avaliar a melhora pelo timbre, não pelo volume.`,
          `Em mixagens densas, filtre ressonâncias antes de saturar ou comprimir pesadamente.`,
        ],
        commonMistakes: [
          `Aplicar o plugin às cegas por preset sem ouvir a interação com a bateria e o baixo.`,
        ],
        equivalentsAndStock: ['Plugins nativos da sua DAW (EQ Paramétrico e Compressor com Knee)'],
        producerRuleOfThumb: 'Menos é mais: se uma alteração não for claramente audível em -1 dB, não force 6 dB sem motivo.',
      });
      setIsAiGenerated(false);
    }

    setIsLoading(false);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPluginGuide(pluginQuery, selectedSource, specificQuestion);
  };

  const handleSelectQuickPlugin = (name: string) => {
    setPluginQuery(name);
    fetchPluginGuide(name, selectedSource, specificQuestion);
  };

  const handleCopyGuide = () => {
    if (!guideData) return;
    const text = `🎛️ [GUIA PEDAGÓGICO DE PLUGIN • MELO STUDIO HUB]
Nome: ${guideData.pluginName}
Circuito: ${guideData.circuitType}
Resumo: ${guideData.headline}

📌 Como Funciona:
${guideData.acousticFunction}

⚡ Casos de Uso & Sweet Spots:
${guideData.primaryUseCases.map((u) => `• ${u.source}: ${u.whyItWorks} (Início: ${u.startingSetting})`).join('\n')}

💡 Dicas Avançadas:
${guideData.proTips.map((t) => `• ${t}`).join('\n')}

⚠️ Erros Comuns:
${guideData.commonMistakes.map((m) => `• ${m}`).join('\n')}

🔄 Alternativas:
${guideData.equivalentsAndStock.join(', ')}

🎯 Regra de Ouro:
"${guideData.producerRuleOfThumb}"`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast('Guia pedagógico copiado para a área de transferência!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendChatMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentChatInput.trim() || isSendingChat) return;

    const userText = currentChatInput.trim();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setCurrentChatInput('');
    setIsSendingChat(true);

    try {
      if (!isOnline) {
        // Instant dynamic offline knowledge engine
        const currentPlugin = guideData?.pluginName || pluginQuery;
        const matched = EXTENDED_PLUGIN_KNOWLEDGE.find(
          (p) => p.pluginName.toLowerCase() === currentPlugin.toLowerCase()
        );

        let offlineReply = '';
        const lowerQ = userText.toLowerCase();

        if (lowerQ.includes('vocal') || lowerQ.includes('voz')) {
          offlineReply = `🎙️ [Modo Offline - Mentor]: Para vocal usando ${currentPlugin}, ${
            matched ? matched.practicalExample : 'calibre o ganho de entrada para bater em torno de -18 dBFS RMS. No equalizador, limpe os subgraves abaixo de 80 Hz com filtro High-Pass (18 dB/oct) e aplique compressão suave (2:1 a 4:1) reduzindo no máximo 3 a 5 dB nos picos.'
          }`;
        } else if (lowerQ.includes('808') || lowerQ.includes('grave') || lowerQ.includes('baixo') || lowerQ.includes('bass')) {
          offlineReply = `🔊 [Modo Offline - Mentor]: No grave/808 com ${currentPlugin}: ${
            matched?.whatItDoes || 'mantenha a faixa de 20 Hz a 120 Hz em Mono absoluto para evitar cancelamento de fase nos subwoofers. Destaque harmônicos entre 600 Hz e 900 Hz com saturação para o 808 ser audível em autofalantes de celular.'
          }`;
        } else if (lowerQ.includes('ratio') || lowerQ.includes('attack') || lowerQ.includes('release') || lowerQ.includes('compressor')) {
          offlineReply = `🎛️ [Modo Offline - Mentor]: Ajuste de dinâmica para ${currentPlugin}: ${
            matched?.suggestedDosage?.moderate || 'Ataque médio-lento (15 a 30 ms) preserva o punch/transiente inicial; liberação (release) rápida (50 a 100 ms) sincronizada com o andamento musical traz densidade sem abafar o sinal.'
          }`;
        } else {
          offlineReply = `💡 [Modo Offline - Mentor]: Para o ${currentPlugin}: ${
            matched
              ? `${matched.whatItDoes}. Regra de ouro: ${matched.commonMistakes}. Dica prática: ${matched.practicalExample}`
              : 'Sempre compare a mixagem com o botão Bypass e compensação de ganho em tempo real. Nunca adicione mais de 3 dB de ganho sem verificar a fase e o teto de headroom (-1 dB True Peak).'
          }`;
        }

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: offlineReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, botMsg]);
        return;
      }

      const res = await fetch('/api/gemini/audio-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          pluginContext: guideData?.pluginName || pluginQuery,
          conversationHistory: chatMessages.slice(-4),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Falha na resposta da IA');
      }
    } catch (err) {
      const botFallback: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `Para o ${guideData?.pluginName || 'plugin'}, a recomendação clássica de engenharia é sempre ouvir com compensação de ganho. Mantenha os níveis de entrada por volta de -18 dBFS RMS e use a escuta em mono para verificar se a intervenção não causou perda de fase.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, botFallback]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Configuration Header Card */}
      <div className="rounded-2xl bg-[#121216] border border-amber-500/30 p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Guia de Aprendizado IA • Mentor de Engenharia de Áudio com Gemini</span>
          </div>

          <div className="flex items-center gap-2">
            {isAiGenerated ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Gemini 3.8 Flash • Online</span>
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                Enciclopédia Integrada
              </span>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Aprenda a Usar Qualquer Plugin em Tempo Real
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">
            Digite o nome de qualquer ferramenta (da Waves, FabFilter, Soundtoys, etc.) e o Gemini
            irá desmistificar a física do processador, o circuito analógico, onde ele brilha e os
            erros que destroem a mixagem.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Plugin Name Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={pluginQuery}
                onChange={(e) => setPluginQuery(e.target.value)}
                placeholder="Ex: FabFilter Pro-Q 3, CLA-76, Decapitator, Soothe2..."
                className="w-full bg-zinc-950 border border-zinc-750 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Target Source Dropdown */}
            <div className="md:col-span-4">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-750 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none transition-colors"
              >
                {TARGET_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-full min-h-[42px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-95 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Explicar com IA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional specific question */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-zinc-500 shrink-0 font-medium">Dúvida específica (opcional):</span>
            <input
              type="text"
              value={specificQuestion}
              onChange={(e) => setSpecificQuestion(e.target.value)}
              placeholder="Ex: Como usar no vocal de trap? Qual ataque usar no bumbo rápido a 140 BPM?"
              className="flex-1 bg-zinc-950/80 border border-zinc-800 focus:border-amber-500/70 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
            />
          </div>
        </form>

        {/* Popular Plugin Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 font-mono">
            Exploração Rápida (Clique para aprender):
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {POPULAR_SUGGESTIONS.map((name) => (
              <button
                key={name}
                onClick={() => handleSelectQuickPlugin(name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                  pluginQuery.toLowerCase() === name.toLowerCase()
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-[#121216] border border-zinc-800 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Consultando o Mentor Gemini IA...
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Analisando arquitetura analógica, dinâmica de transientes, ponto de saturação e
              sweet spots para <span className="text-amber-400 font-semibold">{pluginQuery}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Guide Content Display */}
      {!isLoading && guideData && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Main Title & Action Bar */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121216] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {guideData.pluginName}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{guideData.circuitType}</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {selectedSource}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-300/90 font-medium mt-1.5">
                "{guideData.headline}"
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyGuide}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Copiar este guia"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
              </button>

              {onSelectForVersus && (
                <button
                  onClick={() => onSelectForVersus(guideData.pluginName)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Comparar no Versus</span>
                </button>
              )}

              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isChatOpen
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Tirar Dúvidas com Gemini</span>
              </button>
            </div>
          </div>

          {/* Interactive Chat Drawer / Box */}
          {isChatOpen && (
            <div className="rounded-2xl bg-[#0f0f14] border border-amber-500/40 p-4 sm:p-5 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Sessão Interativa com o Mentor Gemini sobre {guideData.pluginName}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500">
                  Pergunte sobre ajustes para seu estilo musical
                </span>
              </div>

              {/* Chat Message List */}
              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {chatMessages.length === 0 && (
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
                    <p className="font-semibold text-zinc-200">
                      💬 O que você gostaria de saber sobre este plugin?
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Sugestões: "Como configurar para o vocal de Trap?", "O que acontece se eu usar
                      no Mix Bus?", "Qual a diferença do modo Blackface para o Blue Stripe?".
                    </p>
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-amber-500 text-zinc-950 font-medium rounded-br-none'
                          : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-zinc-600 px-1 mt-0.5">
                      {msg.role === 'user' ? 'Você' : 'Mentor Gemini'} • {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isSendingChat && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 p-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>O mentor está formulando uma resposta técnica...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={currentChatInput}
                  onChange={(e) => setCurrentChatInput(e.target.value)}
                  placeholder={`Pergunte algo ao Gemini sobre o ${guideData.pluginName}...`}
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!currentChatInput.trim() || isSendingChat}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          )}

          {/* Section 1: How it Works Physically & Acoustically */}
          <div className="rounded-2xl bg-[#121216] border border-zinc-800 p-5 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>1. Como Funciona no Sinal • Física & Acústica do Efeito</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-850">
              {guideData.acousticFunction}
            </p>
          </div>

          {/* Section 2: Primary Use Cases & Sweet Spot Settings */}
          <div className="rounded-2xl bg-[#121216] border border-zinc-800 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>2. Casos de Uso Primários & Ponto de Partida (Sweet Spots)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {guideData.primaryUseCases.map((useCase, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{useCase.source}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {useCase.whyItWorks}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-0.5 font-mono">
                      Configuração de Ponto de Partida:
                    </span>
                    <span className="text-xs font-mono font-semibold text-amber-300">
                      {useCase.startingSetting}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Pro Tips vs Common Mistakes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pro Tips */}
            <div className="rounded-2xl bg-[#121216] border border-zinc-800 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>3. Segredos de Estúdio & Dicas Avançadas</span>
              </div>
              <ul className="space-y-2">
                {guideData.proTips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-xs text-zinc-300 flex items-start gap-2 bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl leading-relaxed"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div className="rounded-2xl bg-[#121216] border border-zinc-800 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>4. Erros Clássicos & O Que Destrói a Mix</span>
              </div>
              <ul className="space-y-2">
                {guideData.commonMistakes.map((mistake, i) => (
                  <li
                    key={i}
                    className="text-xs text-zinc-300 flex items-start gap-2 bg-rose-950/20 border border-rose-500/20 p-3 rounded-xl leading-relaxed"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 4: Equivalents & Producer Rule of Thumb */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Equivalents */}
            <div className="md:col-span-5 rounded-2xl bg-[#121216] border border-zinc-800 p-5 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Alternativas Nativas & Equivalentes</span>
              </span>
              <p className="text-[11px] text-zinc-400">
                Se você não possui o {guideData.pluginName}, experimente:
              </p>
              <div className="space-y-1.5 pt-1">
                {guideData.equivalentsAndStock.map((alt, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium flex items-center gap-2"
                  >
                    <CornerDownRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{alt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Golden Rule of Thumb */}
            <div className="md:col-span-7 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#16161b] to-zinc-900 border border-amber-500/40 p-5 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Regra de Ouro do Produtor Musical</span>
                </span>
                <p className="text-sm sm:text-base font-bold text-white mt-2 leading-relaxed italic">
                  "{guideData.producerRuleOfThumb}"
                </p>
              </div>

              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">
                  Leve esse princípio consigo sempre que inserir este plugin no canal.
                </span>
                {onOpenTrainer && (
                  <button
                    onClick={onOpenTrainer}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Testar no Treinador</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
