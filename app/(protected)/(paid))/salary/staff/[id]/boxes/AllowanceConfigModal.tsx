"use client";

import { useEffect, useState } from "react";

import FormGroup from "@/components/app/form/FormGroup";
import Select from "@/components/app/form/Select";
import MoneyInput from "@/components/app/form/MoneyInput";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

import { textUI } from "@/ui-tokens";
import toast from "react-hot-toast";

type ItemType = {
  id: string;
  name: string;
  type: "allowance" | "penalty";
};

type Props = {
  open: boolean;
  onClose: () => void;
  staff_id: string;

  itemTypes: ItemType[]; // 🔥 danh sách loại phụ cấp/phạt
  item?: any | null; // 🔥 edit
   onSuccess?: () => void;
};

export default function AllowanceConfigModal({
  open,
  onClose,
  staff_id,
  itemTypes,
  item,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [typeId, setTypeId] = useState("");
  const [amount, setAmount] = useState("0");

  const isEdit = !!item;
  const [localItemTypes, setLocalItemTypes] = useState(itemTypes);
  

  /* ================= LOAD ================= */
useEffect(() => {
  setLocalItemTypes(itemTypes);
}, [itemTypes]);

  useEffect(() => {
    if (!open) return;

    if (item) {
      setTypeId(item.item_type_id);
      setAmount(String(item.amount || 0));
      return;
    }

    setTypeId("");
    setAmount("0");
  }, [item, open]);

  if (!open) return null;

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (loading) return;

    if (!typeId) {
      toast.error("Chọn loại phụ cấp");
      return;
    }

    if (Number(amount) <= 0) {
      toast.error("Nhập số tiền");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/salary/config-item/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item?.id,
          staff_id,
          item_type_id: typeId,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

if (!res.ok) {
  toast.error(data.error || "Lưu thất bại");
  return;
}

toast.success(isEdit ? "Đã cập nhật" : "Đã thêm phụ cấp");

// 🔥 reload data ở parent
onSuccess?.();

// 🔥 đóng modal
onClose();
    } finally {
      setLoading(false);
    }
  }

  /* ================= OPTIONS ================= */

  const options = [
    { value: "", label: "Chọn loại" },
    ...itemTypes.map((t) => ({
      value: t.id,
      label: `${t.name} (${t.type === "allowance" ? "Phụ cấp" : "Phạt"})`,
    })),
  ];

async function handleCreateType(name: string) {
  try {
    const res = await fetch("/api/salary/item-type/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        type: "allowance",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Tạo thất bại");
      return;
    }

    toast.success("Đã tạo loại");

  setLocalItemTypes((prev) => {
  const exists = prev.some((p) => p.id === data.id);

  if (exists) {
    return prev.map((p) =>
      p.id === data.id
        ? {
            ...p,
            name: data.name,
            type: data.type,
          }
        : p
    );
  }

  return [
    ...prev,
    {
      id: data.id,
      name: data.name,
      type: data.type,
    },
  ];
});

    return data.id; // 🔥 để auto select

  } catch (err) {
    toast.error("Lỗi tạo loại");
  }
}
  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5">

        <div className={textUI.pageTitle}>
          {isEdit ? "Cập nhật phụ cấp" : "Thêm phụ cấp"}
        </div>

        <div className="mt-4 space-y-4">

          <FormGroup label="Loại phụ cấp / phạt">
           <SearchableSelectBase
  value={typeId}
  options={localItemTypes.map((t) => ({
    id: t.id,
    label: `${t.name} (${t.type === "allowance" ? "Phụ cấp" : "Phạt"})`,
  }))}
  placeholder="Chọn loại phụ cấp"
  searchable
  creatable
  onChange={setTypeId}
  onCreate={handleCreateType}
/>
          </FormGroup>

          <FormGroup label="Số tiền">
            <MoneyInput
              value={Number(amount || 0)}
              onChange={(v) => setAmount(String(v))}
            />
          </FormGroup>

        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 mt-5">
          <SecondaryButton onClick={onClose} disabled={loading}>
            Huỷ
          </SecondaryButton>

          <PrimaryButton
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? isEdit
                ? "Đang cập nhật..."
                : "Đang thêm..."
              : isEdit
                ? "Cập nhật"
                : "Thêm"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}