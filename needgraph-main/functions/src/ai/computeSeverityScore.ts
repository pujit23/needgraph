import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';

/**
 * computeSeverityScore — callable function that uses Vertex AI (Gemini)
 * to analyze field report text and return structured severity data.
 */
export const computeSeverityScore = onCall(
  { region: 'asia-south1', memory: '512MiB' },
  async (request) => {
    const { text, language } = request.data;
    if (!text || typeof text !== 'string') {
      throw new HttpsError('invalid-argument', 'text is required');
    }

    try {
      const vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT || '',
        location: 'asia-south1',
      });

      const model = vertexAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
      });

      const prompt = `You are a humanitarian crisis analyst. Analyze this field report and return ONLY valid JSON with these fields:
      - needType: one of "Food Insecurity"|"School Dropout"|"Mental Health"|"Healthcare"|"Domestic Violence"|"Unemployment"|"Water Scarcity"|"Child Malnutrition"
      - severityScore: 0-100 integer
      - peopleAffected: integer estimate
      - translatedDescription: 2-3 English sentences
      - confidence: 0-100 integer
      - urgencyFlag: boolean (true if severityScore > 65)
      - keywords: array of 3-5 strings
      - suggestedActions: array of 2 strings
      - locationMentioned: string or null
      - originalLanguageDetected: string

      Language hint: ${language || 'auto'}
      Report: "${text}"`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return { success: true, analysis: parsed };
    } catch (err: any) {
      console.error('Vertex AI error:', err);
      // Fallback: rules-based scoring
      return {
        success: false,
        analysis: rulesBasedScoring(text),
        fallback: true,
      };
    }
  },
);

function rulesBasedScoring(text: string) {
  const lower = text.toLowerCase();
  const rules = [
    { keywords: ['food', 'hunger', 'starving', 'ration', 'rice'], needType: 'Food Insecurity', severity: 58 },
    { keywords: ['water', 'drinking', 'borewell', 'tap'], needType: 'Water Scarcity', severity: 62 },
    { keywords: ['sick', 'hospital', 'doctor', 'medicine', 'fever'], needType: 'Healthcare', severity: 72 },
    { keywords: ['school', 'dropout', 'education', 'children'], needType: 'School Dropout', severity: 45 },
    { keywords: ['violence', 'abuse', 'beating'], needType: 'Domestic Violence', severity: 70 },
    { keywords: ['mental', 'stress', 'depression', 'anxiety'], needType: 'Mental Health', severity: 60 },
    { keywords: ['job', 'unemploy', 'income', 'debt'], needType: 'Unemployment', severity: 48 },
    { keywords: ['malnutrition', 'stunted', 'underweight'], needType: 'Child Malnutrition', severity: 65 },
  ];

  let best = { needType: 'Healthcare', severity: 35 };
  let maxHits = 0;

  for (const r of rules) {
    const hits = r.keywords.filter(k => lower.includes(k)).length;
    if (hits > maxHits) {
      maxHits = hits;
      best = r;
    }
  }

  return {
    needType: best.needType,
    severityScore: best.severity,
    peopleAffected: 10,
    translatedDescription: `Field report analyzed with rules-based engine. ${best.needType} detected.`,
    confidence: maxHits > 2 ? 55 : 30,
    urgencyFlag: best.severity > 65,
    keywords: [],
    suggestedActions: ['Assign specialist', 'Schedule field visit'],
    locationMentioned: null,
    originalLanguageDetected: 'unknown',
  };
}
