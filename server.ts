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

  // 1. Real-time Gemini Plugin Learning Guide
  app.post('/api/gemini/plugin-guide', async (req, res) => {
    try {
      const { pluginName, category, targetSource, specificQuestion } = req.body;
      if (!pluginName || typeof pluginName !== 'string') {
        return res.status(400).json({ error: 'Nome do plugin é obrigatório' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'Chave GEMINI_API_KEY não configurada no ambiente.',
          isMissingKey: true,
        });
      }

      const ai = getGeminiClient();
      const prompt = `Você é um renomado Engenheiro de Áudio e Professor Sênior de Mixagem e Masterização.
Gere um Guia de Aprendizado completo, altamente didático, prático e técnico sobre o seguinte plugin de áudio:
Nome do Plugin: "${pluginName}"
${category ? `Categoria: ${category}` : ''}
${targetSource ? `Canal / Fonte Alvo: ${targetSource}` : ''}
${specificQuestion ? `Dúvida Específica do Produtor: "${specificQuestion}"` : ''}

Você deve responder em Português do Brasil com linguagem fluida, precisa e rica em ensinamentos acústicos e de engenharia de áudio.
Retorne ESTRITAMENTE um objeto JSON válido (sem texto extra fora do JSON) com esta estrutura exata:
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text || '{}';
      try {
        const parsedData = JSON.parse(responseText);
        return res.json(parsedData);
      } catch (parseError) {
        return res.json({
          pluginName,
          headline: `Guia Técnico para ${pluginName}`,
          circuitType: 'Processamento de Áudio',
          acousticFunction: responseText,
          primaryUseCases: [],
          proTips: [],
          commonMistakes: [],
          equivalentsAndStock: [],
          producerRuleOfThumb: 'Ouça sempre o sinal com ganho compensado (Gain Matching).',
        });
      }
    } catch (err: any) {
      console.error('Erro na rota /api/gemini/plugin-guide:', err);
      return res.status(500).json({
        error: err?.message || 'Falha ao processar solicitação com o modelo Gemini.',
      });
    }
  });

  // 2. Real-time Q&A Chat with Gemini about Plugins & Audio Engineering
  app.post('/api/gemini/audio-chat', async (req, res) => {
    try {
      const { message, pluginContext, conversationHistory } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'Chave GEMINI_API_KEY não configurada no ambiente.',
          isMissingKey: true,
        });
      }

      const ai = getGeminiClient();

      let prompt = `Você é o Mentor Especialista em Engenharia de Áudio e Mixagem do MELO STUDIO HUB.
Seu papel é responder dúvidas de produtores sobre plugins, cadeia de processamento, frequências, compressão, saturação, ambiência e mixagem.
Responda de forma clara, técnica, pedagógica e prática em Português do Brasil.
Use exemplos práticos com valores reais de parâmetros (dB, Hz, ms, ratio, etc.).
${pluginContext ? `\nContexto do Plugin atual: "${pluginContext}"` : ''}
${conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0 ? `\nHistórico recente da conversa:\n${conversationHistory.map((m: any) => `${m.role === 'user' ? 'Produtor' : 'Mentor'}: ${m.text}`).join('\n')}` : ''}

Pergunta do Produtor: "${message}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.4,
        },
      });

      return res.json({
        reply: response.text || 'Sem resposta do modelo.',
      });
    } catch (err: any) {
      console.error('Erro na rota /api/gemini/audio-chat:', err);
      return res.status(500).json({
        error: err?.message || 'Erro ao comunicar com a IA do Gemini.',
      });
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
