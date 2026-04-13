//app/(protected)/(paid)/customers/groups/CustomersGroupTable.tsx

"use client";

import LinkButtonLoading from "@/components/app/button/LinkButtonLoading";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import { tableUI } from "@/ui-tokens";
import BulkCustomersGroupActions from "./BulkCustomersGroupActions";

/* ================= TYPES ================= */

export type CustomerGroup = {
  id: string;
  group_code: string | null;
  group_name: string;
  note?: string | null;
  customer_count?: number | null;
};

type Props = {
  groups: CustomerGroup[];
  selectedIds: string[];
  onChangeSelected: (ids: string[]) => void;
};

/* ================= COMPONENT ================= */

export default function CustomersGroupTable({
  groups,
  selectedIds,
  onChangeSelected,
}: Props) {
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

  /* ================= RENDER ================= */

  return (
    <>
      {/* 🔥 LOCK WIDTH */}
      <colgroup>
        <col style={{ width: 40 }} />
        <col style={{ width: 160 }} />
        <col style={{ width: 250 }} />
        <col style={{ width: 160 }} />
        <col />
      </colgroup>

      {/* ================= HEADER ================= */}

      {!isBulkMode ? (
        <thead>
          <tr className={tableUI.headerRow}>
            <th className={`${tableUI.headerCell} text-center`}>
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
              Tên nhóm khách hàng
            </th>

            <th className={`${tableUI.headerCell} text-center`}>
              SL khách hàng
            </th>

            <th className={tableUI.headerCell}>
              Mô tả
            </th>
          </tr>
        </thead>
      ) : (
        <thead>
          <tr className={tableUI.headerRow}>
            <th className={`${tableUI.headerCell} text-center`}>
              <div className="flex items-center justify-center">
                <TableCheckbox
                  checked={allChecked}
                  indeterminate={isIndeterminate}
                  onChange={toggleAll}
                />
              </div>
            </th>

            {/* colSpan = tổng số cột còn lại */}
            <th colSpan={4} className={tableUI.headerCell}>
              <div className="flex items-center gap-4">
                <span>
                  Đã chọn <b>{selectedIds.length}</b> nhóm khách hàng
                </span>

                <BulkCustomersGroupActions
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
        {groups.map((g) => (
          <TableRow key={g.id}>
            <TableCell align="center">
              <TableCheckbox
                checked={selectedIds.includes(g.id)}
                onChange={() => toggle(g.id)}
              />
            </TableCell>

            <TableCell>
              {g.group_code ? (
                <LinkButtonLoading
                  href={`/customers/groups/${g.group_code}`}
                >
                  {g.group_code}
                </LinkButtonLoading>
              ) : (
                "—"
              )}
            </TableCell>

            <TableCell>
              {g.group_name}
            </TableCell>

            <TableCell align="center">
              {g.customer_count ?? 0}
            </TableCell>

            <TableCell>
              {g.note || "—"}
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </>
  );
}
