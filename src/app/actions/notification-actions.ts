"use server";

import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { extractMentions } from "@/lib/utils/mentions";
import { NotificationWithActor, ReferenceType } from "@/types";

interface NotificationsResult {
  error?: string;
  notifications?: NotificationWithActor[];
  hasMore?: boolean;
}

const PAGE_SIZE = 20;

export async function getNotifications(page = 1): Promise<NotificationsResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      *,
      actor:profiles!notifications_actor_id_fkey(id, username, avatar_url)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    Sentry.captureException(error, { tags: { action: "getNotifications" } });
    return { error: "Failed to load notifications." };
  }

  const notifications = (data || []) as unknown as NotificationWithActor[];

  return {
    notifications: notifications.slice(0, PAGE_SIZE),
    hasMore: notifications.length > PAGE_SIZE,
  };
}

export async function getUnreadCount(): Promise<number> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return count ?? 0;
}

export async function markAsRead(
  notificationId: string
): Promise<{ error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    Sentry.captureException(error, { tags: { action: "markAsRead" } });
    return { error: "Failed to mark notification as read." };
  }
  return {};
}

export async function markAllAsRead(): Promise<{ error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    Sentry.captureException(error, { tags: { action: "markAllAsRead" } });
    return { error: "Failed to mark all as read." };
  }
  return {};
}

export async function createMentionNotifications(
  content: string,
  actorId: string,
  referenceType: ReferenceType,
  referenceId: string
): Promise<void> {
  const supabase = createClient();
  const usernames = extractMentions(content);

  if (usernames.length === 0) return;

  // Look up user IDs for mentioned usernames
  const { data: mentionedUsers } = await supabase
    .from("profiles")
    .select("id, username")
    .in("username", usernames);

  if (!mentionedUsers || mentionedUsers.length === 0) return;

  // Don't notify the actor about their own mentions
  const notifications = mentionedUsers
    .filter((u) => u.id !== actorId)
    .map((u) => ({
      user_id: u.id,
      type: "mention" as const,
      title: "You were mentioned",
      message: `@${u.username} was mentioned in a ${referenceType}.`,
      reference_type: referenceType,
      reference_id: referenceId,
      actor_id: actorId,
    }));

  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications);
  }
}
