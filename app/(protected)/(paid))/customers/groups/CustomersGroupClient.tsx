//app/(protected)/(paid)/customers/group/CustomersGroupClient.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import TableContainer from "@/components/app/table/TableContainer";
import TableActionBar from "@/components/app/table/TableActionBar";
import EmptyState from "@/components/app/empty-state/EmptyState";
import { tableUI } from "@/ui-tokens";

import CustomersGroupTable from "./CustomersGroupTable";
import CustomersGroupHeaderActions from "./CustomersGroupHeaderActions";
import CreateCustomerGroupModal from "./CreateCustomerGroupModal";

/* ================= TYPES ================= */

export type CustomerGroup = {
  id: string;
  group_code: string;
  group_name: string;
  note?: string | null;
  customer_count: number;
  is_default?: boolean;
};

type Props = {
  groups: CustomerGroup[];
};

/* ================= COMPONENT ================= */

export default function CustomersGroupClient({
  groups,
}: Props) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);
  const [openCreate, setOpenCreate] =
    useState(false);

  /* ================= EMPTY ================= */

  if (!groups || groups.length === 0) {
    return (
      <>
        <EmptyState
  title="Chưa có nhóm khách hàng"
  description="Tạo nhóm để phân loại và quản lý khách hàng"
  action={
    <button
      onClick={() => setOpenCreate(true)}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
    >
      Thêm nhóm khách hàng
    </button>
  }
/>

        <CreateCustomerGroupModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={() => {
            setOpenCreate(false);
            router.refresh();
          }}
        />
      </>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div>
      {/* ================= ACTION BAR ================= */}
      <div className={tableUI.container}>
        <TableActionBar
         
          left={
            <CustomersGroupHeaderActions
              onCreate={() => setOpenCreate(true)}
            />
          }
         
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="mt-2">
        <TableContainer>
          <CustomersGroupTable
            groups={groups}
            selectedIds={selectedIds}
            onChangeSelected={setSelectedIds}
          />
        </TableContainer>
      </div>

      {/* ================= CREATE MODAL ================= */}
      <CreateCustomerGroupModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={() => {
          setOpenCreate(false);
          router.refresh();
        }}
      />
    </div>
  );
}
