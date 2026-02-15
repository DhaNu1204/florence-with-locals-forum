export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile header skeleton */}
      <div className="animate-pulse rounded-lg border border-light-stone bg-white p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="h-24 w-24 rounded-full bg-light-stone" />
          <div className="flex-1 text-center sm:text-left">
            <div className="mx-auto h-7 w-40 rounded bg-light-stone sm:mx-0" />
            <div className="mx-auto mt-2 h-4 w-20 rounded bg-light-stone sm:mx-0" />
            <div className="mx-auto mt-3 h-4 w-64 rounded bg-light-stone sm:mx-0" />
            <div className="mt-4 flex justify-center gap-6 sm:justify-start">
              <div className="h-4 w-16 rounded bg-light-stone" />
              <div className="h-4 w-16 rounded bg-light-stone" />
              <div className="h-4 w-16 rounded bg-light-stone" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-light-stone bg-white p-4 text-center"
          >
            <div className="mx-auto h-6 w-8 rounded bg-light-stone" />
            <div className="mx-auto mt-2 h-3 w-16 rounded bg-light-stone" />
          </div>
        ))}
      </div>

      {/* Recent activity skeleton */}
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-light-stone bg-white p-4"
          >
            <div className="h-5 w-3/4 rounded bg-light-stone" />
            <div className="mt-2 h-3 w-1/2 rounded bg-light-stone" />
          </div>
        ))}
      </div>
    </div>
  );
}
