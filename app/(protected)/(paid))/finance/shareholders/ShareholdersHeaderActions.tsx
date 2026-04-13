"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

import ShareholderCreateModal from "./ShareholderCreateModal";

type Branch = {
  id: string;
  name: string;
  branch_code?: string;
  is_default?: boolean;
};

type Props = {
  branches: Branch[];
};

export default function ShareholdersHeaderActions({
  branches,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loadingGoCapital, setLoadingGoCapital] = useState(false); // 👈 NEW

  const handleGoCapital = () => {
    setLoadingGoCapital(true);

    // 👉 delay nhỏ để thấy loading (UX mượt hơn)
    setTimeout(() => {
      router.push("/finance/capital");
    }, 100);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <SecondaryButton
          onClick={handleGoCapital}
          disabled={loadingGoCapital}
        >
          {loadingGoCapital ? "Đang chuyển..." : "Giao dịch góp vốn"}
        </SecondaryButton>

        <PrimaryButton onClick={() => setOpen(true)}>
          + Thêm cổ đông
        </PrimaryButton>
      </div>

      <ShareholderCreateModal
        open={open}
        onClose={() => setOpen(false)}
        branches={branches}
      />
    </>
  );
}