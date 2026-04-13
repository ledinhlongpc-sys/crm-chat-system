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

export default function CreateSalesHeaderActions({
  onSave,
  canSave = true,
}: Props) {
  const router = useRouter();

  const [savingDraft, setSavingDraft] = useState(false);
  const [savingProcessing, setSavingProcessing] = useState(false);
  const [exiting, setExiting] = useState(false);

  /* =====================================================
     CALL API
  ===================================================== */

  const callApi = async (
    url: string,
    loadingSetter: (v: boolean) => void
  ) => {
    if (!canSave) return;

    loadingSetter(true);

    try {
      const payload = onSave();

      if (!payload) {
        loadingSetter(false);
        return;
      }

      /* 🔥 FIX TIMEZONE */
      const fixedPayload = {
        ...payload,
        sale_date: payload.sale_date
          ? new Date(payload.sale_date).toISOString()
          : null,
        expected_delivery_at: payload.expected_delivery_at
          ? new Date(payload.expected_delivery_at).toISOString()
          : null,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fixedPayload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Không thể xử lý đơn bán");
      }

      toast.success("Tạo đơn thành công");

      router.push(`/orders/${data.order_code}`);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xử lý đơn");
    } finally {
      loadingSetter(false);
    }
  };

  /* =====================================================
     HANDLERS
  ===================================================== */

  const handleCreateDraft = async () => {
    if (savingDraft || savingProcessing) return;
    await callApi("/api/sales/create_draft", setSavingDraft);
  };

  const handleCreateProcessing = async () => {
    if (savingDraft || savingProcessing) return;
    await callApi(
      "/api/sales/create_processing",
      setSavingProcessing
    );
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <>
      <ExitButton
  label={exiting ? "Đang thoát..." : "Thoát"}
  onClick={async () => {
    if (exiting) return;

    setExiting(true);
    router.push("/orders");
  }}
  disabled={exiting}
/>

      <PrimaryButton
        onClick={handleCreateProcessing}
        loading={savingProcessing}
        disabled={
          savingDraft || savingProcessing || !canSave
        }
      >
        Tạo & Duyệt
      </PrimaryButton>

      <PrimaryButton
        onClick={handleCreateDraft}
        loading={savingDraft}
        disabled={
          savingDraft || savingProcessing || !canSave
        }
      >
        Tạo Đơn Hàng
      </PrimaryButton>
    </>
  );
}