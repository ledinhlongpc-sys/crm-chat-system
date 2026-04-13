//app/(protected)/(paid)/suppliers/SuppliersTable.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import TableActions from "@/components/app/table/TableActions";
import LinkButtonLoading from "@/components/app/button/LinkButtonLoading";
import StatusBadge from "@/components/app/status/StatusBadge";
import ConfirmModal from "@/components/app/modal/ConfirmModal";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import BulkSupplierActions from "./BulkSupplierActions";
import { tableUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Supplier = {
  id: string;
  supplier_code: string;
  supplier_name: string;
  phone?: string | null;
  email?: string | null;
  current_debt: number;
  status: "active" | "inactive";
  supplier_group?: {
    id: string;
    group_name: string;
  } | null;
};

type Props = {
  suppliers: Supplier[];
  selectedIds: string[];
  onChangeSelected: (ids: string[]) => void;
};

/* ================= HELPERS ================= */

function formatMoney(v: number) {
  return v.toLocaleString("vi-VN");
}

/* ================= COMPONENT ================= */

export default function SuppliersTable({
  suppliers,
  selectedIds,
  onChangeSelected,
}: Props) {
  const router = useRouter();

  /* ===== DELETE CONFIRM ===== */

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ===== CHECKBOX ===== */

  function toggle(id: string) {
    onChangeSelected(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  }

  function toggleAll(checked: boolean) {
    onChangeSelected(
      checked ? suppliers.map((s) => s.id) : []
    );
  }

  const allChecked =
    suppliers.length > 0 &&
    suppliers.every((s) => selectedIds.includes(s.id));

  const isIndeterminate =
    selectedIds.length > 0 &&
    selectedIds.length < suppliers.length;

  const isBulkMode = selectedIds.length > 0;

  /* ===== DELETE CONFIRMED ===== */

  async function confirmDelete() {
    if (!deleteId || deleting) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `/api/suppliers/${deleteId}/delete`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      toast.success("Đã xóa nhà cung cấp");
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  }

  /* ================= RENDER ================= */

  return (
    <>
      {/* 🔥 LOCK WIDTH TO PREVENT SHIFT */}
      <colgroup>
        <col style={{ width: 40 }} />
        <col style={{ width: 140 }} />
        <col />
        <col style={{ width: 160 }} />
        <col style={{ width: 200 }} />
        <col style={{ width: 140 }} />
        <col style={{ width: 140 }} />
        <col style={{ width: 160 }} />
        <col style={{ width: 120 }} />
      </colgroup>

      {/* ================= HEADER ================= */}

      {/* ================= HEADER ================= */}

<thead>
  <tr className={tableUI.headerRow}>
    {/* ===== CHECKBOX ===== */}
    <th className={`${tableUI.headerCell} text-center`}>
      <div className="flex items-center justify-center">
        <TableCheckbox
          checked={allChecked}
          indeterminate={isIndeterminate}
          onChange={toggleAll}
        />
      </div>
    </th>

    {!isBulkMode ? (
      <>
        <th className={tableUI.headerCell}>Mã NCC</th>
        <th className={tableUI.headerCell}>Tên nhà cung cấp</th>
        <th className={tableUI.headerCell}>Nhóm</th>
        <th className={tableUI.headerCell}>Email</th>
        <th className={tableUI.headerCell}>Số điện thoại</th>

        <th className={`${tableUI.headerCell} text-right`}>
          Công nợ
        </th>

        <th className={`${tableUI.headerCell} text-center`}>
          Trạng thái
        </th>

        <th className={`${tableUI.headerCell} text-right`}>
          Thao tác
        </th>
      </>
    ) : (
      <th colSpan={8} className={tableUI.headerCell}>
        <div className="flex items-center justify-between">
          <span>
            Đã chọn <b>{selectedIds.length}</b> nhà cung cấp
          </span>

          <BulkSupplierActions
            selectedIds={selectedIds}
            onDone={() => onChangeSelected([])}
          />
        </div>
      </th>
    )}
  </tr>
</thead>


      {/* ================= BODY ================= */}

      <tbody>
        {suppliers.map((s) => {
          const isChecked = selectedIds.includes(s.id);

          return (
            <TableRow key={s.id}>
              <TableCell align="center">
                <TableCheckbox
                  checked={isChecked}
                  onChange={() => toggle(s.id)}
                />
              </TableCell>

              <TableCell>
                <LinkButtonLoading href={`/suppliers/${s.id}`}>
                  {s.supplier_code}
                </LinkButtonLoading>
              </TableCell>

              <TableCell>{s.supplier_name}</TableCell>

              <TableCell>
                {s.supplier_group?.group_name || (
                  <span className="italic text-neutral-400">
                    Chưa phân nhóm
                  </span>
                )}
              </TableCell>

              <TableCell>{s.email || "-"}</TableCell>

              <TableCell>{s.phone || "-"}</TableCell>

              <TableCell align="right">
                {s.current_debt > 0 ? (
                  <span className="text-red-600">
                    {formatMoney(s.current_debt)}
                  </span>
                ) : (
                  "0"
                )}
              </TableCell>

              <TableCell align="center">
                <StatusBadge status={s.status} />
              </TableCell>

              {/* ẨN THAO TÁC KHI BULK MODE */}
              {!isBulkMode && (
                <TableCell align="right">
                  <TableActions
                    onEdit={() =>
                      router.push(`/suppliers/${s.id}/edit`)
                    }
                    onDelete={() => setDeleteId(s.id)}
                  />
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </tbody>

      {/* ================= CONFIRM DELETE ================= */}

      <ConfirmModal
        open={!!deleteId}
        title="Xóa nhà cung cấp"
        description="Anh chắc chắn muốn xóa nhà cung cấp này?"
        confirmText="Xóa"
        danger
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleting) setDeleteId(null);
        }}
      />
    </>
  );
}
