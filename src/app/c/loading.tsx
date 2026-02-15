export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Category header skeleton */}
      <div className="animate-pulse">
        <div className="h-7 w-48 rounded bg-light-stone" />
        <div className="mt-2 h-4 w-80 rounded bg-light-stone" />
      </div>

      {/* Thread list skeleton */}
      <div className="mt-6 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-light-stone bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-light-stone" />
              <div className="flex-1">
                <div className="h-5 w-3/4 rounded bg-light-stone" />
                <div className="mt-2 h-3 w-full rounded bg-light-stone" />
                <div className="mt-1 h-3 w-2/3 rounded bg-light-stone" />
                <div className="mt-3 flex gap-4">
                  <div className="h-3 w-16 rounded bg-light-stone" />
                  <div className="h-3 w-20 rounded bg-light-stone" />
                  <div className="h-3 w-16 rounded bg-light-stone" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
