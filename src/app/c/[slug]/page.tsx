import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ThreadList } from "@/components/forum/ThreadList";
import { Button } from "@/components/ui/Button";
import { SocialSidebar } from "@/components/layout/SocialSidebar";
import type { ThreadListItem } from "@/app/actions/thread-actions";

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

export default async function CategoryPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, description, icon, color, thread_count")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  const { data: user } = await supabase.auth.getUser();
  const isLoggedIn = !!user.user;

  // Fetch first page + 1 extra to detect if there are more
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
    .range(0, PAGE_SIZE);

  const raw = (threadsRaw as unknown as ThreadRow[]) ?? [];
  const hasMore = raw.length > PAGE_SIZE;
  const firstPage = hasMore ? raw.slice(0, PAGE_SIZE) : raw;

  // Map to ThreadListItem shape for the client component
  const initialThreads: ThreadListItem[] = firstPage.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    content: t.content,
    is_pinned: t.is_pinned,
    is_locked: t.is_locked,
    reply_count: t.reply_count,
    view_count: t.view_count,
    like_count: t.like_count,
    created_at: t.created_at,
    last_reply_at: t.last_reply_at,
    authorUsername: t.profiles?.username ?? "unknown",
    authorAvatarUrl: t.profiles?.avatar_url ?? null,
    authorRole: t.profiles?.role ?? "member",
    hasPhotos: !!t.photos && t.photos.length > 0,
  }));

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
            <p className="mt-1 text-sm text-dark-text/40">
              {category.thread_count} {category.thread_count === 1 ? "thread" : "threads"}
            </p>
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
          {initialThreads.length > 0 ? (
            <ThreadList
              initialThreads={initialThreads}
              categoryId={category.id}
              categorySlug={category.slug}
              initialHasMore={hasMore}
              isLoggedIn={isLoggedIn}
            />
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
