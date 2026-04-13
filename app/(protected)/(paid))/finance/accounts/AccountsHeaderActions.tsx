"use client";
import Link from "next/link";
import { useState } from "react";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

import AccountCreateModal from "./AccountCreateModal";

type Branch = {
  id: string;
  name: string;
  is_default: boolean;
};

type Props = {
  branches: Branch[];
};

export default function AccountsHeaderActions({
  branches,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        
<Link
  href="/finance/transactions"
  target="_blank"
  rel="noopener noreferrer"
>
  <SecondaryButton>
    Giao dịch tiền
  </SecondaryButton>
</Link>
        <PrimaryButton onClick={() => setOpen(true)}>
          + Thêm tài khoản
        </PrimaryButton>
      </div>

      <AccountCreateModal
        open={open}
        onClose={() => setOpen(false)}
        branches={branches}
      />
    </>
  );
}