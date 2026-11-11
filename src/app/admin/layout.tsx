import type { ReactNode } from "react";

import { AdminVisualScope } from "@/components/layout/admin-visual-scope";
import { AdminShell } from "@/components/navigation/admin-shell";
import { requireAdminSession } from "@/lib/auth/session";

/*
 * BOOKIFY — ADMIN LAYOUT
 *
 * NAV-002: Sidebar + Topbar.
 * RESP-002: Adaptive Workspace.
 *
 * No se renderiza el workspace antes
 * de validar Admin / Owner.
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireAdminSession();

  return (
    <AdminVisualScope>
      <AdminShell>{children}</AdminShell>
    </AdminVisualScope>
  );
}
