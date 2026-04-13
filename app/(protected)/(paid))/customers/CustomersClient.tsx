// app/(protected)/(paid)/customers/CustomersClient.tsx

"use client";
import Link from "next/link";
import PrimaryButton from "@/components/app/button/PrimaryButton";

import { useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import TableContainer from "@/components/app/table/TableContainer";
import TableActionBar from "@/components/app/table/TableActionBar";
import TableSearchInput from "@/components/app/table/TableSearchInput";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";
import { tableUI } from "@/ui-tokens";

import CustomersTable from "./CustomersTable";


/* ================= TYPES ================= */

export type Customer = {
  id: string;
  customer_code: string | null;
  name: string | null;
  phone: string | null;
  status: "active" | "inactive"; // ✅ THÊM
  created_at: string;

  /** JOIN từ system_customer_groups */
  system_customer_groups: {
  id: string
  group_name: string
}[]
};

export type CustomerGroup = {
  id: string;
  group_name: string;
};

type Props = {
  customers: Customer[];
  groups: CustomerGroup[]; // ✅ FIX: truyền từ page.tsx xuống
  page: number;
  limit: number;
  total: number;
  q: string;

  /* preload address data – CHƯA dùng ở list */
  provincesV1?: any[];
  districtsV1?: any[];
  wardsV1?: any[];

  provincesV2?: any[];
  communesV2?: any[];
};

/* ================= COMPONENT ================= */

export default function CustomersClient({
  customers,
  groups,
  page,
  limit,
  total,
  q,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(q);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /* ================= SEARCH ================= */

  function applySearch(v: string) {
    setKeyword(v);

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (v.trim()) {
      params.set("q", v.trim());
      params.set("page", "1");
    } else {
      params.delete("q");
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  /* ================= EMPTY STATES ================= */

  if (total === 0 && !q) {
    return (
      <EmptyState
  title="Chưa có khách hàng"
  description="Tạo khách hàng để quản lý đơn hàng và lịch sử mua bán"
  action={
    <Link href="/customers/create">
      <PrimaryButton>
        Thêm khách hàng
      </PrimaryButton>
    </Link>
  }
/>
    );
  }

  if (q && customers.length === 0) {
    return (
      <EmptyState
  title="Không tìm thấy khách hàng"
  description={`Không có kết quả phù hợp với từ khóa "${q}"`}
  action={
    <Link href="/customers">
      <PrimaryButton>
        Xóa tìm kiếm
      </PrimaryButton>
    </Link>
  }
/>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div>
      {/* ================= ACTION BAR ================= */}
      <div className={tableUI.container}>
        <TableActionBar
          left={
            <TableSearchInput
              value={keyword}
              onChange={applySearch}
              placeholder="Tìm theo tên hoặc số điện thoại"
            />
          }
          
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="mt-2">
        <TableContainer>
          <CustomersTable
            customers={customers}
            selectedIds={selectedIds}
            onChangeSelected={setSelectedIds}
          />
        </TableContainer>
      </div>

      {/* ================= PAGINATION ================= */}
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
