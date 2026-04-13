"use client";

import { ReactNode } from "react";
import { usePermissions } from "./PermissionProvider";

export default function CanAll({
  permissions: required,
  children,
}: {
  permissions: string[];
  children: ReactNode;
}) {
  const permissions = usePermissions();

  const ok = required.every((p) => permissions.includes(p));
  if (!ok) return null;

  return <>{children}</>;
}
