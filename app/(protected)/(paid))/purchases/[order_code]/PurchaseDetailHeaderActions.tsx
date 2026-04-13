"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import ExitButton from "@/components/app/button/ExitButton";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import DangerButton from "@/components/app/button/DangerButton";

type Props = {
  status: "draft" | "completed" | "cancelled";
  orderId: string;
  orderCode: string;
};

export default function PurchaseDetailHeaderActions({
  status,
  orderId,
}: Props) {
  const router = useRouter();

  const [canceling, setCanceling] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const isDraft = status === "draft";

  /* ======================================================
     HUỶ ĐƠN (CHỈ DRAFT)
  ====================================================== */
  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn huỷ đơn này?")) return;

    try {
      setCanceling(true);

      const res = await fetch(
  `/api/purchases/${orderId}/cancelled`,
  { method: "POST" }
);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Không thể huỷ đơn");
      }

      toast.success("Đã huỷ đơn");
      router.push("/purchases");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi huỷ đơn");
    } finally {
      setCanceling(false);
    }
  };

  /* ======================================================
     SAO CHÉP
  ====================================================== */
  const handleDuplicate = async () => {
    try {
      setDuplicating(true);

      const res = await fetch(
        `/api/purchases/${orderId}/duplicate`,
        { method: "POST" }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Không thể sao chép");
      }

      toast.success("Đã tạo bản sao");
      router.push(`/purchases/${data.order_code}`);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi sao chép");
    } finally {
      setDuplicating(false);
    }
  };

  /* ======================================================
     IN ĐƠN
  ====================================================== */
  const handlePrint = () => {
    window.print();
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
  <>
    <ExitButton
      label="Thoát"
      onClick={() => router.push("/purchases")}
    />

    {isDraft && (
      <DangerButton
        onClick={handleCancel}
        disabled={canceling}
        loading={canceling}
      >
        Huỷ đơn
      </DangerButton>
    )}

    <SecondaryButton
      onClick={handleDuplicate}
      disabled={duplicating}
      loading={duplicating}
    >
      Sao chép
    </SecondaryButton>

    <PrimaryButton
      onClick={handlePrint}
    >
      In đơn
    </PrimaryButton>
  </>
);
}