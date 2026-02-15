"use server";

import { createClient } from "@/lib/supabase/server";
import { slugifyWithSuffix } from "@/lib/utils/slugify";
import { sanitizeHtml } from "@/lib/utils/sanitizeHtml";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rateLimit";
import { createThreadSchema, validate } from "@/lib/validations";
import { createMentionNotifications } from "./notification-actions";
import { trackContentImages } from "./photo-actions";

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
    .select("id, is_banned")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found." };
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

  if (insertError) return { error: "Failed to create thread. Please try again." };

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

  if (updateError) return { error: "Failed to delete thread." };
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

  if (updateError) return { error: "Failed to update thread." };

  // Track any new inline images added during edit
  await trackContentImages(sanitizedContent, user.id, { threadId });

  return {};
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
