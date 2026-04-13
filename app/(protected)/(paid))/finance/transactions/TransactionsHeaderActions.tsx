"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import BackButton from "@/components/app/button/BackButton";

import TransactionCreateModal from "./TransactionCreateModal";

/* ================= TYPES ================= */

type Account = {
  id: string;
  account_name: string;
};

type Category = {
  id: string;
  category_name: string;
  category_type: string;
};

type Props = {
  accounts: Account[];
  categories: Category[];
};

/* ================= COMPONENT ================= */

export default function TransactionsHeaderActions({
  accounts,
  categories,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        
       <SecondaryButton
  size="sm"
  onClick={() => {
    window.open("/finance/capital", "_blank");
  }}
>
  + Góp vốn CP
</SecondaryButton>

        {/* CREATE */}
        <PrimaryButton onClick={() => setOpen(true)}>
          + Tạo giao dịch
        </PrimaryButton>
      </div>

      <TransactionCreateModal
        open={open}
        onClose={() => setOpen(false)}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}