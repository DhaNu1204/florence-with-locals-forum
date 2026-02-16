"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { toggleLike } from "@/app/actions/like-actions";
import { deletePost, updatePost } from "@/app/actions/post-actions";
import { cn } from "@/lib/utils/cn";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-light-stone p-4 min-h-[120px] flex items-center justify-center">
        <p className="text-dark-text/40 text-sm">Loading editor...</p>
      </div>
    ),
  }
);

interface PostItemProps {
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
  currentUserId?: string;
  currentUserRole?: string;
  isLikedByUser: boolean;
}

export function PostItem({
  id,
  content,
  isSolution,
  likeCount: initialLikeCount,
  createdAt,
  updatedAt,
  authorId,
  authorUsername,
  authorAvatarUrl,
  authorRole,
  authorReputation,
  currentUserId,
  currentUserRole,
  isLikedByUser: initialIsLiked,
}: PostItemProps) {
  const [liked, setLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [displayContent, setDisplayContent] = useState(content);
  const [saving, setSaving] = useState(false);

  const isAuthor = currentUserId === authorId;
  const isMod =
    currentUserRole === "admin" || currentUserRole === "moderator";
  const canModify = isAuthor || isMod;
  const wasEdited = createdAt !== updatedAt;

  const handleLike = async () => {
    if (!currentUserId) return;
    // Optimistic update
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));

    const result = await toggleLike("post", id);
    if (result.error) {
      // Revert
      setLiked(liked);
      setLikeCount(initialLikeCount);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const result = await updatePost(id, editContent);
    if (!result.error) {
      setDisplayContent(editContent);
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const result = await deletePost(id);
    if (!result.error) {
      setIsDeleted(true);
    }
    setShowDeleteModal(false);
  };

  if (isDeleted) {
    return (
      <div className="rounded-lg border border-light-stone bg-light-stone/30 p-4 text-center text-base text-dark-text/40">
        This reply has been deleted.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4 sm:p-5",
        isSolution
          ? "border-olive-green/40 bg-olive-green/[0.03]"
          : "border-light-stone bg-white"
      )}
    >
      {isSolution && (
        <div className="mb-3 flex items-center gap-1.5">
          <CheckIcon className="h-4 w-4 text-olive-green" />
          <span className="text-sm font-semibold text-olive-green">
            Best Answer
          </span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Author sidebar (desktop) */}
        <div className="hidden shrink-0 sm:block sm:w-28">
          <div className="text-center">
            <Avatar
              src={authorAvatarUrl}
              name={authorUsername}
              size="md"
              href={`/u/${authorUsername}`}
            />
            <Link
              href={`/u/${authorUsername}`}
              className="mt-1.5 block text-base font-medium text-dark-text hover:text-terracotta transition-colors"
            >
              {authorUsername}
            </Link>
            {authorRole !== "member" && (
              <Badge
                variant="solid"
                color={authorRole === "admin" ? "#C75B39" : "#6B8E23"}
                className="mt-1"
              >
                {authorRole}
              </Badge>
            )}
            <p className="mt-1 text-sm text-dark-text/40">
              {authorReputation} rep
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Mobile author bar */}
          <div className="mb-3 flex items-center gap-2 sm:hidden">
            <Avatar
              src={authorAvatarUrl}
              name={authorUsername}
              size="sm"
              href={`/u/${authorUsername}`}
            />
            <Link
              href={`/u/${authorUsername}`}
              className="text-base font-medium text-dark-text hover:text-terracotta transition-colors"
            >
              {authorUsername}
            </Link>
            {authorRole !== "member" && (
              <Badge
                variant="solid"
                color={authorRole === "admin" ? "#C75B39" : "#6B8E23"}
              >
                {authorRole}
              </Badge>
            )}
          </div>

          {/* Post content or editor */}
          {isEditing ? (
            <div className="space-y-3">
              <RichTextEditor
                content={editContent}
                onChange={setEditContent}
                minHeight="sm"
              />
              <div className="flex gap-2">
                <Button size="sm" isLoading={saving} onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(displayContent);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="prose max-w-none text-dark-text"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          )}

          {/* Footer */}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-light-stone pt-3">
            <span className="text-sm text-dark-text/40">
              {formatRelativeTime(createdAt)}
              {wasEdited && " (edited)"}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleLike}
                disabled={!currentUserId || isAuthor}
                className={cn(
                  "flex items-center gap-1 rounded px-2.5 py-1.5 text-sm transition-colors",
                  liked
                    ? "text-terracotta"
                    : "text-dark-text/40 hover:text-terracotta",
                  (!currentUserId || isAuthor) && "cursor-default opacity-50"
                )}
              >
                <HeartIcon filled={liked} className="h-4 w-4" />
                {likeCount > 0 && likeCount}
              </button>

              {canModify && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-dark-text/40 transition-colors hover:text-dark-text"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="text-sm text-dark-text/40 transition-colors hover:text-red-500"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Reply"
        size="sm"
      >
        <p className="text-base text-dark-text/70">
          Are you sure you want to delete this reply? This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// --- Icons ---

function HeartIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
