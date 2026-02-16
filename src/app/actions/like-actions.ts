"use server";

import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email/send-notifications";

interface LikeResult {
  error?: string;
  liked?: boolean;
}

export async function toggleLike(
  targetType: "thread" | "post",
  targetId: string
): Promise<LikeResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to like content." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_banned, username")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Your profile is still being set up. Please refresh the page and try again." };
  if (profile.is_banned) return { error: "Your account has been suspended." };

  // Check for existing like
  const column = targetType === "thread" ? "thread_id" : "post_id";
  const { data: existingLike } = await supabase
    .from("post_likes")
    .select("id")
    .eq(column, targetId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLike) {
    // Remove like
    const { error: deleteError } = await supabase
      .from("post_likes")
      .delete()
      .eq("id", existingLike.id);

    if (deleteError) {
      Sentry.captureException(deleteError, { tags: { action: "toggleLike" } });
      return { error: "Failed to remove like." };
    }

    // Remove reputation from content author
    const authorId = await getContentAuthorId(supabase, targetType, targetId);
    if (authorId && authorId !== user.id) {
      await supabase.rpc("update_reputation", {
        target_user_id: authorId,
        points: -1,
      });
    }

    return { liked: false };
  }

  // Add like
  const insertData =
    targetType === "thread"
      ? { thread_id: targetId, user_id: user.id }
      : { post_id: targetId, user_id: user.id };

  const { error: insertError } = await supabase
    .from("post_likes")
    .insert(insertData);

  if (insertError) {
    if (insertError.message.includes("like_target_check")) {
      return { error: "Invalid like target." };
    }
    Sentry.captureException(insertError, { tags: { action: "toggleLike" } });
    return { error: "Failed to like. You may have already liked this." };
  }

  // Award reputation to content author
  const authorId = await getContentAuthorId(supabase, targetType, targetId);
  if (authorId && authorId !== user.id) {
    await supabase.rpc("update_reputation", {
      target_user_id: authorId,
      points: 1,
    });

    // Send notification
    await supabase.from("notifications").insert({
      user_id: authorId,
      type: "like" as const,
      title: "Someone liked your " + targetType,
      reference_type: targetType,
      reference_id: targetId,
      actor_id: user.id,
    });

    // Email notification (fire-and-forget — must never block or crash the like action)
    try {
      void (async () => {
        const threadInfo = await getThreadInfoForLike(supabase, targetType, targetId);
        if (threadInfo) {
          sendNotificationEmail({
            recipientId: authorId,
            actorId: user.id,
            type: "like",
            actorUsername: profile.username,
            threadTitle: threadInfo.title,
            threadSlug: threadInfo.slug,
            contentType: targetType,
          }).catch(() => {});
        }
      })().catch(() => {});
    } catch {
      // Email notifications must never break the like action
    }
  }

  return { liked: true };
}

async function getThreadInfoForLike(
  supabase: ReturnType<typeof createClient>,
  targetType: "thread" | "post",
  targetId: string
): Promise<{ title: string; slug: string } | null> {
  if (targetType === "thread") {
    const { data } = await supabase
      .from("threads")
      .select("title, slug")
      .eq("id", targetId)
      .single();
    return data ?? null;
  }
  // For posts, look up the parent thread
  const { data: post } = await supabase
    .from("posts")
    .select("thread_id")
    .eq("id", targetId)
    .single();
  if (!post) return null;
  const { data: thread } = await supabase
    .from("threads")
    .select("title, slug")
    .eq("id", post.thread_id)
    .single();
  return thread ?? null;
}

async function getContentAuthorId(
  supabase: ReturnType<typeof createClient>,
  targetType: "thread" | "post",
  targetId: string
): Promise<string | null> {
  if (targetType === "thread") {
    const { data } = await supabase
      .from("threads")
      .select("author_id")
      .eq("id", targetId)
      .single();
    return data?.author_id ?? null;
  }
  const { data } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", targetId)
    .single();
  return data?.author_id ?? null;
}
