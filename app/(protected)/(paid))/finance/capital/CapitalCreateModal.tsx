"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { textUI } from "@/ui-tokens";

import FormGroup from "@/components/app/form/FormGroup";
import MoneyInput from "@/components/app/form/MoneyInput";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

type Account = {
  id: string;
  account_name: string;
  is_default?: boolean;
};

type Shareholder = {
  id: string;
  shareholder_name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;

  accounts: Account[];
  shareholders: Shareholder[];
};

/* ================= COMPONENT ================= */

export default function CapitalCreateModal({
  open,
  onClose,
  accounts,
  shareholders,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    shareholder_id: "", // ✅ NEW
    account_id: "",
    amount: 0,
    transaction_type: "contribute",
    transaction_date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  /* ================= HANDLE ================= */

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= DEFAULT ================= */

  useEffect(() => {
    if (!open) return;

    // default account
    const defaultAcc =
      accounts.find((a) => a.is_default)?.id ||
      accounts[0]?.id;

    // default shareholder
    const defaultShareholder =
      shareholders[0]?.id || "";

    setForm((prev) => ({
      ...prev,
      account_id: defaultAcc || "",
      shareholder_id: defaultShareholder,
    }));
  }, [open, accounts, shareholders]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!form.shareholder_id) {
      toast.error("Vui lòng chọn cổ đông");
      return;
    }

    if (!form.account_id) {
      toast.error("Vui lòng chọn tài khoản");
      return;
    }

    if (!form.amount || form.amount <= 0) {
      toast.error("Số tiền không hợp lệ");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/finance/capital/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Giao dịch thất bại");
        return;
      }

      toast.success("Thêm giao dịch thành công");

      onClose();
      location.reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="absolute inset-0 flex justify-center items-start p-4 md:p-8 overflow-auto">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className={textUI.pageTitle}>
              Giao dịch góp vốn
            </div>

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            {/* 🔥 NEW: SHAREHOLDER */}
            <FormGroup label="Cổ đông *">
              <Select
                value={form.shareholder_id}
                onChange={(v) =>
                  handleChange("shareholder_id", v)
                }
                options={shareholders.map((s) => ({
                  label: s.shareholder_name,
                  value: s.id,
                }))}
              />
            </FormGroup>

            {/* ACCOUNT */}
            <FormGroup label="Tài khoản tiền *">
              <Select
                value={form.account_id}
                onChange={(v) =>
                  handleChange("account_id", v)
                }
                options={accounts.map((a) => ({
                  label: a.account_name,
                  value: a.id,
                }))}
              />
            </FormGroup>

            {/* AMOUNT */}
            <FormGroup label="Số tiền *">
              <MoneyInput
                value={form.amount}
                onChange={(v) =>
                  handleChange("amount", v)
                }
              />
            </FormGroup>

            {/* TYPE */}
            <FormGroup label="Loại giao dịch">
              <Select
                value={form.transaction_type}
                onChange={(v) =>
                  handleChange("transaction_type", v)
                }
                options={[
                  { label: "Góp vốn", value: "contribute" },
                  { label: "Rút vốn", value: "withdraw" },
                ]}
              />
            </FormGroup>

            {/* DATE */}
            <FormGroup label="Ngày giao dịch">
              <Input
                type="date"
                value={form.transaction_date}
                onChange={(v) =>
                  handleChange("transaction_date", v)
                }
              />
            </FormGroup>

            {/* NOTE */}
            <FormGroup label="Ghi chú">
              <Input
                value={form.note}
                onChange={(v) =>
                  handleChange("note", v)
                }
              />
            </FormGroup>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t">
            <SecondaryButton onClick={onClose}>
              Huỷ
            </SecondaryButton>

            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Xác nhận"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}