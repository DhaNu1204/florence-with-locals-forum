"use client";

import { useState } from "react";
import { PhotoWithUploader } from "@/types";
import { Lightbox } from "./Lightbox";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface PhotoGridProps {
  photos: PhotoWithUploader[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export function PhotoGrid({
  photos,
  onLoadMore,
  hasMore,
  loading,
}: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-light-stone/50 py-16">
        <PhotoIcon className="mb-3 h-12 w-12 text-dark-text/20" />
        <p className="text-base text-dark-text/50">No photos yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="group mb-4 cursor-pointer break-inside-avoid"
            onClick={() => setLightboxIndex(index)}
          >
            <div className="relative overflow-hidden rounded-lg">
              <ImageWithFallback
                src={photo.thumbnail_url || photo.url}
                alt={photo.caption || "Photo"}
                className="w-full transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                {photo.caption && (
                  <p className="text-sm font-medium text-white">
                    {photo.caption}
                  </p>
                )}
                <p className="text-sm text-white/70">
                  @{photo.uploader.username}
                  {photo.location_tag && ` \u2022 ${photo.location_tag}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="secondary"
            onClick={onLoadMore}
            isLoading={loading}
          >
            Load More Photos
          </Button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
    </svg>
  );
}
