// app/(protected)/(paid)/customers/CustomersTable.tsx

"use client";

import StatusBadge from "@/components/app/status/StatusBadge";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import LinkButtonLoading from "@/components/app/button/LinkButtonLoading";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import { tableUI } from "@/ui-tokens";
import BulkCustomersActions from "./BulkCustomersActions";

/* ================= TYPES ================= */

export type Customer = {
  id: string;
  customer_code: string | null;
  name: string | null;
  phone: string | null;
  status: "active" | "inactive";
  created_at: string;

 system_customer_groups: {
  id: string
  group_name: string
}[]
};

type Props = {
  customers: Customer[];
  selectedIds: string[];
  onChangeSelected: (ids: string[]) => void;
};

/* ================= COMPONENT ================= */

export default function CustomersTable({
  customers,
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
      checked ? customers.map((c) => c.id) : []
    );
  }

  const allChecked =
    customers.length > 0 &&
    customers.every((c) => selectedIds.includes(c.id));

  const isIndeterminate =
    selectedIds.length > 0 &&
    selectedIds.length < customers.length;

  const isBulkMode = selectedIds.length > 0;

  /* ================= RENDER ================= */

  return (
    <>
      {/* 🔥 COLGROUP LOCK WIDTH (QUAN TRỌNG) */}
      <colgroup>
        <col style={{ width: 40 }} />
        <col style={{ width: 160 }} />
        <col />
        <col />
        <col />
        <col style={{ width: 140 }} />
        <col style={{ width: 140 }} />
        <col style={{ width: 140 }} />
        <col style={{ width: 160 }} />
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
        <th className={tableUI.headerCell}>Mã khách hàng</th>
        <th className={tableUI.headerCell}>Tên khách hàng</th>
        <th className={tableUI.headerCell}>Số điện thoại</th>
        <th className={tableUI.headerCell}>Nhóm khách hàng</th>

        <th className={`${tableUI.headerCell} text-right`}>
          Công nợ hiện tại
        </th>

        <th className={`${tableUI.headerCell} text-right`}>
          Tổng chi tiêu
        </th>

        <th className={`${tableUI.headerCell} text-right`}>
          Tổng SL đơn hàng
        </th>

        <th className={`${tableUI.headerCell} text-center`}>
          Trạng thái
        </th>
      </>
    ) : (
      <th colSpan={8} className={tableUI.headerCell}>
        <div className="flex items-center justify-between">
          <span>
            Đã chọn <b>{selectedIds.length}</b> khách hàng
          </span>

          <BulkCustomersActions
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
        {customers.map((c) => {
          const code = c.customer_code;
          const isChecked = selectedIds.includes(c.id);

          return (
            <TableRow key={c.id}>
              <TableCell align="center">
                <TableCheckbox
                  checked={isChecked}
                  onChange={() => toggle(c.id)}
                />
              </TableCell>

              <TableCell>
                {code ? (
                  <LinkButtonLoading href={`/customers/${code}`}>
                    {code}
                  </LinkButtonLoading>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell>{c.name || "—"}</TableCell>
              <TableCell>{c.phone || "—"}</TableCell>
              <TableCell>
                {c.system_customer_groups?.[0]?.group_name || "—"}
              </TableCell>

              <TableCell align="right">0</TableCell>
              <TableCell align="right">0</TableCell>
              <TableCell align="right">0</TableCell>

              <TableCell align="center">
                <StatusBadge status={c.status} />
              </TableCell>
            </TableRow>
          );
        })}
      </tbody>
    </>
  );
}
