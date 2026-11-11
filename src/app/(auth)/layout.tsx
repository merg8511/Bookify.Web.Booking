import type { ReactNode } from "react";

import { AdminVisualScope } from "@/components/layout/admin-visual-scope";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AdminVisualScope>{children}</AdminVisualScope>;
}
