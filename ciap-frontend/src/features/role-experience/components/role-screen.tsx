import { AppRole, getRoleLabel } from "@/features/role-experience/roles";

type CurrentRoleLabelProps = {
  role: AppRole;
};

export function CurrentRoleLabel({ role }: CurrentRoleLabelProps) {
  return <p>{`Role: ${getRoleLabel(role)}`}</p>;
}
