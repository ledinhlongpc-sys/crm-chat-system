// app/(protected)/(paid)/products/tags/TagClient.tsx

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

import TagTable from "./TagTable";
import BulkTagActions from "./BulkTagActions";

/* ================= TYPES ================= */

type Tag = {
  id: string;
  name: string;
  created_at: string;
};

type Props = {
  tags: Tag[];
  page: number;
  limit: number;
  total: number;
  q: string;
};

/* ================= COMPONENT ================= */

export default function TagClient({
  tags,
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
  title="Chưa có thẻ sản phẩm"
  description="Tạo thẻ để phân loại và tìm kiếm sản phẩm dễ dàng hơn"
  action={
    <a
      href="/products/tags/create"
      className="inline-flex items-center px-4 h-9 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
    >
      Thêm thẻ
    </a>
  }
/>
    );
  }

  if (q && tags.length === 0) {
    return (
      <EmptyState
  title="Không tìm thấy thẻ"
  description={`Không có kết quả phù hợp với từ khóa "${q}"`}
  action={
    <a
      href="/products/tags"
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
      {/* ===== ACTION BAR (SEARCH + BULK) ===== */}
      <div className={tableUI.container}>
        <TableActionBar
          selectedCount={selectedIds.length}
          left={
            <TableSearchInput
  value={keyword}
  onChange={applySearch}
  placeholder="Tìm kiếm thẻ..."
/>
          }
          right={
            <BulkTagActions
              selectedIds={selectedIds}
              onDone={() => setSelectedIds([])}
            />
          }
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="mt-2">
        <TableContainer>
          <TagTable
            tags={tags}
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
