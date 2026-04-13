"use client";

import { useState } from "react";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import AllowanceTypeCreateModal from "./AllowanceTypeCreateModal";

export default function AllowanceTypeHeaderActions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>
        Thêm phụ cấp
      </PrimaryButton>

      <AllowanceTypeCreateModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}