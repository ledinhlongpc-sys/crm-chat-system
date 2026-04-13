"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

import OrderInvoiceEditModal from "./OrderInvoiceEditModal";

/* ================= TYPES ================= */

type Customer = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
};

type Invoice = {
  id: string;
  invoice_number: string | null;
  invoice_date: string;
  invoice_type: string;
  subtotal_amount: number;
  vat_amount: number;
  vat_rate: number;
  total_amount: number;
  is_vat: boolean;
  customer_id?: string | null;
  branch_id?: string | null;
  note?: string | null;
};

type Props = {
  id: string;
  invoice: Invoice;
  customers: Customer[];
  branches: Branch[];
};

/* ================= COMPONENT ================= */

export default function OrderInvoiceHeaderActions({
  id,
  invoice,
  customers,
  branches,
}: Props) {
  const router = useRouter();

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);

      const res = await fetch(
        `/api/finance/order-invoices/${id}/delete`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Xóa thất bại");
        return;
      }

      router.push("/finance/order-invoices");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingDelete(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <div className="flex items-center gap-2">

        <PrimaryButton onClick={() => setOpenEdit(true)}>
          Sửa
        </PrimaryButton>

        <DeleteButton onClick={() => setOpenDelete(true)} />
      </div>

      {/* ================= EDIT ================= */}

      <OrderInvoiceEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        invoice={invoice}
        customers={customers}
        branches={branches}
      />

      {/* ================= DELETE ================= */}

      <ConfirmModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        description="Xóa hóa đơn này? Hành động không thể hoàn tác."
        danger
        onConfirm={handleDelete}
      />
    </>
  );
}