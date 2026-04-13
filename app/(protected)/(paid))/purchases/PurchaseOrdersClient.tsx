"use client";

import { useMemo, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import TableContainer from "@/components/app/table/TableContainer";
import TableActionBar from "@/components/app/table/TableActionBar";
import TableSearchInput from "@/components/app/table/TableSearchInput";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";
import FilterDropdown from "@/components/app/filter/FilterDropdown";
import PurchaseOrdersTable from "./PurchaseOrdersTable";

import { tableUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type PurchaseOrder = {
  id: string;
  order_code: string;
  status: string;
  payment_status: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
  branch?: { name: string } | null;
  supplier?: { supplier_name: string } | null;
  creator?: { full_name: string } | null;
};

type Props = {
  orders: PurchaseOrder[];
  page: number;
  limit: number;
  total: number;
  q: string;
  filters: {
    status: string | null;
    payment_status: string | null;
  };
};

/* ================= COMPONENT ================= */

export default function PurchaseOrdersClient({
  orders,
  page,
  limit,
  total,
  q,
  filters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(q);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /* ================= SEARCH ================= */

  function applySearch(v: string) {
    setKeyword(v);

    const params = new URLSearchParams(searchParams.toString());

    if (v.trim()) {
      params.set("q", v.trim());
    } else {
      params.delete("q");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  /* ================= FILTER ================= */

  function applyFilter(
    key: "status" | "payment_status",
    value: string | null
  ) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  /* ================= FILTER OPTIONS ================= */

  const statusOptions = useMemo(
    () => [
      { id: "draft", label: "Nháp" },
      { id: "completed", label: "Hoàn thành" },
      { id: "cancelled", label: "Đã hủy" },
    ],
    []
  );

  const paymentOptions = useMemo(
    () => [
      { id: "unpaid", label: "Chưa thanh toán" },
      { id: "partial", label: "Thanh toán một phần" },
      { id: "paid", label: "Đã thanh toán" },
    ],
    []
  );

  /* ================= EMPTY STATES ================= */

  if (total === 0 && !q) {
    return (
      <EmptyState
  title="Chưa có đơn nhập"
  description="Bắt đầu bằng cách tạo đơn nhập hàng đầu tiên"
  action={
    <a
      href="/purchases/create"
      className="inline-flex items-center px-4 h-9 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
    >
      Tạo đơn nhập
    </a>
  }
/>
    );
  }

  if (q && orders.length === 0) {
    return (
      <EmptyState
  title="Không tìm thấy đơn nhập"
  description={`Không có kết quả phù hợp với "${q}"`}
  action={
    <a
      href="/purchases"
      className="inline-flex items-center px-4 h-9 rounded-md bg-neutral-800 text-white text-sm hover:bg-neutral-900"
    >
      Xóa tìm kiếm
    </a>
  }
/>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div>
      {/* ===== ACTION BAR ===== */}
      <div className={tableUI.container}>
        <TableActionBar
          left={
            <TableSearchInput
              value={keyword}
              onChange={applySearch}
              placeholder="Tìm theo mã đơn, nhà cung cấp…"
            />
          }
          filters={
            <div className="flex items-center gap-2">
              <FilterDropdown
                placeholder="Trạng thái"
                options={statusOptions}
                value={filters.status ? [filters.status] : []}
                onChange={(ids) =>
                  applyFilter("status", ids[0] ?? null)
                }
                widthClassName="w-[180px]"
              />

              <FilterDropdown
                placeholder="Thanh toán"
                options={paymentOptions}
                value={
                  filters.payment_status
                    ? [filters.payment_status]
                    : []
                }
                onChange={(ids) =>
                  applyFilter(
                    "payment_status",
                    ids[0] ?? null
                  )
                }
                widthClassName="w-[200px]"
              />
            </div>
          }
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="mt-2">
        <TableContainer>
          <PurchaseOrdersTable
            orders={orders}
            selectedIds={selectedIds}
            onChangeSelected={setSelectedIds}
          />
        </TableContainer>
      </div>

      {/* ===== PAGINATION ===== */}
      <div className={`mt-4 ${tableUI.container}`}>
        <PaginationControls
          page={page}
          limit={limit}
          total={total}
        />
      </div>
    </div>
  );
}