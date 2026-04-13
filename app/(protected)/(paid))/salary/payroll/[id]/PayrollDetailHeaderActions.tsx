"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import ConfirmModal from "@/components/app/modal/ConfirmModal";
import toast from "react-hot-toast";
import PrintPayrollModal from "./PrintPayrollModal";

export default function PayrollDetailHeaderActions({ item }: any) {
  const router = useRouter();

  const [openApprove, setOpenApprove] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);

  const isApproved = item.status === "confirmed";
  const isPaid = item.status === "paid";

  /* ================= APPROVE ================= */

  async function handleApprove() {
    try {
      const res = await fetch("/api/salary/payroll/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [item.id] }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Lỗi duyệt");
      }

      toast.success("Đã duyệt bảng lương");
      setOpenApprove(false);
      router.refresh();

    } catch (err: any) {
      toast.error(err.message || "Lỗi duyệt");
    }
  }

  /* ================= UI ================= */

  return (
    <>
      <div className="flex gap-2">

        {/* Duyệt */}
        {!isApproved && !isPaid && (
          <PrimaryButton onClick={() => setOpenApprove(true)}>
            Duyệt
          </PrimaryButton>
        )}

        {/* In */}
        <SecondaryButton onClick={() => setOpenPrint(true)}>
          In
        </SecondaryButton>

      </div>

      {/* ===== MODAL DUYỆT ===== */}
      <ConfirmModal
        open={openApprove}
        onClose={() => setOpenApprove(false)}
        title="Xác nhận duyệt bảng lương"
        description="Sau khi duyệt, bảng lương sẽ được khóa và không thể chỉnh sửa."
        confirmText="Duyệt"
        confirmingText="Đang duyệt..."
        onConfirm={handleApprove}
      />

      {/* ===== MODAL IN ===== */}
      <PrintPayrollModal
        open={openPrint}
        onClose={() => setOpenPrint(false)}
        payroll={item}
      />
    </>
  );
}