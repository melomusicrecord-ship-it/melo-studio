import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy Gemini Client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      aiClient = new GoogleGenAI({
        apiKey: apiKey || '',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // In-memory cache for plugin guides and chat replies (reduces Gemini API quota usage)
  const pluginGuideCache = new Map<string, any>();
  const chatReplyCache = new Map<string, string>();

  // Curated acoustic engineering knowledge for studio plugins
  function getExpertAudioGuide(
    pluginName: string,
    category?: string,
    targetSource?: string,
    specificQuestion?: string
  ) {
    const pLower = pluginName.toLowerCase();
    const source = targetSource || 'Vocal Lead / Mix Principal';

    if (pLower.includes('pro-q') || (pLower.includes('eq') && pLower.includes('fabfilter'))) {
      return {
        pluginName: 'FabFilter Pro-Q 3',
        headline: 'O padrão global em equalização cirúrgica digital com fase linear e bandas dinâmicas.',
        circuitType: 'Digital Cirúrgico / Modos Zero Latency, Natural Phase e Linear Phase',
        acousticFunction: 'Manipula a amplitude de frequências discretas através de filtros de fase mínima ou linear sem introduzir distorção harmônica. O modo dinâmico atua como um compressor multibanda cirúrgico em frequências problemáticas.',
        primaryUseCases: [
          {
            source: source,
            whyItWorks: 'Permite limpar ressonâncias estáticas de captação e cortar a lama de 200–400 Hz com precisão microscópica.',
            startingSetting: 'HPF a 85 Hz (18 dB/oct) + corte dinâmico de -3 dB em 320 Hz (Q 3.5) + High Shelf suave em 12 kHz (+1.5 dB).'
          },
          {
            source: 'Mix Bus / Master',
            whyItWorks: 'Em modo Linear Phase, faz ajustes tonais sem degradar o alinhamento de fase dos transientes da bateria e do baixo.',
            startingSetting: 'Cortes ou aumentos máximos de 0.5 a 1.0 dB com curvas muito amplas (Q 0.7).'
          }
        ],
        proTips: [
          'Use o "Spectrum Grab" pausando o analisador para localizar e puxar apitos de ressonância com facilidade.',
          'No modo Natural Phase, o Pro-Q 3 simula a resposta de fase analógica com zero pré-ringing.',
          'Ative a audição em Solo (ícone do fone) para ouvir apenas o que a banda está cortando antes de decidir a atenuação.'
        ],
        commonMistakes: [
          'Fazer dezenas de cortes profundos e estreitos desnecessários, esvaziando o corpo e a naturalidade do som.',
          'Dar boosts estreitos em frequências agudas acima de 4 kHz, gerando aspereza e cansaço auditivo.'
        ],
        equivalentsAndStock: [
          'TDR Nova (Excelente alternativa gratuita com EQ dinâmico)',
          'Equalizador paramétrico nativo da sua DAW (Fruity Parametric EQ 2, ReaEQ, Logic Channel EQ)'
        ],
        producerRuleOfThumb: 'Corte estreito para corrigir defeitos (Q alto); aumente largo para embelezar o timbre (Q baixo).'
      };
    }

    if (pLower.includes('76') || pLower.includes('cla-76') || pLower.includes('1176')) {
      return {
        pluginName: 'Universal Audio 1176 / Waves CLA-76',
        headline: 'O compressor FET ultra-rápido lendário para transientes agressivos e presença na cara.',
        circuitType: 'FET (Field Effect Transistor) Analógico Discreto',
        acousticFunction: 'Atua com tempos de ataque incrivelmente rápidos (de 20 a 800 microssegundos). Modela os transientes iniciais da voz ou instrumento e injeta distorção harmônica agradável que projeta o som para a frente da caixa.',
        primaryUseCases: [
          {
            source: source,
            whyItWorks: 'Segura as consoantes explosivas mais rápidas que escapam dos compressores comuns, trazendo consistência.',
            startingSetting: 'Attack: 3 (médio-rápido), Release: 7 (ultra-rápido), Ratio 4:1. Regule o Input para 3 a 5 dB de redução nos picos.'
          },
          {
            source: 'Caixa de Bateria / Percussão',
            whyItWorks: 'Adiciona punch agressivo e sustentação do corpo da peça.',
            startingSetting: 'Attack 4, Release 5, Ratio 8:1 com redução de 4 dB.'
          }
        ],
        proTips: [
          'Lembre-se: no 1176, os botões são invertidos! O número 7 é o MAIS RÁPIDO e o número 1 é o mais lento.',
          'Coloque o 1176 antes de um LA-2A para a clássica técnica em série: o 1176 doma os picos rápidos e o LA-2A cuida do sustain.',
          'Modo Blue Stripe (Bluey) adiciona mais harmônicos e agressividade que o Blackface tradicional.'
        ],
        commonMistakes: [
          'Usar ataque no 7 no bumbo ou caixa, esmagando completamente o ataque do transiente e deixando o som sem impacto.',
          'Não compensar o ganho no Output, acreditando que o som melhorou apenas porque está mais alto.'
        ],
        equivalentsAndStock: [
          'Analog Obsession FETISH (Gratuito)',
          'Compressor nativo da DAW em modo Peak com ataque abaixo de 1 ms'
        ],
        producerRuleOfThumb: '1176 é para atitude, controle de picos e projeção frontal no palco sonoro.'
      };
    }

    if (pLower.includes('soothe') || pLower.includes('soothe2')) {
      return {
        pluginName: 'Oeksound Soothe2',
        headline: 'O supressor dinâmico de ressonâncias mais respeitado para eliminar aspereza e sibilância.',
        circuitType: 'Processamento Espectral Adaptativo em Tempo Real',
        acousticFunction: 'Analisa o espectro em tempo real procurando picos ressonantes desproporcionais e aplica micro-atenuações dinâmicas instantâneas sem alterar o equilíbrio espectral estático do áudio.',
        primaryUseCases: [
          {
            source: source,
            whyItWorks: 'Elimina o som estridente e metálico de microfones condensadores baratos na faixa de 2.5 kHz a 7 kHz.',
            startingSetting: 'Depth: 2.0 a 3.5, Sharpness: 5.0, Selectivity: 5.0. Ative o filtro passa-banda para focar entre 2 kHz e 9 kHz.'
          },
          {
            source: 'Overheads de Bateria / Pratos',
            whyItWorks: 'Remove o chiado estridente dos pratos sem abafar o brilho e o sustain.',
            startingSetting: 'Depth moderado (2.5) focado nos médios-altos.'
          }
        ],
        proTips: [
          'Use o modo "Delta" (botão de diferença) para ouvir EXCLUSIVAMENTE o que o Soothe2 está removendo. Se ouvir o timbre musical da voz, você foi longe demais.',
          'No modo Ultra, o Soothe2 tem oversampling de altíssima precisão, ideal para a fase final de renderização.',
          'Posicione o Soothe2 antes da compressão pesada para evitar que o compressor amplifique as ressonâncias.'
        ],
        commonMistakes: [
          'Exagerar no Depth (>5.0), deixando o vocal oco, sem presença e com som de MP3 de baixa resolução.',
          'Processar a faixa inteira sem delimitar os nós de corte nos graves e subgraves.'
        ],
        equivalentsAndStock: [
          'FabFilter Pro-Q 3 em modo Dynamic EQ nas frequências problemáticas',
          'Baby Audio Smooth Operator'
        ],
        producerRuleOfThumb: 'Soothe2 deve ser sentido e não percebido: a voz deve soar suave, não fosca.'
      };
    }

    if (pLower.includes('la-2a') || pLower.includes('cla-2a') || pLower.includes('cl 1b') || pLower.includes('cl1b') || pLower.includes('tube-tech')) {
      return {
        pluginName: pLower.includes('cl') ? 'Tube-Tech CL 1B' : 'Teletronix LA-2A / Waves CLA-2A',
        headline: 'A suavidade do circuito óptico a válvula para nivelamento musical e calor analógico.',
        circuitType: 'Compressor Óptico valvulado com fotocélula eletroluminescente (T4 cell)',
        acousticFunction: 'Utiliza uma célula óptica sensível à luz que reage com ataque dependente do programa e liberação em dois estágios (50% nos primeiros 60ms e o restante ao longo de segundos), conferindo um sustain sedoso e orgânico.',
        primaryUseCases: [
          {
            source: source,
            whyItWorks: 'Nivela o volume das estrofes com o refrão sem criar artefatos audíveis de bombeamento (pumping).',
            startingSetting: 'Peak Reduction ajustado para 2 a 3 dB de redução de ganho nas notas mais longas.'
          },
          {
            source: 'Baixo Elétrico / Sintético',
            whyItWorks: 'Garante que todas as notas do baixo tenham o mesmo peso e sustentação na mixagem.',
            startingSetting: 'Modo Compress com 3 a 4 dB de compressão constante.'
          }
        ],
        proTips: [
          'Não tema ver o ponteiro se mexendo suavemente durante toda a performance vocal; o LA-2A foi feito para agir constantemente.',
          'Na versão Tube-Tech CL 1B, você pode escolher Attack manual (10 a 20 ms) e Release manual (0.3 a 0.5 s) para vocais pop modernos e rápidos.',
          'A saturação das válvulas deste circuito ajuda a "engordar" vocais finos de forma natural.'
        ],
        commonMistakes: [
          'Tentar usá-lo para capturar transientes percussivos rápidos — sua fotocélula é propositalmente lenta demais para isso.',
          'Comprimir mais de 7–8 dB continuamente sem um compressor rápido antes para segurar os picos.'
        ],
        equivalentsAndStock: [
          'Analog Obsession LALA (Gratuito)',
          'Compressor nativo em modo Opto com release automático lento'
        ],
        producerRuleOfThumb: 'Se o 1176 é o martelo que bate nos picos, o LA-2A é o abraço que acolhe o corpo da voz.'
      };
    }

    if (pLower.includes('vintageverb') || pLower.includes('valhalla') || pLower.includes('reverb') || pLower.includes('pro-r')) {
      return {
        pluginName: 'Valhalla VintageVerb / FabFilter Pro-R 2',
        headline: 'Ambiência estéreo expansiva 3D inspirada nos clássicos de estúdio dos anos 70 e 80.',
        circuitType: 'Algoritmo Digital de Linhas de Atraso e Difusão Estéreo',
        acousticFunction: 'Cria uma densa teia de reflexões iniciais e cauda reverberante que simula a física de espaços acústicos reais ou salões lendários, expandindo o plano de profundidade e a largura estéreo da mix.',
        primaryUseCases: [
          {
            source: 'Canal Auxiliar (Send FX)',
            whyItWorks: 'No canal auxiliar, mantém o vocal seco limpo e com foco frontal, adicionando a cauda em paralelo com controle total de ducking.',
            startingSetting: 'Mix 100% Wet, Decay 2.6 a 3.0s, Pre-delay 35ms, Color 1980s, Low Cut 450 Hz, High Cut 6.5 kHz.'
          }
        ],
        proTips: [
          'Sempre configure o Pre-delay entre 25ms e 50ms: isso separa a voz seca do reverb, evitando que o vocal soe longe ou abafado.',
          'Técnica Abbey Road: insira um EQ cortando abaixo de 500 Hz e acima de 7 kHz antes ou depois do reverb no canal auxiliar.',
          'Aplique um compressor com Sidechain Ducking linkado à voz lead: quando a voz canta, o reverb abaixa 4 dB; quando a voz para, a cauda floresce.'
        ],
        commonMistakes: [
          'Inserir o reverb diretamente no canal da voz (Insert) com Mix em 30%, perdendo a clareza e a presença frontal.',
          'Deixar subgraves e sibilâncias entrarem no reverb, criando um ambiente sujo e com sibilâncias espalhadas.'
        ],
        equivalentsAndStock: [
          'Fruity Reverb 2 / Logic ChromaVerb',
          'Valhalla Supermassive (Gratuito)'
        ],
        producerRuleOfThumb: 'Reverb bom em mix moderna é aquele que você sente quando desliga, mas não percebe enquanto a música toca.'
      };
    }

    if (pLower.includes('pro-l') || pLower.includes('limiter') || pLower.includes('maximizer')) {
      return {
        pluginName: 'FabFilter Pro-L 2',
        headline: 'O limitador de pico verdadeiro profissional para transparência absoluta e sonoridade comercial.',
        circuitType: 'Limiter Digital de Lookahead com Oversampling e Detecção True Peak',
        acousticFunction: 'Previne que o sinal ultrapasse um teto (ceiling) pré-determinado, calculando o ganho de atenuação com algoritmos avançados de lookahead e modelagem de transientes para evitar distorção interamostral.',
        primaryUseCases: [
          {
            source: 'Master Bus (Slot Final)',
            whyItWorks: 'Garante que a música atinja a sonoridade comercial competitiva sem distorcer em plataformas como Spotify e Apple Music.',
            startingSetting: 'Style: Modern ou Transparent, Lookahead: 0.8ms, True Peak Limiting: ON, Output Ceiling: -1.0 dBTP, Gain: 2 a 4 dB até obter 1.5 a 2.5 dB de GR nos picos.'
          },
          {
            source: 'Vocal Bus',
            whyItWorks: 'Captura os picos mais agressivos com segurança milimétrica antes da Master.',
            startingSetting: 'Atenuação de no máximo 0.5 a 1.0 dB apenas nas sílabas mais fortes.'
          }
        ],
        proTips: [
          'Nunca coloque o Ceiling em 0.0 dB! Sempre use -1.0 dBTP para garantir que a compressão para MP3/AAC das plataformas de streaming não gere distorção.',
          'Use o algoritmo "Modern" para pop, rap e música eletrônica moderna, e "Dynamic" ou "Transparent" para acoustic e jazz.',
          'Monitore o Integrated LUFS ao mesmo tempo: busque entre -9 e -11 LUFS para streaming contemporâneo.'
        ],
        commonMistakes: [
          'Esmagar o limitador com 6 a 8 dB de redução, destruindo o impacto do bumbo e da caixa e gerando fadiga auditiva.',
          'Colocar outros plugins DEPOIS do limitador (exceto medidores como o Youlean Loudness Meter).'
        ],
        equivalentsAndStock: [
          'Fruity Limiter / Logic Adaptive Limiter',
          'Vladg Limiter No.6 (Gratuito)'
        ],
        producerRuleOfThumb: 'O limitador não serve para criar volume do nada; ele serve para selar uma mixagem que já está equilibrada.'
      };
    }

    // Smart parametric fallback for any audio plugin
    const isComp = pLower.includes('comp') || pLower.includes('press') || (category && category.toLowerCase().includes('comp'));
    const isEq = pLower.includes('eq') || (category && category.toLowerCase().includes('eq'));
    const isSat = pLower.includes('sat') || pLower.includes('tape') || pLower.includes('drive') || pLower.includes('dist');
    const isDelay = pLower.includes('delay') || pLower.includes('echo');

    let dynamicCircuit = 'Processamento Digital de Alta Precisão / Modelagem de Componentes Físicos';
    if (isComp) dynamicCircuit = 'Circuito Dinâmico com Controle de Envelope VCA / Feedback';
    if (isEq) dynamicCircuit = 'Arquitetura de Filtragem Paramétrica de Curva Mínima / IIR';
    if (isSat) dynamicCircuit = 'Emulação de Saturação Harmônica Não-Linear / Fita Magnética & Válvulas';
    if (isDelay) dynamicCircuit = 'Linha de Atraso Estéreo Sincronizada ao Clock de BPM';

    return {
      pluginName: pluginName,
      headline: `Processador de estúdio renomado para modelagem sonora e controle preciso de ${category || 'áudio'}.`,
      circuitType: dynamicCircuit,
      acousticFunction: `O ${pluginName} processa o sinal manipulando as relações de fase, conteúdo espectral e dinâmica temporal. No canal de ${source}, atua garantindo clareza, definição de contorno e compatibilidade com o arranjo musical.`,
      primaryUseCases: [
        {
          source: source,
          whyItWorks: `Ideal para controlar a energia espectral e o equilíbrio dinâmico na mixagem contemporânea.`,
          startingSetting: `Ajuste com passos graduais e sempre calibre o nível de entrada (Gain Staging) mantendo o sinal em torno de -18 dBFS RMS.`
        },
        {
          source: 'Submix / Bus Auxiliar',
          whyItWorks: 'Garante coesão acústica quando múltiplos elementos sonoros tocam ao mesmo tempo.',
          startingSetting: 'Aplicação moderada (10% a 25% de dosagem) para unificar o timbre geral.'
        }
      ],
      proTips: [
        'Sempre use a técnica de Gain Matching: compense o ganho de saída para avaliar a intervenção pelo timbre real, e não pelo volume maior.',
        'Em mixagens densas, aplique filtros corretivos antes de saturar ou comprimir pesadamente.',
        'Ouça o resultado com a mixagem inteira ligada (em contexto), e nunca exclusivamente em modo Solo.'
      ],
      commonMistakes: [
        'Aplicar presets genéricos às cegas sem ajustar os parâmetros para a dinâmica específica da gravação.',
        'Exagerar na dosagem dos parâmetros sem conferir a compatibilidade em sistemas de som mono.'
      ],
      equivalentsAndStock: [
        'Processadores nativos da sua DAW configurados com valores equivalentes de ataque, decaimento e curva.',
        'Plugins renomados equivalentes do catálogo padrão de estúdio.'
      ],
      producerRuleOfThumb: 'A melhor ferramenta é aquela que você domina: entenda o propósito de cada botão antes de girá-lo.'
    };
  }

  // Audio engineering reply generator for chat fallback
  function getExpertAudioChatReply(message: string, pluginContext?: string): string {
    const mLower = message.toLowerCase();
    const ctx = pluginContext || 'o plugin selecionado';

    if (mLower.includes('ordem') || mLower.includes('cadeia') || mLower.includes('posi')) {
      return `Na ordem ideal da cadeia de processamento vocal, a regra de ouro é:
1º EQ Cirúrgico (limpeza e corte de subgraves com HPF em 85 Hz);
2º Supressor de ressonâncias (Soothe2 ou EQ dinâmico);
3º Compressor rápido FET (1176) para domar os picos de consoantes;
4º De-Esser para amaciar os "S";
5º Compressor óptico musical (CL 1B ou LA-2A) para dar sustentação e calor;
6º EQ tonal / Air Band para abrir o brilho nos agudos;
Os efeitos de ambiência (Reverb e Delay) devem sempre ser usados em Canais Auxiliares (Sends) paralelos, desaguando juntos no Vocal Bus antes da Master.`;
    }

    if (mLower.includes('reverb') || mLower.includes('delay') || mLower.includes('abafad') || mLower.includes('limpo')) {
      return `Para obter um reverb largo sem abafar a voz (o segredo das produções de ponta):
1. Use sempre o Reverb em um Canal Auxiliar (Send), com o Mix em 100% Wet;
2. Filtre o Reverb com a técnica Abbey Road: corte tudo abaixo de 500 Hz e acima de 7 kHz;
3. Ajuste o Pre-delay entre 35 e 45 ms para que a voz seca seja ouvida com clareza antes da cauda;
4. Adicione um compressor com Sidechain Ducking linkado à voz no canal do Reverb: enquanto o vocal canta, o reverb atenua 4 dB; quando o vocal pausa, o espaço 3D abre.`;
    }

    if (mLower.includes('compress') || mLower.includes('ataque') || mLower.includes('release')) {
      return `Ao calibrar compressores para vocais:
- Ataque rápido (menos de 1 ms no 1176): doma picos e traz o som para a frente;
- Ataque mais lento (10 a 30 ms): deixa o transiente passar com impacto e punch;
- Release rápido: recupera o volume rapidamente gerando agressividade e densidade;
- Release automático/lento (LA-2A): garante estabilidade transparente sem bombeamento audível.`;
    }

    return `Para ${ctx}, a recomendação fundamental de engenharia é:
1. Mantenha os níveis de ganho de entrada (Gain Staging) alinhados em torno de -18 dBFS RMS para operar na faixa doce do circuito;
2. Sempre use a compensação de ganho (Gain Matching) para checar se a alteração realmente melhorou a qualidade sonora e não apenas adicionou volume;
3. No canal de mixagem, avalie as decisões sempre com o arranjo completo tocando (com instrumental ativo).`;
  }

  // 1. Real-time Gemini Plugin Learning Guide
  app.post('/api/gemini/plugin-guide', async (req, res) => {
    try {
      const { pluginName, category, targetSource, specificQuestion } = req.body;
      if (!pluginName || typeof pluginName !== 'string') {
        return res.status(400).json({ error: 'Nome do plugin é obrigatório' });
      }

      const cacheKey = `${pluginName.toLowerCase().trim()}__${(targetSource || '').toLowerCase()}__${(specificQuestion || '').toLowerCase()}`;
      if (pluginGuideCache.has(cacheKey)) {
        return res.json(pluginGuideCache.get(cacheKey));
      }

      const apiKey = process.env.GEMINI_API_KEY;

      // If Gemini API is configured, attempt generation with resilient multi-model fallback
      if (apiKey) {
        try {
          const ai = getGeminiClient();
          const prompt = `Você é um renomado Engenheiro de Áudio e Professor Sênior de Mixagem e Masterização.
Gere um Guia de Aprendizado completo, altamente didático, prático e técnico sobre o seguinte plugin de áudio:
Nome do Plugin: "${pluginName}"
${category ? `Categoria: ${category}` : ''}
${targetSource ? `Canal / Fonte Alvo: ${targetSource}` : ''}
${specificQuestion ? `Dúvida Específica do Produtor: "${specificQuestion}"` : ''}

Você deve responder em Português do Brasil com linguagem fluida, precisa e rica em ensinamentos acústicos e de engenharia de áudio.
Retorne ESTRITAMENTE um objeto JSON válido (sem markdown ou texto extra fora do JSON) com esta estrutura exata:
{
  "pluginName": "${pluginName}",
  "headline": "Frase de impacto explicando o propósito e a essência sonora deste processador",
  "circuitType": "Tipo de circuito ou arquitetura digital (ex: FET, VCA, Vari-Mu, Óptico, EQ Digital Fase Linear, Algoritmo de Saturação, Convolução, etc.)",
  "acousticFunction": "Explicação detalhada e pedagógica de como o plugin manipula o sinal elétrico/digital e o que ele faz fisicamente com a forma de onda, transientes e harmônicos.",
  "primaryUseCases": [
    {
      "source": "Nome do canal (ex: Vocal Lead, Bateria/Caixa, 808/Sub, Mix Bus, etc.)",
      "whyItWorks": "Por que este plugin se destaca especificamente nesta aplicação",
      "startingSetting": "Ponto de partida recomendado com valores específicos (ex: Attack, Release, Ratio, Frequência, Drive, Mix %)"
    }
  ],
  "proTips": [
    "Dica avançada 1 com segredo ou técnica real de estúdio",
    "Dica avançada 2",
    "Dica avançada 3"
  ],
  "commonMistakes": [
    "Erro crítico 1 cometido por quem não domina a ferramenta que estraga o áudio",
    "Erro crítico 2"
  ],
  "equivalentsAndStock": [
    "Alternativa nativa ou gratuita e como aproximar o som",
    "Alternativa renomada de outra marca"
  ],
  "producerRuleOfThumb": "Uma Regra de Ouro prática e memorável para o produtor lembrar sempre que abrir este plugin."
}`;

          const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
          let geminiResultText: string | null = null;

          for (const model of modelsToTry) {
            try {
              const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                  responseMimeType: 'application/json',
                  temperature: 0.3,
                },
              });
              if (response?.text) {
                geminiResultText = response.text;
                break;
              }
            } catch (mErr: any) {
              // Gracefully notice quota or permission limits without breaking
              console.log(`[Gemini API] Modelo ${model} indisponível (${mErr?.status || mErr?.code || 'quota limit'}).`);
            }
          }

          if (geminiResultText) {
            try {
              const parsed = JSON.parse(geminiResultText);
              pluginGuideCache.set(cacheKey, parsed);
              return res.json(parsed);
            } catch (pErr) {
              // JSON parse issue, fall through to expert generator
            }
          }
        } catch (apiError: any) {
          console.log(`[Gemini API] Modo de resiliência ativo: ${apiError?.message || 'Quota excedida'}`);
        }
      }

      // High-quality expert audio engineering fallback
      const expertData = getExpertAudioGuide(pluginName, category, targetSource, specificQuestion);
      pluginGuideCache.set(cacheKey, expertData);
      return res.json(expertData);
    } catch (err: any) {
      console.log(`[Server] Erro recuperado no plugin-guide: ${err?.message}`);
      const fallback = getExpertAudioGuide(req.body?.pluginName || 'Processador de Áudio');
      return res.json(fallback);
    }
  });

  // 2. Real-time Q&A Chat with Gemini about Plugins & Audio Engineering
  app.post('/api/gemini/audio-chat', async (req, res) => {
    try {
      const { message, pluginContext, conversationHistory } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
      }

      const cacheKey = `${message.toLowerCase().trim()}__${(pluginContext || '').toLowerCase()}`;
      if (chatReplyCache.has(cacheKey)) {
        return res.json({ reply: chatReplyCache.get(cacheKey) });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        try {
          const ai = getGeminiClient();
          const prompt = `Você é o Mentor Especialista em Engenharia de Áudio e Mixagem do MELO STUDIO HUB.
Seu papel é responder dúvidas de produtores sobre plugins, cadeia de processamento, frequências, compressão, saturação, ambiência e mixagem.
Responda de forma clara, técnica, pedagógica e prática em Português do Brasil.
Use exemplos práticos com valores reais de parâmetros (dB, Hz, ms, ratio, etc.).
${pluginContext ? `\nContexto do Plugin atual: "${pluginContext}"` : ''}
${conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0 ? `\nHistórico recente da conversa:\n${conversationHistory.map((m: any) => `${m.role === 'user' ? 'Produtor' : 'Mentor'}: ${m.text}`).join('\n')}` : ''}

Pergunta do Produtor: "${message}"`;

          const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
          for (const model of modelsToTry) {
            try {
              const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                  temperature: 0.4,
                },
              });
              if (response?.text) {
                chatReplyCache.set(cacheKey, response.text);
                return res.json({ reply: response.text });
              }
            } catch (mErr: any) {
              console.log(`[Gemini API Chat] Modelo ${model} indisponível (${mErr?.status || mErr?.code || 'quota limit'}).`);
            }
          }
        } catch (chatErr: any) {
          console.log(`[Gemini Chat] Ativando mentor local: ${chatErr?.message}`);
        }
      }

      // Expert audio engineering mentor fallback reply
      const reply = getExpertAudioChatReply(message, pluginContext);
      chatReplyCache.set(cacheKey, reply);
      return res.json({ reply });
    } catch (err: any) {
      console.log(`[Server] Resposta de chat de contingência: ${err?.message}`);
      const fallbackReply = getExpertAudioChatReply(req.body?.message || '', req.body?.pluginContext);
      return res.json({ reply: fallbackReply });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MeloStudio Server] Rodando na porta ${PORT} (0.0.0.0:${PORT})`);
  });
}

startServer();
