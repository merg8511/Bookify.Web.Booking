import type { HTMLAttributes, ReactNode } from "react";

import styles from "./content-container.module.css";

type ContentContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

// Contenedor de presentación, independiente
// de las funcionalidades del sistema.
export function ContentContainer({
  children,
  className = "",
  ...props
}: ContentContainerProps) {
  const classes = [styles.container, className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
