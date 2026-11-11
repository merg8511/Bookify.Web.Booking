import type { ReactNode } from "react";
import { EB_Garamond, Cabin } from "next/font/google";

import { PublicHeader } from "@/components/navigation/public-header";

import "@/styles/public-tokens.css";

/*
 * BOOKIFY — PUBLIC LAYOUT
 *
 * TIP-001: EB Garamond + Cabin.
 * NAV-001: Editorial Header NAV-P1.
 * RESP-001: Editorial Continuity.
 *
 * El layout conserva la identidad pública
 * sin introducir lógica de reservas.
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
      <PublicHeader />

      {children}
    </div>
  );
}
