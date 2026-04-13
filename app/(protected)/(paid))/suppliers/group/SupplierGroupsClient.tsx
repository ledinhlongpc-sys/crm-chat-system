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
import PrimaryButton from "@/components/app/button/PrimaryButton";
import { tableUI } from "@/ui-tokens";

import SupplierGroupsTable from "./SupplierGroupsTable";

/* ================= TYPES ================= */

type SupplierGroup = {
  id: string;
  group_code: string;
  group_name: string;
  note?: string | null;
  is_default: boolean;
  is_active: boolean;
  supplier_count: number;
};

type Props = {
  groups: SupplierGroup[];
  page: number;
  limit: number;
  total: number;
  q: string;
};

/* ================= COMPONENT ================= */

export default function SupplierGroupsClient({
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
    } else {
      params.delete("q");
    }

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  }

  /* ================= EMPTY STATES ================= */

  if (total === 0 && !q) {
    return (
      <EmptyState
        title="Chưa có nhóm nhà cung cấp"
        description="Tạo nhóm để phân loại nhà cung cấp dễ quản lý hơn"
        action={
          <Link href="/suppliers/group/create">
            <PrimaryButton>
              Thêm nhóm nhà cung cấp
            </PrimaryButton>
          </Link>
        }
      />
    );
  }

  if (q && groups.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy nhóm nhà cung cấp"
        description={`Không có kết quả phù hợp với từ khóa "${q}"`}
        action={
          <Link href="/suppliers/group">
            <PrimaryButton variant="outline">
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
      {/* ===== ACTION BAR ===== */}
      <div className={tableUI.container}>
        <TableActionBar
          left={
            <TableSearchInput
              value={keyword}
              onChange={applySearch}
              placeholder="Tìm mã nhóm, tên nhóm..."
            />
          }
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="mt-2">
        <TableContainer>
          <SupplierGroupsTable
            groups={groups}
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