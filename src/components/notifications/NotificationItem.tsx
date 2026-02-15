"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationWithActor } from "@/types";
import { formatRelativeTime } from "@/lib/utils/formatDate";

interface NotificationItemProps {
  notification: NotificationWithActor;
  onMarkRead: (id: string) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onMarkRead,
  compact,
}: NotificationItemProps) {
  const href = getNotificationHref(notification);

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 transition-colors hover:bg-light-stone ${
        compact ? "py-3" : "py-4"
      } ${
        !notification.is_read
          ? "border-l-2 border-terracotta bg-terracotta/[0.03]"
          : "border-l-2 border-transparent"
      }`}
    >
      {/* Icon or actor avatar */}
      <div className="shrink-0 pt-0.5">
        {notification.actor ? (
          <Avatar
            src={notification.actor.avatar_url}
            name={notification.actor.username}
            size="sm"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-light-stone">
            <NotificationIcon type={notification.type} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-dark-text/80 ${
            compact ? "text-sm" : "text-base"
          } ${!notification.is_read ? "font-medium" : ""}`}
        >
          {notification.actor && (
            <span className="font-semibold text-dark-text">
              @{notification.actor.username}
            </span>
          )}{" "}
          {notification.message || notification.title}
        </p>
        <p className={`mt-0.5 text-dark-text/40 ${compact ? "text-xs" : "text-sm"}`}>
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-terracotta" />
      )}
    </Link>
  );
}

function getNotificationHref(notification: NotificationWithActor): string {
  if (notification.reference_type === "thread" && notification.reference_id) {
    return `/t/${notification.reference_id}`;
  }
  if (notification.reference_type === "post" && notification.reference_id) {
    return `/t/${notification.reference_id}`;
  }
  if (notification.reference_type === "profile" && notification.reference_id) {
    return `/u/${notification.reference_id}`;
  }
  return "/notifications";
}

function NotificationIcon({ type }: { type: string }) {
  const className = "h-4 w-4 text-dark-text/40";

  switch (type) {
    case "reply":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
      );
    case "like":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    case "mention":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      );
  }
}
