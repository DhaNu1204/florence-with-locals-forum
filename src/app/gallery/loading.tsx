export default function GalleryLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-8 w-48 rounded bg-light-stone" />
        <div className="mt-2 h-4 w-72 rounded bg-light-stone" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mt-6 flex animate-pulse gap-3">
        <div className="h-10 w-40 rounded-lg bg-light-stone" />
        <div className="h-10 w-32 rounded-lg bg-light-stone" />
      </div>

      {/* Photo grid skeleton (masonry-like) */}
      <div className="mt-6 columns-2 gap-4 sm:columns-3 lg:columns-4">
        {[180, 240, 160, 200, 280, 180, 220, 160, 240, 200, 160, 280].map(
          (h, i) => (
            <div
              key={i}
              className="mb-4 animate-pulse rounded-lg bg-light-stone"
              style={{ height: h }}
            />
          )
        )}
      </div>
    </div>
  );
}
