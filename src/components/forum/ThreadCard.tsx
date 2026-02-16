import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { truncate } from "@/lib/utils/truncate";

interface ThreadCardProps {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  lastReplyAt: string | null;
  authorUsername: string;
  authorAvatarUrl: string | null;
  authorRole: string;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string | null;
  hasPhotos?: boolean;
}

export function ThreadCard({
  title,
  slug,
  content,
  isPinned,
  isLocked,
  replyCount,
  viewCount,
  likeCount,
  createdAt,
  lastReplyAt,
  authorUsername,
  authorAvatarUrl,
  authorRole,
  categoryName,
  categorySlug,
  categoryColor,
  hasPhotos,
}: ThreadCardProps) {
  return (
    <div
      data-testid="thread-card"
      className={`rounded-lg border bg-white p-4 sm:p-5 transition-colors ${
        isPinned
          ? "border-terracotta/30 bg-terracotta/[0.02]"
          : "border-light-stone hover:border-terracotta/20"
      }`}
    >
      <div className="flex gap-3">
        {/* Author avatar */}
        <div className="hidden shrink-0 sm:block">
          <Avatar
            src={authorAvatarUrl}
            name={authorUsername}
            size="sm"
            href={`/u/${authorUsername}`}
          />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              {/* Status icons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {isPinned && (
                  <PinIcon className="h-3.5 w-3.5 text-terracotta shrink-0" />
                )}
                {isLocked && (
                  <LockIcon className="h-3.5 w-3.5 text-dark-text/40 shrink-0" />
                )}
                <Link
                  href={`/t/${slug}`}
                  className="text-base font-medium text-dark-text hover:text-terracotta transition-colors line-clamp-2 sm:text-lg sm:line-clamp-1"
                >
                  {title}
                </Link>
              </div>

              {/* Preview */}
              <p className="mt-1 line-clamp-1 text-base text-dark-text/50">
                {truncate(content, 150)}
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-dark-text/45">
            <Link
              href={`/u/${authorUsername}`}
              className="font-medium text-dark-text/60 hover:text-terracotta transition-colors"
            >
              {authorUsername}
            </Link>

            {authorRole !== "member" && (
              <Badge
                variant="outline"
                color={authorRole === "admin" ? "#C75B39" : "#6B8E23"}
              >
                {authorRole}
              </Badge>
            )}

            {categoryName && categorySlug && (
              <Link href={`/c/${categorySlug}`}>
                <Badge color={categoryColor || undefined}>{categoryName}</Badge>
              </Link>
            )}

            <span className="flex items-center gap-1">
              <ReplyIcon className="h-3.5 w-3.5" />
              {replyCount}
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon className="h-3.5 w-3.5" />
              {viewCount}
            </span>
            <span className="flex items-center gap-1">
              <HeartIcon className="h-3.5 w-3.5" />
              {likeCount}
            </span>
            {hasPhotos && <CameraIcon className="h-3.5 w-3.5" />}
            <span className="ml-auto">
              {formatRelativeTime(lastReplyAt || createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Icons ---

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function ReplyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}
