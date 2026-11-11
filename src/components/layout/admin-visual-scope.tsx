import type { ReactNode } from "react";
import { Inter } from "next/font/google";

import "@/styles/admin-tokens.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin-body",
  display: "swap",
});

type AdminVisualScopeProps = {
  children: ReactNode;
};

/*
 * Identidad visual administrativa.
 *
 * No realiza autenticación.
 * No modifica sesiones ni permisos.
 */
export function AdminVisualScope({ children }: AdminVisualScopeProps) {
  return (
    <div data-bookify-ui="admin" className={inter.variable}>
      {children}
    </div>
  );
}
