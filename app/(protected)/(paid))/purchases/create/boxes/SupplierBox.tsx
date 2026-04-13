"use client";

import { useCallback, useState } from "react";
import Form2Box from "@/components/app/form/Form2Box";
import AsyncSearchSelect, {
  AsyncOption,
} from "@/components/app/form/AsyncSearchSelect";
import { textUI } from "@/ui-tokens";
import { X } from "lucide-react";

import CreateQuickSupplierModal from "./CreateQuickSupplierModal";

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

/* ================= FORMAT MONEY ================= */

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(
    value ?? 0
  );
}

type Props = {
  initialSuppliers: Supplier[]; // 👈 preload 50 NCC
  value: Supplier | null;
  onChange: (supplier: Supplier | null) => void;
};

/* ================= COMPONENT ================= */

export default function SupplierBox({
  initialSuppliers,
  value,
  onChange,
}: Props) {
  const [openCreateModal, setOpenCreateModal] =
    useState(false);

  /* ================= FETCH OPTIONS ================= */

const fetchOptions = useCallback(
  async (keyword?: string, page?: number) => {
    const baseCreateOption: AsyncOption = {
      id: "__create__",
      label: (
        <div className="text-blue-600 font-medium">
          + Thêm mới nhà cung cấp
        </div>
      ),
    };

    const mapLocal = (s: Supplier): AsyncOption => ({
      id: s.id,
      label: (
        <div>
          <div className={textUI.body}>{s.name}</div>
          {s.phone && (
            <div className="text-neutral-500 text-sm">
              {s.phone}
            </div>
          )}
        </div>
      ),
      data: s,
    });

    /* ===== KHÔNG CÓ KEYWORD ===== */
    if (!keyword?.trim()) {
      return {
        data: [
          baseCreateOption,
          ...initialSuppliers.map(mapLocal),
        ],
        hasMore: false,
      };
    }

    const k = keyword.toLowerCase().trim();

    /* ===== LOCAL MATCH ===== */
    const localMatch = initialSuppliers.filter(
      (s) =>
        s.name?.toLowerCase().includes(k) ||
        s.phone?.includes(k)
    );

    if (localMatch.length > 0) {
      return {
        data: [
          baseCreateOption,
          ...localMatch.map(mapLocal),
        ],
        hasMore: false,
      };
    }

    /* ===== CALL API ===== */
    const res = await fetch(
      `/api/suppliers/search?q=${encodeURIComponent(
        keyword
      )}`
    );

    if (!res.ok) {
      return {
        data: [baseCreateOption],
        hasMore: false,
      };
    }

    const data = await res.json();

    const supplierOptions = (data ?? []).map((s: any) => ({
      id: s.id,
      label: (
        <div>
          <div className={textUI.body}>
            {s.supplier_name}
          </div>
          {s.phone && (
            <div className="text-neutral-500 text-sm">
              {s.phone}
            </div>
          )}
        </div>
      ),
      data: {
        id: s.id,
        name: s.supplier_name,
        phone: s.phone,
        address: s.address,
        current_debt: s.current_debt,
        total_purchase: s.total_purchase,
        total_return: s.total_return,
        total_purchase_count:
          s.total_purchase_count,
        total_return_count:
          s.total_return_count,
      },
    }));

    return {
      data: [baseCreateOption, ...supplierOptions],
      hasMore: false,
    };
  },
  [initialSuppliers]
);


  /* ================= HANDLE SELECT ================= */

  const handleSelect = (option?: any) => {
    if (!option) return;

    if (option.id === "__create__") {
      setOpenCreateModal(true);
      return;
    }

    /* 👇 KHÔNG CALL API NỮA */
    if (option.data) {
      onChange(option.data);
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      <Form2Box title="Thông tin nhà cung cấp">
        {/* ===== CHƯA CHỌN ===== */}
        {!value && (
          <>
            <AsyncSearchSelect
              placeholder="Tìm theo tên, SĐT, mã nhà cung cấp..."
              fetchOptions={fetchOptions}
              onSelect={handleSelect}
            />

            <div className="flex flex-col items-center justify-center py-14 text-neutral-400">
              <span className={textUI.body}>
                Chưa có thông tin nhà cung cấp
              </span>
            </div>
          </>
        )}

        {/* ===== ĐÃ CHỌN ===== */}
        {value && (
          <div className="grid grid-cols-5 gap-8">
            {/* LEFT */}
            <div className="col-span-3 space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className={`${textUI.body} text-blue-600`}
                >
                  {value.name}
                </span>

                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {value.phone && (
                <div
                  className={`${textUI.body} text-neutral-800`}
                >
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
                  <span
                    className={`${textUI.body} text-neutral-600`}
                  >
                    Nợ hiện tại
                  </span>
                  <span
                    className={`${textUI.body} text-red-500`}
                  >
                    {formatMoney(value.current_debt)} đ
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span
                    className={`${textUI.body} text-neutral-600`}
                  >
                    Tổng đơn nhập
                    {typeof value.total_purchase_count ===
                    "number"
                      ? ` (${value.total_purchase_count})`
                      : ""}
                  </span>
                  <span
                    className={`${textUI.body} text-blue-600`}
                  >
                    {formatMoney(value.total_purchase)} đ
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span
                    className={`${textUI.body} text-neutral-600`}
                  >
                    Trả hàng
                    {typeof value.total_return_count ===
                    "number"
                      ? ` (${value.total_return_count})`
                      : ""}
                  </span>
                  <span
                    className={`${textUI.body} text-red-500`}
                  >
                    {formatMoney(value.total_return)} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Form2Box>

      <CreateQuickSupplierModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={(supplier) => {
          onChange(supplier);
        }}
      />
    </>
  );
}
