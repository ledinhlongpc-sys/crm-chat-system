"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import ExitButton from "@/components/app/button/ExitButton";
import PrimaryButton from "@/components/app/button/PrimaryButton";

type Props = {
  onSave: () => any;
  canSave?: boolean;
};

export default function EditSalesHeaderActions({
  onSave,
  canSave = true,
}: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  /* =====================================================
     CALL API UPDATE
  ===================================================== */

  const handleUpdate = async () => {
    if (!canSave || saving) return;

    setSaving(true);

    try {
      const payload = await onSave();

      if (!payload) {
        setSaving(false);
        return;
      }

      /* =========================
         FIX TIMEZONE (SAFE)
      ========================== */

      const fixedPayload = {
        ...payload,

        expected_delivery_at:
          payload.expected_delivery_at &&
          !isNaN(Date.parse(payload.expected_delivery_at))
            ? new Date(payload.expected_delivery_at).toISOString()
            : null,
      };

      /* =========================
         CALL API
      ========================== */

      const res = await fetch(`/api/sales/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fixedPayload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Không thể cập nhật đơn");
      }

      /* =========================
         SUCCESS
      ========================== */

      if (!data?.order_code) {
        throw new Error("Không tìm thấy mã đơn hàng");
      }

      toast.success("Cập nhật đơn thành công");

      router.push(`/orders/${data.order_code}`);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi cập nhật đơn");
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <>
      <ExitButton
        label="Thoát"
        onClick={() => router.back()}
        disabled={saving}
      />

      <PrimaryButton
        onClick={handleUpdate}
        loading={saving}
        disabled={saving || !canSave}
      >
        Cập nhật đơn
      </PrimaryButton>
    </>
  );
}