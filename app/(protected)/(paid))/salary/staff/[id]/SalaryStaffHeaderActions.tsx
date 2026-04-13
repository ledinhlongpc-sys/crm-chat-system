"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

import SalaryStaffEditModal from "./SalaryStaffEditModal";

/* ================= TYPES ================= */

type Branch = {
  id: string;
  name: string;
};

type Position = {
  id: string;
  name: string;
};

type Staff = {
  id: string;
  full_name: string;
  phone?: string | null;
  birth_date?: string | null;
  join_date?: string | null;
  id_number?: string | null;
  address?: string | null;
  status?: string | null;

  position?: Position | null;
  branch?: Branch | null;
};

type Props = {
  id: string;
  staff: Staff;
  branches: Branch[];
  positions: Position[];
  userType: string;
};

/* ================= COMPONENT ================= */

export default function SalaryStaffHeaderActions({
  id,
  staff,
  branches,
  positions,
  userType,
}: Props) {
  const router = useRouter();

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  /* ================= PERMISSION ================= */

  const canEdit = ["tenant", "admin", "manager", "accountant"].includes(userType);

  const canDelete = ["tenant", "admin"].includes(userType); // 🔥 FIX

  const isInactive = staff.status === "inactive";

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);

      const res = await fetch(`/api/salary/staff/${id}/delete`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Xóa thất bại");
        return;
      }

      // 🔥 phân biệt message backend
      if (data.type === "inactivated") {
        alert("Nhân viên đã có lương → chuyển sang trạng thái nghỉ");
      } else {
        alert("Đã xóa nhân viên");
      }

      router.refresh(); // 🔥 tốt hơn push
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
        <PrimaryButton
          onClick={() => setOpenEdit(true)}
          disabled={!canEdit || isInactive}
        >
          Sửa
        </PrimaryButton>

        <DeleteButton
          onClick={() => setOpenDelete(true)}
          disabled={!canDelete || loadingDelete}
        />
      </div>

      <SalaryStaffEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        staff={staff}
        userType={userType}
        branches={branches}
        positions={positions}
      />

      <ConfirmModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        description={
          isInactive
            ? "Nhân viên đã nghỉ. Bạn có chắc muốn xóa?"
            : "Xóa nhân viên này? Nếu đã có lương sẽ chuyển sang nghỉ."
        }
        danger
        onConfirm={handleDelete}
      />
    </>
  );
}