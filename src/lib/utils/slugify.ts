export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, "-")
      // Remove all non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, "")
      // Collapse multiple hyphens
      .replace(/-+/g, "-")
      // Trim leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
}

export function slugifyWithSuffix(text: string): string {
  const base = slugify(text).slice(0, 200);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}
