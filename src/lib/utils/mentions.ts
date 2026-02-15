/**
 * Extract @mentions from HTML content.
 * Returns an array of unique lowercase usernames.
 */
export function extractMentions(html: string): string[] {
  // Strip HTML tags first to avoid matching attributes
  const text = html.replace(/<[^>]*>/g, " ");
  const regex = /@(\w{2,30})\b/g;
  const matches = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    matches.add(match[1].toLowerCase());
  }

  return Array.from(matches);
}

/**
 * Replace @username mentions with linked <a> tags.
 * Only replaces mentions that are NOT already inside an anchor tag.
 */
export function linkifyMentions(html: string): string {
  // Split by existing tags to avoid modifying content inside tags
  return html.replace(
    /(?<!<a[^>]*>.*?)@(\w{2,30})\b(?![^<]*<\/a>)/g,
    '<a href="/u/$1" class="text-terracotta font-medium hover:underline">@$1</a>'
  );
}
