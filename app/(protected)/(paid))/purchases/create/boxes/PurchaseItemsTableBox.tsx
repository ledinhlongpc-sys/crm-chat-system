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

import { purchaseUI } from "@/ui-tokens";

import type { PurchaseItem } from "./PurchaseItemsBox";

/* ================= TYPES ================= */

type CalcItem = PurchaseItem & {
  baseTotal: number;
  discountAmount: number;
  lineTotal: number;
};

type Props = {
  columns: any[];
  items: CalcItem[];
  onUpdateItem: (key: string, patch: Partial<PurchaseItem>) => void;
  onRemoveItem: (key: string) => void;
  fmt: (n: number) => string;
  onAddProduct?: () => void;
};

function clamp0(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

/* ================= DISCOUNT DISPLAY (SAPO STYLE) ================= */

function DiscountDisplay({
  item,
  onChange,
}: {
  item: CalcItem;
  onChange: (patch: Partial<PurchaseItem>) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const price = item.price || 0;

  const unitDiscount =
    item.discount_type === "amount"
      ? item.discount_value || 0
      : (price * (item.discount_value || 0)) / 100;

  const percent =
    price > 0 ? ((unitDiscount / price) * 100).toFixed(2) : "0";

  /* ===== click outside ===== */
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

  /* ===== auto focus ===== */
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative text-right">
      {/* ===== DISPLAY ===== */}
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer hover:bg-neutral-100 rounded px-2 py-1"
      >
        <div>{unitDiscount.toLocaleString("vi-VN")}</div>
        <div className="text-xs text-red-500">{percent}%</div>
      </div>

      {/* ===== POPUP ===== */}
      {open && (
        <div className="absolute right-0 bottom-full mb-2 z-[9999] w-48 bg-white border border-neutral-200 rounded-lg shadow-lg p-3">
          {/* toggle */}
          <div className="flex bg-neutral-100 rounded-md overflow-hidden text-sm mb-2">
            <button
              className={`flex-1 py-1 ${
                item.discount_type === "amount"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-600"
              }`}
              onClick={() => onChange({ discount_type: "amount" })}
            >
              Giá trị
            </button>

            <button
              className={`flex-1 py-1 ${
                item.discount_type === "percent"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-600"
              }`}
              onClick={() => onChange({ discount_type: "percent" })}
            >
              %
            </button>
          </div>

          {/* input */}
          <input
            ref={inputRef}
            type="number"
            value={item.discount_value}
            onChange={(e) =>
              onChange({
                discount_value: Number(e.target.value) || 0,
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setOpen(false);
              }
            }}
            className="w-full border border-neutral-300 rounded-md px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}




/* ================= MAIN TABLE ================= */

export default function PurchaseItemsTableBox({
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
                  <div className={purchaseUI.productCell.wrapper}>
                    <div className={purchaseUI.productCell.name}>
                      {item.product_name} - {item.variant_name}
                    </div>
                    <div className={purchaseUI.productCell.sku}>
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

                {/* SAPO STYLE DISCOUNT */}
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
                    title="Xóa"
                  >
                    <X size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableContainer.Body>
        )}
      </TableContainer>

      {/* EMPTY STATE */}
      {items.length === 0 && (
        <div className="border border-t-0 border-neutral-200 rounded-b-lg">
          <div className="flex items-center justify-center min-h-[360px]">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center">
                <Package className="text-neutral-400" />
              </div>

              <div className="mt-4 text-neutral-600">
                Đơn hàng nhập của bạn chưa có sản phẩm nào
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