import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SearchResult } from "@/types";
import { SearchForm } from "./SearchForm";
import { SearchResults } from "./SearchResults";

export const metadata: Metadata = {
  title: "Search - Florence With Locals Forum",
  robots: { index: false },
};

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() || "";
  let results: SearchResult[] = [];

  if (query.length >= 2) {
    const supabase = createClient();
    const { data } = await supabase.rpc("search_posts", {
      search_query: query,
    });
    results = (data as SearchResult[]) || [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-dark-text">
        Search
      </h1>

      <div className="mt-6">
        <SearchForm initialQuery={query} resultCount={results.length} />
      </div>

      {query && (
        <div className="mt-8">
          <SearchResults results={results} query={query} />
        </div>
      )}
    </div>
  );
}
