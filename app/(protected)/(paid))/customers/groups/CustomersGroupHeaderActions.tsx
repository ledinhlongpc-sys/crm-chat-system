// app/(protected)/(paid)/customers/group/CustomersGroupHeaderActions.tsx

"use client";

import PrimaryButton from "@/components/app/button/PrimaryButton";

type Props = {
  onCreate: () => void;
};

export default function CustomersGroupHeaderActions({
  onCreate,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <PrimaryButton onClick={onCreate}>
         Thêm nhóm khách hàng
      </PrimaryButton>
    </div>
  );
}
