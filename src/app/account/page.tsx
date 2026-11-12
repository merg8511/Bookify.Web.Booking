import { AccountOverview } from "./account-overview";

import { signOutOfBookify } from "@/lib/auth/actions";
import { requireSession } from "@/lib/auth/session";

/*
 * BOOKIFY — ACCOUNT PAGE 04.3
 *
 * Conserva la validación real de sesión.
 *
 * No introduce nuevos permisos,
 * claims ni mecanismos de autenticación.
 */
export default async function AccountPage() {
  const session = await requireSession();

  return (
    <AccountOverview
      subject={session.user.subject}
      roles={session.user.roles}
      signOutAction={signOutOfBookify}
    />
  );
}
