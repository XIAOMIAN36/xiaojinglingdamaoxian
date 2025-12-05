
import { GoogleGenAI, Type } from "@google/genai";
import { DailyMission } from "../types";

// NOTE: In a production environment, never expose API keys in client-side code.
// For this demo, we assume a restrictive API key or a proxy is used.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const FALLBACK_MISSION: DailyMission = {
  title: "小精灵冲刺",
  description: "尽情奔跑吧！不需要理由！",
  targetScore: 1000
};

export const generateDailyMission = async (): Promise<DailyMission> => {
  try {
    // Create a timeout promise to fail fast if Google is blocked (common in China)
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Request timed out (likely blocked)")), 3000)
    );

    const apiCallPromise = (async () => {
      if (!process.env.API_KEY) throw new Error("No API Key");
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate a fun, fictional daily mission for a cute runner game. Keep it short. Language: Chinese (Simplified).",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A catchy title in Chinese" },
              description: { type: Type.STRING, description: "A one-sentence objective in Chinese" },
              targetScore: { type: Type.INTEGER, description: "A target score between 500 and 5000" }
            },
            required: ["title", "description", "targetScore"]
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as DailyMission;
      }
      throw new Error("No text response");
    })();

    // Race between the API call and the timeout
    return await Promise.race([apiCallPromise, timeoutPromise]);

  } catch (error) {
    console.log("Mission generation skipped (using fallback):", error);
    // Return fallback silently so the user can still play
    return FALLBACK_MISSION;
  }
};
