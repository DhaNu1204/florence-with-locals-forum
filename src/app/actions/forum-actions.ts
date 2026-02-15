"use server";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActivityItem = {
  id: string;
  type: "new_thread" | "new_reply" | "new_member";
  username: string;
  avatar_url: string | null;
  text: string;
  link: string;
  created_at: string;
};

export type PopularThread = {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  reply_count: number;
  like_count: number;
  category_name: string;
  category_color: string;
  author_username: string;
};

// ---------------------------------------------------------------------------
// getRecentActivity
// ---------------------------------------------------------------------------

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const supabase = createClient();

  const [threadsRes, postsRes, membersRes] = await Promise.all([
    // Latest 5 threads
    supabase
      .from("threads")
      .select("id, title, slug, created_at, profiles:author_id(username, avatar_url), categories:category_id(name)")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(5),
    // Latest 5 replies
    supabase
      .from("posts")
      .select("id, created_at, profiles:author_id(username, avatar_url), threads:thread_id(title, slug)")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(5),
    // Latest 3 new members
    supabase
      .from("profiles")
      .select("id, username, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const activities: ActivityItem[] = [];

  // New threads
  if (threadsRes.data) {
    for (const t of threadsRes.data as unknown as Array<{
      id: string;
      title: string;
      slug: string;
      created_at: string;
      profiles: { username: string; avatar_url: string | null } | null;
      categories: { name: string } | null;
    }>) {
      const username = t.profiles?.username ?? "someone";
      const catName = t.categories?.name ?? "a category";
      activities.push({
        id: `thread-${t.id}`,
        type: "new_thread",
        username,
        avatar_url: t.profiles?.avatar_url ?? null,
        text: `${username} started "${t.title}" in ${catName}`,
        link: `/t/${t.slug}`,
        created_at: t.created_at,
      });
    }
  }

  // New replies
  if (postsRes.data) {
    for (const p of postsRes.data as unknown as Array<{
      id: string;
      created_at: string;
      profiles: { username: string; avatar_url: string | null } | null;
      threads: { title: string; slug: string } | null;
    }>) {
      const username = p.profiles?.username ?? "someone";
      activities.push({
        id: `post-${p.id}`,
        type: "new_reply",
        username,
        avatar_url: p.profiles?.avatar_url ?? null,
        text: `${username} replied to "${p.threads?.title ?? "a thread"}"`,
        link: `/t/${p.threads?.slug ?? ""}`,
        created_at: p.created_at,
      });
    }
  }

  // New members
  if (membersRes.data) {
    for (const m of membersRes.data) {
      activities.push({
        id: `member-${m.id}`,
        type: "new_member",
        username: m.username,
        avatar_url: m.avatar_url,
        text: `${m.username} joined the community`,
        link: `/u/${m.username}`,
        created_at: m.created_at,
      });
    }
  }

  // Sort by date descending, take top 10
  activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return activities.slice(0, 10);
}

// ---------------------------------------------------------------------------
// getPopularThreads
// ---------------------------------------------------------------------------

export async function getPopularThreads(): Promise<PopularThread[]> {
  const supabase = createClient();

  // Try last 30 days first
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("threads")
    .select("id, title, slug, view_count, reply_count, like_count, created_at, profiles:author_id(username), categories:category_id(name, color)")
    .eq("is_deleted", false)
    .gte("created_at", thirtyDaysAgo)
    .order("view_count", { ascending: false })
    .limit(20);

  let threads = (data ?? []) as unknown as Array<{
    id: string;
    title: string;
    slug: string;
    view_count: number;
    reply_count: number;
    like_count: number;
    created_at: string;
    profiles: { username: string } | null;
    categories: { name: string; color: string } | null;
  }>;

  // If fewer than 5 in last 30 days, extend to 90 days
  if (threads.length < 5) {
    const { data: extendedData } = await supabase
      .from("threads")
      .select("id, title, slug, view_count, reply_count, like_count, created_at, profiles:author_id(username), categories:category_id(name, color)")
      .eq("is_deleted", false)
      .gte("created_at", ninetyDaysAgo)
      .order("view_count", { ascending: false })
      .limit(20);

    threads = (extendedData ?? []) as unknown as typeof threads;
  }

  // Score and sort: views*1 + replies*3 + likes*5
  const scored = threads
    .map((t) => ({
      ...t,
      score: t.view_count * 1 + t.reply_count * 3 + t.like_count * 5,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    view_count: t.view_count,
    reply_count: t.reply_count,
    like_count: t.like_count,
    category_name: t.categories?.name ?? "General",
    category_color: t.categories?.color ?? "#5D4037",
    author_username: t.profiles?.username ?? "unknown",
  }));
}
