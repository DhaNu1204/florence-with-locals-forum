import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://forum.florencewithlocals.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const [categoriesRes, threadsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("slug, created_at")
      .eq("is_active", true),
    supabase
      .from("threads")
      .select("slug, updated_at")
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false })
      .limit(5000),
  ]);

  const categories = categoriesRes.data ?? [];
  const threads = threadsRes.data ?? [];

  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date("2026-01-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date("2026-01-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  for (const cat of categories) {
    entries.push({
      url: `${SITE_URL}/c/${cat.slug}`,
      lastModified: new Date(cat.created_at),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const thread of threads) {
    entries.push({
      url: `${SITE_URL}/t/${thread.slug}`,
      lastModified: new Date(thread.updated_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
