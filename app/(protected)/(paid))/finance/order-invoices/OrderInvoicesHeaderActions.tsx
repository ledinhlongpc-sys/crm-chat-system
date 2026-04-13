"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

import OrderInvoiceCreateModal from "./OrderInvoiceCreateModal";

/* ================= TYPES ================= */

type Customer = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
  is_default?: boolean;
};

type Props = {
  customers: Customer[];
  branches: Branch[];
};

/* ================= COMPONENT ================= */

export default function OrderInvoicesHeaderActions({
  customers,
  branches,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null); // 👈 thêm
  const router = useRouter();

  /* ================= NAV ================= */

  const handleGo = (path: string, key: string) => {
    setLoading(key);
    router.push(path);
  };

  return (
    <>
      <div className="flex items-center gap-2">

        {/* 🔥 NÚT MỚI (có loading) */}
        <SecondaryButton
          onClick={() =>
            handleGo("/finance/purchase-invoices", "purchase")
          }
          disabled={loading === "purchase"}
        >
          {loading === "purchase"
            ? "Đang chuyển..."
            : "Hóa Đơn Đầu Vào"}
        </SecondaryButton>

        {/* CREATE (giữ nguyên modal) */}
        <PrimaryButton onClick={() => setOpen(true)}>
          + Tạo hóa đơn
        </PrimaryButton>
      </div>

      <OrderInvoiceCreateModal
        open={open}
        onClose={() => setOpen(false)}
        customers={customers}
        branches={branches}
      />
    </>
  );
}