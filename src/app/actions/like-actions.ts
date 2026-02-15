"use server";

import { createClient } from "@/lib/supabase/server";

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
    .select("id, is_banned")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found." };
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

    if (deleteError) return { error: "Failed to remove like." };

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
  }

  return { liked: true };
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
