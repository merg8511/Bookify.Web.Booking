export const BOOKIFY_ROLES = {
  Admin: "Admin",
  Owner: "Owner",
  Customer: "Customer",
} as const;

export type BookifyRole = (typeof BOOKIFY_ROLES)[keyof typeof BOOKIFY_ROLES];

export function isBookifyRole(value: unknown): value is BookifyRole {
  return (
    value === BOOKIFY_ROLES.Admin ||
    value === BOOKIFY_ROLES.Owner ||
    value === BOOKIFY_ROLES.Customer
  );
}

export function canAccessAdministration(
  roles: readonly BookifyRole[],
): boolean {
  return (
    roles.includes(BOOKIFY_ROLES.Admin) || roles.includes(BOOKIFY_ROLES.Owner)
  );
}
