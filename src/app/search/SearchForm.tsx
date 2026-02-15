"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchFormProps {
  initialQuery: string;
  resultCount: number;
}

export function SearchForm({ initialQuery, resultCount }: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-text/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search threads and replies..."
          className="w-full rounded-lg border border-light-stone bg-white py-3 pl-12 pr-4 text-dark-text placeholder-dark-text/40 focus:border-terracotta/30 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          autoFocus
        />
      </div>
      {initialQuery && (
        <p className="mt-3 text-base text-dark-text/50">
          {resultCount === 0
            ? `No results found for "${initialQuery}"`
            : `${resultCount} result${resultCount !== 1 ? "s" : ""} for "${initialQuery}"`}
        </p>
      )}
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}
