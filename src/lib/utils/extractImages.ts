/**
 * Extract image URLs from HTML content and map them to Supabase Storage paths.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

/** Extract all <img src="..."> URLs from HTML content */
export function extractImageUrls(htmlContent: string): string[] {
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  const urls: string[] = [];
  let match;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    urls[urls.length] = match[1];
  }
  return urls;
}

/**
 * Extract the storage path from a Supabase Storage public URL.
 * e.g. https://xxx.supabase.co/storage/v1/object/public/photos/2026/02/user-id/image.jpg
 *    → photos/2026/02/user-id/image.jpg
 *
 * Returns null if the URL doesn't belong to our Supabase project.
 */
export function extractStoragePath(url: string): string | null {
  if (!supabaseUrl || !url.includes(supabaseUrl)) return null;
  const match = url.match(/\/storage\/v1\/object\/public\/photos\/(.+)/);
  return match ? `photos/${match[1]}` : null;
}

/**
 * Filter image URLs to only those hosted on our Supabase Storage.
 * Returns objects with the public URL and extracted storage path.
 */
export function extractSupabaseImages(
  htmlContent: string
): { url: string; storagePath: string }[] {
  const allUrls = extractImageUrls(htmlContent);
  const results: { url: string; storagePath: string }[] = [];

  for (const url of allUrls) {
    const storagePath = extractStoragePath(url);
    if (storagePath) {
      results.push({ url, storagePath });
    }
  }

  return results;
}
