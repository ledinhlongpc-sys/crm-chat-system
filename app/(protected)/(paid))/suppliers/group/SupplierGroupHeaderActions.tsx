"use client";

import Link from "next/link";
import PrimaryButton from "@/components/app/button/PrimaryButton";

export default function SupplierGroupHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      {/* NHÀ CUNG CẤP */}
      <Link href="/suppliers">
        <PrimaryButton variant="outline">
          Nhà cung cấp
        </PrimaryButton>
      </Link>

      {/* THÊM NHÓM */}
      <Link href="/suppliers/group/create">
        <PrimaryButton>
          + Thêm nhóm nhà cung cấp
        </PrimaryButton>
      </Link>
    </div>
  );
}