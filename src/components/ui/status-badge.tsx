import type { HTMLAttributes, ReactNode } from "react";
import styles from "./status-badge.module.css";

type StatusTone = "neutral" | "success" | "warning" | "destructive";

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
  children: ReactNode;
};

export function StatusBadge({
  tone = "neutral",
  children,
  className = "",
  ...props
}: StatusBadgeProps) {
  const classes = [styles.badge, styles[tone], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
