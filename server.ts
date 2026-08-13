import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Initialize Gemini AI client lazily
  let aiClient: GoogleGenAI | null = null;
  function getAiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  }

  // API endpoint for AI library concierge / book search assistant
  app.post('/api/recommend', async (req, res) => {
    try {
      const { userQuery, librariesContext } = req.body;
      if (!userQuery) {
        res.status(400).json({ error: 'User query is required' });
        return;
      }

      let ai;
      try {
        ai = getAiClient();
      } catch (err: any) {
        res.status(500).json({
          error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in secrets.',
          message: err.message
        });
        return;
      }

      const prompt = `あなたは埼玉県民向けの「埼玉県図書館コンシェルジュAI」です。
ユーザーからの質問・相談・探したい環境や本のテーマに応じて、埼玉県内の最適な図書館と活用アドバイスをわかりやすく日本語で回答してください。

回答フォーマットルール:
1. 親しみやすく丁寧な日本語で回答してください。
2. ユーザーの目的にマッチするオススメ図書館（1〜3施設）を挙げ、なぜその図書館が適切か（開館時間、自習席、Wi-Fi、駅アクセス、蔵書の特徴など）を説明してください。
3. 最後にJSONフォーマットで、推薦した図書館のID一覧を "recommendedLibraryIds": ["id1", "id2"] の形式で含めてください。例:
\`\`\`json
{
  "recommendedLibraryIds": ["saitama-omiya", "saitama-chuo"]
}
\`\`\`

埼玉県図書館のデータベース(抜粋):
${JSON.stringify(librariesContext || [])}

ユーザーの質問:
${userQuery}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';

      // Extract recommended IDs if present in JSON block
      let recommendedIds: string[] = [];
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (Array.isArray(parsed.recommendedLibraryIds)) {
            recommendedIds = parsed.recommendedLibraryIds;
          }
        } catch (e) {
          console.warn('Failed to parse embedded JSON IDs', e);
        }
      }

      res.json({
        answer: text,
        recommendedLibraryIds: recommendedIds
      });
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      res.status(500).json({
        error: 'Failed to process AI recommendation',
        details: error.message || String(error)
      });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
