"use client";

import { useState } from "react";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SalaryAdvanceCreateModal from "./SalaryAdvanceCreateModal";

type Staff = {
  id: string;
  full_name: string;
};

type Props = {
  staffs: Staff[];
};

export default function SalaryAdvanceHeaderActions({ staffs }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>
        Thêm tạm ứng
      </PrimaryButton>

      <SalaryAdvanceCreateModal
        open={open}
        onClose={() => setOpen(false)}
        staffs={staffs}
      />
    </>
  );
}