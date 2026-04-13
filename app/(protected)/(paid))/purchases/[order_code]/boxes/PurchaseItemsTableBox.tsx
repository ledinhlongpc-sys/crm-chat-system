"use client";

import { Package } from "lucide-react";

import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";

import ProductThumb from "@/components/app/image/ProductThumb";

import { purchaseUI } from "@/ui-tokens";

import type { PurchaseItem } from "./PurchaseItemsBox";

/* ================= TYPES ================= */

type Props = {
  columns: any[];
  items: PurchaseItem[];
  fmt: (n: number) => string;
};

/* ================= MAIN TABLE (VIEW ONLY) ================= */

export default function PurchaseItemsTableBox({
  columns,
  items,
  fmt,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <TableContainer noBorder>
        <TableHead columns={columns} />

        {items.length > 0 && (
          <TableContainer.Body>
            {items.map((item, index) => {
              const baseTotal = (item.quantity || 0) * (item.price || 0);
              const discountAmount = item.discount_amount || 0;
              const lineTotal = item.line_total ?? 0;

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
                    <div className={purchaseUI.productCell.wrapper}>
                      <div className={purchaseUI.productCell.name}>
                        {item.product_name} - {item.variant_name}
                      </div>
                      <div className={purchaseUI.productCell.sku}>
                        {item.sku}
                      </div>
                    </div>
                  </TableCell>

                  {/* UNIT */}
                  <TableCell align="center" nowrap>
                    {item.unit_name}
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
                <TableCell align="right" nowrap>
  <div className="flex flex-col items-end leading-tight">
    <div className="text-neutral-900">
      - {fmt(discountAmount)}
    </div>

    <div className="text-xs text-red-500">
      {(() => {
        if (!item.price || item.price <= 0) return "0.00";
        return ((discountAmount / item.price) * 100).toFixed(2);
      })()}
      %
    </div>
  </div>
</TableCell>

                  {/* LINE TOTAL */}
                  <TableCell
                    align="right"
                    nowrap
                    className="font-semibold text-neutral-900"
                  >
                    {fmt(lineTotal)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableContainer.Body>
        )}
      </TableContainer>

      {/* EMPTY STATE */}
      {items.length === 0 && (
        <div className="border border-t-0 border-neutral-200 rounded-b-lg">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center">
                <Package className="text-neutral-400" />
              </div>

              <div className="mt-4 text-neutral-600">
                Đơn nhập chưa có sản phẩm.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}