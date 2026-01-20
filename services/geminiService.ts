
import { GoogleGenAI, Type } from "@google/genai";

// Initialization is moved inside functional blocks to guarantee the client uses the most current API key from the environment/dialog.

export const suggestTasks = async (goal: string): Promise<string[]> => {
  try {
    // Create a new instance right before the request as recommended
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a list of 5-7 actionable daily tasks for someone whose goal today is: "${goal}". Provide only the tasks as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error suggesting tasks:", error);
    return [];
  }
};

export const getDailyQuote = async (): Promise<string> => {
  try {
    // Create a new instance right before the request as recommended
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Give me a single short, highly motivational quote to start a productive day. No author name, just the quote.",
    });
    return response.text.trim();
  } catch (error) {
    return "Make today count.";
  }
};
