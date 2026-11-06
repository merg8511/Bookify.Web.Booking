"use server";

import { signIn, signOut } from "@/auth";

export async function signInWithBookify() {
  await signIn("bookify-oidc", {
    redirectTo: "account",
  });
}

export async function signOutOfBookify() {
  await signOut({
    redirectTo: "/",
  });
}
