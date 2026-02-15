/**
 * Wrap matching search terms in <mark> tags for search result highlighting.
 * Escapes regex special chars in the query to prevent injection.
 */
export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}
