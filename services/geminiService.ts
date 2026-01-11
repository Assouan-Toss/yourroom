
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEnticingDescription = async (details: {
  title: string;
  price: number;
  region: string;
  commune: string;
  quartier: string;
}) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `En tant qu'agent immobilier expert au Togo (Lomé, Agoè, etc.), écris une description commerciale attrayante pour une annonce immobilière. 
      Détails : ${details.title}, Prix : ${details.price} FCFA, Région : ${details.region}, Commune : ${details.commune}, Quartier : ${details.quartier}. 
      Utilise un ton professionnel, rassurant et persuasif. Réponds uniquement avec la description en français.`
    });
    return response.text || "Description non disponible.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur lors de la génération de la description.";
  }
};

export const simulateAgentResponse = async (userMessage: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tu es un démarcheur immobilier professionnel au Togo travaillant pour la plateforme YOURROOM. Un client te contacte à propos d'une annonce (${context}). 
      Message du client : "${userMessage}". 
      Réponds poliment, réponds à ses questions sur le prix ou la localisation si mentionnés, et propose-lui de fixer un rendez-vous pour une visite. Garde un ton courtois et professionnel.`
    });
    return response.text || "Je reviens vers vous bientôt pour organiser une visite.";
  } catch (error) {
    return "L'agent est actuellement sur le terrain pour des visites. Il vous répondra dès que possible.";
  }
};
