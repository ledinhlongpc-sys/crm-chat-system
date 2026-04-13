"use client";

import { useState } from "react";
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
import { tableUI } from "@/ui-tokens";
import SuppliersTable from "./SuppliersTable";


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

type Group = {
  id: string;
  group_name: string;
};

type Props = {
  suppliers: Supplier[];
  groups: Group[];
  page: number;
  limit: number;
  total: number;
  q: string;
};

/* ================= COMPONENT ================= */

export default function SuppliersClient({
  suppliers,
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
  title="Chưa có nhà cung cấp"
  description="Bắt đầu bằng cách tạo nhà cung cấp đầu tiên"
  action={
    <Link
      href="/suppliers/create"
      className="text-blue-600 font-medium"
    >
      Thêm nhà cung cấp
    </Link>
  }
/>
    );
  }

  if (q && suppliers.length === 0) {
    return (
      <EmptyState
  title="Không tìm thấy nhà cung cấp"
  description={`Không có kết quả phù hợp với từ khóa "${q}"`}
  action={
    <Link
      href="/suppliers"
      className="text-blue-600 font-medium"
    >
      Xóa tìm kiếm
    </Link>
  }
/>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div>
	   {/* ===== ACTION BAR (SEARCH + BULK) ===== */}
	  <div className={tableUI.container}> 
      <TableActionBar
       
        left={
          <TableSearchInput
  value={keyword}
  onChange={applySearch}
/>
        }
       
      />
	 </div>
	 
      {/* ===== TABLE ===== */}
	  <div className={`mt-2`}>
      <TableContainer>
        <SuppliersTable
          suppliers={suppliers}
 
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
