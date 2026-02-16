"use server";

import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { sanitizeHtml } from "@/lib/utils/sanitizeHtml";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rateLimit";
import { createPostSchema, validate } from "@/lib/validations";
import { createMentionNotifications } from "./notification-actions";
import { trackContentImages } from "./photo-actions";

interface ActionResult {
  error?: string;
  postId?: string;
}

export async function createPost(
  threadId: string,
  content: string
): Promise<ActionResult> {
  // Validate input
  const validation = validate(createPostSchema, { threadId, content });
  if (validation.error) return { error: validation.error };

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to reply." };

  // Rate limit (stricter for new users)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_banned, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found." };
  if (profile.is_banned) return { error: "Your account has been suspended." };

  const isNewUser =
    Date.now() - new Date(profile.created_at).getTime() < 24 * 60 * 60 * 1000;
  const limit = isNewUser ? RATE_LIMITS.NEW_USER_POST : RATE_LIMITS.POST;
  const rateCheck = checkRateLimit(`post:${user.id}`, limit.maxRequests, limit.windowMs);
  if (!rateCheck.allowed) {
    return {
      error: isNewUser
        ? "New accounts can post up to 3 times per hour. Please wait a bit."
        : "You're posting too quickly. Please wait a bit.",
    };
  }

  const { data: thread } = await supabase
    .from("threads")
    .select("id, is_locked, author_id")
    .eq("id", threadId)
    .eq("is_deleted", false)
    .single();

  if (!thread) return { error: "Thread not found." };
  if (thread.is_locked) return { error: "This thread is locked." };

  const sanitizedContent = sanitizeHtml(content.trim());
  if (!sanitizedContent) return { error: "Reply content cannot be empty." };

  const { data: post, error: insertError } = await supabase
    .from("posts")
    .insert({
      thread_id: threadId,
      author_id: user.id,
      content: sanitizedContent,
    })
    .select("id")
    .single();

  if (insertError) {
    Sentry.captureException(insertError, { tags: { action: "createPost" } });
    return { error: "Failed to create reply. Please try again." };
  }

  // Award reputation
  await supabase.rpc("update_reputation", {
    target_user_id: user.id,
    points: 2,
  });

  // Send notification to thread author (if replier != author)
  if (thread.author_id !== user.id) {
    await supabase.from("notifications").insert({
      user_id: thread.author_id,
      type: "reply" as const,
      title: "New reply to your thread",
      message: "Someone replied to your thread.",
      reference_type: "thread",
      reference_id: threadId,
      actor_id: user.id,
    });
  }

  // Create mention notifications
  await createMentionNotifications(sanitizedContent, user.id, "post", post.id);

  // Track inline editor images in the photos table
  await trackContentImages(sanitizedContent, user.id, {
    threadId,
    postId: post.id,
  });

  return { postId: post.id };
}

export async function deletePost(postId: string): Promise<ActionResult> {
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

  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .single();

  if (!post) return { error: "Post not found." };

  const isAuthor = post.author_id === user.id;
  const isMod = profile.role === "admin" || profile.role === "moderator";

  if (!isAuthor && !isMod) return { error: "You don't have permission to delete this post." };

  const { error: updateError } = await supabase
    .from("posts")
    .update({ is_deleted: true })
    .eq("id", postId);

  if (updateError) {
    Sentry.captureException(updateError, { tags: { action: "deletePost" } });
    return { error: "Failed to delete post." };
  }
  return {};
}

export async function updatePost(
  postId: string,
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

  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .single();

  if (!post) return { error: "Post not found." };

  const isAuthor = post.author_id === user.id;
  const isMod = profile.role === "admin" || profile.role === "moderator";

  if (!isAuthor && !isMod) return { error: "You don't have permission to edit this post." };

  const sanitizedContent = sanitizeHtml(content.trim());
  if (!sanitizedContent) return { error: "Content cannot be empty." };

  const { error: updateError } = await supabase
    .from("posts")
    .update({ content: sanitizedContent })
    .eq("id", postId);

  if (updateError) {
    Sentry.captureException(updateError, { tags: { action: "updatePost" } });
    return { error: "Failed to update post." };
  }

  // Track any new inline images added during edit
  const { data: postData } = await supabase
    .from("posts")
    .select("thread_id")
    .eq("id", postId)
    .single();

  await trackContentImages(sanitizedContent, user.id, {
    threadId: postData?.thread_id || undefined,
    postId,
  });

  return {};
}
