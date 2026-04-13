"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { textUI } from "@/ui-tokens";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import PhoneInput from "@/components/app/form/PhoneInput";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
/* ================= TYPES ================= */

type Branch = {
  id: string;
  name: string;
};

type Position = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  branches: Branch[];
  positions: Position[];
};

/* ================= COMPONENT ================= */

export default function SalaryStaffCreateModal({
  open,
  onClose,
  branches,
  positions,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
	birth_date: "", 
	join_date: "",
	id_number: "",  
    address: "",  
    position_id: "",
    branch_id: "",
    status: "active",
	 
  });

 const [localPositions, setLocalPositions] = useState(positions);
 
  /* ================= HANDLE ================= */

  function handleChange(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
  setForm({
    full_name: "",
    phone: "",
    birth_date: "",
    join_date: "",
    id_number: "",
    address: "",
    position_id: "",
    branch_id: "",
    status: "active",
  });
}

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!form.full_name.trim()) {
      toast.error("Vui lòng nhập tên nhân viên");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/salary/staff/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          full_name: form.full_name.trim(),
          phone: form.phone?.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Tạo thất bại");
        return;
      }

      toast.success("Tạo nhân viên thành công");

      resetForm();
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
      <div className="fixed inset-0 z-50">
        {/* BACKDROP */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => !loading && onClose()}
        />

        {/* MODAL */}
        <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8 overflow-auto">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-neutral-200">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div className={textUI.pageTitle}>
                Thêm nhân viên
              </div>

              <button
                onClick={() => !loading && onClose()}
                disabled={loading}
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
           <div className="px-6 py-5 space-y-4">

  {/* HÀNG 1 */}
  <div className="grid grid-cols-2 gap-4">
    <FormGroup label="Tên nhân viên *">
      <Input
        value={form.full_name}
        onChange={(v) => handleChange("full_name", v)}
        placeholder="Nhập tên nhân viên"
      />
    </FormGroup>

    <FormGroup label="Ngày sinh">
      <Input
        type="date"
        value={form.birth_date || ""}
        onChange={(v) => handleChange("birth_date", v)}
      />
    </FormGroup>
  </div>

  {/* HÀNG 2 */}
  <div className="grid grid-cols-2 gap-4">
    <FormGroup label="CCCD">
      <Input
        value={form.id_number}
        onChange={(v) => handleChange("id_number", v)}
        placeholder="Nhập CCCD"
      />
    </FormGroup>

    <FormGroup label="Số điện thoại">
      <PhoneInput
        value={form.phone}
        onChange={(v) => handleChange("phone", v)}
        placeholder="Nhập số điện thoại"
      />
    </FormGroup>
  </div>

  {/* HÀNG 3 */}
  <div className="grid grid-cols-2 gap-4">
    <FormGroup label="Chức vụ">
      <SearchableSelectBase
        value={form.position_id}
        onChange={(v) => handleChange("position_id", v)}
        placeholder="Chọn chức vụ"
        options={[
          ...localPositions.map((p) => ({
            id: p.id,
            label: p.name,
          })),
        ]}
        searchable
        creatable
        onCreate={async (name) => {
          const res = await fetch("/api/salary/positions/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.error);
            return;
          }

          setLocalPositions((prev) => [data.data, ...prev]);
          handleChange("position_id", data.data.id);
        }}
      />
    </FormGroup>

    <FormGroup label="Ngày vào làm">
      <Input
        type="date"
        value={form.join_date || ""}
        onChange={(v) => handleChange("join_date", v)}
      />
    </FormGroup>
  </div>

  {/* HÀNG 4 */}
  <div className="grid grid-cols-2 gap-4">
    <FormGroup label="Chi nhánh">
      <Select
        value={form.branch_id}
        onChange={(v) => handleChange("branch_id", v)}
        options={[
          { label: "Chọn chi nhánh", value: "" },
          ...branches.map((b) => ({
            label: b.name,
            value: b.id,
          })),
        ]}
      />
    </FormGroup>

    <FormGroup label="Trạng thái">
      <Select
        value={form.status}
        onChange={(v) => handleChange("status", v)}
        options={[
          { label: "Đang làm", value: "active" },
          { label: "Ngưng làm", value: "inactive" },
        ]}
      />
    </FormGroup>
  </div>

  {/* HÀNG 5 */}
  <FormGroup label="Địa chỉ">
    <Input
      value={form.address}
      onChange={(v) => handleChange("address", v)}
      placeholder="Nhập địa chỉ"
    />
  </FormGroup>

</div>



            {/* FOOTER */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200">
              <SecondaryButton
                onClick={onClose}
                disabled={loading}
              >
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
    </>
  );
}