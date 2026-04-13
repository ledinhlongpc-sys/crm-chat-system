"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";
import PurchaseWarehouseStatusBox from "./boxes/PurchaseWarehouseStatusBox";
import PurchasePaymentStatusBox from "./boxes/PurchasePaymentStatusBox";
import PurchaseDetailHeaderActions from "./PurchaseDetailHeaderActions";
import PurchasePaymentModal from "./boxes/PurchasePaymentModal";
import SupplierBox, { Supplier } from "./boxes/SupplierBox";
import PurchaseInfoBox, { Branch, Staff } from "./boxes/PurchaseInfoBox";

import PurchaseItemsBox, { PurchaseItem } from "./boxes/PurchaseItemsBox";

/* ================= TYPES ================= */

type PurchaseFull = {
  order: any;
  supplier: any;
  branch: any;
  created_by_user: any;
  items: any[];
  costs: any[];
  payments: any[];
} | null;

type Props = {
  orderCode: string;
  initialData: PurchaseFull;
  suppliers: Supplier[];
  branches: Branch[];
  staffs: Staff[];
  currentUserId: string;
};

function num(n: any) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

/* ================= COMPONENT ================= */

export default function PurchaseDetailClient({
  orderCode,
  initialData,
  suppliers,
  branches,
  staffs,
  currentUserId,
}: Props) {
  const hasData = !!initialData?.order;

  /* ================= SUPPLIER ================= */
  const router = useRouter();

  const supplierValue: Supplier | null = useMemo(() => {
    if (!initialData?.supplier) return null;

    return {
      id: initialData.supplier.id,
      name:
        initialData.supplier.supplier_name ??
        initialData.supplier.name ??
        "",
      phone: initialData.supplier.phone ?? null,
      address: initialData.supplier.address ?? null,
      current_debt: num(initialData.supplier.current_debt),
      total_purchase: num(initialData.supplier.total_purchase),
      total_return: num(initialData.supplier.total_return),
      total_purchase_count: num(
        initialData.supplier.total_purchase_count
      ),
      total_return_count: num(
        initialData.supplier.total_return_count
      ),
    };
  }, [initialData]);

  /* ================= PURCHASE INFO ================= */

  const purchaseInfoValue = useMemo(() => {
    const o = initialData?.order;

    return {
      branch_id: o?.branch_id ?? "",
      created_by: o?.created_by ?? currentUserId ?? "",
      reference_code: o?.reference_code ?? null,
      order_date: (
        o?.order_date ??
        o?.created_at ??
        new Date().toISOString()
      )
        .toString()
        .slice(0, 10),
    };
  }, [initialData, currentUserId]);

  /* ================= ITEMS (FIX CHÍNH Ở ĐÂY) ================= */
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  const itemsValue: PurchaseItem[] = useMemo(() => {
    const rows = initialData?.items ?? [];

    return rows.map((r: any) => ({
      key:
        r.id ??
        `${r.variant_id}-${r.unit_conversion_id ?? "base"}`,
		product_id: r.product_id ?? "", 

      variant_id: r.variant_id ?? "",
      unit_id: r.unit_conversion_id ?? null,

      product_name: r.variant_name ?? "",   // backend đang trả variant_name
      variant_name: "",                     // không cần nữa
      sku: r.sku ?? "",
      image: r.image_url ?? null,
      unit_name: r.unit_name ?? "",

      quantity: num(r.quantity),
      price: num(r.cost_price),             // dùng cost_price
      discount_amount: num(r.discount_amount),
      line_total: num(r.line_total),        // 🔥 quan trọng

    }));
  }, [initialData]);

  /* ================= SUMMARY ================= */

  const viewTotals = useMemo(() => {
    const o = initialData?.order;

    return {
      total_quantity: num(
        o?.total_quantity ?? o?.total_items_qty
      ),
      total_amount: num(
        o?.items_total_amount ??
          o?.items_amount ??
          o?.subtotal_amount ??
          o?.items_subtotal_amount
      ),
    };
  }, [initialData]);

  const orderDiscountAmount = useMemo(
    () => num(initialData?.order?.discount_amount),
    [initialData]
  );

  const importCost = useMemo(
    () =>
      num(
        initialData?.order?.extra_cost_amount ??
          initialData?.order?.import_cost_amount
      ),
    [initialData]
  );

  const paidAmount = useMemo(
    () => num(initialData?.order?.paid_amount),
    [initialData]
  );

  const grandTotal = useMemo(
    () =>
      num(
        initialData?.order?.total_amount ??
          initialData?.order?.grand_total
      ),
    [initialData]
  );

  const remaining = useMemo(() => {
    const o = initialData?.order;
    const dbRemaining =
      o?.remaining_amount ?? o?.remaining ?? null;

    return dbRemaining != null
      ? num(dbRemaining)
      : Math.max(0, grandTotal - paidAmount);
  }, [initialData, grandTotal, paidAmount]);

  const extraCosts = useMemo(
    () =>
      (initialData?.costs ?? []).map((c: any) => ({
        id: c.id ?? crypto.randomUUID(),
        label: c.reason ?? "",
        amount: num(c.amount),
      })),
    [initialData]
  );

  const payments = useMemo(
  () =>
    (initialData?.payments ?? []).map((p: any) => ({
      id: p.id,
      method: p.method ?? "cash",
      amount: num(p.amount),
      note: p.note ?? null,
      paid_at: p.paid_at ?? null,
      created_by_name:
        p.created_by_user?.full_name ??
        p.created_by_user?.name ??
        null,
    })),
  [initialData]
);

  const headerRight = (
  <PurchaseDetailHeaderActions
    status={initialData?.order?.status}
    orderId={initialData?.order?.id}
    orderCode={orderCode}
  />
);

  if (!hasData) {
    return (
      <>
        <PageHeader
  title={`Chi tiết đơn nhập hàng - ${orderCode}`}
  description="Không tìm thấy đơn nhập hoặc bạn không có quyền truy cập"
  left={<BackButton href="/purchases" />}
/>
        <div className={pageUI.contentWideTable}>
          <div className="text-sm text-neutral-600">
            Mã đơn:{" "}
            <span className="font-medium">
              {orderCode}
            </span>
          </div>
        </div>
      </>
    );
  }

return (
  <>
    <PageHeader
  title={`Chi tiết đơn nhập hàng - ${orderCode}`}
  left={<BackButton href="/purchases" />}
  right={headerRight}
/>

    <div className={pageUI.contentWideTable}>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <SupplierBox
            initialSuppliers={suppliers}
            value={supplierValue}
            onChange={() => {}}
            readOnly
          />
        </div>

        <div className="xl:col-span-4 space-y-6">
          <PurchaseInfoBox
            branches={branches}
            staffs={staffs}
            value={purchaseInfoValue}
          
          />
        </div>
      </div>

<PurchaseWarehouseStatusBox
  status={initialData?.order?.status}
  orderCode={orderCode}
  orderDate={initialData?.order?.created_at}
  onPrint={() => {}}
  onComplete={async () => {
    const res = await fetch(
      `/api/purchases/${initialData?.order?.id}/complete`,
      { method: "POST" }
    );

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Nhập kho thất bại");
    }

    // reload lại data server component
    router.refresh();
  }}
/>

      <PurchasePaymentStatusBox
        paidAmount={paidAmount}
        grandTotal={grandTotal}
		payments={payments}
        onPay={() => setOpenPaymentModal(true)}
      />

      <PurchaseItemsBox
  items={itemsValue}
  note={initialData?.order?.note ?? ""}
  totals={viewTotals}
  orderDiscountAmount={orderDiscountAmount}
  importCost={importCost}
  paidAmount={paidAmount}
  grandTotal={grandTotal}
  remaining={remaining}
  extraCosts={extraCosts}
  payments={payments}
/>
    </div>

    {openPaymentModal && (
      <PurchasePaymentModal
  open={openPaymentModal}
  onClose={() => setOpenPaymentModal(false)}
  defaultAmount={remaining}
  onSubmit={async (data) => {
    const res = await fetch(
      `/api/purchases/${initialData?.order?.id}/payments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Thanh toán thất bại");
    }

    // reload lại dữ liệu
    router.refresh();
  }}
/>
    )}
  </>
);
}