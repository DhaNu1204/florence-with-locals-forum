import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "solid" | "outline";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  color?: string;
  icon?: ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = "solid",
  color,
  icon,
  className,
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors";

  if (color) {
    const style =
      variant === "solid"
        ? { backgroundColor: color, color: "#fff" }
        : {
            backgroundColor: "transparent",
            color: color,
            border: `1px solid ${color}`,
          };
    return (
      <span className={cn(baseStyles, className)} style={style}>
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        baseStyles,
        variant === "solid"
          ? "bg-tuscan-brown/10 text-tuscan-brown"
          : "border border-tuscan-brown/30 text-tuscan-brown",
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
