"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";

import CreatePurchaseHeaderActions from "./CreatePurchaseHeaderActions";
import SupplierBox, { Supplier } from "./boxes/SupplierBox";
import PurchaseInfoBox, {
  Branch,
  Staff,
  PurchaseInfoDraft,
} from "./boxes/PurchaseInfoBox";

import PurchaseItemsBox, {
  PurchaseItem,
  MoneyBreakdown,
  SummaryDraft,
} from "./boxes/PurchaseItemsBox";

/* ================= TYPES ================= */

type Props = {
  suppliers: Supplier[];
  branches: Branch[];
  staffs: Staff[];
  currentUserId: string;
};

/* ================= COMPONENT ================= */

export default function CreatePurchaseClient({
  suppliers,
  branches,
  staffs,
  currentUserId,
}: Props) {
  const defaultBranch = branches.find((b) => b.is_default) || branches[0];

  const [supplier, setSupplier] = useState<Supplier | null>(null);

  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfoDraft>({
    branch_id: defaultBranch?.id ?? "",
    created_by: currentUserId ?? "",
    reference_code: null,
    order_date: new Date().toISOString().slice(0, 10),
  });

  const [items, setItems] = useState<PurchaseItem[]>([]);

  const [totals, setTotals] = useState({
    total_quantity: 0,
    total_amount: 0,
  });

  const [moneyBreakdown, setMoneyBreakdown] = useState<MoneyBreakdown | null>(
    null
  );

  // ✅ đây là nguồn sự thật cho costs/payments (đẩy lên từ PurchaseItemsBox)
  const [summaryDraft, setSummaryDraft] = useState<SummaryDraft | null>(null);

  /* ================= BUILD PAYLOAD ================= */

  const buildPayload = useMemo(() => {
    return () => {
      if (!supplier) return null;
      if (!summaryDraft) return null;

      return {
        /** ===== HEADER ===== */
        supplier_id: supplier.id,
        branch_id: purchaseInfo.branch_id,
        created_by: purchaseInfo.created_by,
        reference_code: purchaseInfo.reference_code,
        order_date: purchaseInfo.order_date,
        note: summaryDraft.note,

        subtotal_amount: summaryDraft.breakdown?.items_subtotal_amount ?? 0,
        discount_amount: summaryDraft.orderDiscountAmount ?? 0,

        // ✅ lấy đúng từ summaryDraft (vì payments/costs nằm trong PurchaseItemsBox)
        extra_cost_amount: summaryDraft.importCost ?? 0,
        total_amount: summaryDraft.grandTotal ?? 0,
        paid_amount: summaryDraft.paidAmount ?? 0,

        /** ===== ITEMS ===== */
        items: items.map((i) => {
          const qty = Number(i.quantity || 0);
          const price = Number(i.price || 0);

          const unitDiscount =
            i.discount_type === "amount"
              ? Number(i.discount_value || 0)
              : (price * Number(i.discount_value || 0)) / 100;

          const unitAfter = price - Math.min(unitDiscount, price);

          return {
            variant_id: i.variant_id,
            unit_conversion_id: i.unit_id,
            quantity: qty,
            cost_price: price,
            discount_amount: unitDiscount,
            price_after_discount: unitAfter,
            line_total: qty * unitAfter,
          };
        }),

        /** ===== COSTS (từ summaryDraft) ===== */
        costs: (summaryDraft.extraCosts ?? [])
          .filter((c) => (c.label ?? "").trim() !== "" && Number(c.amount) > 0)
          .map((c) => ({
            reason: c.label,
            amount: Number(c.amount || 0),
          })),

        /** ===== PAYMENTS (từ summaryDraft) ===== */
        payments: (summaryDraft.payments ?? [])
          .filter((p) => (p.method ?? "").trim() !== "" && Number(p.amount) > 0)
          .map((p) => ({
            method: p.method,
            amount: Number(p.amount || 0),
            note: p.note ?? null,
            paid_at: p.paid_at ?? null,
          })),
      };
    };
  }, [supplier, purchaseInfo, items, summaryDraft]);

  /* ================= VALIDATION ================= */

  const canSave =
    !!supplier &&
    !!purchaseInfo.branch_id &&
    !!purchaseInfo.created_by &&
    items.length > 0 &&
    !!summaryDraft; // ✅ phải có summaryDraft thì mới có costs/payments

  /* ================= RENDER ================= */

  return (
    <>
      <PageHeader
        title="Tạo đơn nhập hàng"
       
        left={<BackButton href="/purchases" />}
        right={
          <CreatePurchaseHeaderActions onSave={buildPayload} canSave={canSave} />
        }
      />

      <div className={pageUI.contentWideTable}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-6">
            <SupplierBox
              initialSuppliers={suppliers}
              value={supplier}
              onChange={setSupplier}
            />
          </div>

          <div className="xl:col-span-4 space-y-6">
            <PurchaseInfoBox
              branches={branches}
              staffs={staffs}
              currentUserId={currentUserId}
              value={purchaseInfo}
              onChange={setPurchaseInfo}
            />
          </div>
        </div>

        <PurchaseItemsBox
          branch_id={purchaseInfo.branch_id}
          items={items}
          onChange={setItems}
          onTotalsChange={setTotals}
          onMoneyBreakdownChange={setMoneyBreakdown}
          onSummaryChange={setSummaryDraft}
        />
      </div>
    </>
  );
}