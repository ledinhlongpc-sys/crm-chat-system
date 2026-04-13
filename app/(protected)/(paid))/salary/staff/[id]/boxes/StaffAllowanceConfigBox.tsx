"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import FormBox from "@/components/app/form/FormBox";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

import AllowanceConfigModal from "./AllowanceConfigModal";

import { textUI } from "@/ui-tokens";
import { Trash2 } from "lucide-react";

/* ================= TYPES ================= */

type Props = {
  items: any[];
  staff_id: string;
  itemTypes: any[];
  userType: string;        // 🔥 thêm
  staffStatus?: string;    // 🔥 thêm
};

/* ================= COMPONENT ================= */

export default function StaffAllowanceConfigBox({
  items,
  staff_id,
  itemTypes,
  userType,
  staffStatus,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ================= PERMISSION ================= */

  const canEdit = ["tenant", "admin", "manager", "accountant"].includes(userType);

  const canDelete = ["tenant", "admin"].includes(userType);

  const isInactive = staffStatus === "inactive";
  
  const [refreshKey, setRefreshKey] = useState(0);

  /* ================= DATA ================= */

  const allowanceItems = items.filter(
    (i) => i.type === "allowance"
  );

  const hasData = allowanceItems.length > 0;

  const total = allowanceItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  /* ================= DELETE ================= */

  async function handleDelete() {
    if (!deleteId) return;

    if (!canDelete) {
      alert("Bạn không có quyền xóa");
      return;
    }

    try {
      const res = await fetch("/api/salary/config-item/delete", {
        method: "POST",
        body: JSON.stringify({ id: deleteId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Lỗi");
        return;
      }

      setDeleteId(null);

      // 🔥 FIX: dùng router.refresh
      router.refresh();

    } catch (err) {
      alert("Lỗi hệ thống");
    }
  }

  /* ================= UI ================= */

  return (
    <>
      <FormBox
        title="Cấu hình phụ cấp"
        actions={
          <PrimaryButton
            size="sm"
            variant={hasData ? "outline" : "primary"}
            onClick={() => setOpen(true)}
            disabled={!canEdit || isInactive} // 🔥 FIX
          >
            {hasData ? "Cập nhật" : "+ Thêm"}
          </PrimaryButton>
        }
      >
        {!hasData ? (
          <div className={textUI.subtle}>
            Nhân viên này chưa có phụ cấp
          </div>
        ) : (
          <div className="space-y-2">

            {allowanceItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between group"
              >
                {/* LEFT */}
                <div className={textUI.body}>
                  {item.name}
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3">
                  
                  <div className={textUI.bodyStrong}>
                    {formatMoney(item.amount)}
                  </div>

                  {/* DELETE ICON */}
                  <button
                    onClick={() => setDeleteId(item.id)}
                    disabled={!canDelete}
                    className="opacity-0 group-hover:opacity-100 transition text-neutral-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            ))}

            {/* TOTAL */}
            <div className="flex items-center justify-between border-t pt-2 mt-2">
              <div className={textUI.label}>
                Tổng phụ cấp
              </div>
              <div className={textUI.bodyStrong}>
                {formatMoney(total)}
              </div>
            </div>

          </div>
        )}
      </FormBox>

      {/* ================= MODAL ADD ================= */}
      {canEdit && !isInactive && (
        <AllowanceConfigModal
          open={open}
          onClose={() => setOpen(false)}
          staff_id={staff_id}
          itemTypes={itemTypes}
		  onSuccess={() => router.refresh()}
        />
      )}

      {/* ================= CONFIRM DELETE ================= */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        danger
        description="Bạn có chắc muốn xóa phụ cấp này không?"
        confirmText="Xóa"
        confirmingText="Đang xóa..."
        onConfirm={handleDelete}
      />
    </>
  );
}

/* ================= HELPER ================= */

const formatMoney = (v?: number) =>
  v ? v.toLocaleString("vi-VN") + " đ" : "0 đ";