import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils/formatDate";

interface LatestThread {
  title: string;
  slug: string;
  author_username: string;
  created_at: string;
}

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  threadCount: number;
  postCount: number;
  latestThread?: LatestThread | null;
}

export function CategoryCard({
  name,
  slug,
  description,
  icon,
  color,
  threadCount,
  postCount,
  latestThread,
}: CategoryCardProps) {
  return (
    <Link
      href={`/c/${slug}`}
      className="group block rounded-lg border border-light-stone bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="flex gap-4 p-5 sm:p-6"
        style={{ borderLeft: `4px solid ${color || "#5D4037"}` }}
      >
        {/* Icon */}
        <div className="shrink-0 text-2xl">{icon || "💬"}</div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-xl font-semibold text-tuscan-brown group-hover:text-terracotta transition-colors">
            {name}
          </h3>
          {description && (
            <p className="mt-1 line-clamp-2 text-base text-dark-text/60">
              {description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-4 text-sm text-dark-text/45">
            <span>{threadCount} threads</span>
            <span>{postCount} posts</span>
          </div>

          {/* Latest thread */}
          {latestThread && (
            <div className="mt-3 border-t border-light-stone pt-2.5">
              <p className="truncate text-sm text-dark-text/70">
                <span className="font-medium">{latestThread.title}</span>
              </p>
              <p className="mt-0.5 text-sm text-dark-text/40">
                by {latestThread.author_username} &middot;{" "}
                {formatRelativeTime(latestThread.created_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
