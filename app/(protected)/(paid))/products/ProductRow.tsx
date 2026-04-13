// app/(protected)/(paid)/products/components/ProductRow.tsx

"use client";
import { formatDateVN } from "@/lib/helpers/format";
import { formatNumber } from "@/lib/helpers/number";
import { useState, Fragment, useMemo } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import LinkButtonLoading from "@/components/app/button/LinkButtonLoading";
import ProductThumb from "@/components/app/image/ProductThumb";

import ProductVariantsExpand from "./ProductVariantsExpand";
import { textUI, tableUI, purchaseUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  product: any;
  categoryLabelMap: Record<string, string>;

  isChecked: boolean;
  onToggle: () => void;

  onPreview?: (src: string) => void;
  canViewCostPrice: boolean;
};

/* ================= COMPONENT ================= */

export default function ProductRow({
  product,
  categoryLabelMap,
  isChecked,
  onToggle,
  canViewCostPrice,
}: Props) {
  const [open, setOpen] = useState(false);

  /* ================= CHILD VARIANTS ================= */

  const childVariants = useMemo(
    () => product.variants ?? [],
    [product.variants]
  );

  const hasChildVariants = childVariants.length > 0;

  const isNegative = (product.total_available ?? 0) < 0;

  const categoryLabel = useMemo(() => {
    const categoryId = product.category?.id ?? product.category_id ?? null;
    if (!categoryId) return "—";
    return categoryLabelMap[categoryId] ?? product.category?.name ?? "—";
  }, [product, categoryLabelMap]);

  /* ================= RENDER ================= */

  return (
    <Fragment>
      {/* ================= ROW CHA ================= */}
      <TableRow
        className={`
          ${open ? tableUI.rowActive : ""}
          ${isChecked ? "bg-blue-50" : ""}
        `}
      >
        {/* ===== CHECKBOX ===== */}
        <TableCell align="center">
          <TableCheckbox checked={isChecked} onChange={onToggle} />
        </TableCell>

        {/* ===== EXPAND ===== */}
        <TableCell align="center">
          {hasChildVariants ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              className="p-1 rounded text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 transition"
            >
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : null}
        </TableCell>

        {/* ===== IMAGE (DÙNG CHUNG COMPONENT) ===== */}
        <TableCell align="center">
          <ProductThumb
            src={product.thumbnail}
            alt={product.name}
            size="lg"
          />
        </TableCell>

        {/* ===== NAME + SKU (DÙNG TOKEN CHUNG) ===== */}
        <TableCell>
          <div className={purchaseUI.productCell.wrapper}>
            <LinkButtonLoading
  href={`/products/${product.product_code}`}
  className="block max-w-[420px]"
  title={product.name}
>
  <span
    className={`
      ${textUI.bodyStrong}
      block
      truncate
    `}
  >
    {product.name}
  </span>
</LinkButtonLoading>

            {childVariants?.[0]?.sku && (
              <div className={purchaseUI.productCell.sku}>
                {childVariants[0].sku}
              </div>
            )}
          </div>
        </TableCell>

        {/* ===== CATEGORY ===== */}
        <TableCell>
          <span
            className={`${textUI.body} block max-w-[280px] truncate`}
            title={categoryLabel === "—" ? "" : categoryLabel}
          >
            {categoryLabel}
          </span>
        </TableCell>

        {/* ===== BRAND ===== */}
        <TableCell>
          <span className={textUI.body}>
            {product.brand?.name ?? "—"}
          </span>
        </TableCell>

        {/* ===== AVAILABLE ===== */}
        <TableCell align="center">
  <span
    className={`${textUI.body} font-medium ${
      isNegative ? "text-red-600" : "text-neutral-800"
    }`}
  >
    {formatNumber(product.total_available)}
  </span>
</TableCell>

        {/* ===== STOCK ===== */}
       <TableCell align="center">
  <span className={`${textUI.body} text-neutral-600`}>
    {formatNumber(product.total_stock)}
  </span>
</TableCell>

        {/* ===== CREATED ===== */}
        <TableCell align="center" className="text-neutral-500">
  <span className={textUI.body}>
    {formatDateVN(product.created_at)}
  </span>
</TableCell>
      </TableRow>

      {/* ================= VARIANT EXPAND ================= */}
      {open && hasChildVariants && (
        <tr className={tableUI.row}>
          <td colSpan={9} className="p-0">
            <div className="px-4 py-3">
              <ProductVariantsExpand
                productCode={product.product_code}
                variants={childVariants}
				 canViewCostPrice={canViewCostPrice}
              />
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}