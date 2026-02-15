"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: AvatarSize;
  showOnline?: boolean;
  href?: string;
  className?: string;
}

const sizeMap: Record<AvatarSize, { px: number; text: string; dot: string }> = {
  xs: { px: 24, text: "text-[10px]", dot: "h-2 w-2" },
  sm: { px: 32, text: "text-xs", dot: "h-2.5 w-2.5" },
  md: { px: 40, text: "text-sm", dot: "h-3 w-3" },
  lg: { px: 64, text: "text-lg", dot: "h-3.5 w-3.5" },
  xl: { px: 96, text: "text-2xl", dot: "h-4 w-4" },
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  showOnline,
  href,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const { px, text, dot } = sizeMap[size];

  const showImage = src && !imgError;

  const content = (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-light-stone text-tuscan-brown font-medium overflow-hidden",
        text,
        className
      )}
      style={{ width: px, height: px }}
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          width={px}
          height={px}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
      {showOnline && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white bg-olive-green",
            dot
          )}
        />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
