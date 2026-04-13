"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import ExitButton from "@/components/app/button/ExitButton";
import SaveButton from "@/components/app/button/SaveButton";

/* ================= TYPES ================= */

type Props = {
  onSave: () => any;
  canSave?: boolean;
};

/* ================= COMPONENT ================= */

export default function CreatePurchaseHeaderActions({
  onSave,
  canSave = true,
}: Props) {
  const router = useRouter();

  const [savingDraft, setSavingDraft] = useState(false);
  const [savingComplete, setSavingComplete] = useState(false);

  /* =======================================================
     CALL API GENERIC
  ======================================================= */

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

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Không thể xử lý đơn nhập");
      }

      toast.success("Thao tác thành công");

      // redirect sau khi thành công
      router.push(`/purchases/${data.order_code}`);

      return data; // ✅ QUAN TRỌNG: để SaveButton await được
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xử lý đơn");
      loadingSetter(false);
      throw err; // ✅ để Promise reject đúng
    }
  };

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleCreateDraft = async () => {
    if (savingDraft || savingComplete) return;
    await callApi("/api/purchases/create", setSavingDraft);
  };

  const handleCreateAndComplete = async () => {
    if (savingDraft || savingComplete) return;
    await callApi(
      "/api/purchases/create_complete",
      setSavingComplete
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <ExitButton
        label="Thoát"
        onClick={() => router.push("/purchases")}
      />

      {/* Tạo (Draft) */}
      <SaveButton
        label="Tạo (Chưa nhập)"
        loadingLabel="Đang tạo..."
        disabled={savingDraft || savingComplete || !canSave}
        onClick={handleCreateDraft}
      />

      {/* Tạo & Nhập kho */}
      <SaveButton
        label="Tạo & Nhập kho"
        loadingLabel="Đang nhập kho..."
        disabled={savingDraft || savingComplete || !canSave}
        onClick={handleCreateAndComplete}
      />
    </>
  );
}