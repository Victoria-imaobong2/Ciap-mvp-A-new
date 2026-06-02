export const appRoles = ["guest", "sme", "creator"] as const;

export type AppRole = (typeof appRoles)[number];
const roleLabels: Record<AppRole, string> = {
  guest: "guest",
  sme: "sme",
  creator: "creator",
};

export function isAppRole(value: string): value is AppRole {
  return appRoles.includes(value as AppRole);
}

export function getRoleFromSearchParams(searchParams: {
  role?: string | string[];
}): AppRole {
  const roleValue = Array.isArray(searchParams.role)
    ? searchParams.role[0]
    : searchParams.role;

  if (!roleValue) {
    return "guest";
  }

  const normalizedRole = roleValue.trim().toLowerCase();
  return isAppRole(normalizedRole) ? normalizedRole : "guest";
}

export function getRoleLabel(role: AppRole): string {
  return roleLabels[role];
}
