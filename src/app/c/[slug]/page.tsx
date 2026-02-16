import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ThreadCard } from "@/components/forum/ThreadCard";
import { Button } from "@/components/ui/Button";
import { SocialSidebar } from "@/components/layout/SocialSidebar";

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

const PAGE_SIZE = 20;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!category) return { title: "Category Not Found" };

  return {
    title: category.name,
    description: category.description || `Browse discussions in ${category.name}`,
  };
}

interface ThreadRow {
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
  profiles: {
    username: string;
    avatar_url: string | null;
    role: string;
  } | null;
  photos: { id: string }[] | null;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const supabase = createClient();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, description, icon, color, thread_count")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  const { data: user } = await supabase.auth.getUser();
  const isLoggedIn = !!user.user;

  const { data: threadsRaw } = await supabase
    .from("threads")
    .select(
      "id, title, slug, content, is_pinned, is_locked, reply_count, view_count, like_count, created_at, last_reply_at, profiles:author_id(username, avatar_url, role), photos(id)"
    )
    .eq("category_id", category.id)
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("last_reply_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const threads = (threadsRaw as unknown as ThreadRow[]) ?? [];
  const totalPages = Math.ceil(category.thread_count / PAGE_SIZE);

  return (
    <div className="w-full overflow-hidden">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-dark-text/50">
        <Link href="/" className="hover:text-terracotta transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-dark-text/70">{category.name}</span>
      </nav>

      {/* Category header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <h1 className="font-heading text-2xl font-bold text-tuscan-brown sm:text-4xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-1 text-base text-dark-text/60 sm:text-lg">
                {category.description}
              </p>
            )}
          </div>
        </div>

        {isLoggedIn && (
          <Link href={`/c/${category.slug}/new`} className="w-full sm:w-auto">
            <Button fullWidth className="sm:w-auto">New Thread</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8 w-full overflow-hidden">
        {/* Thread list */}
        <div className="flex-1 min-w-0">
          {threads.length > 0 ? (
            <div className="space-y-4">
              {threads.map((t) => (
                <ThreadCard
                  key={t.id}
                  id={t.id}
                  title={t.title}
                  slug={t.slug}
                  content={t.content}
                  isPinned={t.is_pinned}
                  isLocked={t.is_locked}
                  replyCount={t.reply_count}
                  viewCount={t.view_count}
                  likeCount={t.like_count}
                  createdAt={t.created_at}
                  lastReplyAt={t.last_reply_at}
                  authorUsername={t.profiles?.username ?? "unknown"}
                  authorAvatarUrl={t.profiles?.avatar_url ?? null}
                  authorRole={t.profiles?.role ?? "member"}
                  hasPhotos={!!t.photos && t.photos.length > 0}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-light-stone bg-white p-12 text-center">
              <p className="text-lg text-dark-text/50">No discussions yet.</p>
              <p className="mt-1 text-base text-dark-text/40">
                Be the first to start one!
              </p>
              {isLoggedIn && (
                <Link href={`/c/${category.slug}/new`} className="mt-4 inline-block">
                  <Button>Start a Discussion</Button>
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/c/${category.slug}?page=${page - 1}`}
                  className="rounded-lg border border-light-stone px-4 py-2.5 text-base text-dark-text/60 transition-colors hover:bg-light-stone"
                >
                  Previous
                </Link>
              )}
              <span className="px-4 py-2.5 text-base text-dark-text/50">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/c/${category.slug}?page=${page + 1}`}
                  className="rounded-lg border border-light-stone px-4 py-2.5 text-base text-dark-text/60 transition-colors hover:bg-light-stone"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="mt-8 w-full lg:w-80 lg:flex-shrink-0 min-w-0 lg:mt-0">
          <SocialSidebar />
        </aside>
      </div>
    </div>
    </div>
  );
}
