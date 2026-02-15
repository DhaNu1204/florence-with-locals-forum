"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { getSearchSuggestions } from "@/app/actions/search-actions";
import { SearchResult } from "@/types";
import { truncate, stripHtml } from "@/lib/utils/truncate";

export function SearchInput() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      getSearchSuggestions(debouncedQuery).then((res) => {
        setSuggestions(res.suggestions);
        setShowSuggestions(res.suggestions.length > 0);
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) inputRef.current?.focus();
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsExpanded(false);
      setShowSuggestions(false);
      setQuery("");
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="rounded-lg p-2 text-dark-text/50 transition-colors hover:bg-light-stone hover:text-dark-text"
        aria-label="Search"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-text/30" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the forum..."
            className="w-48 rounded-lg border border-light-stone bg-light-stone/50 py-2 pl-9 pr-3 text-base text-dark-text placeholder-dark-text/40 transition-all focus:w-64 focus:border-terracotta/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-terracotta/20"
          />
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-light-stone bg-white py-1 shadow-lg">
          {suggestions.map((result) => (
            <Link
              key={result.id}
              href={`/t/${result.thread_slug}`}
              onClick={() => {
                setIsExpanded(false);
                setShowSuggestions(false);
                setQuery("");
              }}
              className="block px-4 py-2.5 transition-colors hover:bg-light-stone"
            >
              <p className="text-base font-medium text-dark-text">
                {result.title}
              </p>
              <p className="mt-0.5 text-sm text-dark-text/50">
                {truncate(stripHtml(result.content_preview), 80)}
              </p>
            </Link>
          ))}
          <div className="border-t border-light-stone px-4 py-2">
            <button
              onClick={handleSubmit as () => void}
              className="text-sm font-medium text-terracotta hover:underline"
            >
              See all results for &ldquo;{query}&rdquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}
