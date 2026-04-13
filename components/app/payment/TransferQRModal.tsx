"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import BaseModal from "@/components/app/modal/BaseModal";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import toast from "react-hot-toast";

type Bank = {
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  orderCode: string;
  amount: number;
  branchId: string;
};

function fmt(n: number) {
  return (Number(n) || 0).toLocaleString("vi-VN");
}

export default function TransferQRModal({
  open,
  onClose,
  orderCode,
  amount,
  branchId,
}: Props) {

  const [bank, setBank] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(false);

  const content = `${orderCode}`;

  useEffect(() => {

    if (!open) return;

    const loadBank = async () => {

      try {

        setLoading(true);

        const res = await fetch(
          `/api/bank/default?branch_id=${branchId}`
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || "BANK_LOAD_FAILED");
        }

        setBank(json);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    loadBank();

  }, [open, branchId]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép");
  };

  const qrUrl =
    bank
      ? `https://img.vietqr.io/image/${bank.bank_code}-${bank.account_number}-compact2.png`
        + `?amount=${amount}`
        + `&addInfo=${encodeURIComponent(content)}`
        + `&accountName=${encodeURIComponent(bank.account_name)}`
      : "";

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Mã VietQR thanh toán"
      width="520px"
    >

      <div className="space-y-6">

        {/* QR */}

        <div className="flex justify-center">

          {loading && (
            <div className="w-80 h-80 flex items-center justify-center border rounded-lg text-neutral-400">
              Đang tải QR...
            </div>
          )}

          {!loading && bank && (
            <img
              src={qrUrl}
              className="w-80 h-80 border rounded-lg"
            />
          )}

        </div>

        {/* INFO */}

        <div className="space-y-4 text-sm">

          <div className="flex justify-between">
            <span className="text-neutral-500">
              Số tiền
            </span>

            <div className="flex items-center gap-2 font-medium">
              {fmt(amount)} VND
              <Copy
                size={16}
                className="cursor-pointer"
                onClick={() => copy(String(amount))}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500">
              Nội dung chuyển khoản
            </span>

            <div className="flex items-center gap-2 font-medium">
              {content}
              <Copy
                size={16}
                className="cursor-pointer"
                onClick={() => copy(content)}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500">
              Ngân hàng
            </span>

            <span className="font-medium">
              {bank?.bank_name || "-"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500">
              Số tài khoản
            </span>

            <div className="flex items-center gap-2 font-medium">
              {bank?.account_number || "-"}
              {bank && (
                <Copy
                  size={16}
                  className="cursor-pointer"
                  onClick={() => copy(bank.account_number)}
                />
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500">
              Chủ tài khoản
            </span>

            <span className="font-medium">
              {bank?.account_name || "-"}
            </span>
          </div>

        </div>

        <div className="flex justify-end pt-2">

          <SecondaryButton onClick={onClose}>
            Đóng
          </SecondaryButton>

        </div>

      </div>

    </BaseModal>
  );
}