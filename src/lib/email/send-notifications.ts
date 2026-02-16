import * as Sentry from "@sentry/nextjs";
import { getResend, sendEmail } from "./resend";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  replyNotificationEmail,
  mentionNotificationEmail,
  likeNotificationEmail,
  welcomeEmail,
} from "./templates";

// ---------------------------------------------------------------------------
// In-memory rate limit: one email per type per recipient per 5 min
// ---------------------------------------------------------------------------
const emailRateMap = new Map<string, number>();
const EMAIL_RATE_WINDOW = 5 * 60 * 1000; // 5 minutes

function isRateLimited(recipientId: string, type: string): boolean {
  const key = `${recipientId}:${type}`;
  const last = emailRateMap.get(key);
  const now = Date.now();

  // Cleanup when map grows large
  if (emailRateMap.size > 1000) {
    const cutoff = now - EMAIL_RATE_WINDOW;
    emailRateMap.forEach((v, k) => {
      if (v < cutoff) emailRateMap.delete(k);
    });
  }

  if (last && now - last < EMAIL_RATE_WINDOW) return true;
  emailRateMap.set(key, now);
  return false;
}

// ---------------------------------------------------------------------------
// Strip HTML for email previews
// ---------------------------------------------------------------------------
function stripHtml(html: string, maxLength = 200): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

// ---------------------------------------------------------------------------
// Core notification sender
// ---------------------------------------------------------------------------
type NotificationType = "reply" | "mention" | "like";

interface SendNotificationParams {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  actorUsername: string;
  threadTitle: string;
  threadSlug: string;
  contentType?: "thread" | "post";
  contentPreview?: string;
}

export async function sendNotificationEmail(
  params: SendNotificationParams
): Promise<void> {
  try {
    // Don't email yourself
    if (params.recipientId === params.actorId) return;

    // Rate limit
    if (isRateLimited(params.recipientId, params.type)) return;

    // Check Resend is available
    if (!getResend()) return;

    const admin = createAdminClient();

    // Check recipient's email_notifications preference
    // Use select("*") so this doesn't 400 if the column hasn't been migrated yet
    const { data: recipientProfile, error: profileError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", params.recipientId)
      .single();

    if (profileError || !recipientProfile) return;

    // If the column exists and is explicitly false, respect the opt-out
    const emailPref = (recipientProfile as Record<string, unknown>).email_notifications;
    if (emailPref === false) return;

    // Get recipient's email from auth
    const { data: authUser, error: authError } = await admin.auth.admin.getUserById(
      params.recipientId
    );
    if (authError || !authUser?.user?.email) return;
    const email = authUser.user.email;

    // Build email from template
    let template: { subject: string; html: string };
    const preview = params.contentPreview
      ? stripHtml(params.contentPreview)
      : "";

    switch (params.type) {
      case "reply":
        template = replyNotificationEmail({
          actorUsername: params.actorUsername,
          threadTitle: params.threadTitle,
          threadSlug: params.threadSlug,
          replyPreview: preview,
        });
        break;
      case "mention":
        template = mentionNotificationEmail({
          actorUsername: params.actorUsername,
          contentType: params.contentType || "post",
          threadTitle: params.threadTitle,
          threadSlug: params.threadSlug,
          mentionPreview: preview,
        });
        break;
      case "like":
        template = likeNotificationEmail({
          actorUsername: params.actorUsername,
          contentType: params.contentType || "post",
          threadTitle: params.threadTitle,
          threadSlug: params.threadSlug,
        });
        break;
    }

    await sendEmail({ to: email, ...template });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { action: "sendNotificationEmail", type: params.type },
    });
  }
}

// ---------------------------------------------------------------------------
// Welcome email sender
// ---------------------------------------------------------------------------
export async function sendWelcomeEmail(
  userId: string,
  username: string
): Promise<void> {
  try {
    if (!getResend()) return;

    const admin = createAdminClient();
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    const email = authUser?.user?.email;
    if (!email) return;

    const template = welcomeEmail({ username });
    await sendEmail({ to: email, ...template });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { action: "sendWelcomeEmail" },
    });
  }
}
