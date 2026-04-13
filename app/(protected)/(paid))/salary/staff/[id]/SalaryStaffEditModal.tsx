"use client";

import { useEffect, useState } from "react";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

import { textUI } from "@/ui-tokens";

import toast from "react-hot-toast";

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

  branch?: Branch | null;
  position?: Position | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  staff: Staff;
  branches?: Branch[];
  positions?: Position[];
  userType: string;
};

/* ================= COMPONENT ================= */

export default function SalaryStaffEditModal({
  open,
  onClose,
  staff,
  branches = [],
  positions = [],
  userType,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");

  const [branchId, setBranchId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [status, setStatus] = useState("active");
  const canEditJoinDate = ["tenant", "admin", "manager"].includes(userType);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!staff) return;

    setFullName(staff.full_name || "");
    setPhone(staff.phone || "");
    setBirthDate(staff.birth_date || "");
    setJoinDate(staff.join_date || "");
    setIdNumber(staff.id_number || "");
    setAddress(staff.address || "");

    setBranchId(staff.branch?.id || "");
    setPositionId(staff.position?.id || "");
    setStatus(staff.status || "active");
  }, [staff]);

  if (!open) return null;

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!fullName.trim()) {
      toast.error("Nhập tên nhân viên");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/salary/staff/${staff.id}/update`,
        {
          method: "PUT",
          body: JSON.stringify({
            full_name: fullName,
            phone,
            birth_date: birthDate,
            join_date: joinDate,
            id_number: idNumber,
            address,
            branch_id: branchId,
            position_id: positionId,
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Cập nhật thất bại");
        return;
      }

      toast.success("Đã cập nhật nhân viên");

      onClose();
      location.reload(); // 🔥 đơn giản nhất cho anh
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-5 w-full max-w-lg">

        <div className={textUI.pageTitle}>
          Cập nhật nhân viên
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* LEFT */}
          <FormGroup label="Tên nhân viên">
            <Input value={fullName} onChange={setFullName} />
          </FormGroup>

          <FormGroup label="SĐT">
            <Input value={phone} onChange={setPhone} />
          </FormGroup>

          <FormGroup label="Ngày sinh">
            <Input
              type="date"
              value={birthDate}
              onChange={setBirthDate}
            />
          </FormGroup>

          <FormGroup label="CCCD">
            <Input value={idNumber} onChange={setIdNumber} />
          </FormGroup>

          {/* RIGHT */}
          <FormGroup label="Chức vụ">
            <Select
              value={positionId}
              onChange={setPositionId}
              options={[
                { value: "", label: "Chọn chức vụ" },
                ...positions.map((p) => ({
                  value: p.id,
                  label: p.name,
                })),
              ]}
            />
          </FormGroup>

          <FormGroup label="Chi nhánh">
            <Select
              value={branchId}
              onChange={setBranchId}
              options={[
                { value: "", label: "Chọn chi nhánh" },
                ...branches.map((b) => ({
                  value: b.id,
                  label: b.name,
                })),
              ]}
            />
          </FormGroup>

          <FormGroup label="Ngày vào làm">
  {canEditJoinDate ? (
    <Input
      type="date"
      value={joinDate}
      onChange={setJoinDate}
    />
  ) : (
    <div className="h-10 flex items-center px-3 border rounded-lg bg-neutral-50 text-neutral-600">
      {joinDate
        ? new Date(joinDate).toLocaleDateString("vi-VN")
        : "-"}
    </div>
  )}
</FormGroup>

          <FormGroup label="Trạng thái">
            <Select
              value={status}
              onChange={setStatus}
              options={[
                { value: "active", label: "Đang làm" },
                { value: "inactive", label: "Ngưng làm" },
              ]}
            />
          </FormGroup>

        </div>

        {/* ADDRESS full row */}
        <div className="mt-4">
          <FormGroup label="Địa chỉ">
            <Input value={address} onChange={setAddress} />
          </FormGroup>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 mt-5">
          <SecondaryButton onClick={onClose}>
            Huỷ
          </SecondaryButton>

          <PrimaryButton onClick={handleSubmit} disabled={loading}>
            Lưu
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}