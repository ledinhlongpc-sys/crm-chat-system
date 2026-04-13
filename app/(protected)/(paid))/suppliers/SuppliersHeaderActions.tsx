"use client";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import Link from "next/link";
export default function SuppliersHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      {/* NHÓM NHÀ CUNG CẤP */}
      <Link href="/suppliers/group">
  <PrimaryButton variant="outline">
    Nhóm nhà cung cấp
  </PrimaryButton>
</Link>

      {/* THÊM NHÀ CUNG CẤP */}
      <Link href="/suppliers/create">
  <PrimaryButton>
    + Thêm nhà cung cấp
  </PrimaryButton>
</Link>
    </div>
  );
}
