import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";

const FROM_EMAIL = "Florence With Locals Forum <forum@florencewithlocals.com>";

let resendInstance: Resend | null = null;

/**
 * Get a lazy-initialised Resend client.
 * Returns null when no API key is configured (safe for local dev).
 *
 * NOTE: reads process.env directly instead of importing serverEnv to avoid
 * triggering eager requireEnv() checks for unrelated vars (e.g.
 * SUPABASE_SERVICE_ROLE_KEY) which would crash the entire import chain
 * if any required server env var is missing.
 */
export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/**
 * Send an email via Resend. Returns true on success, false on failure.
 * Never throws — errors are captured in Sentry.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    if (error) {
      Sentry.captureException(error, { tags: { action: "sendEmail" } });
      return false;
    }
    return true;
  } catch (err) {
    Sentry.captureException(err, { tags: { action: "sendEmail" } });
    return false;
  }
}
