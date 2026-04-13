"use client";

import BaseModal from "@/components/app/modal/BaseModal";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

type Props = {
  open: boolean;
  onClose: () => void;

  payroll?: any;        // 👉 dùng cho detail
  payrollIds?: string[]; // 👉 dùng cho list
};

export default function PrintPayrollModal({
  open,
  onClose,
  payroll,
  payrollIds = [],
}: Props) {

  function handlePrint() {
    // ✅ CASE 1: nhiều nhân viên
    if (payrollIds.length > 0) {
      const ids = payrollIds.join(",");

      const url = `/salary/payroll/print-multiple?ids=${ids}`;

      window.open(url, "_blank");
      return;
    }

    // ✅ CASE 2: 1 nhân viên
    if (payroll?.id) {
      const url = `/salary/payroll/${payroll.id}/print`;

      window.open(url, "_blank");
      return;
    }

    console.log("❌ không có dữ liệu in", { payroll, payrollIds });
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="In bảng lương"
      size="sm"
    >
      <div className="text-sm text-neutral-600">
        {payrollIds.length > 0
          ? `Bạn muốn in ${payrollIds.length} bảng lương?`
          : "Bạn muốn in bảng lương này?"}
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t pt-4">
        <SecondaryButton onClick={onClose}>
          Hủy
        </SecondaryButton>

        <PrimaryButton onClick={handlePrint}>
          In
        </PrimaryButton>
      </div>
    </BaseModal>
  );
}