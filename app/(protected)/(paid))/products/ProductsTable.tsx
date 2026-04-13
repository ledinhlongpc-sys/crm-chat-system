"use client";


import TableCheckbox from "@/components/app/form/TableCheckbox";
import ProductRow from "./ProductRow";
import { textUI } from "@/ui-tokens";
import TableHead, { Column } from "@/components/app/table/TableHead";
/* ================= TYPES ================= */

export type Product = {
  id: string;
  name: string;
  created_at: string;
  thumbnail?: string | null;
  category_id?: string | null;
  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  total_stock: number;
  total_available: number;
  variants?: any[];
};

type Props = {
  products: Product[];
  categoryLabelMap: Record<string, string>;
  selectedIds: string[];
  onChangeSelected: (ids: string[]) => void;
  canViewCostPrice: boolean;
};

export default function ProductsTable({
  products,
  categoryLabelMap,
  selectedIds,
  onChangeSelected,
  canViewCostPrice,
}: Props) {
  function toggle(id: string) {
    onChangeSelected(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  }

  function toggleAll(checked: boolean) {
    onChangeSelected(checked ? products.map((p) => p.id) : []);
  }

  const allChecked =
    products.length > 0 &&
    products.every((p) => selectedIds.includes(p.id));

  const isIndeterminate =
    selectedIds.length > 0 &&
    selectedIds.length < products.length;



  const columns: Column[] = [
    {
      key: "check",
      width: "40px",
      align: "center",
      compact: true,
      header: (
        <TableCheckbox
          checked={allChecked}
          indeterminate={isIndeterminate}
          onChange={toggleAll}
        />
      ),
    },
    { key: "expand", width: "40px" },
    { key: "image", label: "Ảnh", width: "80px" },
    { key: "name", width: "300px", label: "Tên Sản Phẩm" },
    { key: "category", label: "Danh Mục", width: "160px" },
    { key: "brand", label: "Nhãn Hiệu", width: "120px" },
    { key: "available", label: "Có thể bán", align: "center", width: "100px" },
    { key: "stock", label: "Tồn kho", align: "center", width: "100px" },
    { key: "created", label: "Ngày tạo", align: "center", width: "100px" },
  ];

  return (
  <>
    {/* ===== HEADER ===== */}
   <TableHead columns={columns} />

    {/* ===== BODY ===== */}
    <tbody className={textUI.body}>
      {products.map((p) => (
        <ProductRow
          key={p.id}
          product={p}
          categoryLabelMap={categoryLabelMap}
          isChecked={selectedIds.includes(p.id)}
          onToggle={() => toggle(p.id)}
		  canViewCostPrice={canViewCostPrice}
        />
      ))}
    </tbody>
  </>
);

}
