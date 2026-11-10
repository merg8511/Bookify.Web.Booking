import { describe, expect, it } from "vitest";

import {
  BOOKIFY_ROLES,
  canAccessAdministration,
  isBookifyRole,
} from "@/lib/auth/roles";

describe("Bookify roles — M25.5", () => {
  it.each(["Admin", "Owner", "Customer"])("reconoce el rol %s", (role) => {
    expect(isBookifyRole(role)).toBe(true);
  });

  it.each(["admin", "owner", "customer", "Support", ""])(
    "no acepta el rol no reconocido %s",
    (role) => {
      expect(isBookifyRole(role)).toBe(false);
    },
  );

  it("permite administración a Admin", () => {
    expect(canAccessAdministration([BOOKIFY_ROLES.Admin])).toBe(true);
  });

  it("permite administración a Owner", () => {
    expect(canAccessAdministration([BOOKIFY_ROLES.Owner])).toBe(true);
  });

  it("no permite administración a Customer", () => {
    expect(canAccessAdministration([BOOKIFY_ROLES.Customer])).toBe(false);
  });

  it("no concede permisos cuando no hay roles", () => {
    expect(canAccessAdministration([])).toBe(false);
  });

  it("admite múltiples roles sin inferir una jerarquía", () => {
    expect(
      canAccessAdministration([BOOKIFY_ROLES.Customer, BOOKIFY_ROLES.Owner]),
    ).toBe(true);
  });
});
