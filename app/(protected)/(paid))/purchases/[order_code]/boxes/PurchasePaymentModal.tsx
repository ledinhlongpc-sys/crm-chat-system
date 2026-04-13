"use client";

import { useEffect, useState } from "react";
import BaseModal from "@/components/app/modal/BaseModal";
import FormGroup from "@/components/app/form/FormGroup";
import TextInput from "@/components/app/form/TextInput";
import Select from "@/components/app/form/Select";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import toast from "react-hot-toast";
import MoneyInput from "@/components/app/form/MoneyInput";

/* ===== FORMAT LOCAL DATETIME (KHÔNG LỆCH TZ) ===== */
function nowLocal() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    method: string;
    amount: number;
    paid_at: string;
    reference?: string;
  }) => Promise<void> | void;
  defaultAmount: number;
};

export default function PurchasePaymentModal({
  open,
  onClose,
  onSubmit,
  defaultAmount,
}: Props) {
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState<string>("0"); // 🔥 string
  const [paidAt, setPaidAt] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [loading, setLoading] = useState(false);

  /* ===== RESET STATE KHI MỞ MODAL ===== */
  useEffect(() => {
    if (open) {
      setAmount(String(defaultAmount ?? 0));
      setPaidAt(nowLocal());
      setReference("");
      setMethod("cash");
    }
  }, [open, defaultAmount]);

  const handleSubmit = async () => {
    if (loading) return;

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Số tiền phải lớn hơn 0");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        method,
        amount: numericAmount,
        paid_at: paidAt,
        reference: reference.trim() || undefined,
      });

      toast.success("Thanh toán thành công");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={loading ? () => {} : onClose}
      title="Xác nhận thanh toán"
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Phương thức */}
          <FormGroup label="Phương thức thanh toán">
            <Select
              value={method}
              onChange={(v) => setMethod(v)}
              options={[
                { label: "Tiền mặt", value: "cash" },
                { label: "Chuyển khoản", value: "transfer" },
                { label: "Khác", value: "other" },
              ]}
            />
          </FormGroup>

          {/* Số tiền */}
          <FormGroup label="Số tiền">
  <TextInput
    type="number"
    value={amount}
    onChange={(v) => setAmount(v)}
    align="right"
  />
</FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Ngày thanh toán */}
          <FormGroup label="Ngày thanh toán">
            <TextInput
              type="datetime-local"
              value={paidAt}
              onChange={(v) => setPaidAt(v)}
            />
          </FormGroup>

          {/* Tham chiếu */}
          <FormGroup label="Tham chiếu">
            <TextInput
              value={reference}
              onChange={(v) => setReference(v)}
              placeholder="Mã giao dịch / ghi chú thêm"
            />
          </FormGroup>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <SecondaryButton
            onClick={onClose}
            disabled={loading}
          >
            Thoát
          </SecondaryButton>

          <PrimaryButton
            onClick={handleSubmit}
            loading={loading}
          >
            Thanh toán
          </PrimaryButton>
        </div>
      </div>
    </BaseModal>
  );
}