import type { HTMLAttributes, ReactNode } from "react";
import styles from "./surface.module.css";

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Surface({ children, className = "", ...props }: SurfaceProps) {
  const classes = [styles.surface, className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
