import { Resend } from "resend";

// Graceful no-op if RESEND_API_KEY is not set
const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export function isEmailEnabled() {
  return !!resend;
}
