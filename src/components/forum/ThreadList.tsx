"use client";

import { useState, useTransition } from "react";
import { ThreadCard } from "./ThreadCard";
import { getThreadsByCategory, type ThreadListItem } from "@/app/actions/thread-actions";

interface ThreadListProps {
  initialThreads: ThreadListItem[];
  categoryId: number;
  categorySlug: string;
  initialHasMore: boolean;
  isLoggedIn: boolean;
}

export function ThreadList({
  initialThreads,
  categoryId,
  initialHasMore,
}: ThreadListProps) {
  const [threads, setThreads] = useState(initialThreads);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    startTransition(async () => {
      const result = await getThreadsByCategory(categoryId, page);
      setThreads((prev) => [...prev, ...result.threads]);
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);
    });
  };

  if (threads.length === 0) return null;

  return (
    <>
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
            authorUsername={t.authorUsername}
            authorAvatarUrl={t.authorAvatarUrl}
            authorRole={t.authorRole}
            hasPhotos={t.hasPhotos}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="rounded-lg border border-light-stone bg-white px-6 py-2.5 text-base font-medium text-tuscan-brown transition-colors hover:border-terracotta/30 hover:bg-light-stone disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                Loading…
              </span>
            ) : (
              "Load More Threads"
            )}
          </button>
        </div>
      )}
    </>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
