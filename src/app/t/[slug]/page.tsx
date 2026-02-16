import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime, formatFullDate } from "@/lib/utils/formatDate";
import { truncate } from "@/lib/utils/truncate";
import { ThreadActions } from "./ThreadActions";
import { PostsList } from "./PostsList";
import { ThreadPhotos } from "@/components/forum/ThreadPhotos";
import { PhotoWithUploader } from "@/types";
import { SocialSidebar } from "@/components/layout/SocialSidebar";
import type { ReplyListItem } from "@/app/actions/post-actions";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const supabase = createClient();
    const { data: thread } = await supabase
      .from("threads")
      .select("title, content, category_id, author_id")
      .eq("slug", params.slug)
      .eq("is_deleted", false)
      .single();

    if (!thread) return { title: "Thread Not Found" };

    const description = truncate(thread.content, 160);

    // Fetch category name and author username for OG image
    const [catRes, authorRes] = await Promise.all([
      supabase.from("categories").select("name").eq("id", thread.category_id).single(),
      supabase.from("profiles").select("username").eq("id", thread.author_id).single(),
    ]);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forum.florencewithlocals.com";
    const ogParams = new URLSearchParams({
      title: thread.title,
      ...(catRes.data?.name && { category: catRes.data.name }),
      ...(authorRes.data?.username && { author: authorRes.data.username }),
    });

    return {
      title: thread.title,
      description,
      openGraph: {
        title: thread.title,
        description,
        images: [`${siteUrl}/api/og?${ogParams.toString()}`],
      },
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { page: "thread-metadata", slug: params.slug },
    });
    return { title: "Thread" };
  }
}

interface ThreadData {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  category_id: number;
  author_id: string;
}

interface CategoryData {
  id: number;
  name: string;
  slug: string;
}

interface AuthorProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  role: string;
  reputation_points: number;
  joined_at: string;
}

interface PostRow {
  id: string;
  content: string;
  is_solution: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
  author_id: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    role: string;
    reputation_points: number;
  } | null;
}

export default async function ThreadPage({ params }: PageProps) {
  try {
  const supabase = createClient();

  const { data: thread } = await supabase
    .from("threads")
    .select("id, title, slug, content, is_pinned, is_locked, view_count, reply_count, like_count, created_at, updated_at, category_id, author_id")
    .eq("slug", params.slug)
    .eq("is_deleted", false)
    .single();

  if (!thread) notFound();

  const typedThread = thread as unknown as ThreadData;

  const REPLY_PAGE_SIZE = 20;

  // Parallel fetches — replies are now paginated (first page + 1 to detect hasMore)
  const [categoryRes, authorRes, postsRes, userRes, photosRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("id", typedThread.category_id)
      .single(),
    supabase
      .from("profiles")
      .select("id, username, avatar_url, role, reputation_points, joined_at")
      .eq("id", typedThread.author_id)
      .single(),
    supabase
      .from("posts")
      .select("id, content, is_solution, like_count, created_at, updated_at, author_id, profiles:author_id(id, username, avatar_url, role, reputation_points)")
      .eq("thread_id", typedThread.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })
      .range(0, REPLY_PAGE_SIZE),
    supabase.auth.getUser(),
    supabase
      .from("photos")
      .select(`
        *,
        uploader:profiles!photos_uploader_id_fkey(id, username, avatar_url)
      `)
      .eq("thread_id", typedThread.id)
      .order("created_at", { ascending: true }),
  ]);

  const category = categoryRes.data as unknown as CategoryData | null;
  const author = authorRes.data as unknown as AuthorProfile | null;
  const allPostsRaw = (postsRes.data as unknown as PostRow[]) ?? [];
  const repliesHasMore = allPostsRaw.length > REPLY_PAGE_SIZE;
  const posts = repliesHasMore ? allPostsRaw.slice(0, REPLY_PAGE_SIZE) : allPostsRaw;
  const currentUser = userRes.data.user;
  const threadPhotos = (photosRes.data || []) as unknown as PhotoWithUploader[];

  // Get current user's profile and likes
  let currentProfile: { id: string; role: string; username: string; avatar_url: string | null } | null = null;
  let userLikedThread = false;
  const userLikedPostIds: Set<string> = new Set();

  if (currentUser) {
    const [profileRes, threadLikeRes, postLikesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, role, username, avatar_url")
        .eq("id", currentUser.id)
        .single(),
      supabase
        .from("post_likes")
        .select("id")
        .eq("thread_id", typedThread.id)
        .eq("user_id", currentUser.id)
        .maybeSingle(),
      supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", currentUser.id)
        .in(
          "post_id",
          posts.map((p) => p.id)
        ),
    ]);

    currentProfile = profileRes.data as unknown as { id: string; role: string; username: string; avatar_url: string | null } | null;
    userLikedThread = !!threadLikeRes.data;
    for (const like of postLikesRes.data ?? []) {
      if (like.post_id) userLikedPostIds.add(like.post_id);
    }
  }

  // Increment view count (fire-and-forget)
  supabase
    .from("threads")
    .update({ view_count: typedThread.view_count + 1 })
    .eq("id", typedThread.id)
    .then(() => {});

  const wasEdited = typedThread.created_at !== typedThread.updated_at;

  // JSON-LD structured data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forum.florencewithlocals.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: typedThread.title,
    text: truncate(typedThread.content, 200),
    datePublished: typedThread.created_at,
    dateModified: typedThread.updated_at,
    url: `${siteUrl}/t/${typedThread.slug}`,
    commentCount: typedThread.reply_count,
    author: {
      "@type": "Person",
      name: author?.username ?? "unknown",
    },
    isPartOf: {
      "@type": "DiscussionForum",
      name: "Florence With Locals Community",
      url: siteUrl,
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: typedThread.reply_count,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: typedThread.like_count,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex flex-wrap items-baseline gap-y-1 text-sm text-dark-text/50">
          <Link href="/" className="shrink-0 hover:text-terracotta transition-colors">
            Home
          </Link>
          <span className="mx-2 shrink-0">/</span>
          {category && (
            <>
              <Link
                href={`/c/${category.slug}`}
                className="shrink-0 hover:text-terracotta transition-colors"
              >
                {category.name}
              </Link>
              <span className="mx-2 shrink-0">/</span>
            </>
          )}
          <span className="text-dark-text/70 line-clamp-1 min-w-0">
            {typedThread.title}
          </span>
        </nav>

        {/* Original post */}
        <article data-testid="thread-content" className="rounded-lg border border-light-stone bg-white p-5 sm:p-7">
          <div className="flex gap-5">
            {/* Author sidebar (desktop) */}
            {author && (
              <div className="hidden shrink-0 sm:block sm:w-32">
                <div className="sticky top-20 text-center">
                  <Avatar
                    src={author.avatar_url}
                    name={author.username}
                    size="lg"
                    href={`/u/${author.username}`}
                  />
                  <Link
                    href={`/u/${author.username}`}
                    className="mt-2 block text-base font-semibold text-dark-text hover:text-terracotta transition-colors"
                  >
                    {author.username}
                  </Link>
                  {author.role !== "member" && (
                    <Badge
                      variant="solid"
                      color={
                        author.role === "admin" ? "#C75B39" : "#6B8E23"
                      }
                      className="mt-1"
                    >
                      {author.role}
                    </Badge>
                  )}
                  <p className="mt-1 text-sm text-dark-text/40">
                    {author.reputation_points} reputation
                  </p>
                  <p className="mt-0.5 text-sm text-dark-text/30">
                    Joined {formatFullDate(author.joined_at)}
                  </p>
                </div>
              </div>
            )}

            {/* Main content */}
            <div className="min-w-0 flex-1">
              {/* Mobile author bar */}
              {author && (
                <div className="mb-4 flex items-center gap-2 sm:hidden">
                  <Avatar
                    src={author.avatar_url}
                    name={author.username}
                    size="sm"
                    href={`/u/${author.username}`}
                  />
                  <div>
                    <Link
                      href={`/u/${author.username}`}
                      className="text-base font-semibold text-dark-text"
                    >
                      {author.username}
                    </Link>
                    {author.role !== "member" && (
                      <Badge
                        variant="solid"
                        color={
                          author.role === "admin" ? "#C75B39" : "#6B8E23"
                        }
                        className="ml-2"
                      >
                        {author.role}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Pinned / Locked indicators */}
              <div className="mb-2 flex items-center gap-2">
                {typedThread.is_pinned && (
                  <Badge color="#C75B39">Pinned</Badge>
                )}
                {typedThread.is_locked && (
                  <Badge variant="outline">Locked</Badge>
                )}
              </div>

              <h1 className="font-heading text-xl font-bold text-tuscan-brown sm:text-3xl">
                {typedThread.title}
              </h1>

              <p className="mt-1 text-sm text-dark-text/40">
                {formatRelativeTime(typedThread.created_at)}
                {wasEdited && " (edited)"}
                {" · "}
                {typedThread.view_count} views
              </p>

              {/* Content */}
              <div
                className="prose mt-5 max-w-none text-dark-text"
                dangerouslySetInnerHTML={{ __html: typedThread.content }}
              />

              {/* Action bar */}
              <ThreadActions
                threadId={typedThread.id}
                threadSlug={typedThread.slug}
                likeCount={typedThread.like_count}
                isLikedByUser={userLikedThread}
                isAuthor={currentUser?.id === typedThread.author_id}
                canModify={
                  currentUser?.id === typedThread.author_id ||
                  currentProfile?.role === "admin" ||
                  currentProfile?.role === "moderator"
                }
                currentUserId={currentUser?.id}
                categorySlug={category?.slug}
              />
            </div>
          </div>
        </article>

        {/* Thread photos */}
        {threadPhotos.length > 0 && (
          <div className="mt-6 rounded-lg border border-light-stone bg-white p-5 sm:p-7">
            <ThreadPhotos photos={threadPhotos} />
          </div>
        )}

        {/* Replies */}
        <PostsList
          threadId={typedThread.id}
          isLocked={typedThread.is_locked}
          totalReplyCount={typedThread.reply_count}
          initialHasMore={repliesHasMore}
          posts={posts.map((p): ReplyListItem => ({
            id: p.id,
            content: p.content,
            isSolution: p.is_solution,
            likeCount: p.like_count,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            authorId: p.author_id,
            authorUsername: p.profiles?.username ?? "unknown",
            authorAvatarUrl: p.profiles?.avatar_url ?? null,
            authorRole: p.profiles?.role ?? "member",
            authorReputation: p.profiles?.reputation_points ?? 0,
            isLikedByUser: userLikedPostIds.has(p.id),
          }))}
          currentUserId={currentUser?.id}
          currentUserRole={currentProfile?.role}
          currentUsername={currentProfile?.username ?? undefined}
          currentAvatarUrl={currentProfile?.avatar_url ?? undefined}
        />

        {/* Social sidebar */}
        <div className="mt-8">
          <SocialSidebar />
        </div>
      </div>
      </div>
    </>
  );

  } catch (error) {
    Sentry.captureException(error, {
      tags: { page: "thread-detail", slug: params.slug },
    });
    throw error;
  }
}
