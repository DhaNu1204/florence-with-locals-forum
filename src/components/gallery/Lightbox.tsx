"use client";

import { useState, useEffect, useCallback } from "react";
import { PhotoWithUploader } from "@/types";

interface LightboxProps {
  photos: PhotoWithUploader[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const photo = photos[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < photos.length - 1 ? i + 1 : i));
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 sm:right-4 sm:top-4"
        aria-label="Close lightbox"
      >
        <CloseIcon className="h-6 w-6" />
      </button>

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-2 z-10 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 sm:left-4"
          aria-label="Previous photo"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div className="flex max-h-[85vh] max-w-[90vw] flex-col items-center">
        <img
          src={photo.url}
          alt={photo.caption || "Photo"}
          className="max-h-[80vh] max-w-full rounded object-contain"
        />

        {/* Caption & author info */}
        <div className="mt-3 text-center">
          {photo.caption && (
            <p className="text-base text-white/90">{photo.caption}</p>
          )}
          <p className="mt-1 text-sm text-white/50">
            By @{photo.uploader.username}
            {photo.location_tag && ` \u2022 ${photo.location_tag}`}
          </p>
          <p className="mt-0.5 text-sm text-white/30">
            {currentIndex + 1} / {photos.length}
          </p>
        </div>
      </div>

      {/* Next button */}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={goNext}
          className="absolute right-2 z-10 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 sm:right-4"
          aria-label="Next photo"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
