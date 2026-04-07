import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  verdict: "Real" | "Fake" | "Suspicious" | "Satire";
  confidenceScore: number;
  reasoning: string;
  biasAnalysis: string;
  keyClaims: { claim: string; status: "Verified" | "Unverified" | "False" }[];
  suggestions: string[];
  technicalAnalysis?: string;
}

export async function analyzeNews(title: string, content: string): Promise<AnalysisResult> {
  const prompt = `Analyze the following news article for credibility and potential misinformation.
  
  Title: ${title}
  Content: ${content}
  
  You have access to a Python Code Execution tool. Use it to perform linguistic analysis, check for sensationalism patterns, or verify any mathematical claims in the text.
  
  Provide a detailed analysis including:
  1. A verdict (Real, Fake, Suspicious, or Satire).
  2. A confidence score (0-100).
  3. Detailed reasoning for the verdict.
  4. Analysis of political or social bias.
  5. Verification status of key claims.
  6. Suggestions for further verification.
  7. A 'technicalAnalysis' summary if you used code to verify any patterns.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ codeExecution: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: { type: Type.STRING, enum: ["Real", "Fake", "Suspicious", "Satire"] },
          confidenceScore: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          biasAnalysis: { type: Type.STRING },
          keyClaims: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                claim: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["Verified", "Unverified", "False"] }
              },
              required: ["claim", "status"]
            }
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          technicalAnalysis: { type: Type.STRING }
        },
        required: ["verdict", "confidenceScore", "reasoning", "biasAnalysis", "keyClaims", "suggestions"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to analyze the news article. Please try again.");
  }
}
