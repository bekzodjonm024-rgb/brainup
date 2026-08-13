import { GoogleGenerativeAI } from "@google/generative-ai";

function createClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

const globalForAI = globalThis as unknown as { googleAI: GoogleGenerativeAI | null };
export const googleAI = globalForAI.googleAI ?? createClient();
if (process.env.NODE_ENV !== "production") globalForAI.googleAI = googleAI;

export function isAIAvailable() {
  return !!process.env.GOOGLE_API_KEY;
}
