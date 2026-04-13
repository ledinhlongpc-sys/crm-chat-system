// app/(protected)/(paid)/customers/[customer_code]/CustomersViewHeaderActions.tsx

"use client";

import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";

type Props = {
  customerCode: string;
};

export default function CustomersViewHeaderActions({
  customerCode,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <PrimaryLinkButton href="/customers/group">
        Nhóm khách hàng
      </PrimaryLinkButton>

      <PrimaryLinkButton
        href={`/customers/${customerCode}/edit`}
      >
        Chỉnh sửa
      </PrimaryLinkButton>
    </div>
  );
}
