"use client";

import Link from "next/link";
import { SearchResult } from "@/types";
import { highlightMatches } from "@/lib/utils/highlightText";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { truncate, stripHtml } from "@/lib/utils/truncate";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-lg bg-light-stone/50 p-8 text-center">
        <SearchEmptyIcon className="mx-auto mb-3 h-12 w-12 text-dark-text/20" />
        <h3 className="text-lg font-semibold text-dark-text/60">
          No results found
        </h3>
        <p className="mt-2 text-base text-dark-text/40">
          Try different keywords or check your spelling.
        </p>
        <div className="mt-4 text-left">
          <p className="text-xs font-semibold uppercase text-dark-text/40">
            Search tips
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-base text-dark-text/50">
            <li>Use specific keywords like &ldquo;Uffizi tickets&rdquo;</li>
            <li>Try broader terms if specific ones don&apos;t match</li>
            <li>Check for common misspellings</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Link
          key={`${result.result_type}-${result.id}`}
          href={`/t/${result.thread_slug}`}
          className="block rounded-lg bg-white p-5 shadow-sm ring-1 ring-light-stone transition-colors hover:bg-light-stone/50"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {result.result_type === "thread" ? (
                <ThreadIcon className="h-5 w-5 text-terracotta/60" />
              ) : (
                <ReplyIcon className="h-5 w-5 text-olive-green/60" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-base font-semibold text-dark-text"
                dangerouslySetInnerHTML={{
                  __html: highlightMatches(result.title, query),
                }}
              />
              <p
                className="mt-1 text-base text-dark-text/60"
                dangerouslySetInnerHTML={{
                  __html: highlightMatches(
                    truncate(stripHtml(result.content_preview), 200),
                    query
                  ),
                }}
              />
              <div className="mt-2 flex items-center gap-3 text-sm text-dark-text/40">
                <span className="rounded bg-light-stone px-2 py-0.5 text-xs font-medium uppercase">
                  {result.result_type}
                </span>
                <span>{formatRelativeTime(result.created_at)}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SearchEmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ThreadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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
