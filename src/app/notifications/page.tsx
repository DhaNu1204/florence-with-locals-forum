"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/Button";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@/app/actions/notification-actions";
import { NotificationWithActor, NotificationGroup } from "@/types";

function groupNotifications(
  notifications: NotificationWithActor[]
): NotificationGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, NotificationWithActor[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  for (const n of notifications) {
    const date = new Date(n.created_at);
    if (date >= today) groups["Today"].push(n);
    else if (date >= yesterday) groups["Yesterday"].push(n);
    else if (date >= weekAgo) groups["This Week"].push(n);
    else groups["Earlier"].push(n);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, notifications: items }));
}

export default function NotificationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>(
    []
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (pageNum: number) => {
    const result = await getNotifications(pageNum);
    return result;
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/auth/login?redirectTo=/notifications");
      return;
    }

    fetchNotifications(1).then((result) => {
      if (result.notifications) {
        setNotifications(result.notifications);
        setHasMore(result.hasMore ?? false);
      }
      setLoading(false);
    });
  }, [user, isLoading, router, fetchNotifications]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const result = await fetchNotifications(nextPage);
    if (result.notifications) {
      setNotifications((prev) => [...prev, ...result.notifications!]);
      setHasMore(result.hasMore ?? false);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const groups = groupNotifications(notifications);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-dark-text sm:text-3xl">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-12 text-center">
          <BellOffIcon className="mx-auto mb-3 h-12 w-12 text-dark-text/20" />
          <p className="text-base text-dark-text/50">
            No notifications yet. You&apos;ll be notified when someone replies
            to your threads or mentions you.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-dark-text/40">
                {group.label}
              </h2>
              <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-light-stone">
                {group.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                isLoading={loadingMore}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BellOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.143 17.082a24.248 24.248 0 003.714 0m5.143-7.832V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 6.124l17.25 17.25"
      />
    </svg>
  );
}
