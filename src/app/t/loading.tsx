export default function ThreadLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumbs skeleton */}
      <div className="flex animate-pulse gap-2">
        <div className="h-4 w-16 rounded bg-light-stone" />
        <div className="h-4 w-4 rounded bg-light-stone" />
        <div className="h-4 w-24 rounded bg-light-stone" />
      </div>

      {/* Thread header skeleton */}
      <div className="mt-6 animate-pulse">
        <div className="h-8 w-3/4 rounded bg-light-stone" />
        <div className="mt-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-light-stone" />
          <div>
            <div className="h-4 w-24 rounded bg-light-stone" />
            <div className="mt-1 h-3 w-32 rounded bg-light-stone" />
          </div>
        </div>
      </div>

      {/* Thread content skeleton */}
      <div className="mt-6 animate-pulse rounded-lg border border-light-stone bg-white p-6">
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-light-stone" />
          <div className="h-4 w-full rounded bg-light-stone" />
          <div className="h-4 w-5/6 rounded bg-light-stone" />
          <div className="h-4 w-3/4 rounded bg-light-stone" />
        </div>
      </div>

      {/* Replies skeleton */}
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-light-stone bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-light-stone" />
              <div className="h-4 w-24 rounded bg-light-stone" />
              <div className="h-3 w-16 rounded bg-light-stone" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full rounded bg-light-stone" />
              <div className="h-4 w-2/3 rounded bg-light-stone" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
