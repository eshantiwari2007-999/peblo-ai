import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the API key is available
const apiKey = process.env.GEMINI_API_KEY || "";

// Initialize the Gemini API client
export const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};
