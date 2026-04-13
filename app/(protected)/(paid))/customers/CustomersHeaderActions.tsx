//app/(protected)/(paid)/customers/group/CustomersHeaderActions.tsx

"use client";

import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";

export default function CustomersHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      
      <PrimaryLinkButton href="/customers/groups">
        Nhóm khách hàng
      </PrimaryLinkButton>

      <PrimaryLinkButton href="/customers/create">
        + Thêm khách hàng
      </PrimaryLinkButton>

    </div>
  );
}
