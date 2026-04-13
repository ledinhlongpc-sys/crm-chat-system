"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

import AccountEditModal from "./AccountEditModal";
import TransactionCreateModal from "../../transactions/TransactionCreateModal";

/* ================= TYPES ================= */

type Branch = {
  id: string;
  name: string;
};

type Props = {
  id: string;
  branches: Branch[];
  account: any;
  categories: any[]; // 👈 THÊM
  
};

/* ================= COMPONENT ================= */

export default function AccountHeaderActions({
  id,
  branches,
  account,
  categories, // 👈 NHẬN
}: Props) {
  const router = useRouter();

  const [openEdit, setOpenEdit] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);

      const res = await fetch(
        `/api/finance/accounts/${id}/delete`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Xóa thất bại");
        return;
      }

      router.push("/finance/accounts");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingDelete(false);
      setOpenDelete(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <div className="flex items-center gap-2">

        {/* 👉 GIAO DỊCH */}
        <PrimaryButton onClick={() => setOpenTransaction(true)}>
          + Giao dịch
        </PrimaryButton>

        {/* 👉 EDIT */}
        <PrimaryButton onClick={() => setOpenEdit(true)}>
          Sửa
        </PrimaryButton>

        {/* 👉 DELETE */}
        <DeleteButton
          onClick={() => setOpenDelete(true)}
          disabled={loadingDelete}
        />
      </div>

      {/* ================= MODALS ================= */}

      <AccountEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        id={id}
        branches={branches}
        account={account}
      />

      {/* 🔥 FIX CHÍNH Ở ĐÂY */}
      <TransactionCreateModal
        open={openTransaction}
        onClose={() => setOpenTransaction(false)}
        accounts={[account]}
        categories={categories} // 👈 QUAN TRỌNG
        defaultAccountId={account.id}
      />

      <ConfirmModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        description="Xóa tài khoản này? Hành động không thể hoàn tác."
        danger
        onConfirm={handleDelete}
      />
    </>
  );
}