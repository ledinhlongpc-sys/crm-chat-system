"use client";

import { useState, useRef, useEffect } from "react";
import { X, Package } from "lucide-react";

import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";

import SecondaryButton from "@/components/app/button/SecondaryButton";
import NumberInput from "@/components/app/form/NumberInput";
import MoneyInput from "@/components/app/form/MoneyInput";
import ProductThumb from "@/components/app/image/ProductThumb";

import { textUI } from "@/ui-tokens";

import type { SalesItem } from "./EditSalesItemsBox";

/* ================= TYPES ================= */

type CalcItem = SalesItem & {
  base_quantity: number;
  discountAmount: number;
  lineTotal: number;
};

type Props = {
  columns: any[];
  items: CalcItem[];
  onUpdateItem: (key: string, patch: Partial<SalesItem>) => void;
  onRemoveItem: (key: string) => void;
  fmt: (n: number) => string;
  onAddProduct?: () => void;
};

function clamp0(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

/* ================= DISCOUNT DISPLAY ================= */

function DiscountDisplay({
  item,
  onChange,
}: {
  item: CalcItem;
  onChange: (patch: Partial<SalesItem>) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const price = Number(item.price || 0);
  const MAX_PERCENT = 100;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [open]);

  /* ===== CLAMP LOGIC ===== */

  const clampValue = (raw: number) => {
    const v = clamp0(raw);

    if (item.discount_type === "percent") {
      return Math.min(v, MAX_PERCENT);
    }

    return Math.min(v, price);
  };

  const unitDiscount =
    item.discount_type === "amount"
      ? Math.min(item.discount_value || 0, price)
      : Math.min(
          (price * (item.discount_value || 0)) / 100,
          price
        );

  const percent =
    price > 0 ? ((unitDiscount / price) * 100).toFixed(2) : "0.00";

  return (
    <div ref={wrapperRef} className="relative text-right">
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer hover:bg-neutral-100 rounded px-2 py-1"
      >
        <div>{unitDiscount.toLocaleString("vi-VN")}</div>
        <div className="text-xs text-red-500">{percent}%</div>
      </div>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 z-[9999] w-48 bg-white border border-neutral-200 rounded-lg shadow-lg p-3">
          <div className="flex bg-neutral-100 rounded-md overflow-hidden text-sm mb-2">
            <button
              className={`flex-1 py-1 ${
                item.discount_type === "amount"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-600"
              }`}
              onClick={() => {
                onChange({ discount_type: "amount" });
                onChange({
                  discount_value: Math.min(item.discount_value || 0, price),
                });
              }}
            >
              Giá trị
            </button>

            <button
              className={`flex-1 py-1 ${
                item.discount_type === "percent"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-600"
              }`}
              onClick={() => {
                onChange({ discount_type: "percent" });
                onChange({
                  discount_value: Math.min(
                    item.discount_value || 0,
                    MAX_PERCENT
                  ),
                });
              }}
            >
              %
            </button>
          </div>

          <input
            ref={inputRef}
            type="number"
            value={item.discount_value}
            onChange={(e) =>
              onChange({
                discount_value: clampValue(Number(e.target.value)),
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") setOpen(false);
              if (e.key === "Escape") setOpen(false);
            }}
            className="w-full border border-neutral-300 rounded-md px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="text-xs text-neutral-500 mt-2">
            {item.discount_type === "percent"
              ? `Tối đa ${MAX_PERCENT}%`
              : `Tối đa ${price.toLocaleString("vi-VN")}`}
          </div>
        </div>
      )}
    </div>
  );
}


/* ================= MAIN TABLE ================= */

export default function SalesItemsTableBox({
  columns,
  items,
  onUpdateItem,
  onRemoveItem,
  fmt,
  onAddProduct,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <TableContainer noBorder>
        <TableHead columns={columns} />

        {items.length > 0 && (
          <TableContainer.Body>
            {items.map((item, index) => (
              <TableRow key={item.key}>
                <TableCell align="center" nowrap>
                  {index + 1}
                </TableCell>

                <TableCell align="center" nowrap>
                  <ProductThumb
                    src={item.image}
                    alt={item.product_name}
                    size="lg"
                  />
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className={`${textUI.cardTitle}`}>
  {item.unit_conversion_id ? item.unit_name : item.variant_name}
</div>
                    <div className="text-xs text-neutral-500">
                      {item.sku}
                    </div>
                  </div>
                </TableCell>

                <TableCell align="center" nowrap>
  {item.unit_name}
</TableCell>

                <TableCell align="center" nowrap>
                  <NumberInput
                    value={item.quantity}
                    onChange={(v: number) =>
                      onUpdateItem(item.key, {
                        quantity: clamp0(v),
                      })
                    }
                    className="w-24"
                    inputClassName="text-center"
                  />
                </TableCell>

                <TableCell align="right" nowrap>
                  <MoneyInput
                    value={item.price}
                    onChange={(v: number) =>
                      onUpdateItem(item.key, {
                        price: clamp0(v),
                      })
                    }
                    className="w-32"
                    inputClassName="text-right"
                  />
                </TableCell>

                <TableCell align="right">
                  <DiscountDisplay
                    item={item}
                    onChange={(patch) =>
                      onUpdateItem(item.key, patch)
                    }
                  />
                </TableCell>

                <TableCell
                  align="right"
                  nowrap
                  className="font-semibold text-neutral-900"
                >
                  {fmt(item.lineTotal)}
                </TableCell>

                <TableCell align="center" nowrap>
                  <button
                    type="button"
                    className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-red-50 text-neutral-400 hover:text-red-600"
                    onClick={() => onRemoveItem(item.key)}
                  >
                    <X size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableContainer.Body>
        )}
      </TableContainer>

      {items.length === 0 && (
        <div className="border border-t-0 border-neutral-200 rounded-b-lg">
          <div className="flex items-center justify-center min-h-[360px]">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center">
                <Package className="text-neutral-400" />
              </div>

              <div className="mt-4 text-neutral-600">
                Đơn bán của bạn chưa có sản phẩm nào
              </div>

              <div className="mt-5">
                <SecondaryButton
                  type="button"
                  onClick={onAddProduct}
                  disabled={!onAddProduct}
                >
                  Thêm sản phẩm
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}