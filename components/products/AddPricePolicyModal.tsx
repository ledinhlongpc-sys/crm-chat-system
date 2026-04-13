"use client";

import { useState } from "react";

type Props = {
  productVariantId: string;
  branchId: string;
  onAdded: () => void;
};

export default function AddPricePolicyModal({
  productVariantId,
  branchId,
  onAdded,
}: Props) {
  const [group, setGroup] = useState("");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!group) {
      alert("Chọn nhóm khách");
      return;
    }

    setLoading(true);

    await fetch("/api/product-branch-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_variant_id: productVariantId,
        branch_id: branchId,
        customer_group_code: group,
        price,
        is_default: false,
      }),
    });

    setLoading(false);
    onAdded();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded w-[360px] p-4 space-y-4">
        <h3 className="font-medium">Thêm chính sách giá</h3>

        <div>
          <label className="text-sm">Nhóm khách</label>
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">Chọn nhóm</option>
            <option value="wholesale">Khách sỉ</option>
            <option value="vip">Khách VIP</option>
            <option value="technician">Khách thợ</option>
            <option value="dealer">Đại lý</option>
          </select>
        </div>

        <div>
          <label className="text-sm">Giá</label>
          <input
            type="number"
            className="mt-1 w-full rounded border px-3 py-2"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onAdded}
            className="px-3 py-1 border rounded"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
