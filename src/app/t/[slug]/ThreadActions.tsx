"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";
import { toggleLike } from "@/app/actions/like-actions";
import { deleteThread } from "@/app/actions/thread-actions";

interface ThreadActionsProps {
  threadId: string;
  threadSlug: string;
  likeCount: number;
  isLikedByUser: boolean;
  isAuthor: boolean;
  canModify: boolean;
  currentUserId?: string;
  categorySlug?: string;
}

export function ThreadActions({
  threadId,
  threadSlug,
  likeCount: initialLikeCount,
  isLikedByUser: initialIsLiked,
  isAuthor,
  canModify,
  currentUserId,
  categorySlug,
}: ThreadActionsProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    if (!currentUserId || isAuthor) return;
    // Optimistic update
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));

    const result = await toggleLike("thread", threadId);
    if (result.error) {
      // Revert
      setLiked(liked);
      setLikeCount(initialLikeCount);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/t/${threadSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch {
      // Fallback for older browsers
      window.prompt("Copy link:", url);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteThread(threadId);
    if (!result.error) {
      router.push(categorySlug ? `/c/${categorySlug}` : "/");
    }
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-light-stone pt-4">
        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={!currentUserId || isAuthor}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm transition-colors",
            liked
              ? "bg-terracotta/10 text-terracotta"
              : "text-dark-text/50 hover:bg-light-stone hover:text-terracotta",
            (!currentUserId || isAuthor) && "cursor-default opacity-50"
          )}
        >
          <HeartIcon filled={liked} className="h-4 w-4" />
          <span>{likeCount > 0 ? likeCount : ""} Like{likeCount !== 1 ? "s" : ""}</span>
        </button>

        {/* Share dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm text-dark-text/50 transition-colors hover:bg-light-stone hover:text-dark-text"
          >
            <ShareIcon className="h-4 w-4" />
            <span>Share</span>
            <ChevronDownIcon className="h-3 w-3" />
          </button>
          {showShareToast && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-dark-text px-2 py-1 text-xs text-white">
              Link copied!
            </span>
          )}
          {showShareMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowShareMenu(false)}
              />
              <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-light-stone bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    const url = encodeURIComponent(`${window.location.origin}/t/${threadSlug}`);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "width=600,height=400");
                    setShowShareMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-dark-text/70 transition-colors hover:bg-light-stone/50"
                >
                  <FacebookShareIcon className="h-4 w-4 text-[#1877F2]" />
                  Share on Facebook
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(`${window.location.origin}/t/${threadSlug}`);
                    const text = encodeURIComponent(document.title);
                    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank", "width=600,height=400");
                    setShowShareMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-dark-text/70 transition-colors hover:bg-light-stone/50"
                >
                  <XShareIcon className="h-4 w-4" />
                  Share on X
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(`${window.location.origin}/t/${threadSlug}`);
                    const text = encodeURIComponent(`Check out this thread on Florence With Locals! ${decodeURIComponent(url)}`);
                    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
                    setShowShareMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-dark-text/70 transition-colors hover:bg-light-stone/50"
                >
                  <WhatsAppShareIcon className="h-4 w-4 text-[#25D366]" />
                  Share on WhatsApp
                </button>
                <div className="my-1 border-t border-light-stone" />
                <button
                  onClick={() => {
                    handleShare();
                    setShowShareMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-dark-text/70 transition-colors hover:bg-light-stone/50"
                >
                  <LinkShareIcon className="h-4 w-4" />
                  Copy Link
                </button>
              </div>
            </>
          )}
        </div>

        {/* Edit / Delete (for author or mods) */}
        {canModify && (
          <div className="ml-auto flex items-center gap-2">
            {isAuthor && (
              <button
                onClick={() => router.push(`/t/${threadSlug}/edit`)}
                className="text-sm text-dark-text/40 transition-colors hover:text-dark-text"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-sm text-dark-text/40 transition-colors hover:text-red-500"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Thread"
        size="sm"
      >
        <p className="text-base text-dark-text/70">
          Are you sure you want to delete this thread? All replies will also be
          removed. This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Delete Thread
          </Button>
        </div>
      </Modal>
    </>
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

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function FacebookShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function LinkShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 00-6.364-6.364L5.07 8.398a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}
