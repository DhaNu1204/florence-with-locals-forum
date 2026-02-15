"use client";

import { useRouter } from "next/navigation";
import { PostItem } from "@/components/forum/PostItem";
import { ReplyForm } from "@/components/forum/ReplyForm";

interface PostData {
  id: string;
  content: string;
  isSolution: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  authorRole: string;
  authorReputation: number;
  isLikedByUser: boolean;
}

interface PostsListProps {
  threadId: string;
  isLocked: boolean;
  posts: PostData[];
  currentUserId?: string;
  currentUserRole?: string;
  currentUsername?: string;
  currentAvatarUrl?: string | null;
}

export function PostsList({
  threadId,
  isLocked,
  posts,
  currentUserId,
  currentUserRole,
  currentUsername,
  currentAvatarUrl,
}: PostsListProps) {
  const router = useRouter();

  const handleReplyCreated = () => {
    router.refresh();
  };

  return (
    <section className="mt-6">
      {posts.length > 0 && (
        <>
          <h2 className="mb-4 font-heading text-xl font-semibold text-tuscan-brown">
            {posts.length} {posts.length === 1 ? "Reply" : "Replies"}
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
