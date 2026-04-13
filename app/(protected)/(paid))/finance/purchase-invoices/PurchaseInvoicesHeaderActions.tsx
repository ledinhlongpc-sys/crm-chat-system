"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

import PurchaseInvoiceCreateModal from "./PurchaseInvoiceCreateModal";

/* ================= TYPES ================= */

type Supplier = {
  id: string;
  supplier_name: string;
};

type Branch = {
  id: string;
  name: string;
  is_default?: boolean;
};

type Props = {
  suppliers: Supplier[];
  branches: Branch[];
};

/* ================= COMPONENT ================= */

export default function PurchaseInvoicesHeaderActions({
  suppliers,
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

        {/* 🔥 NÚT MỚI - NGƯỢC LẠI PAGE KIA */}
        <SecondaryButton
          onClick={() =>
            handleGo("/finance/order-invoices", "order")
          }
          disabled={loading === "order"}
        >
          {loading === "order"
            ? "Đang chuyển..."
            : "Hóa Đơn Đầu Ra"}
        </SecondaryButton>

        {/* CREATE (giữ nguyên modal) */}
        <PrimaryButton onClick={() => setOpen(true)}>
          + Tạo hóa đơn
        </PrimaryButton>
      </div>

      <PurchaseInvoiceCreateModal
        open={open}
        onClose={() => setOpen(false)}
        suppliers={suppliers}
        branches={branches}
      />
    </>
  );
}