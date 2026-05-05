import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const getDifferentialDiagnosis = async (patientContext) => {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('Missing Groq API key');
  }

  const { currentCat, complaint, signs, vitals } = patientContext;

  const prompt = `Tu es un assistant médical pour les urgences hospitalières.
Donne un diagnostic différentiel structuré — 3 à 5 hypothèses classées par probabilité.
Réponds UNIQUEMENT en JSON, rien d'autre, aucun texte avant ou après:
{
  "differentials": [
    {
      "diagnosis": "nom de la pathologie",
      "probability": "élevée|moyenne|faible",
      "key_sign": "signe clinique clé justifiant cette hypothèse"
    }
  ]
}

Données patient:
- Catégorie médicale: ${currentCat?.name || 'Non spécifiée'}
- Motif principal: ${complaint || 'Non spécifié'}
- Signes cliniques: ${signs?.join(', ') || 'Aucun'}
- FC: ${vitals?.fc || '—'} bpm
- PAS: ${vitals?.pas || '—'} mmHg
- SpO2: ${vitals?.spo2 || '—'}%
- Température: ${vitals?.temp || '—'}°C`;

  let response;
  try {
    response = await groq.chat.completions.create({
      // Updated model name (older "llama3-8b-8192" returns 400 on many accounts).
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });
  } catch (error) {
    const apiMessage =
      error?.error?.message ||
      error?.message ||
      'Groq request failed';
    throw new Error(apiMessage);
  }

  const raw = response?.choices?.[0]?.message?.content || '{}';
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(clean);
    const differentials = Array.isArray(parsed?.differentials) ? parsed.differentials : [];

    return {
      differentials: differentials
        .filter((d) => d?.diagnosis)
        .map((d) => ({
          diagnosis: d.diagnosis,
          probability: d.probability || 'moyenne',
          key_sign: d.key_sign || 'Non précisé'
        }))
    };
  } catch {
    throw new Error('Invalid JSON returned by model');
  }
};
