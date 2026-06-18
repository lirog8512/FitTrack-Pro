// Anthropic Claude API calls for AI features
const CLAUDE_MODEL = 'claude-sonnet-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';

export async function analyzeFoodImage(base64Image, apiKey) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: base64Image },
          },
          {
            type: 'text',
            text: `Analiza este alimento/comida y responde SOLO con un JSON válido sin texto adicional:
{
  "name": "nombre del alimento",
  "portion": "porción estimada",
  "calories": número,
  "protein": número en gramos,
  "carbs": número en gramos,
  "fat": número en gramos,
  "confidence": "alta/media/baja",
  "notes": "observación breve"
}
Si hay múltiples alimentos, calcula el total. Usa valores realistas basados en la porción visible.`,
          },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Error en la API');
  }

  const data = await response.json();
  const text = data.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Respuesta inválida de la IA');
  return JSON.parse(jsonMatch[0]);
}

export async function analyzeBodyPhoto(base64Image, userStats, previousAnalysis, apiKey) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: base64Image },
          },
          {
            type: 'text',
            text: `Eres un coach de fitness experto. Analiza esta foto de progreso corporal.

Datos del usuario:
- Peso actual: ${userStats.weight}kg | Objetivo: ${userStats.goalWeight}kg
- Edad: ${userStats.age} años | Altura: ${userStats.height}cm
- Plan actual: ${userStats.calories}kcal, ${userStats.protein}g proteína, ${userStats.carbs}g carbos, ${userStats.fat}g grasa
- Lesiones: ${userStats.injuries?.join(', ') || 'ninguna'}
${previousAnalysis ? `- Análisis anterior: ${previousAnalysis}` : ''}

Responde SOLO con JSON válido:
{
  "bodyFatEstimate": "porcentaje estimado ej: 18-22%",
  "muscleDefinition": "baja/media/alta",
  "strongAreas": ["área1", "área2"],
  "weakAreas": ["área1", "área2"],
  "progressVsPrevious": "mejora/estable/retroceso o 'primera foto'",
  "nutritionAdjustment": true/false,
  "newCalories": número (si adjustment=true, nueva meta),
  "newProtein": número (si adjustment=true),
  "newCarbs": número (si adjustment=true),
  "newFat": número (si adjustment=true),
  "reasoning": "explicación breve del análisis y cambios si los hay",
  "motivationalMessage": "mensaje motivador personalizado",
  "nextFocus": "recomendación principal para las próximas 4 semanas"
}`,
          },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Error en la API');
  }

  const data = await response.json();
  const text = data.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Respuesta inválida de la IA');
  return JSON.parse(jsonMatch[0]);
}
