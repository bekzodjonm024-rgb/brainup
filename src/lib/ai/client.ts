import Anthropic from "@anthropic-ai/sdk";

function createClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

const globalForAI = globalThis as unknown as { anthropic: Anthropic | null };
export const anthropic = globalForAI.anthropic ?? createClient();
if (process.env.NODE_ENV !== "production") globalForAI.anthropic = anthropic;

export function isAIAvailable() {
  return !!process.env.ANTHROPIC_API_KEY;
}
