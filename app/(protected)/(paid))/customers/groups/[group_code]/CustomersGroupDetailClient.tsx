// app/(protected)/(paid)/customers/groups/[group_code]/CustomersGroupDetailClient.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import GroupInfoBox from "./boxes/GroupInfoBox";
import GroupCustomersBox from "./boxes/GroupCustomersBox";

/* ================= TYPES ================= */

export type CustomerGroup = {
  id: string;
  group_code: string;
  group_name: string;
  note?: string | null;
  is_default?: boolean;
  customer_count: number;
};

export type Customer = {
  id: string;
  customer_code: string | null;
  name: string | null;
  phone: string | null;
  status: "active" | "inactive";
  created_at: string;
};

type Props = {
  group: CustomerGroup;
  customers: Customer[];
};

/* ================= COMPONENT ================= */

export default function CustomersGroupDetailClient({
  group,
  customers,
}: Props) {
  const router = useRouter();

  const [groupData, setGroupData] =
    useState<CustomerGroup>(group);

  /* ================= AFTER SAVE ================= */

  function handleSaved(updated: CustomerGroup) {
    setGroupData(updated);
    router.refresh();
  }

  /* ================= RENDER ================= */

  return (
    <div className="mt-4 space-y-4">
      {/* ===== GROUP INFO ===== */}
      <GroupInfoBox
        group={groupData}
        onSaved={handleSaved}
      />

      {/* ===== GROUP CUSTOMERS ===== */}
      <GroupCustomersBox
        customers={customers}
        group={groupData}
      />
    </div>
  );
}
