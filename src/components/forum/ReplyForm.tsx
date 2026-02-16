"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { createPost } from "@/app/actions/post-actions";

interface ReplyFormProps {
  threadId: string;
  isLoggedIn: boolean;
  isLocked: boolean;
  username?: string;
  avatarUrl?: string | null;
  onReplyCreated?: () => void;
}

export function ReplyForm({
  threadId,
  isLoggedIn,
  isLocked,
  username,
  avatarUrl,
  onReplyCreated,
}: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLocked) {
    return (
      <div className="rounded-lg border border-light-stone bg-light-stone/30 p-6 text-center">
        <LockIcon className="mx-auto h-8 w-8 text-dark-text/30" />
        <p className="mt-2 text-base text-dark-text/50">
          This thread is locked. No new replies can be posted.
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-light-stone bg-white p-6 text-center">
        <p className="text-base text-dark-text/60">
          <Link
            href="/auth/login"
            className="font-medium text-terracotta hover:text-terracotta/80 transition-colors"
          >
            Log in
          </Link>{" "}
          to join the discussion.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError("");
    const trimmed = content.trim();
    if (!trimmed || trimmed === "<p></p>") {
      setError("Please write a reply before posting.");
      return;
    }

    setIsSubmitting(true);
    const result = await createPost(threadId, trimmed);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setContent("");
    setIsSubmitting(false);
    onReplyCreated?.();
  };

  return (
    <div className="rounded-lg border border-light-stone bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Avatar src={avatarUrl} name={username} size="sm" />
        <span className="text-base text-dark-text/60">
          Reply as{" "}
          <span className="font-medium text-dark-text">{username}</span>
        </span>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 px-4 py-2.5 text-base text-red-600">
          {error}
        </div>
      )}

      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder="Write your reply..."
        minHeight="sm"
      />

      <div className="mt-3 flex sm:justify-end">
        <Button fullWidth className="sm:w-auto" isLoading={isSubmitting} onClick={handleSubmit}>
          Post Reply
        </Button>
      </div>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
