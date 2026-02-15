export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-8 w-64 rounded bg-light-stone" />
        <div className="mt-3 h-4 w-96 rounded bg-light-stone" />
      </div>

      {/* Category cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-light-stone bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-light-stone" />
              <div>
                <div className="h-5 w-32 rounded bg-light-stone" />
                <div className="mt-2 h-3 w-48 rounded bg-light-stone" />
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <div className="h-3 w-20 rounded bg-light-stone" />
              <div className="h-3 w-20 rounded bg-light-stone" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
