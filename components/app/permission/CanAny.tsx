"use client";

import { ReactNode } from "react";
import { usePermissions } from "./PermissionProvider";

export default function CanAny({
  permissions: required,
  children,
}: {
  permissions: string[];
  children: ReactNode;
}) {
  const permissions = usePermissions();

  const ok = required.some((p) => permissions.includes(p));
  if (!ok) return null;

  return <>{children}</>;
}
