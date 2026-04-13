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
import { tableUI } from "@/ui-tokens";
import BulkSupplierGroupActions from "./BulkSupplierGroupActions";

/* ================= TYPES ================= */

type SupplierGroup = {
  id: string;
  group_code: string;
  group_name: string;
  supplier_count: number;
  is_active: boolean;
};

type Props = {
  groups: SupplierGroup[];
  selectedIds: string[];
  onChangeSelected: (ids: string[]) => void;
};

/* ================= COMPONENT ================= */

export default function SuppliersGroupTable({
  groups,
  selectedIds,
  onChangeSelected,
}: Props) {
  const router = useRouter();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ================= CHECKBOX ================= */

  function toggle(id: string) {
    onChangeSelected(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  }

  function toggleAll(checked: boolean) {
    onChangeSelected(
      checked ? groups.map((g) => g.id) : []
    );
  }

  const allChecked =
    groups.length > 0 &&
    groups.every((g) => selectedIds.includes(g.id));

  const isIndeterminate =
    selectedIds.length > 0 &&
    selectedIds.length < groups.length;

  const isBulkMode = selectedIds.length > 0;

  /* ================= DELETE ================= */

  async function confirmDelete() {
    if (!deleteId || deleting) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `/api/suppliers/group/${deleteId}/delete`,
        { method: "DELETE" }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Xóa nhóm nhà cung cấp thất bại"
        );
      }

      toast.success("Đã xóa nhóm nhà cung cấp");
      setDeleteId(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  /* ================= RENDER ================= */

  return (
    <>
      {/* ================= HEADER ================= */}

      {!isBulkMode ? (
        <thead>
          <tr className={tableUI.headerRow}>
            <th
              className={`${tableUI.headerCell} text-center`}
              style={{ width: 40 }}
            >
              <div className="flex items-center justify-center">
                <TableCheckbox
                  checked={allChecked}
                  indeterminate={isIndeterminate}
                  onChange={toggleAll}
                />
              </div>
            </th>

            <th className={tableUI.headerCell}>
              Mã nhóm
            </th>

            <th className={tableUI.headerCell}>
              Tên nhóm
            </th>

            <th
              className={`${tableUI.headerCell} text-right`}
            >
              Số nhà cung cấp
            </th>

            <th
              className={`${tableUI.headerCell} text-center`}
            >
              Trạng thái
            </th>

            <th
              className={`${tableUI.headerCell} text-right`}
            >
              Thao tác
            </th>
          </tr>
        </thead>
      ) : (
        <thead>
          <tr className={tableUI.headerRow}>
            <th
              className={`${tableUI.headerCell} text-center`}
              style={{ width: 40 }}
            >
              <div className="flex items-center justify-center">
                <TableCheckbox
                  checked={allChecked}
                  indeterminate={isIndeterminate}
                  onChange={toggleAll}
                />
              </div>
            </th>

           <th colSpan={5} className={tableUI.headerCell}>
  <div className="flex items-center gap-4">
    <span>
      Đã chọn <b>{selectedIds.length}</b> nhóm
    </span>

    <BulkSupplierGroupActions
      selectedIds={selectedIds}
      onDone={() => onChangeSelected([])}
    />
  </div>
</th>

          </tr>
        </thead>
      )}

      {/* ================= BODY ================= */}

      <tbody>
        {groups.map((g) => {
          const isChecked = selectedIds.includes(g.id);

          return (
            <TableRow key={g.id}>
              <TableCell align="center">
                <TableCheckbox
                  checked={isChecked}
                  onChange={() => toggle(g.id)}
                />
              </TableCell>

              <TableCell>
                <LinkButtonLoading
                  href={`/suppliers/group/${g.id}`}
                >
                  {g.group_code}
                </LinkButtonLoading>
              </TableCell>

              <TableCell>
                {g.group_name}
              </TableCell>

              <TableCell align="right">
                {g.supplier_count}
              </TableCell>

              <TableCell align="center">
                <StatusBadge
                  status={
                    g.is_active
                      ? "active"
                      : "inactive"
                  }
                />
              </TableCell>

              <TableCell align="right">
                <TableActions
                  onEdit={() =>
                    router.push(
                      `/suppliers/group/${g.id}/edit`
                    )
                  }
                  onDelete={() =>
                    setDeleteId(g.id)
                  }
                />
              </TableCell>
            </TableRow>
          );
        })}
      </tbody>

      {/* ================= CONFIRM DELETE ================= */}

      <ConfirmModal
        open={!!deleteId}
        title="Xóa nhóm nhà cung cấp"
        description="Anh chắc chắn muốn xóa nhóm nhà cung cấp này?"
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
