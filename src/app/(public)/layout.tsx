import type { ReactNode } from "react";
import { EB_Garamond, Cabin } from "next/font/google";
import "@/styles/public-tokens.css";

/*
 * MÓDULO 26.1 — PUBLIC LAYOUT
 *
 * TIP-001: fuentes públicas aprobadas.
 * DS-003: separación visual público/admin.
 */
const displayFont = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-public-display",
  display: "swap",
});

const bodyFont = Cabin({
  subsets: ["latin"],
  variable: "--font-public-body",
  display: "swap",
});

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div
      data-bookify-ui="public"
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      {children}
    </div>
  );
}
