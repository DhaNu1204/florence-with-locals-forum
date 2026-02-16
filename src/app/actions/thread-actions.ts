"use server";

import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { slugifyWithSuffix } from "@/lib/utils/slugify";
import { sanitizeHtml } from "@/lib/utils/sanitizeHtml";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rateLimit";
import { createThreadSchema, validate } from "@/lib/validations";
import { createMentionNotifications } from "./notification-actions";
import { trackContentImages } from "./photo-actions";
import { sendNotificationEmail } from "@/lib/email/send-notifications";
import { extractMentions } from "@/lib/utils/mentions";

interface ActionResult {
  error?: string;
  slug?: string;
  threadId?: string;
}

export async function createThread(
  categorySlug: string,
  title: string,
  content: string,
  photoIds: string[]
): Promise<ActionResult> {
  // Validate input
  const validation = validate(createThreadSchema, { title, content, categorySlug, photoIds });
  if (validation.error) return { error: validation.error };

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to create a thread." };

  // Rate limit
  const rateCheck = checkRateLimit(
    `thread:${user.id}`,
    RATE_LIMITS.THREAD.maxRequests,
    RATE_LIMITS.THREAD.windowMs
  );
  if (!rateCheck.allowed) {
    return { error: "You're creating threads too quickly. Please wait a bit." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_banned, username")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Your profile is still being set up. Please refresh the page and try again." };
  if (profile.is_banned) return { error: "Your account has been suspended." };

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .single();

  if (!category) return { error: "Category not found." };

  const slug = slugifyWithSuffix(trimmedTitle);
  const sanitizedContent = sanitizeHtml(trimmedContent);

  const { data: thread, error: insertError } = await supabase
    .from("threads")
    .insert({
      category_id: category.id,
      author_id: user.id,
      title: trimmedTitle,
      slug,
      content: sanitizedContent,
    })
    .select("id, slug")
    .single();

  if (insertError) {
    Sentry.captureException(insertError, { tags: { action: "createThread" } });
    return { error: "Failed to create thread. Please try again." };
  }

  // Link photos to thread
  if (photoIds.length > 0) {
    await supabase
      .from("photos")
      .update({ thread_id: thread.id })
      .in("id", photoIds)
      .eq("uploader_id", user.id);
  }

  // Track inline editor images in the photos table
  await trackContentImages(sanitizedContent, user.id, { threadId: thread.id });

  // Award reputation
  await supabase.rpc("update_reputation", {
    target_user_id: user.id,
    points: 5,
  });

  // Create mention notifications
  await createMentionNotifications(sanitizedContent, user.id, "thread", thread.id);

  // Email mention notifications (fire-and-forget — must never block or crash thread creation)
  try {
    const mentionedUsernames = extractMentions(sanitizedContent);
    if (mentionedUsernames.length > 0) {
      // Fire-and-forget: async IIFE runs in background, never blocks the action
      void (async () => {
        const { data: mentionedUsers } = await supabase
          .from("profiles")
          .select("id, username")
          .in("username", mentionedUsernames);

        for (const mentioned of mentionedUsers ?? []) {
          sendNotificationEmail({
            recipientId: mentioned.id,
            actorId: user.id,
            type: "mention",
            actorUsername: profile.username,
            threadTitle: trimmedTitle,
            threadSlug: thread.slug,
            contentType: "thread",
            contentPreview: sanitizedContent,
          }).catch(() => {});
        }
      })().catch(() => {});
    }
  } catch {
    // Email notifications must never break thread creation
  }

  return { slug: thread.slug, threadId: thread.id };
}

export async function deleteThread(threadId: string): Promise<ActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found." };

  const { data: thread } = await supabase
    .from("threads")
    .select("author_id")
    .eq("id", threadId)
    .single();

  if (!thread) return { error: "Thread not found." };

  const isAuthor = thread.author_id === user.id;
  const isMod = profile.role === "admin" || profile.role === "moderator";

  if (!isAuthor && !isMod) return { error: "You don't have permission to delete this thread." };

  const { error: updateError } = await supabase
    .from("threads")
    .update({ is_deleted: true })
    .eq("id", threadId);

  if (updateError) {
    Sentry.captureException(updateError, { tags: { action: "deleteThread" } });
    return { error: "Failed to delete thread." };
  }
  return {};
}

export async function updateThread(
  threadId: string,
  title: string,
  content: string
): Promise<ActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found." };

  const { data: thread } = await supabase
    .from("threads")
    .select("author_id")
    .eq("id", threadId)
    .single();

  if (!thread) return { error: "Thread not found." };

  const isAuthor = thread.author_id === user.id;
  const isMod = profile.role === "admin" || profile.role === "moderator";

  if (!isAuthor && !isMod) return { error: "You don't have permission to edit this thread." };

  const trimmedTitle = title.trim();
  if (!trimmedTitle || trimmedTitle.length > 200) {
    return { error: "Title must be between 1 and 200 characters." };
  }

  const sanitizedContent = sanitizeHtml(content.trim());
  if (!sanitizedContent) return { error: "Content cannot be empty." };

  const { error: updateError } = await supabase
    .from("threads")
    .update({ title: trimmedTitle, content: sanitizedContent })
    .eq("id", threadId);

  if (updateError) {
    Sentry.captureException(updateError, { tags: { action: "updateThread" } });
    return { error: "Failed to update thread." };
  }

  // Track any new inline images added during edit
  await trackContentImages(sanitizedContent, user.id, { threadId });

  return {};
}

// ---------------------------------------------------------------------------
// getThreadsByCategory — paginated thread fetch for category pages
// ---------------------------------------------------------------------------

export type ThreadListItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  view_count: number;
  like_count: number;
  created_at: string;
  last_reply_at: string | null;
  authorUsername: string;
  authorAvatarUrl: string | null;
  authorRole: string;
  hasPhotos: boolean;
};

export async function getThreadsByCategory(
  categoryId: number,
  page: number,
  pageSize: number = 20
): Promise<{ threads: ThreadListItem[]; hasMore: boolean }> {
  const supabase = createClient();
  const offset = page * pageSize;

  const { data } = await supabase
    .from("threads")
    .select(
      "id, title, slug, content, is_pinned, is_locked, reply_count, view_count, like_count, created_at, last_reply_at, profiles:author_id(username, avatar_url, role), photos(id)"
    )
    .eq("category_id", categoryId)
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("last_reply_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize);

  type RawThread = {
    id: string;
    title: string;
    slug: string;
    content: string;
    is_pinned: boolean;
    is_locked: boolean;
    reply_count: number;
    view_count: number;
    like_count: number;
    created_at: string;
    last_reply_at: string | null;
    profiles: { username: string; avatar_url: string | null; role: string } | null;
    photos: { id: string }[] | null;
  };

  const raw = (data as unknown as RawThread[]) ?? [];

  // We fetch pageSize+1 to check if there are more
  const hasMore = raw.length > pageSize;
  const threads = (hasMore ? raw.slice(0, pageSize) : raw).map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    content: t.content,
    is_pinned: t.is_pinned,
    is_locked: t.is_locked,
    reply_count: t.reply_count,
    view_count: t.view_count,
    like_count: t.like_count,
    created_at: t.created_at,
    last_reply_at: t.last_reply_at,
    authorUsername: t.profiles?.username ?? "unknown",
    authorAvatarUrl: t.profiles?.avatar_url ?? null,
    authorRole: t.profiles?.role ?? "member",
    hasPhotos: !!t.photos && t.photos.length > 0,
  }));

  return { threads, hasMore };
}

export async function incrementViewCount(threadId: string): Promise<void> {
  const supabase = createClient();
  // Simple increment by reading current value and updating
  const { data } = await supabase
    .from("threads")
    .select("view_count")
    .eq("id", threadId)
    .single();

  if (data) {
    await supabase
      .from("threads")
      .update({ view_count: data.view_count + 1 })
      .eq("id", threadId);
  }
}
