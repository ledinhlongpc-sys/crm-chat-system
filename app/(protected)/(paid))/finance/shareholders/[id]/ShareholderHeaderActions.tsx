"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";

import ShareholderEditModal from "./ShareholderEditModal";
import CapitalCreateModal from "./CapitalCreateModal";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

/* ================= TYPES ================= */
type Account = {
  id: string;
  account_name: string;
  is_default?: boolean;
};

type Branch = {
  id: string;
  name: string;
  branch_code?: string;
};

type Props = {
  id: string;
  branches: Branch[];
   shareholder: any; 
   accounts: Account[]; 
};


/* ================= COMPONENT ================= */

export default function ShareholderHeaderActions({
  id,
  branches,
   shareholder,
   accounts,
}: Props) {
  const router = useRouter();

  const [openEdit, setOpenEdit] = useState(false);
  const [openCapital, setOpenCapital] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);

      const res = await fetch(
        `/api/finance/shareholders/${id}/delete`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Xóa thất bại");
        return;
      }

      router.push("/finance/shareholders");
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
        <PrimaryButton onClick={() => setOpenCapital(true)}>
          + Góp vốn
        </PrimaryButton>

        <PrimaryButton onClick={() => setOpenEdit(true)}>
          Sửa
        </PrimaryButton>

        <DeleteButton onClick={() => setOpenDelete(true)} />
      </div>

      {/* ================= MODALS ================= */}

      <ShareholderEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        id={id}
        branches={branches} // ✅ KEY
		shareholder={shareholder} 
      />

      <CapitalCreateModal
        open={openCapital}
        onClose={() => setOpenCapital(false)}
        shareholderId={id}
		accounts={accounts}
      />

      <ConfirmModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        description="Xóa cổ đông này? Hành động không thể hoàn tác."
        danger
        onConfirm={handleDelete}
      />
    </>
  );
}