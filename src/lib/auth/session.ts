import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canAccessAdministration } from "./roles";

export async function requireSession() {
  const session = await auth();

  if (!session?.user?.subject || session.bookifyAuthError) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();

  if (!canAccessAdministration(session.user.roles)) {
    redirect("/access-denied");
  }

  return session;
}
