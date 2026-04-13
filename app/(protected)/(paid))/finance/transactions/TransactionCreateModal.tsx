"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { textUI } from "@/ui-tokens";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import MoneyInput from "@/components/app/form/MoneyInput";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import TransactionCategoryCreateModal from "./TransactionCategoryCreateModal";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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

type Props = {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  defaultAccountId?: string;
};

/* ================= COMPONENT ================= */

export default function TransactionCreateModal({
  open,
  onClose,
  accounts,
  categories,
  defaultAccountId,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

const [form, setForm] = useState({
  account_id: "",
  category_id: "",
  direction: "in",
  amount: 0,
  description: "",
  transaction_date: today, // 🔥 mặc định hôm nay
});
  
  /* ================= SET DEFAULT ACCOUNT ================= */

useEffect(() => {
  if (accounts.length > 0 && !form.account_id) {
    let defaultAcc =
      accounts.find((a: any) => a.id === defaultAccountId) || // 👈 ưu tiên
      accounts.find((a: any) => a.is_default) ||
      accounts[0];

    setForm((prev) => ({
      ...prev,
      account_id: defaultAcc.id,
    }));
  }
}, [accounts, defaultAccountId]);


  const [openCreateCategory, setOpenCreateCategory] =
    useState(false);
  const [createName, setCreateName] = useState("");

  /* 🔥 LOCAL CATEGORY (QUAN TRỌNG) */
  const [localCategories, setLocalCategories] =
    useState(categories);

  /* sync khi server đổi */
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  /* ================= HANDLE ================= */

  function handleChange(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ================= RESET CATEGORY ================= */

  useEffect(() => {
    setForm((prev) => ({ ...prev, category_id: "" }));
  }, [form.direction]);

  /* ================= FILTER CATEGORY ================= */

  const filteredCategories = (localCategories || []).filter((c) =>
  form.direction === "in"
    ? c.category_type === "income"
    : c.category_type === "expense"
);

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
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
        "/api/finance/transactions/create",
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
        toast.error(data.error || "Tạo thất bại");
        return;
      }

      toast.success("Tạo giao dịch thành công");

      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  if (!open) return null;

  return (
    <>
      {/* ===== MAIN MODAL ===== */}
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8 overflow-auto">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-neutral-200">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div className={textUI.pageTitle}>
                Tạo giao dịch
              </div>

              <button onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="px-6 py-5 space-y-5">

              {/* ACCOUNT */}
              <FormGroup label="Tài khoản *">
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

              {/* DIRECTION */}
              <FormGroup label="Loại giao dịch">
                <Select
                  value={form.direction}
                  onChange={(v) =>
                    handleChange("direction", v)
                  }
                  options={[
                    { label: "Thu tiền", value: "in" },
                    { label: "Chi tiền", value: "out" },
                  ]}
                />
              </FormGroup>

              {/* CATEGORY */}
              <FormGroup label="Danh mục">
                <SearchableSelectBase
                  value={form.category_id}
                  onChange={(v) =>
                    handleChange("category_id", v)
                  }
                  options={filteredCategories.map((c) => ({
                    id: c.id,
                    label: c.category_name,
                  }))}
                  placeholder="Chọn danh mục"
                  searchable
                  creatable
                  onCreate={(name) => {
                    setCreateName(name);
                    setOpenCreateCategory(true);
                  }}
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

              {/* DESCRIPTION */}
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
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200">
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

      {/* ===== CREATE CATEGORY MODAL ===== */}
      <TransactionCategoryCreateModal
        open={openCreateCategory}
        onClose={() => setOpenCreateCategory(false)}
        defaultName={createName}
        direction={form.direction as "in" | "out"}
        onCreated={(newId) => {
          handleChange("category_id", newId);

          const newCategory = {
            id: newId,
            category_name: createName,
            category_type:
              form.direction === "in" ? "income" : "expense",
          };

          setLocalCategories((prev) => {
            const exists = prev.find((c) => c.id === newId);
            if (exists) return prev;
            return [...prev, newCategory];
          });

          router.refresh();
        }}
      />
    </>
  );
}