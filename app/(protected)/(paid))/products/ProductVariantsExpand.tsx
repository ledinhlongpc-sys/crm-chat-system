"use client";

import { Column } from "@/components/app/table/TableHead";
import TableHead from "@/components/app/table/TableHead";
import TableRowVariant from "@/components/app/table/variant/TableRowVariant";
import TableCellVariant from "@/components/app/table/variant/TableCellVariant";
import LinkButtonLoading from "@/components/app/button/LinkButtonLoading";
import EmptyState from "@/components/app/table/EmptyState";
import ProductThumb from "@/components/app/image/ProductThumb";

import { formatNumber } from "@/lib/helpers/number";
import { formatCurrency } from "@/lib/helpers/format";
import { textUI, tableUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Variant = {
id: string;
type?: "variant" | "unit";
name: string;
sku?: string | null;
image?: string | null;

stock_qty?: number | null;
outgoing_qty?: number | null;
available_qty?: number | null;

sale_price?: number | null;
wholesale_price?: number | null;
cost_price?: number | null;
};

type Props = {
productCode: string;
variants: Variant[];
canViewCostPrice: boolean;
};

/* ================= UTILS ================= */

const num = (v: number | null | undefined) =>
Number.isFinite(v as number) ? (v as number) : 0;

/* ================= COMPONENT ================= */

export default function ProductVariantsExpand({
productCode,
variants,
canViewCostPrice,
}: Props) {
/* ===== EMPTY ===== */
if (!variants || variants.length === 0) {
return ( <div className="pl-14 py-3"> <EmptyState colSpan={6} label="Chưa có phiên bản" /> </div>
);
}

/* ===== COLUMNS (FIX CHUẨN TS) ===== */
const baseColumns: Column[] = [
{ key: "variant", label: "Phiên bản" },
{ key: "stock", label: "Tồn kho", align: "center" },
{ key: "outgoing", label: "Đang giao dịch", align: "center" },
{ key: "available", label: "Có thể bán", align: "center" },
{ key: "price", label: "Giá bán lẻ", align: "right" },
{ key: "wholesale", label: "Giá bán sỉ", align: "right" },
];

const columns: Column[] = canViewCostPrice
? [
...baseColumns,
{ key: "cost", label: "Giá nhập", align: "right" },
]
: baseColumns;

/* ===== RENDER ===== */

return ( <div className="pl-14 py-3">
<div className={`w-full max-w-[1280px] ${tableUI.container}`}> <table className="w-full border-collapse">
{/* ===== HEADER ===== */} <TableHead columns={columns} />


      {/* ===== BODY ===== */}
      <tbody>
        {variants.map((v) => {
          const isUnit = v.type === "unit";

          const stock = num(v.stock_qty);
          const outgoing = num(v.outgoing_qty);

          const available =
            v.available_qty != null
              ? num(v.available_qty)
              : stock - outgoing;

          const retailPrice = v.sale_price;
          const wholesalePrice = v.wholesale_price;
          const costPrice = v.cost_price;

          return (
            <TableRowVariant
              key={v.id}
              className={isUnit ? "bg-neutral-50" : ""}
            >
              {/* ===== VARIANT INFO ===== */}
              <TableCellVariant>
                <div
                  className={`flex items-center gap-3 ${
                    isUnit ? "pl-6" : ""
                  }`}
                >
                  <ProductThumb
                    src={v.image}
                    alt={v.name}
                    size="md"
                  />

                  <div className="flex flex-col gap-0.5">
                    <LinkButtonLoading
                      href={`/products/${productCode}`}
                      className="block max-w-[260px]"
                      title={v.name}
                    >
                      <span
                        className={`
                          ${textUI.bodyStrong}
                          block
                          truncate
                          ${isUnit ? "text-neutral-600" : ""}
                        `}
                      >
                        {v.name}
                      </span>
                    </LinkButtonLoading>

                    {v.sku && (
                      <div className={textUI.caption}>
                        {v.sku}
                      </div>
                    )}
                  </div>
                </div>
              </TableCellVariant>

              {/* ===== STOCK ===== */}
              <TableCellVariant align="center">
                {formatNumber(stock)}
              </TableCellVariant>

              {/* ===== OUTGOING ===== */}
              <TableCellVariant align="center">
                {formatNumber(outgoing)}
              </TableCellVariant>

              {/* ===== AVAILABLE ===== */}
              <TableCellVariant align="center">
                <span
                  className={`${textUI.body} ${
                    available < 0 ? "text-red-600" : ""
                  }`}
                >
                  {formatNumber(available)}
                </span>
              </TableCellVariant>

              {/* ===== RETAIL ===== */}
              <TableCellVariant align="right">
                {retailPrice != null
                  ? formatCurrency(retailPrice)
                  : "—"}
              </TableCellVariant>

              {/* ===== WHOLESALE ===== */}
              <TableCellVariant align="right">
                {wholesalePrice != null
                  ? formatCurrency(wholesalePrice)
                  : "—"}
              </TableCellVariant>

              {/* ===== COST ===== */}
              {canViewCostPrice && (
                <TableCellVariant align="right">
                  {costPrice != null
                    ? formatCurrency(costPrice)
                    : "—"}
                </TableCellVariant>
              )}
            </TableRowVariant>
          );
        })}
      </tbody>
    </table>
  </div>
</div>

);
}
