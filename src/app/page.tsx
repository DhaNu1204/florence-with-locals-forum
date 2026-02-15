import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CategoryCard } from "@/components/forum/CategoryCard";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { SocialSidebar } from "@/components/layout/SocialSidebar";
import {
  getRecentActivity,
  getPopularThreads,
  ActivityItem,
  PopularThread,
} from "@/app/actions/forum-actions";

interface LatestThreadRow {
  title: string;
  slug: string;
  category_id: number;
  profiles: { username: string } | null;
  created_at: string;
}

async function getData() {
  const supabase = createClient();

  const [categoriesRes, statsRes, activities, popularThreads] =
    await Promise.all([
      supabase
        .from("categories")
        .select(
          "id, name, slug, description, icon, color, display_order, thread_count, post_count"
        )
        .eq("is_active", true)
        .order("display_order"),
      Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("threads")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false),
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false),
        supabase
          .from("profiles")
          .select("username")
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
      ]),
      getRecentActivity().catch(() => [] as ActivityItem[]),
      getPopularThreads().catch(() => [] as PopularThread[]),
    ]);

  // Fetch latest thread per category
  const categories = categoriesRes.data ?? [];
  let latestThreads: LatestThreadRow[] = [];
  if (categories.length > 0) {
    const categoryIds = categories.map((c) => c.id);
    const { data } = await supabase
      .from("threads")
      .select(
        "title, slug, category_id, profiles:author_id(username), created_at"
      )
      .in("category_id", categoryIds)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(categories.length * 2);
    latestThreads = (data as unknown as LatestThreadRow[]) ?? [];
  }

  // Build latest thread map (first thread per category)
  const latestMap = new Map<number, LatestThreadRow>();
  for (const t of latestThreads) {
    if (!latestMap.has(t.category_id)) {
      latestMap.set(t.category_id, t);
    }
  }

  const [memberCountRes, threadCountRes, postCountRes, newestMemberRes] =
    statsRes;

  return {
    categories,
    latestMap,
    activities,
    popularThreads,
    stats: {
      members: memberCountRes.count ?? 0,
      threads: threadCountRes.count ?? 0,
      posts: postCountRes.count ?? 0,
      newestMember: newestMemberRes.data?.username ?? null,
    },
  };
}

export default async function HomePage() {
  let data;
  try {
    data = await getData();
  } catch {
    // DB not connected — render placeholder
    data = {
      categories: [],
      latestMap: new Map(),
      activities: [] as ActivityItem[],
      popularThreads: [] as PopularThread[],
      stats: { members: 0, threads: 0, posts: 0, newestMember: null },
    };
  }

  const { categories, latestMap, activities, popularThreads, stats } = data;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-light-stone bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-tuscan-brown sm:text-5xl lg:text-6xl">
            Welcome to the Florence With Locals Community
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-dark-text/60 sm:text-xl">
            Share your Florence experiences, get travel tips from locals, and
            connect with fellow travelers.
          </p>
          <div className="mt-6">
            <Link
              href="/auth/register"
              className="inline-flex items-center rounded-lg bg-terracotta px-6 py-3 text-base font-medium text-white transition-colors hover:bg-terracotta/90 sm:px-8 sm:py-3.5"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:flex lg:gap-8">
          {/* Categories */}
          <div className="flex-1">
            <h2 className="mb-5 font-heading text-2xl font-bold text-tuscan-brown">
              Forum Categories
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
              {categories.map((cat) => {
                const latest = latestMap.get(cat.id);
                return (
                  <CategoryCard
                    key={cat.id}
                    name={cat.name}
                    slug={cat.slug}
                    description={cat.description}
                    icon={cat.icon}
                    color={cat.color}
                    threadCount={cat.thread_count}
                    postCount={cat.post_count}
                    latestThread={
                      latest
                        ? {
                            title: latest.title,
                            slug: latest.slug,
                            author_username:
                              latest.profiles?.username ?? "unknown",
                            created_at: latest.created_at,
                          }
                        : null
                    }
                  />
                );
              })}
            </div>

            {categories.length === 0 && (
              <div className="rounded-lg border border-light-stone bg-white p-8 text-center">
                <p className="text-base text-dark-text/50">
                  Forum categories will appear here once the database is
                  connected.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="mt-8 w-full shrink-0 lg:mt-0 lg:w-80">
            {/* 1. Community Stats */}
            <div className="rounded-lg border border-light-stone bg-white p-5">
              <h3 className="font-heading text-xl font-semibold text-tuscan-brown">
                Community Stats
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <StatBox label="Members" value={stats.members} />
                <StatBox label="Threads" value={stats.threads} />
                <StatBox label="Posts" value={stats.posts} />
              </div>
              {stats.newestMember && (
                <p className="mt-3 text-sm text-dark-text/40">
                  Newest member:{" "}
                  <Link
                    href={`/u/${stats.newestMember}`}
                    className="font-medium text-terracotta"
                  >
                    {stats.newestMember}
                  </Link>
                </p>
              )}
            </div>

            {/* 2. Popular Threads */}
            {popularThreads.length > 0 && (
              <div className="mt-4 rounded-lg border border-light-stone bg-white p-5">
                <h3 className="font-heading text-xl font-semibold text-tuscan-brown">
                  Popular Threads
                </h3>
                <div className="mt-3 space-y-3">
                  {popularThreads.map((thread, index) => (
                    <div key={thread.id} className="flex gap-2.5">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-sm font-bold text-terracotta">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/t/${thread.slug}`}
                          className="line-clamp-2 text-base font-medium text-dark-text hover:text-terracotta transition-colors leading-snug"
                        >
                          {thread.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-dark-text/40">
                          <span
                            className="inline-block rounded px-1.5 py-0.5 text-white"
                            style={{
                              backgroundColor: thread.category_color,
                            }}
                          >
                            {thread.category_name}
                          </span>
                          <span>
                            {thread.view_count} views
                          </span>
                          <span>
                            {thread.reply_count} replies
                          </span>
                          <span>
                            {thread.like_count} likes
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-dark-text/30">
                          by {thread.author_username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Recent Activity */}
            <div className="mt-4 rounded-lg border border-light-stone bg-white p-5">
              <h3 className="font-heading text-xl font-semibold text-tuscan-brown">
                Recent Activity
              </h3>
              {activities.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <Avatar
                        src={activity.avatar_url}
                        name={activity.username}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <Link
                          href={activity.link}
                          className="line-clamp-2 text-dark-text/80 hover:text-terracotta transition-colors leading-snug"
                        >
                          {activity.type === "new_thread" && (
                            <ActivityIcon type="thread" />
                          )}
                          {activity.type === "new_reply" && (
                            <ActivityIcon type="reply" />
                          )}
                          {activity.type === "new_member" && (
                            <ActivityIcon type="member" />
                          )}
                          {activity.text}
                        </Link>
                        <p className="text-xs text-dark-text/30 mt-0.5">
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-base text-dark-text/40">
                  No recent activity yet.
                </p>
              )}
            </div>

            {/* 4. Social Sidebar */}
            <div className="mt-4">
              <SocialSidebar />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-bold text-tuscan-brown">{value}</p>
      <p className="text-sm text-dark-text/40">{label}</p>
    </div>
  );
}

function ActivityIcon({ type }: { type: "thread" | "reply" | "member" }) {
  const icons = {
    thread: "\u{1F4DD} ",
    reply: "\u{1F4AC} ",
    member: "\u{1F44B} ",
  };
  return <span className="mr-0.5">{icons[type]}</span>;
}
