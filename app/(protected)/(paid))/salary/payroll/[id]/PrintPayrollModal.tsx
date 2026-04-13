"use client";

import BaseModal from "@/components/app/modal/BaseModal";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

type Props = {
  open: boolean;
  onClose: () => void;
  payroll: any;
};

export default function PrintPayrollModal({
  open,
  onClose,
  payroll,
}: Props) {

  function handlePrint() {
    if (!payroll?.id) {
      console.log("❌ payroll lỗi:", payroll);
      return;
    }

    // ✅ bỏ size luôn
    const url = `/salary/payroll/${payroll.id}/print`;

    window.open(url, "_blank");
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="In bảng lương"
      size="sm"
    >
      <div className="text-sm text-neutral-600">
        Bạn muốn in bảng lương này?
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