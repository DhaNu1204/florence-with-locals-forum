"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { PostItem } from "@/components/forum/PostItem";
import { getThreadReplies, type ReplyListItem } from "@/app/actions/post-actions";

const ReplyForm = dynamic(
  () => import("@/components/forum/ReplyForm").then((mod) => mod.ReplyForm),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-light-stone p-6 mt-6">
        <p className="text-dark-text/50 text-sm">Loading editor...</p>
      </div>
    ),
  }
);

interface PostsListProps {
  threadId: string;
  isLocked: boolean;
  posts: ReplyListItem[];
  totalReplyCount: number;
  initialHasMore: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  currentUsername?: string;
  currentAvatarUrl?: string | null;
}

export function PostsList({
  threadId,
  isLocked,
  posts: initialPosts,
  totalReplyCount,
  initialHasMore,
  currentUserId,
  currentUserRole,
  currentUsername,
  currentAvatarUrl,
}: PostsListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    startTransition(async () => {
      const result = await getThreadReplies(threadId, page, 20, currentUserId);
      setPosts((prev) => [...prev, ...result.replies]);
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);
    });
  };

  const handleReplyCreated = () => {
    router.refresh();
  };

  return (
    <section className="mt-6">
      {posts.length > 0 && (
        <>
          <h2 className="mb-4 font-heading text-xl font-semibold text-tuscan-brown">
            {totalReplyCount} {totalReplyCount === 1 ? "Reply" : "Replies"}
          </h2>

          <div className="space-y-4">
            {posts.map((post) => (
              <PostItem
                key={post.id}
                id={post.id}
                content={post.content}
                isSolution={post.isSolution}
                likeCount={post.likeCount}
                createdAt={post.createdAt}
                updatedAt={post.updatedAt}
                authorId={post.authorId}
                authorUsername={post.authorUsername}
                authorAvatarUrl={post.authorAvatarUrl}
                authorRole={post.authorRole}
                authorReputation={post.authorReputation}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                isLikedByUser={post.isLikedByUser}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                data-testid="load-more-replies"
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
                  "Load More Replies"
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Reply form */}
      <div className="mt-6">
        <ReplyForm
          threadId={threadId}
          isLoggedIn={!!currentUserId}
          isLocked={isLocked}
          username={currentUsername}
          avatarUrl={currentAvatarUrl}
          onReplyCreated={handleReplyCreated}
        />
      </div>
    </section>
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
