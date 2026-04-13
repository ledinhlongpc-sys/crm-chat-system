"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";
import ConfirmModal from "@/components/app/modal/ConfirmModal";
import TransactionEditModal from "./TransactionEditModal";

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
  amount: number;
  direction: "in" | "out";
  description: string | null;
  account_id: string;
  category_id: string | null;
  transaction_date: string;
};

type Props = {
  id: string;
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
};

/* ================= COMPONENT ================= */

export default function TransactionHeaderActions({
  id,
  transaction,
  accounts,
  categories,
}: Props) {
  const router = useRouter();

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);

      const res = await fetch(
        `/api/finance/transactions/${id}/delete`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Xóa thất bại");
        return;
      }

      router.push("/finance/transactions");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingDelete(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <div className="flex items-center gap-2">

        {/* ✅ FIX */}
        <PrimaryButton onClick={() => setOpenEdit(true)}>
          Sửa
        </PrimaryButton>

        <DeleteButton onClick={() => setOpenDelete(true)} />
      </div>

      {/* ================= EDIT ================= */}

      <TransactionEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        transaction={transaction}
        accounts={accounts}
        categories={categories}
      />

      {/* ================= DELETE ================= */}

      <ConfirmModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        description="Xóa giao dịch này? Hành động không thể hoàn tác."
        danger
        onConfirm={handleDelete}
      />
    </>
  );
}