"use client";

import { useState } from "react";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import CapitalCreateModal from "./CapitalCreateModal";

/* ================= TYPES ================= */

type Account = {
  id: string;
  account_name: string;
  is_default?: boolean;
};

type Shareholder = {
  id: string;
  shareholder_name: string;
};

type Props = {
  accounts: Account[];
  shareholders: Shareholder[];
};

/* ================= COMPONENT ================= */

export default function CapitalHeaderActions({
  accounts,
  shareholders,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ACTION BUTTON */}
      <div className="flex gap-2">
        <PrimaryButton onClick={() => setOpen(true)}>
          + Giao dịch góp vốn
        </PrimaryButton>
      </div>

      {/* MODAL */}
      <CapitalCreateModal
        open={open}
        onClose={() => setOpen(false)}
        accounts={accounts}
        shareholders={shareholders}
      />
    </>
  );
}