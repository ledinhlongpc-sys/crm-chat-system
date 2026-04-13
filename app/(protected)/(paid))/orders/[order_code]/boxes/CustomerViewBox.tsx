"use client";

import Form2Box from "@/components/app/form/Form2Box";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type CustomerAddress = {
  id: string;

  address_line: string;

  province_name_v1?: string | null;
  district_name_v1?: string | null;
  ward_name_v1?: string | null;

  province_name_v2?: string | null;
  commune_name_v2?: string | null;

  receiver_name?: string | null;
  receiver_phone?: string | null;

  is_default?: boolean;
};

export type Customer = {
  id: string;
  customer_code?: string;

  name?: string | null;
  phone?: string | null;
  email?: string | null;

  current_debt?: number;
  total_sales_amount?: number;
  total_return_amount?: number;

  total_sales_count?: number;
  total_return_count?: number;

  default_address?: CustomerAddress | null;
};

/* ================= HELPERS ================= */

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(Number(value) || 0);
}

function buildAddressLine(a?: CustomerAddress | null) {
  if (!a) return "";

  const parts = [
    a.address_line,

    // v1
    a.ward_name_v1,
    a.district_name_v1,
    a.province_name_v1,

    // v2
    a.commune_name_v2,
    a.province_name_v2,
  ].filter(Boolean);

  return parts.join(", ");
}

/* ================= PROPS ================= */

type Props = {
  value: Customer | null;

  onChange?: (customer: Customer | null) => void;
  readOnly?: boolean;
};

/* ================= COMPONENT ================= */

export default function CustomerViewBox({ value = null }: Props) {
  return (
    <Form2Box title="Thông tin khách hàng">
      {/* EMPTY */}
      {!value && (
        <div className="flex flex-col items-center justify-center py-14 text-neutral-400">
          <span className={textUI.cardTitle}>—</span>
        </div>
      )}

      {/* HAS VALUE */}
      {value && (
        <div className="grid grid-cols-5 gap-8">
          {/* LEFT */}
          <div className="col-span-3 space-y-3">
            {/* NAME */}
            <div className="flex items-center gap-3">
              <span className={`${textUI.cardTitle} text-blue-600`}>
                {value.name || "—"}
                {value.phone ? ` - ${value.phone}` : ""}
              </span>
            </div>

            {/* ADDRESS */}
            {value.default_address && (
              <>
                {/* RECEIVER */}
                <div className={`${textUI.cardTitle} text-neutral-800`}>
  Thông tin giao hàng :
  {" "}
  {value.default_address.receiver_name || value.name || "—"}
  {(value.default_address.receiver_phone || value.phone) &&
    ` - ${
      value.default_address.receiver_phone || value.phone
    }`}
</div>

                {/* ADDRESS LINE */}
                <div
                  className={`${textUI.cardTitle} text-neutral-500 leading-relaxed`}
                >
                  {buildAddressLine(value.default_address)}
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="col-span-2 border border-neutral-200 rounded-xl px-8 py-7 bg-neutral-50">
            <div className="space-y-6">
              {/* DEBT */}
              <div className="flex justify-between items-center">
                <span className={`${textUI.cardTitle} text-neutral-600`}>
                  Nợ hiện tại
                </span>

                <span className={`${textUI.cardTitle} text-red-500`}>
                  {formatMoney(value.current_debt)} đ
                </span>
              </div>

              {/* SALES */}
              <div className="flex justify-between items-center">
                <span className={`${textUI.cardTitle} text-neutral-600`}>
                  Tổng đơn bán
                  {typeof value.total_sales_count === "number"
                    ? ` (${value.total_sales_count})`
                    : ""}
                </span>

                <span className={`${textUI.cardTitle} text-blue-600`}>
                  {formatMoney(value.total_sales_amount)} đ
                </span>
              </div>

              {/* RETURN */}
              <div className="flex justify-between items-center">
                <span className={`${textUI.cardTitle} text-neutral-600`}>
                  Trả hàng
                  {typeof value.total_return_count === "number"
                    ? ` (${value.total_return_count})`
                    : ""}
                </span>

                <span className={`${textUI.cardTitle} text-red-500`}>
                  {formatMoney(value.total_return_amount)} đ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Form2Box>
  );
}