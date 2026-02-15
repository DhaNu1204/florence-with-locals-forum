"use server";

import { createClient } from "@/lib/supabase/server";
import { SearchResult } from "@/types";
import { searchSchema, validate } from "@/lib/validations";

interface SearchResults {
  error?: string;
  results?: SearchResult[];
}

export async function searchForum(query: string): Promise<SearchResults> {
  const validation = validate(searchSchema, { query });
  if (validation.error) return { error: validation.error };

  const supabase = createClient();

  const { data, error } = await supabase.rpc("search_posts", {
    search_query: query.trim(),
  });

  if (error) return { error: "Search failed. Please try again." };

  return { results: (data as SearchResult[]) || [] };
}

export async function getSearchSuggestions(
  query: string
): Promise<{ suggestions: SearchResult[] }> {
  if (!query.trim() || query.trim().length < 2) {
    return { suggestions: [] };
  }

  const supabase = createClient();

  const { data } = await supabase.rpc("search_posts", {
    search_query: query.trim(),
  });

  // Return only top 5 for suggestions dropdown
  return { suggestions: ((data as SearchResult[]) || []).slice(0, 5) };
}
