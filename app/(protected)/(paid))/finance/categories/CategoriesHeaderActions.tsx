"use client";

import { useState } from "react";

import PrimaryButton from "@/components/app/button/PrimaryButton";

import CategoryCreateModal from "./CategoryCreateModal";

/* ================= COMPONENT ================= */

export default function CategoriesHeaderActions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <PrimaryButton onClick={() => setOpen(true)}>
          + Thêm danh mục
        </PrimaryButton>
      </div>

      <CategoryCreateModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}