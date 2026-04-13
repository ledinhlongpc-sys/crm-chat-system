// app/(protected)/(paid)/customers/[customer_code]/boxes/PurchaseHistoryBox.tsx

"use client";

import { cardUI } from "@/ui-tokens";

import TableContainer from "@/components/app/table/TableContainer";
import type { HeaderColumn } from "@/components/app/table/TableHeaderRows";
import TableHeaderRows from "@/components/app/table/TableHeaderRows";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";

import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";

export default function PurchaseHistoryBox() {
  const hasData = false;

  const columns: HeaderColumn[] = [
  { key: "code", label: "Mã đơn hàng" },
  { key: "status", label: "Trạng thái" },
  {
    key: "payment",
    label: "Thanh toán",
    align: "center",
    width: "110px",
  },
  {
    key: "export",
    label: "Xuất kho",
    align: "center",
    width: "110px",
  },
  {
    key: "total",
    label: "Giá trị",
    align: "right",
    width: "140px",
  },
  { key: "branch", label: "Chi nhánh" },
  { key: "source", label: "Nguồn đơn" },
  { key: "staff", label: "Nhân viên xử lý đơn" },
  {
    key: "created_at",
    label: "Ngày ghi nhận",
    width: "140px",
  },
] ;

  return (
    <div className={cardUI.base}>
      {/* HEADER */}
      <div className={cardUI.header}>
        <h2 className={cardUI.title}>Lịch sử mua hàng</h2>
      </div>

      {/* TABLE */}
      <TableContainer>
        <TableHeaderRows columns={columns} />

        {!hasData ? (
          <tbody>
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  title="Chưa có đơn hàng"
                  description="Khách hàng này chưa phát sinh đơn mua hàng"
                />
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {/* rows sau này anh đổ data */}
          </tbody>
        )}
      </TableContainer>

      {/* PAGINATION */}
      <div className="px-4 py-3 border-t border-neutral-200">
        <PaginationControls
  page={1}
  limit={10}
  total={0}
/>
      </div>
    </div>
  );
}
