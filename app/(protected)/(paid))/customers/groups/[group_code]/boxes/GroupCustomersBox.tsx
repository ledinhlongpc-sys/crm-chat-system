// app/(protected)/(paid)/customers/groups/[group_code]/boxes/GroupCustomersBox.tsx

// app/(protected)/(paid)/customers/groups/[group_code]/boxes/GroupCustomersBox.tsx

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

import { cardUI, badgeUI } from "@/ui-tokens";
import type { HeaderColumn } from "@/components/app/table/TableHeaderRows";
import TableContainer from "@/components/app/table/TableContainer";
import TableHeaderRows from "@/components/app/table/TableHeaderRows";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";

/* ================= TYPES ================= */

type Customer = {
  id: string;
  customer_code: string | null;
  name: string | null;
  phone: string | null;
  status: "active" | "inactive";
  created_at: string;
};

type CustomerGroup = {
  id: string;
  group_code: string;
  group_name: string;
  customer_count: number;
};

type Props = {
  customers: Customer[];
  group: CustomerGroup;
};

/* ================= CONFIG ================= */

const PAGE_SIZE = 10;

/* ================= COMPONENT ================= */

export default function GroupCustomersBox({
  customers,
  group,
}: Props) {
  const [page, setPage] = useState(1);

  const total = customers.length;
  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return customers.slice(
      start,
      start + PAGE_SIZE
    );
  }, [customers, page]);

  const hasData = pageData.length > 0;

  const columns: HeaderColumn[] = [
    {
      key: "customer_code",
      label: "Mã khách hàng",
      width: "160px",
    },
    { key: "name", label: "Tên khách hàng" },
    {
      key: "phone",
      label: "Số điện thoại",
      width: "140px",
    },
    {
      key: "status",
      label: "Trạng thái",
      align: "center",
      width: "160px",
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      width: "140px",
    },
  ];

  return (
    <div >
      {/* ================= HEADER ================= */}
      <div className={cardUI.header}>
        <h2 className={cardUI.title}>
          Khách hàng trong nhóm
          <span className="ml-2 text-sm font-normal text-neutral-500">
            ({group.customer_count})
          </span>
        </h2>
      </div>

      {/* ================= TABLE ================= */}
      <TableContainer>
        <TableHeaderRows columns={columns} />

        {!hasData ? (
          <tbody>
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  title="Chưa có khách hàng"
                  description="Nhóm khách hàng này chưa có khách hàng nào"
                />
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {pageData.map((c) => (
              <TableRow key={c.id}>
                {/* MÃ KH */}
                <TableCell>
                  {c.customer_code ? (
                    <Link
                      href={`/customers/${c.customer_code}`}
                      className="text-blue-600 hover:underline"
                    >
                      {c.customer_code}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>

                {/* TÊN KH */}
                <TableCell>
                  {c.name || "—"}
                </TableCell>

                {/* SĐT */}
                <TableCell>
                  {c.phone || "—"}
                </TableCell>

                {/* TRẠNG THÁI */}
               <TableCell align="center" >

                  <span
                    className={`${badgeUI.base} ${
                      c.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {c.status === "active"
                      ? "Đang hoạt động"
                      : "Ngưng hoạt động"}
                  </span>
                </TableCell>

                {/* NGÀY TẠO */}
                <TableCell>
                  {new Date(
                    c.created_at
                  ).toLocaleDateString("vi-VN")}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        )}
      </TableContainer>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-neutral-200">
          <PaginationControls
  page={page}
  limit={PAGE_SIZE}
  total={customers.length}
/>
        </div>
      )}
    </div>
  );
}
