"use client";

import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";
import SaveButton from "@/components/app/button/SaveButton";

type Props = {
  onSaveAll?: () => Promise<void>;
  saving?: boolean;
  disabled?: boolean;
};

export default function CustomersHeaderActions({
  onSaveAll,
  saving = false,
  disabled = false,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <PrimaryLinkButton href="/customers/groups">
        Nhóm khách hàng
      </PrimaryLinkButton>

      <SaveButton
        onClick={onSaveAll!}
        disabled={disabled || saving}
        label="Lưu Khách Hàng"
        loadingLabel="Đang lưu..."
      />
    </div>
  );
}