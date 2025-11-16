
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this context, we assume the key is provided.
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

function base64ToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

export async function analyzeImageWithGemini(base64Image: string, mimeType: string): Promise<string> {
  if (!API_KEY) {
    return "API Key not configured. Please set up your API_KEY environment variable.";
  }
  
  try {
    const imagePart = base64ToGenerativePart(base64Image, mimeType);
    const prompt = "Analyze this image in detail. Describe the scene, the objects present, the dominant colors, and the overall mood or atmosphere of the photo. Format your response in a single, well-written paragraph.";

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    return "Sorry, I couldn't analyze the image at the moment. It might be due to a network issue or API restrictions. Please try again later.";
  }
}
