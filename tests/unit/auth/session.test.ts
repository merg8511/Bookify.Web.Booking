import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * CAMBIO 25.7:
 * Mocks compartidos declarados antes de
 * importar el módulo que estamos probando.
 */
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),

  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import { requireAdminSession, requireSession } from "@/lib/auth/session";

function sessionWithRoles(roles: string[]) {
  return {
    user: {
      subject: "test-subject",
      roles,
    },
  };
}

describe("Server session guards — M25.5", () => {
  beforeEach(() => {
    mocks.auth.mockReset();
    mocks.redirect.mockClear();
  });

  it("redirige al login sin sesión", async () => {
    mocks.auth.mockResolvedValue(null);

    await expect(requireSession()).rejects.toThrow("REDIRECT:/login");
  });

  it("redirige al login si la sesión tiene un error", async () => {
    mocks.auth.mockResolvedValue({
      ...sessionWithRoles(["Owner"]),
      bookifyAuthError: "expired_api_token",
    });

    await expect(requireSession()).rejects.toThrow("REDIRECT:/login");
  });

  it("acepta una sesión Customer válida", async () => {
    const session = sessionWithRoles(["Customer"]);

    mocks.auth.mockResolvedValue(session);

    await expect(requireSession()).resolves.toEqual(session);
  });

  it("rechaza Customer en administración", async () => {
    mocks.auth.mockResolvedValue(sessionWithRoles(["Customer"]));

    await expect(requireAdminSession()).rejects.toThrow(
      "REDIRECT:/access-denied",
    );
  });

  it("rechaza un usuario autenticado sin roles", async () => {
    mocks.auth.mockResolvedValue(sessionWithRoles([]));

    await expect(requireAdminSession()).rejects.toThrow(
      "REDIRECT:/access-denied",
    );
  });

  it.each([["Admin"], ["Owner"], ["Customer", "Owner"]])(
    "autoriza roles administrativos: %j",
    async (...roles) => {
      mocks.auth.mockResolvedValue(sessionWithRoles(roles));

      const session = await requireAdminSession();

      expect(session.user.subject).toBe("test-subject");

      expect(mocks.redirect).not.toHaveBeenCalled();
    },
  );
});
