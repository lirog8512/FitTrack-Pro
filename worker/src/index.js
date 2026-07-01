const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BASE64_LEN = 8_000_000;

const FOOD_PROMPT = `Analiza la imagen y, si muestra comida o bebida, estima su valor nutricional para la porción visible.
Responde ÚNICAMENTE con JSON válido, sin texto adicional ni markdown, con este formato exacto:
{"name":"nombre breve del alimento en español","kcal":numero,"protein":numero_en_gramos,"carbs":numero_en_gramos,"fat":numero_en_gramos}
Si la imagen no muestra comida o bebida reconocible, responde exactamente: {"error":"no_food"}`;

const GOAL_MAP = {fat_loss:'perder grasa',muscle:'ganar músculo',recomp:'recomposición corporal',maintain:'mantenimiento',performance:'rendimiento deportivo'};

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
  return Math.max(0, Math.min(max, Math.round(Number(n) || 0)));
}

async function callClaude(apiKey, messages, maxTokens) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, messages }),
  });
  if (!resp.ok) throw new Error('ai_request_failed');
  const data = await resp.json();
  return (data.content || []).map((b) => b.text || '').join('').trim();
}

function parseJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text);
}

// POST / — análisis nutricional de foto de comida
async function handleFood(body, apiKey, origin) {
  const { image, mediaType } = body || {};
  if (!image || typeof image !== 'string') return json({ error: 'missing_image' }, 400, origin);
  if (image.length > MAX_BASE64_LEN) return json({ error: 'image_too_large' }, 413, origin);
  const mt = ALLOWED_MEDIA_TYPES.includes(mediaType) ? mediaType : 'image/jpeg';

  let text;
  try {
    text = await callClaude(apiKey, [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mt, data: image } },
        { type: 'text', text: FOOD_PROMPT },
      ],
    }], 300);
  } catch { return json({ error: 'ai_request_failed' }, 502, origin); }

  let parsed;
  try { parsed = parseJSON(text); } catch { return json({ error: 'parse_failed' }, 502, origin); }
  if (parsed.error) return json({ error: parsed.error }, 200, origin);

  return json({
    name: String(parsed.name || 'Alimento').slice(0, 60),
    kcal: clamp(parsed.kcal, 3000),
    protein: clamp(parsed.protein, 300),
    carbs: clamp(parsed.carbs, 400),
    fat: clamp(parsed.fat, 300),
  }, 200, origin);
}

// POST /body — análisis corporal de progreso con fotos
async function handleBody(body, apiKey, origin) {
  const { goal, stats, photos } = body || {};
  const s = stats || {};
  const delta = Number(s.delta || 0);
  const validPhotos = (photos || []).filter(p => p && p.data && p.mediaType).slice(0, 3);

  const content = [];

  if (validPhotos.length > 1) {
    content.push({ type: 'text', text: 'Foto 1 (más antigua):' });
    content.push({ type: 'image', source: { type: 'base64', media_type: validPhotos[0].mediaType, data: validPhotos[0].data } });
    if (validPhotos.length === 3) {
      content.push({ type: 'text', text: 'Foto intermedia:' });
      content.push({ type: 'image', source: { type: 'base64', media_type: validPhotos[1].mediaType, data: validPhotos[1].data } });
    }
    content.push({ type: 'text', text: `Foto ${validPhotos.length} (más reciente):` });
    content.push({ type: 'image', source: { type: 'base64', media_type: validPhotos[validPhotos.length-1].mediaType, data: validPhotos[validPhotos.length-1].data } });
  } else if (validPhotos.length === 1) {
    content.push({ type: 'image', source: { type: 'base64', media_type: validPhotos[0].mediaType, data: validPhotos[0].data } });
  }

  const prompt = `Eres un coach de fitness experto analizando el progreso corporal de un usuario.
${validPhotos.length > 0 ? `Observa detenidamente ${validPhotos.length > 1 ? 'las fotos de evolución' : 'la foto corporal'} y` : 'Basándote en los datos,'} proporciona un análisis personalizado.

Datos del usuario:
- Objetivo: ${GOAL_MAP[goal] || goal || 'no especificado'}
- Peso inicio: ${s.startKg || '-'}kg → Peso actual: ${s.curKg || '-'}kg (${delta >= 0 ? '+' : ''}${delta.toFixed(1)}kg en ${s.weeks || 1} semana(s))
- Plan calórico: ${s.cal || '-'} kcal/día · Proteína objetivo: ${s.proteinG || '-'}g/día

${validPhotos.length > 1 ? 'Compara las fotos y describe los cambios visibles de composición corporal.' : ''}
Devuelve SOLO JSON válido sin markdown con este formato exacto:
{"titulo":"Título motivador de 4-6 palabras","hallazgos":["observación concreta 1","observación concreta 2","observación concreta 3"],"ajustes":["recomendación práctica 1","recomendación práctica 2","recomendación práctica 3"],"resumen":"1-2 frases motivadoras personalizadas basadas en lo que ves"}`;

  content.push({ type: 'text', text: prompt });

  let text;
  try {
    text = await callClaude(apiKey, [{ role: 'user', content }], 600);
  } catch { return json({ error: 'ai_request_failed' }, 502, origin); }

  let parsed;
  try { parsed = parseJSON(text); } catch { return json({ error: 'parse_failed' }, 502, origin); }

  return json(parsed, 200, origin);
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin) });
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin);
    if (!env.ANTHROPIC_API_KEY) return json({ error: 'server_misconfigured' }, 500, origin);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, 400, origin); }

    const path = new URL(request.url).pathname;
    if (path === '/body') return handleBody(body, env.ANTHROPIC_API_KEY, origin);
    return handleFood(body, env.ANTHROPIC_API_KEY, origin);
  },
};
