import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini AI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI:', e);
    }
  }
  return aiClient;
}

// In-memory server cache
const serverTranslationCache = new Map<string, string>();

// Cooldown tracker when Gemini rate limit (429 / Quota) or 503 is reached
let geminiCoolDownUntil = 0;

function isGeminiTemporaryError(err: any): boolean {
  if (!err) return false;
  const msg = (err?.message || typeof err === 'string' ? String(err) : '').toLowerCase();
  const status = err?.status || err?.code;
  return (
    status === 429 ||
    status === 503 ||
    status === 'RESOURCE_EXHAUSTED' ||
    status === 'UNAVAILABLE' ||
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate-limits') ||
    msg.includes('high demand')
  );
}

/**
 * Common Islamic & e-commerce terminology adjustments for natural Kazakh
 */
const ISLAMIC_ECOMMERCE_TERM_MAP: [RegExp, string][] = [
  [/\bчерн(ый|ого|ому|ым|ом)\s+тмин(а|у|ом|е)?\b/gi, 'қара зере'],
  [/\bмасл(о|а|ом|е)\s+черного\s+тмина\b/gi, 'қара зере майы'],
  [/\bқара\s+химия(лық)?\s+май(ы)?\b/gi, 'қара зере майы'],
  [/\bқара\s+кәмпит\s+майы\b/gi, 'қара зере майы'],
  [/\bсуық\s+басылған\b/gi, 'суық сығымдалған'],
  [/\bхолодн(ого|ый)\s+отжим(а)?\b/gi, 'суық сығымдалған'],
  [/\bперв(ый|ого)\s+холодн(ый|ого)\s+отжим(а)?\b/gi, 'алғашқы суық сығымдалған'],
  [/\bспособ\s+применения\b/gi, 'Қолдану тәсілі:'],
  [/\bспособы\s+применения\b/gi, 'Қолдану тәсілдері:'],
  [/\bпротивопоказания\b/gi, 'Қолдануға болмайтын жағдайлар:'],
  [/\bсостав\b/gi, 'Құрамы:'],
  [/\bсрок\s+годности\b/gi, 'Жарамдылық мерзімі:'],
  [/\bусловия\s+хранения\b/gi, 'Сақтау шарттары:'],
  [/\bстрана\s+производитель\b/gi, 'Өндіруші ел:'],
  [/\bстрана\s+производства\b/gi, 'Өндіруші ел:'],
  [/\bобъем\b/gi, 'Көлемі:'],
  [/\bвес\b/gi, 'Салмағы:'],
  [/\bукрепляет\s+иммунитет\b/gi, 'иммунитетті нығайтады'],
];

function refineKazakhTranslation(text: string): string {
  if (!text) return '';
  let refined = text;
  for (const [regex, replacement] of ISLAMIC_ECOMMERCE_TERM_MAP) {
    refined = refined.replace(regex, replacement);
  }
  return refined;
}

/**
 * Fallback translation using MyMemory API (supports multi-line product descriptions)
 */
async function fallbackTranslateText(text: string): Promise<string> {
  if (!text || !text.trim()) return '';

  const cacheKey = `my_tr_${text.trim()}`;
  if (serverTranslationCache.has(cacheKey)) {
    return serverTranslationCache.get(cacheKey)!;
  }

  const lines = text.split('\n');
  const translatedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      translatedLines.push('');
      continue;
    }

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=ru|kk`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data: any = await res.json();
        if (data.responseData?.translatedText && data.responseStatus === 200) {
          translatedLines.push(data.responseData.translatedText);
          continue;
        }
      }
    } catch {
      // ignore network errors per chunk
    }

    translatedLines.push(trimmed);
  }

  const result = refineKazakhTranslation(translatedLines.join('\n'));
  if (result && result !== text) {
    serverTranslationCache.set(cacheKey, result);
    return result;
  }

  return text;
}

/**
 * Translate arbitrary text to natural Kazakh using Gemini 3.8 Flash with fallback.
 */
async function translateWithAI(text: string, contextHint: string = 'product details'): Promise<string> {
  if (!text || !text.trim()) return '';

  const cacheKey = `ai_tr_${text.trim()}`;
  if (serverTranslationCache.has(cacheKey)) {
    return serverTranslationCache.get(cacheKey)!;
  }

  const ai = getGenAI();
  if (ai && Date.now() >= geminiCoolDownUntil) {
    try {
      const prompt = `You are an expert Kazakh translator for an Islamic & health online shop in Kazakhstan.
Translate the following Russian text into natural, accurate, and fluent Kazakh (қазақ тілі).

Context: ${contextHint}

CRITICAL RULES:
1. Preserve all markdown styling: bold text like **сөз**, bullet points (•, -, *), line breaks, and all emojis (🔥, 🎯, ⚡️, 🏋️, etc.).
2. Keep brand names, trademarks, English model names, and Latin terms unchanged (e.g., "DR'S Secret Men's Bio Honey", "Bio Honey", "Solgar", "Hemani", "SPF-50").
3. Do not add intro/outro greetings, quotes, or markdown code block markers. Return ONLY the translated Kazakh text.

Russian text:
${text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const translated = response.text ? response.text.trim() : '';
      if (translated && translated !== text) {
        const refined = refineKazakhTranslation(translated);
        serverTranslationCache.set(cacheKey, refined);
        return refined;
      }
    } catch (err: any) {
      if (isGeminiTemporaryError(err)) {
        console.warn('Gemini temporary error (429/503). Activating 45s cooldown and using fallback service.');
        geminiCoolDownUntil = Date.now() + 45000;
      } else {
        console.warn('Gemini translation error, falling back:', err?.message || err);
      }
    }
  }

  // Fallback translation
  return await fallbackTranslateText(text);
}

/**
 * Translate complete product object in a single coherent prompt
 */
async function translateProductWithAI(product: {
  titleRu?: string;
  descriptionRu?: string;
  specsRu?: string;
}): Promise<{ titleKz: string; descriptionKz: string; specsKz: string }> {
  const titleRu = product.titleRu?.trim() || '';
  const descriptionRu = product.descriptionRu?.trim() || '';
  const specsRu = product.specsRu?.trim() || '';

  if (!titleRu && !descriptionRu && !specsRu) {
    return { titleKz: '', descriptionKz: '', specsKz: '' };
  }

  const ai = getGenAI();
  if (ai && Date.now() >= geminiCoolDownUntil) {
    try {
      const prompt = `You are an expert Kazakh translator for an Islamic & health online shop in Kazakhstan.
Translate the following Russian product data into natural, persuasive Kazakh (қазақ тілі).

CRITICAL REQUIREMENTS:
- Preserve all emojis (🔥, 🚀, 🎯, ⚡️, 🏋️, etc.), line breaks, bullet points (•), and markdown formatting (**bold**).
- Keep English and Latin brand names, trademarks, numbers, and SKUs exactly as-is (e.g., "DR'S Secret Men's Bio Honey", "Hemani", "Solgar").
- Return a strict JSON object with three keys: "titleKz", "descriptionKz", "specsKz".

Product data to translate:
${JSON.stringify({ titleRu, descriptionRu, specsRu }, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text?.trim() || '';
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      const titleKz = refineKazakhTranslation(parsed.titleKz || (titleRu ? await fallbackTranslateText(titleRu) : ''));
      const descriptionKz = refineKazakhTranslation(parsed.descriptionKz || (descriptionRu ? await fallbackTranslateText(descriptionRu) : ''));
      const specsKz = refineKazakhTranslation(parsed.specsKz || (specsRu ? await fallbackTranslateText(specsRu) : ''));

      return { titleKz, descriptionKz, specsKz };
    } catch (e: any) {
      if (isGeminiTemporaryError(e)) {
        console.warn('Gemini temporary error (429/503) in product translation. Activating 45s cooldown and using fallback.');
        geminiCoolDownUntil = Date.now() + 45000;
      } else {
        console.warn('Batch product translation with Gemini failed, falling back:', e?.message || e);
      }
    }
  }

  // Fallback field by field using reliable fallback service
  const [titleKz, descriptionKz, specsKz] = await Promise.all([
    titleRu ? fallbackTranslateText(titleRu) : Promise.resolve(''),
    descriptionRu ? fallbackTranslateText(descriptionRu) : Promise.resolve(''),
    specsRu ? fallbackTranslateText(specsRu) : Promise.resolve(''),
  ]);

  return {
    titleKz: refineKazakhTranslation(titleKz),
    descriptionKz: refineKazakhTranslation(descriptionKz),
    specsKz: refineKazakhTranslation(specsKz),
  };
}

// ================= API ENDPOINTS =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, product, context } = req.body;

    if (product && typeof product === 'object') {
      const translated = await translateProductWithAI(product);
      return res.json({ success: true, ...translated });
    }

    if (text && typeof text === 'string') {
      const translatedText = await translateWithAI(text, context || 'general e-commerce');
      return res.json({ success: true, translatedText });
    }

    return res.status(400).json({ error: 'Missing text or product in request body' });
  } catch (err: any) {
    console.error('Translation endpoint error:', err);
    res.status(500).json({ error: err.message || 'Translation failed' });
  }
});

// ================= VITE / STATIC SERVING =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Muslim Shop server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
