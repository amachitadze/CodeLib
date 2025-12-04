import { GoogleGenAI } from "@google/genai";
import { SnippetType } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client only if the key exists to avoid immediate errors, 
// though the app requires it for AI features.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateCodeSnippet = async (prompt: string, type: SnippetType): Promise<{ code: string; title: string; description: string }> => {
  if (!ai) {
    throw new Error("API Key not found");
  }

  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert Frontend Engineer helper. 
    The user will ask for a UI component or a small HTML/CSS effect, or a full website template.
    The user has selected the type: "${type}".

    You must return a valid JSON object. 
    Do not use Markdown formatting like \`\`\`json. Return raw JSON text only.
    
    Structure:
    {
      "title": "A short Georgian title for the snippet",
      "description": "A short Georgian description (1 sentence)",
      "code": "The full working HTML/CSS/JS code."
    }

    Rules:
    1. If type is 'website', providing a full HTML structure with <html>, <head>, <body> is MANDATORY.
    2. If type is 'component', you can skip <html> and just provide the container div and styles.
    3. Use Tailwind CSS via CDN if helpful, or custom CSS in <style> tags.
    4. The content MUST be in Georgian language if there is text to display.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Create a ${type} for: ${prompt}`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};