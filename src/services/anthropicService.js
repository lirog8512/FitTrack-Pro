const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';
const API_URL = 'https://api.anthropic.com/v1/messages';

export async function analyzeFood(base64Image) {
  if (!ANTHROPIC_API_KEY) {
    return getMockFoodAnalysis();
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: 'Analiza esta foto de comida y devuelve SOLO un JSON válido con este formato exacto: {"foodName": "nombre del plato en español", "calories": número, "protein": gramos, "carbs": gramos, "fat": gramos, "confidence": "alta/media/baja", "description": "breve descripción"}. No incluyas texto adicional, solo el JSON.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const text = data.content[0].text.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Anthropic API error:', error);
    return getMockFoodAnalysis();
  }
}

export async function analyzeBodyProgress(base64Image) {
  if (!ANTHROPIC_API_KEY) {
    return getMockProgressAnalysis();
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: base64Image },
              },
              {
                type: 'text',
                text: 'Eres un coach de fitness. Analiza esta foto corporal y devuelve SOLO un JSON: {"analysis": "análisis breve en español de 2-3 oraciones sobre la composición corporal visible", "strengths": ["punto positivo 1", "punto positivo 2"], "suggestions": ["sugerencia 1", "sugerencia 2"]}',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return JSON.parse(data.content[0].text.trim());
  } catch (error) {
    return getMockProgressAnalysis();
  }
}

function getMockFoodAnalysis() {
  const foods = [
    { foodName: 'Pechuga de pollo con arroz', calories: 420, protein: 45, carbs: 38, fat: 8, confidence: 'alta', description: 'Proteína magra con carbohidratos complejos, excelente para el objetivo de pérdida de grasa.' },
    { foodName: 'Ensalada de atún', calories: 280, protein: 32, carbs: 12, fat: 10, confidence: 'alta', description: 'Comida rica en proteína y baja en calorías, ideal para déficit calórico.' },
    { foodName: 'Tortilla de claras con vegetales', calories: 190, protein: 24, carbs: 8, fat: 6, confidence: 'media', description: 'Desayuno proteico bajo en calorías.' },
    { foodName: 'Batido de proteína con avena', calories: 350, protein: 30, carbs: 42, fat: 5, confidence: 'media', description: 'Buen balance de macros post-entrenamiento.' },
  ];
  return foods[Math.floor(Math.random() * foods.length)];
}

function getMockProgressAnalysis() {
  return {
    analysis: 'Se observa una buena base muscular con definición visible en los deltoides y pectorales. La zona abdominal muestra progreso en reducción de grasa. La postura corporal es correcta.',
    strengths: ['Buena definición muscular en tren superior', 'Postura erguida y correcta'],
    suggestions: ['Continuar con el déficit calórico para más definición', 'Enfocarse en ejercicios de core para mayor definición abdominal'],
  };
}
