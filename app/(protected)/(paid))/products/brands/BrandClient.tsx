
// app/(protected)/(paid)/products/brands/BrandClient.tsx

"use client";

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
import Link from "next/link";
import PrimaryButton from "@/components/app/button/PrimaryButton";

import BrandTable from "./BrandTable";
import BulkBrandActions from "./BulkBrandActions";

/* ================= TYPES ================= */

type Brand = {
  id: string;
  name: string;
  created_at: string;
  product_count: number;
};

type Props = {
  brands: Brand[];
  page: number;
  limit: number;
  total: number; // ✅ BẮT BUỘC
  q: string;
};

/* ================= COMPONENT ================= */

export default function BrandClient({
  brands,
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

    const params = new URLSearchParams(searchParams.toString());

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
  title="Chưa có nhãn hiệu"
  description="Tạo nhãn hiệu để quản lý và phân loại sản phẩm"
  action={
    <Link href="/products/brands/create">
      <PrimaryButton>Thêm nhãn hiệu</PrimaryButton>
    </Link>
  }
/>
    );
  }

  if (q && brands.length === 0) {
    return (
      <EmptyState
  title="Không tìm thấy nhãn hiệu"
  description={`Không có kết quả phù hợp với từ khóa "${q}"`}
  action={
    <Link href="/products/brands">
      <PrimaryButton>Xóa tìm kiếm</PrimaryButton>
    </Link>
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
          selectedCount={selectedIds.length}
          left={
            <TableSearchInput
  value={keyword}
  onChange={applySearch}
  placeholder="Tìm kiếm nhãn hiệu..."
/>
          }
          right={
            <BulkBrandActions
              selectedIds={selectedIds}
              onDone={() => setSelectedIds([])}
            />
          }
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="mt-2">
        <TableContainer>
          <BrandTable
            brands={brands}
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
