"use client";

import { useState } from "react";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SalaryPenaltyCreateModal from "./SalaryPenaltyCreateModal";

type Staff = {
  id: string;
  full_name: string;
};

type Props = {
  staffs: Staff[];
};

export default function SalaryPenaltyHeaderActions({ staffs }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>
        Thêm phiếu phạt
      </PrimaryButton>

      <SalaryPenaltyCreateModal
        open={open}
        onClose={() => setOpen(false)}
        staffs={staffs}
      />
    </>
  );
}