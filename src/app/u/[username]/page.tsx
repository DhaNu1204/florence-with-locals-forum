import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime, formatFullDate } from "@/lib/utils/formatDate";
import { truncate, stripHtml } from "@/lib/utils/truncate";

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, bio")
    .eq("username", params.username)
    .single();

  if (!profile) return { title: "User Not Found" };

  return {
    title: `${profile.full_name || profile.username} (@${profile.username}) - Florence With Locals Forum`,
    description: profile.bio
      ? truncate(stripHtml(profile.bio), 155)
      : `View ${profile.username}'s profile on Florence With Locals Forum`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const supabase = createClient();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  // Check if banned
  if (profile.is_banned) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-lg bg-red-50 p-8">
          <h1 className="font-heading text-2xl font-bold text-red-800">
            Account Suspended
          </h1>
          <p className="mt-2 text-base text-red-600">
            This account has been suspended.
          </p>
        </div>
      </div>
    );
  }

  // Fetch stats and recent content in parallel
  const [threadsRes, repliesRes, photosRes, threadCountRes, replyCountRes] =
    await Promise.all([
      supabase
        .from("threads")
        .select("id, title, slug, created_at, reply_count, view_count, category_id, categories(name, slug, color)")
        .eq("author_id", profile.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("posts")
        .select("id, content, created_at, thread_id, threads(title, slug)")
        .eq("author_id", profile.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("photos")
        .select("id, url, caption, location_tag")
        .eq("uploader_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("threads")
        .select("id", { count: "exact", head: true })
        .eq("author_id", profile.id)
        .eq("is_deleted", false),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", profile.id)
        .eq("is_deleted", false),
    ]);

  const threads = threadsRes.data || [];
  const replies = repliesRes.data || [];
  const photos = photosRes.data || [];
  const threadCount = threadCountRes.count ?? 0;
  const replyCount = replyCountRes.count ?? 0;

  // Check if viewing own profile
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile header */}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-light-stone">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name || profile.username}
            size="xl"
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <h1 className="font-heading text-3xl font-bold text-dark-text">
                {profile.full_name || profile.username}
              </h1>
              <Badge
                color={
                  profile.role === "admin"
                    ? "#dc2626"
                    : profile.role === "moderator"
                      ? "#d97706"
                      : profile.role === "guide"
                        ? "#6B8E23"
                        : "#5D4037"
                }
              >
                {profile.role}
              </Badge>
            </div>

            <p className="mt-0.5 text-base text-dark-text/50">
              @{profile.username}
            </p>

            {profile.bio && (
              <div
                className="mt-3 text-base text-dark-text/70"
                dangerouslySetInnerHTML={{ __html: profile.bio }}
              />
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-dark-text/50 sm:justify-start">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-terracotta hover:underline"
                >
                  <LinkIcon className="h-4 w-4" />
                  Website
                </a>
              )}
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Joined {formatFullDate(profile.joined_at)}
              </span>
            </div>

            {isOwnProfile && (
              <Link
                href="/settings"
                className="mt-4 inline-block rounded-lg border border-light-stone px-4 py-2 text-base font-medium text-dark-text/70 transition-colors hover:bg-light-stone"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-light-stone pt-4">
          <div className="text-center">
            <p className="text-xl font-bold text-dark-text">{threadCount}</p>
            <p className="text-sm text-dark-text/50">Threads</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-dark-text">{replyCount}</p>
            <p className="text-sm text-dark-text/50">Replies</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-terracotta">
              {profile.reputation_points}
            </p>
            <p className="text-sm text-dark-text/50">Reputation</p>
          </div>
        </div>
      </div>

      {/* Recent Threads */}
      <section className="mt-8">
        <h2 className="mb-4 font-heading text-xl font-bold text-dark-text">
          Recent Threads
        </h2>
        {threads.length === 0 ? (
          <p className="text-base text-dark-text/40">No threads yet.</p>
        ) : (
          <div className="space-y-3">
            {threads.map((thread: Record<string, unknown>) => (
              <Link
                key={thread.id as string}
                href={`/t/${thread.slug as string}`}
                className="block rounded-lg bg-white p-4 shadow-sm ring-1 ring-light-stone transition-colors hover:bg-light-stone/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-medium text-dark-text">
                      {thread.title as string}
                    </h3>
                    <p className="mt-1 text-sm text-dark-text/50">
                      {formatRelativeTime(thread.created_at as string)} &middot;{" "}
                      {thread.reply_count as number} replies &middot;{" "}
                      {thread.view_count as number} views
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Replies */}
      <section className="mt-8">
        <h2 className="mb-4 font-heading text-xl font-bold text-dark-text">
          Recent Replies
        </h2>
        {replies.length === 0 ? (
          <p className="text-base text-dark-text/40">No replies yet.</p>
        ) : (
          <div className="space-y-3">
            {replies.map((reply: Record<string, unknown>) => {
              const threadData = reply.threads as Record<string, unknown> | null;
              return (
                <Link
                  key={reply.id as string}
                  href={threadData ? `/t/${threadData.slug as string}` : "#"}
                  className="block rounded-lg bg-white p-4 shadow-sm ring-1 ring-light-stone transition-colors hover:bg-light-stone/50"
                >
                  {threadData && (
                    <p className="mb-1 text-sm font-medium text-terracotta">
                      Re: {threadData.title as string}
                    </p>
                  )}
                  <p className="text-base text-dark-text/70">
                    {truncate(stripHtml(reply.content as string), 150)}
                  </p>
                  <p className="mt-1 text-sm text-dark-text/40">
                    {formatRelativeTime(reply.created_at as string)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Photos */}
      {photos.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-heading text-xl font-bold text-dark-text">
            Photos
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo: Record<string, unknown>) => (
              <div
                key={photo.id as string}
                className="aspect-square overflow-hidden rounded-lg"
              >
                <img
                  src={photo.url as string}
                  alt={(photo.caption as string) || "Photo"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.8 8.626" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
