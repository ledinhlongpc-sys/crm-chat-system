"use client";

import Form2Box from "@/components/app/form/Form2Box";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type Supplier = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  current_debt?: number;
  total_purchase?: number;
  total_return?: number;
  total_purchase_count?: number;
  total_return_count?: number;
};

/* ================= HELPERS ================= */

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

/* ================= PROPS ================= */
/** VIEW-ONLY: giữ props để khỏi sửa chỗ gọi */
type Props = {
  initialSuppliers?: Supplier[]; // không dùng ở view
  value: Supplier | null;
  onChange?: (supplier: Supplier | null) => void; // không dùng ở view
  readOnly?: boolean; // không dùng ở view
};

/* ================= COMPONENT ================= */

export default function SupplierBox({ value }: Props) {
  return (
    <Form2Box title="Thông tin nhà cung cấp">
      {/* EMPTY */}
      {!value && (
        <div className="flex flex-col items-center justify-center py-14 text-neutral-400">
          <span className={textUI.body}>—</span>
        </div>
      )}

      {/* HAS VALUE */}
      {value && (
        <div className="grid grid-cols-5 gap-8">
          {/* LEFT */}
          <div className="col-span-3 space-y-3">
            <div className="flex items-center gap-3">
              <span className={`${textUI.body} text-blue-600`}>
                {value.name}
              </span>
            </div>

            {value.phone && (
              <div className={`${textUI.body} text-neutral-800`}>
                {value.phone}
              </div>
            )}

            {value.address && (
              <div
                className={`${textUI.body} text-neutral-500 leading-relaxed`}
              >
                {value.address}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="col-span-2 border border-neutral-200 rounded-xl px-8 py-7 bg-neutral-50">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className={`${textUI.body} text-neutral-600`}>
                  Nợ hiện tại
                </span>
                <span className={`${textUI.body} text-red-500`}>
                  {formatMoney(value.current_debt)} đ
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className={`${textUI.body} text-neutral-600`}>
                  Tổng đơn nhập
                  {typeof value.total_purchase_count === "number"
                    ? ` (${value.total_purchase_count})`
                    : ""}
                </span>
                <span className={`${textUI.body} text-blue-600`}>
                  {formatMoney(value.total_purchase)} đ
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className={`${textUI.body} text-neutral-600`}>
                  Trả hàng
                  {typeof value.total_return_count === "number"
                    ? ` (${value.total_return_count})`
                    : ""}
                </span>
                <span className={`${textUI.body} text-red-500`}>
                  {formatMoney(value.total_return)} đ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Form2Box>
  );
}