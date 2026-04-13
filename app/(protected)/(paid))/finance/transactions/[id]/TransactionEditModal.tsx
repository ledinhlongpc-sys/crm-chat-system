"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { textUI } from "@/ui-tokens";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import MoneyInput from "@/components/app/form/MoneyInput";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

type Account = {
  id: string;
  account_name: string;
};

type Category = {
  id: string;
  category_name: string;
  category_type: string;
};

type Transaction = {
  id: string;
  account_id: string;
  category_id: string | null;
  direction: "in" | "out";
  amount: number;
  description: string | null;
  transaction_date: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
};

/* ================= COMPONENT ================= */

export default function TransactionEditModal({
  open,
  onClose,
  transaction,
  accounts,
  categories,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    account_id: "",
    category_id: "",
    direction: "in" as "in" | "out",
    amount: 0,
    description: "",
    transaction_date: "",
  });

  /* ================= LOAD ================= */

  useEffect(() => {
  if (!open || !transaction) return;

  setForm({
    account_id: String(transaction.account_id || ""),
    category_id: String(transaction.category_id || ""),
    direction: transaction.direction || "in",
    amount: transaction.amount || 0,
    description: transaction.description || "",
    transaction_date: transaction.transaction_date
      ? transaction.transaction_date.slice(0, 10)
      : "",
  });
}, [open, transaction]);

  /* ================= HANDLE ================= */

  function handleChange(key: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [key]: value ? String(value) : "",
    }));
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    console.log("FORM SUBMIT:", form); // 👈 debug

    if (!form.account_id) {
      toast.error("Chọn tài khoản");
      return;
    }

    if (!form.amount || form.amount <= 0) {
      toast.error("Số tiền không hợp lệ");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/finance/transactions/${transaction.id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Cập nhật thất bại");
        return;
      }

      toast.success("Cập nhật thành công");

      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex justify-center items-start p-6">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border">

          {/* HEADER */}
          <div className="flex justify-between px-5 py-4 border-b">
            <div className={textUI.pageTitle}>
              Sửa giao dịch
            </div>

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-5 space-y-4">

            {/* ✅ KEY FIX CHÍNH Ở ĐÂY */}
            <FormGroup label="Tài khoản">
  <Select
    key={form.account_id || "empty"} // 🔥 QUAN TRỌNG
    value={String(form.account_id || "")}
    onChange={(v) =>
      setForm((prev) => ({
        ...prev,
        account_id: String(v || ""),
      }))
    }
    options={(accounts || []).map((a) => ({
      label: a.account_name,
      value: String(a.id),
    }))}
  />
</FormGroup>

            <FormGroup label="Loại">
              <Select
                value={form.direction}
                onChange={(v) =>
                  handleChange("direction", v)
                }
                options={[
                  { label: "Thu", value: "in" },
                  { label: "Chi", value: "out" },
                ]}
              />
            </FormGroup>

            <FormGroup label="Danh mục">
              <Select
  key={form.category_id || "empty"}
  value={String(form.category_id || "")}
  onChange={(v) =>
    handleChange("category_id", String(v || ""))
  }
  options={categories.map((c) => ({
    label: c.category_name,
    value: String(c.id),
  }))}
/>
            </FormGroup>

            <FormGroup label="Số tiền">
              <MoneyInput
                value={form.amount}
                onChange={(v) =>
                  handleChange("amount", v)
                }
              />
            </FormGroup>

            <FormGroup label="Ngày">
              <Input
                type="date"
                value={form.transaction_date}
                onChange={(v) =>
                  handleChange("transaction_date", v)
                }
              />
            </FormGroup>

            <FormGroup label="Nội dung">
              <Input
                value={form.description}
                onChange={(v) =>
                  handleChange("description", v)
                }
              />
            </FormGroup>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t">
            <SecondaryButton onClick={onClose}>
              Huỷ
            </SecondaryButton>

            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}