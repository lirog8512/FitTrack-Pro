// Backend seguro para el analizador de fotos de comida de Vital.
// Recibe una imagen en base64, la envía a la API de Claude (Anthropic) con
// visión y devuelve una estimación nutricional estructurada en JSON.
// La API key de Anthropic vive solo aquí (variable secreta), nunca en el
// frontend estático servido por GitHub Pages.

const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BASE64_LEN = 8_000_000; // ~6MB de imagen original

const PROMPT = `Analiza la imagen y, si muestra comida o bebida, estima su valor nutricional para la porción visible.
Responde ÚNICAMENTE con JSON válido, sin texto adicional ni markdown, con este formato exacto:
{"name":"nombre breve del alimento en español","kcal":numero,"protein":numero_en_gramos,"carbs":numero_en_gramos,"fat":numero_en_gramos}
Si la imagen no muestra comida o bebida reconocible, responde exactamente: {"error":"no_food"}`;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function clamp(n, max) {
  const v = Math.round(Number(n) || 0);
  return Math.max(0, Math.min(max, v));
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400, origin);
    }

    const { image, mediaType } = body || {};
    if (!image || typeof image !== 'string') {
      return json({ error: 'missing_image' }, 400, origin);
    }
    if (image.length > MAX_BASE64_LEN) {
      return json({ error: 'image_too_large' }, 413, origin);
    }
    const finalMediaType = ALLOWED_MEDIA_TYPES.includes(mediaType) ? mediaType : 'image/jpeg';

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'server_misconfigured' }, 500, origin);
    }

    let aiResp;
    try {
      aiResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: finalMediaType, data: image } },
                { type: 'text', text: PROMPT },
              ],
            },
          ],
        }),
      });
    } catch {
      return json({ error: 'ai_request_failed' }, 502, origin);
    }

    if (!aiResp.ok) {
      return json({ error: 'ai_request_failed' }, 502, origin);
    }

    const data = await aiResp.json();
    const text = (data.content || []).map((b) => b.text || '').join('').trim();

    let parsed;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : text);
    } catch {
      return json({ error: 'parse_failed' }, 502, origin);
    }

    if (parsed.error) {
      return json({ error: parsed.error }, 200, origin);
    }

    return json(
      {
        name: String(parsed.name || 'Alimento').slice(0, 60),
        kcal: clamp(parsed.kcal, 3000),
        protein: clamp(parsed.protein, 300),
        carbs: clamp(parsed.carbs, 400),
        fat: clamp(parsed.fat, 300),
      },
      200,
      origin
    );
  },
};
