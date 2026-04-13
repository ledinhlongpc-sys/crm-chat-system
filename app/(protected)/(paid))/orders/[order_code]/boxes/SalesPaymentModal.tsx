"use client";

import { useEffect, useState } from "react";
import BaseModal from "@/components/app/modal/BaseModal";
import FormGroup from "@/components/app/form/FormGroup";
import TextInput from "@/components/app/form/TextInput";
import MoneyInput from "@/components/app/form/MoneyInput";
import Select from "@/components/app/form/Select";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import toast from "react-hot-toast";

/* ===== FORMAT LOCAL DATETIME ===== */

function nowLocal() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

/* ================= TYPES ================= */

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

/* ================= COMPONENT ================= */

export default function SalesPaymentModal({
  open,
  onClose,
  onSubmit,
  defaultAmount,
}: Props) {

  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState<number>(0);
  const [paidAt, setPaidAt] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  const [loading, setLoading] = useState(false);

  /* ===== RESET STATE ===== */

  useEffect(() => {
    if (open) {
      setAmount(defaultAmount ?? 0);
      setPaidAt(nowLocal());
      setReference("");
      setMethod("cash");
    }
  }, [open, defaultAmount]);

  /* ===== SUBMIT ===== */

  const handleSubmit = async () => {

    if (loading) return;

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Số tiền phải lớn hơn 0");
      return;
    }

    /* 🚨 KHÔNG ĐƯỢC THANH TOÁN VƯỢT NỢ */

    if (numericAmount > defaultAmount) {
      toast.error(
        `Số tiền thanh toán không được vượt quá ${defaultAmount.toLocaleString("vi-VN")}`
      );
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
      title="Khách thanh toán"
      size="xl"
    >

      <div className="space-y-6">

        {/* ROW 1 */}

        <div className="grid grid-cols-2 gap-6">

          <FormGroup label="Phương thức thanh toán">

            <Select
              value={method}
              onChange={(v) => setMethod(v)}
              options={[
                { label: "Tiền mặt", value: "cash" },
                { label: "Chuyển khoản", value: "transfer" },
                { label: "COD", value: "cod" },
                { label: "Khác", value: "other" },
              ]}
            />

          </FormGroup>

          <FormGroup label="Số tiền">

            <MoneyInput
              value={amount}
              onChange={(v) => setAmount(v)}
              className="w-full"
            />

          </FormGroup>

        </div>

        {/* ROW 2 */}

        <div className="grid grid-cols-2 gap-6">

          <FormGroup label="Ngày thanh toán">

            <TextInput
              type="datetime-local"
              value={paidAt}
              onChange={(v) => setPaidAt(v)}
            />

          </FormGroup>

          <FormGroup label="Tham chiếu">

            <TextInput
              value={reference}
              onChange={(v) => setReference(v)}
              placeholder="Mã giao dịch / ghi chú thêm"
            />

          </FormGroup>

        </div>

        {/* FOOTER */}

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