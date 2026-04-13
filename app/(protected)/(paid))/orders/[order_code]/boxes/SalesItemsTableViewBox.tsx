"use client";

import { Package } from "lucide-react";

import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";

import ProductThumb from "@/components/app/image/ProductThumb";
import { textUI } from "@/ui-tokens";

import type { SalesItem } from "./SalesItemsViewBox";

/* ================= TYPES ================= */

type CalcItem = SalesItem & {
  base_quantity: number;
  discountAmount: number;
  lineTotal: number;
};

type Props = {
  columns: any[];
  items: CalcItem[];
  fmt: (n: number) => string;
};

/* ================= COMPONENT ================= */

export default function SalesItemsTableViewBox({
  columns,
  items,
  fmt,
}: Props) {
  const calcUnitDiscount = (item: CalcItem) => {
    const price = Number(item.price || 0);

    if (item.discount_type === "amount") {
      return Math.min(item.discount_value || 0, price);
    }

    return Math.min((price * (item.discount_value || 0)) / 100, price);
  };

  return (
    <div className="overflow-x-auto">
      <TableContainer noBorder>
        <TableHead columns={columns} />

        {items.length > 0 && (
          <TableContainer.Body>
            {items.map((item, index) => {
              const unitDiscount = calcUnitDiscount(item);
              const percent =
                item.price > 0
                  ? ((unitDiscount / item.price) * 100).toFixed(2)
                  : "0.00";

              return (
                <TableRow key={item.key}>
                  {/* STT */}
                  <TableCell align="center" nowrap>
                    {index + 1}
                  </TableCell>

                  {/* IMAGE */}
                  <TableCell align="center" nowrap>
                    <ProductThumb
                      src={item.image}
                      alt={item.product_name}
                      size="lg"
                    />
                  </TableCell>

                  {/* PRODUCT */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className={textUI.cardTitle}>
  {item.product_name}
</div>

                      <div className="text-xs text-neutral-500">
                        {item.sku}
                      </div>
                    </div>
                  </TableCell>

                  {/* UNIT */}
                  <TableCell align="center" nowrap>
                    {item.uom}
                  </TableCell>

                  {/* QTY */}
                  <TableCell align="center" nowrap>
                    {fmt(item.quantity)}
                  </TableCell>

                  {/* PRICE */}
                  <TableCell align="right" nowrap>
                    {fmt(item.price)}
                  </TableCell>

                  {/* DISCOUNT */}
                  <TableCell align="right">
                    <div>
                      <div>{fmt(unitDiscount)}</div>
                      <div className="text-xs text-red-500">
                        {percent}%
                      </div>
                    </div>
                  </TableCell>

                  {/* TOTAL */}
                  <TableCell
                    align="right"
                    nowrap
                    className="font-semibold text-neutral-900"
                  >
                    {fmt(item.lineTotal)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableContainer.Body>
        )}
      </TableContainer>

      {/* EMPTY */}
      {items.length === 0 && (
        <div className="border border-t-0 border-neutral-200 rounded-b-lg">
          <div className="flex items-center justify-center min-h-[360px]">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center">
                <Package className="text-neutral-400" />
              </div>

              <div className="mt-4 text-neutral-600">
                Đơn bán này không có sản phẩm
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}