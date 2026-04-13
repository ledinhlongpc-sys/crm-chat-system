// app/(protected)/(paid)/products/Brand/BrandHeaderActions.tsx

"use client";

import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";

export default function BrandHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      {/* THÊM NHÃN HIỆU */}
      <PrimaryLinkButton href="/products/brands/create">
        + Thêm nhãn hiệu
      </PrimaryLinkButton>
    </div>
  );
}
