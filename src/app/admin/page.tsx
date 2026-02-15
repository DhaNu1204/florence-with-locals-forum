import Link from "next/link";
import { getAdminStats, getRecentActivity, getStorageUsage } from "@/app/actions/admin-actions";
import { formatRelativeTime } from "@/lib/utils/formatDate";

export default async function AdminDashboardPage() {
  const [stats, activity, storage] = await Promise.all([
    getAdminStats(),
    getRecentActivity(),
    getStorageUsage(),
  ]);

  if (!stats) {
    return (
      <div className="rounded-lg bg-red-50 p-8 text-center">
        <p className="text-red-600">Failed to load admin stats.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-dark-text sm:text-3xl">
        Dashboard
      </h1>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={stats.totalMembers}
          change={stats.newMembers}
          icon="👥"
        />
        <StatCard
          label="Total Threads"
          value={stats.totalThreads}
          change={stats.newThreads}
          icon="💬"
        />
        <StatCard
          label="Total Posts"
          value={stats.totalPosts}
          change={stats.newPosts}
          icon="📝"
        />
        <StatCard
          label="Total Photos"
          value={stats.totalPhotos}
          change={stats.newPhotos}
          icon="📷"
        />
      </div>

      {/* Storage usage */}
      {storage && <StorageCard storage={storage} />}

      {/* Pending reports */}
      {stats.pendingReports > 0 && (
        <Link
          href="/admin/reports"
          className="mt-6 flex items-center justify-between rounded-lg border-2 border-red-200 bg-red-50 px-5 py-4 transition-colors hover:bg-red-100"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚩</span>
            <div>
              <p className="text-base font-semibold text-red-800">
                {stats.pendingReports} Pending Report{stats.pendingReports !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-red-600">
                Requires your attention
              </p>
            </div>
          </div>
          <span className="text-base font-medium text-red-700">View &rarr;</span>
        </Link>
      )}

      {/* Quick actions + Recent activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="rounded-lg border border-light-stone bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-dark-text">
            Quick Actions
          </h2>
          <div className="mt-4 space-y-2">
            <QuickAction href="/admin/categories" icon="📁">
              Manage Categories
            </QuickAction>
            <QuickAction href="/admin/reports" icon="🚩">
              View Reports
            </QuickAction>
            <QuickAction href="/admin/users" icon="👥">
              Manage Users
            </QuickAction>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-lg border border-light-stone bg-white p-5 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold text-dark-text">
            Recent Activity
          </h2>
          {activity.length > 0 ? (
            <div className="mt-4 space-y-3">
              {activity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 text-sm">
                    {item.type === "thread"
                      ? "💬"
                      : item.type === "user"
                        ? "👤"
                        : "🚩"}
                  </span>
                  <div className="min-w-0 flex-1">
                    {item.link ? (
                      <Link
                        href={item.link}
                        className="text-base text-dark-text/80 hover:text-terracotta"
                      >
                        {item.description}
                      </Link>
                    ) : (
                      <p className="text-base text-dark-text/80">
                        {item.description}
                      </p>
                    )}
                    <p className="text-sm text-dark-text/40">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-base text-dark-text/40">
              No recent activity.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: number;
  change: number;
  icon: string;
}) {
  return (
    <div className="rounded-lg border border-light-stone bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {change > 0 && (
          <span className="rounded-full bg-olive-green/10 px-2.5 py-0.5 text-sm font-medium text-olive-green">
            +{change} this week
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-dark-text">{value}</p>
      <p className="text-sm text-dark-text/50">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-dark-text/70 transition-colors hover:bg-light-stone hover:text-dark-text"
    >
      <span>{icon}</span>
      {children}
    </Link>
  );
}

function StorageCard({
  storage,
}: {
  storage: { totalSizeMB: number; photoCount: number; percentUsed: number };
}) {
  const barColor =
    storage.percentUsed > 80
      ? "bg-red-500"
      : storage.percentUsed > 50
        ? "bg-yellow-500"
        : "bg-olive-green";

  const textColor =
    storage.percentUsed > 80
      ? "text-red-700"
      : storage.percentUsed > 50
        ? "text-yellow-700"
        : "text-olive-green";

  return (
    <div className="mt-6 rounded-lg border border-light-stone bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💾</span>
          <h3 className="font-heading text-base font-semibold text-dark-text">
            Storage Usage
          </h3>
        </div>
        <span className={`text-sm font-medium ${textColor}`}>
          {storage.totalSizeMB} MB / 1,000 MB
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-light-stone">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(storage.percentUsed, 100)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-sm text-dark-text/50">
        <span>{storage.photoCount} photos stored</span>
        <span>{storage.percentUsed}% used</span>
      </div>

      {storage.percentUsed > 80 && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          Storage is running low. Consider upgrading to{" "}
          <a
            href="https://supabase.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            Supabase Pro
          </a>
          .
        </div>
      )}
    </div>
  );
}
