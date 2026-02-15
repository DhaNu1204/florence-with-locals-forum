import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PhotoWithUploader } from "@/types";
import { GalleryClient } from "./GalleryClient";

export const metadata: Metadata = {
  title: "Photo Gallery - Florence With Locals Forum",
  description:
    "Browse beautiful photos of Florence shared by our community of locals and visitors.",
};

export default async function GalleryPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("photos")
    .select(
      `
      *,
      uploader:profiles!photos_uploader_id_fkey(id, username, avatar_url)
    `
    )
    .order("created_at", { ascending: false })
    .range(0, 23);

  const initialPhotos = (data || []) as unknown as PhotoWithUploader[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-dark-text">
          Photo Gallery
        </h1>
        <p className="mt-2 text-base text-dark-text/60">
          Beautiful moments from Florence, shared by our community.
        </p>
      </div>

      <GalleryClient initialPhotos={initialPhotos} />
    </div>
  );
}
