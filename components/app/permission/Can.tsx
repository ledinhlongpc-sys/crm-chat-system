"use client";

import { ReactNode } from "react";
import { usePermissions } from "./PermissionProvider";

export default function Can({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const permissions = usePermissions();

  if (!permissions.includes(permission)) {
    return null;
  }

  return <>{children}</>;
}
