"use client";

import { useState, useCallback } from "react";
import { PhotoWithUploader } from "@/types";
import { getGalleryPhotos } from "@/app/actions/photo-actions";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";

interface GalleryClientProps {
  initialPhotos: PhotoWithUploader[];
}

export function GalleryClient({ initialPhotos }: GalleryClientProps) {
  const [photos, setPhotos] = useState<PhotoWithUploader[]>(initialPhotos);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPhotos.length >= 24);
  const [loading, setLoading] = useState(false);
  const [locationTag, setLocationTag] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const loadMore = useCallback(async () => {
    setLoading(true);
    const nextPage = page + 1;
    const result = await getGalleryPhotos({ locationTag: locationTag || undefined, sort }, nextPage);
    if (result.photos) {
      setPhotos((prev) => [...prev, ...result.photos!]);
      setHasMore(result.hasMore ?? false);
      setPage(nextPage);
    }
    setLoading(false);
  }, [page, locationTag, sort]);

  const applyFilters = useCallback(async () => {
    setLoading(true);
    setPage(1);
    const result = await getGalleryPhotos({ locationTag: locationTag || undefined, sort }, 1);
    if (result.photos) {
      setPhotos(result.photos);
      setHasMore(result.hasMore ?? false);
    }
    setLoading(false);
  }, [locationTag, sort]);

  return (
    <>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={locationTag}
          onChange={(e) => setLocationTag(e.target.value)}
          placeholder="Filter by location..."
          className="w-full rounded-lg border border-light-stone bg-white px-3.5 py-2.5 text-base text-dark-text placeholder-dark-text/40 focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20 sm:w-auto"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
          className="rounded-lg border border-light-stone bg-white px-3.5 py-2.5 text-base text-dark-text focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        <button
          onClick={applyFilters}
          className="rounded-lg bg-terracotta px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-terracotta/90"
        >
          Apply
        </button>
      </div>

      <PhotoGrid
        photos={photos}
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
      />
    </>
  );
}
