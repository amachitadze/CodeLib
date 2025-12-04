import { GoogleGenAI } from "@google/genai";
import { SnippetType, Language } from "../types";

// Safe access to environment variable
const getApiKey = () => {
  return (import.meta as any).env?.VITE_GEMINI_API_KEY;
};

// Initialize conditionally or lazily to prevent crash if key is missing on load
const getAIClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Gemini API Key is missing");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

export const generateCodeSnippet = async (prompt: string, type: SnippetType, language: Language): Promise<{ code: string; title: string; description: string }> => {
  // Coding tasks are complex, so we use gemini-3-pro-preview
  const model = "gemini-3-pro-preview";
  
  const systemInstruction = `
    You are an expert Frontend Engineer helper. 
    The user will ask for a UI component or a small HTML/CSS effect, or a full website template.
    The user has selected the type: "${type}".
    The user's current language is: "${language}".

    You must return a valid JSON object. 
    Do not use Markdown formatting like \`\`\`json. Return raw JSON text only.
    
    Structure:
    {
      "title": "A short title for the snippet in ${language}",
      "description": "A short description (1 sentence) in ${language}",
      "code": "The full working HTML/CSS/JS code."
    }

    Rules:
    1. If type is 'website', providing a full HTML structure with <html>, <head>, <body> is MANDATORY.
    2. If type is 'component', you can skip <html> and just provide the container div and styles.
    3. Use Tailwind CSS via CDN if helpful, or custom CSS in <style> tags.
    4. The content MUST be in ${language} language if there is text to display inside the snippet.
  `;

  try {
    const ai = getAIClient();
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