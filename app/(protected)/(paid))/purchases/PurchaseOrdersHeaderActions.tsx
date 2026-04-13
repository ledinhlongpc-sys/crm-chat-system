"use client";

import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";

export default function PurchaseOrdersHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      {/* TẠO ĐƠN NHẬP */}
      <PrimaryLinkButton href="/purchases/create">
        + Tạo đơn nhập
      </PrimaryLinkButton>
    </div>
  );
}