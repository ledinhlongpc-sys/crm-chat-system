"use client";

import { useMemo, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import { UserType } from "@/types/user";
import TableContainer from "@/components/app/table/TableContainer";
import TableActionBar from "@/components/app/table/TableActionBar";
import TableSearchInput from "@/components/app/table/TableSearchInput";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";
import ConfirmModal from "@/components/app/modal/ConfirmModal";
import FilterDropdown from "@/components/app/filter/FilterDropdown";
import ProductsTable from "./ProductsTable";
import { canViewCost } from "@/lib/permissions";

import {
  flattenCategoryTree,
} from "@/components/app/category/category.flatten";
import {
  buildCategoryTree,
} from "@/components/app/category/category.tree";

import { tableUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Product = {
  id: string;
  product_code: string;
  name: string;
  created_at: string;
  category?: any;
  brand?: any;
  thumbnail?: string | null;
  total_stock: number;
  total_available: number;
  sale_price: number | null;
  cost_price: number | null;
  variants: any[];
};

type Category = {
  id: string;
  name: string;
  parent_id?: string | null;
  sort_order?: number | null;
};

type Brand = {
  id: string;
  name: string;
};



type Props = {
  products: Product[];
  categories: Category[];
  brands: Brand[];


  page: number;
  limit: number;
  total: number;
  q: string;
  userType: UserType;

  filters: {
    category_id: string | null;
    brand_id: string | null;
	tag_id: string | null;
  };
};

/* ================= COMPONENT ================= */

export default function ProductsClient({
  products,
  categories,
  brands,
  page,
  limit,
  total,
  q,
  userType, 
  filters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(q);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
const [printing, setPrinting] = useState(false);
const canViewCostPrice = canViewCost(userType);

  /* ================= SEARCH ================= */

  function applySearch(v: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (v.trim()) params.set("q", v.trim());
    else params.delete("q");

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  /* ================= FILTER ================= */

  function applyFilter(
    key: "category_id" | "brand_id" | "tag_id",
    ids: string[]
  ) {
    const params = new URLSearchParams(searchParams.toString());

    if (ids.length > 0) params.set(key, ids.join(","));
    else params.delete(key);

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilter() {
    router.push(pathname);
  }

async function handleDeleteSelected() {
  if (selectedIds.length === 0) return;

  try {
    const res = await fetch("/api/products/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: selectedIds }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Xóa sản phẩm thất bại");
    }

    setSelectedIds([]);
    setOpenDeleteConfirm(false);
    router.refresh();
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Xóa sản phẩm thất bại");
  }
}

async function handlePrintBarcodes() {
  if (selectedIds.length === 0) return;

  try {
    setPrinting(true);

    const params = new URLSearchParams();
    params.set("ids", selectedIds.join(","));

    window.open(`/products/print-barcodes?${params.toString()}`, "_blank");
  } finally {
    setPrinting(false);
  }
}

  /* ================= VALUES ================= */

 const categoryIds = useMemo(
  () =>
    filters.category_id
      ? filters.category_id.split(",").filter(Boolean)
      : [],
  [filters.category_id]
);

const brandIds = useMemo(
  () =>
    filters.brand_id
      ? filters.brand_id.split(",").filter(Boolean)
      : [],
  [filters.brand_id]
);
 
  /* ================= OPTIONS ================= */

  const categoryOptions = useMemo(() => {
    const fixed = categories.map((c) => ({
      ...c,
      parent_id: c.parent_id ?? null,
    }));

    const tree = buildCategoryTree(fixed);
    return flattenCategoryTree(tree);
  }, [categories]);

  const categoryLabelMap = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        categoryOptions.map((c) => [c.id, c.label])
      ),
    [categoryOptions]
  );

  const brandOptions = useMemo(
    () =>
      brands.map((b) => ({
        id: b.id,
        label: b.name,
      })),
    [brands]
  );

const tagIds = useMemo(
  () =>
    filters.tag_id
      ? filters.tag_id.split(",").filter(Boolean)
      : [],
  [filters.tag_id]
);

  /* ================= RENDER ================= */

  return (
    <div>
      {/* ===== ACTION BAR ===== */}
      <TableActionBar
       left={
  <div className="flex items-center gap-2 flex-1 mr-2">
    <div className="flex-1">
      <TableSearchInput
        value={keyword}
        onChange={setKeyword}
        onEnter={() => applySearch(keyword)}
        placeholder="Tìm theo tên sản phẩm, SKU, mã vạch…"
      />
    </div>

    {selectedIds.length > 0 && (
      <>
        <SecondaryButton onClick={handlePrintBarcodes} disabled={printing}>
          {printing
            ? "Đang mở..."
            : `In mã vạch (${selectedIds.length})`}
        </SecondaryButton>

        <PrimaryButton onClick={() => setOpenDeleteConfirm(true)}>
          Xóa ({selectedIds.length})
        </PrimaryButton>
      </>
    )}
  </div>
}
        right={
          <div className="flex items-center gap-2">
            {/* CATEGORY */}
            <FilterDropdown
              placeholder="Danh mục"
              options={categoryOptions}
              value={categoryIds}
              onChange={(ids) =>
                applyFilter("category_id", ids)
              }
              widthClassName="w-[170px]"
              dropdownWidthClassName="w-[360px]"
            />

            {/* BRAND */}
            <FilterDropdown
              placeholder="Nhãn hiệu"
              options={brandOptions}
              value={brandIds}
              onChange={(ids) =>
                applyFilter("brand_id", ids)
              }
              widthClassName="w-[170px]"
              dropdownWidthClassName="w-[360px]"
            />
			
			
			<FilterDropdown
  placeholder="Tag"
  options={categoryOptions} // reuse luôn category
  value={tagIds}
  onChange={(ids) => applyFilter("tag_id", ids)}
  widthClassName="w-[170px]"
  dropdownWidthClassName="w-[360px]"
/>
          

            {/* CLEAR */}
            {(categoryIds.length > 0 ||
  brandIds.length > 0 ||
  tagIds.length > 0 ||
  q.trim()) && (
  <SecondaryButton onClick={clearFilter}>
    Xóa lọc
  </SecondaryButton>
)}
          </div>
        }
      />

      {/* ===== TABLE / EMPTY ===== */}
      <div className="mt-2">
        {products.length === 0 ? (
          q ? (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              description={`Không có kết quả phù hợp với "${q}"`}
              action={
                <PrimaryButton onClick={clearFilter}>
                  Xóa tìm kiếm
                </PrimaryButton>
              }
            />
          ) : (
            <EmptyState
              title="Chưa có sản phẩm"
              description="Bắt đầu bằng cách tạo sản phẩm đầu tiên"
              action={
                <Link href="/products/create">
                  <PrimaryButton>
                    Thêm sản phẩm
                  </PrimaryButton>
                </Link>
              }
            />
          )
        ) : (
          <TableContainer>
            <ProductsTable
              products={products}
              categoryLabelMap={categoryLabelMap}
              selectedIds={selectedIds}
              onChangeSelected={setSelectedIds}
			  canViewCostPrice={canViewCostPrice}
            />
          </TableContainer>
        )}
      </div>

      {/* ===== PAGINATION ===== */}
      <div className={`mt-4 ${tableUI.container}`}>
        <PaginationControls
          page={page}
          limit={limit}
          total={total}
        />
      </div>
	  <ConfirmModal
  open={openDeleteConfirm}
  onClose={() => setOpenDeleteConfirm(false)}
  danger
  description={`Xóa ${selectedIds.length} sản phẩm đã chọn?`}
  confirmText="Xóa"
  confirmingText="Đang xóa..."
  onConfirm={handleDeleteSelected}
/>
    </div>
  );
}