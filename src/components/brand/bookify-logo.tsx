/*
 * BOOKIFY — HORIZON L2.3
 *
 * LOGO-001 ... LOGO-006
 *
 * Los SVG son maestros externos aprobados.
 * No reconstruir el wordmark con texto o fuentes.
 *
 * Los SVG locales se sirven sin transformación
 * raster; se preserva su geometría intrínseca.
 */

/* eslint-disable @next/next/no-img-element -- Se utilizan los SVG vectoriales maestros sin transformación. */

import Link from "next/link";

import styles from "./bookify-logo.module.css";

type BookifyLogoContext = "public" | "admin";

type BookifyLogoProps = {
  context: BookifyLogoContext;
  inverted?: boolean;
  href?: string;
  className?: string;
};

const logoAssets = {
  public: {
    normal: "/brand/horizon-public.svg",
    inverted: "/brand/horizon-public-inverse.svg",
  },
  admin: {
    normal: "/brand/horizon-admin.svg",
    inverted: "/brand/horizon-admin-inverse.svg",
  },
} as const;

export function BookifyLogo({
  context,
  inverted = false,
  href,
  className = "",
}: BookifyLogoProps) {
  const source = logoAssets[context][inverted ? "inverted" : "normal"];

  const classes = [styles.logo, className].filter(Boolean).join(" ");

  const mark = (
    <img src={source} alt="Bookify" className={styles.image} decoding="async" />
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {mark}
      </Link>
    );
  }

  return <span className={classes}>{mark}</span>;
}
