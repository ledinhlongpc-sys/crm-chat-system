"use client";
import { useEffect } from "react";
import { useMemo, useState } from "react";
import { toInputDateTime } from "@/lib/helpers/date";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";

import EditSalesHeaderActions from "./EditSalesHeaderActions";

import CustomerBox, { Customer } from "./boxes/CustomerBox";
import EditSalesInfoBox, {
  Branch,
  Staff,
  SalesInfoDraft,
  OrderSource,
} from "./boxes/EditSalesInfoBox";

import EditSalesItemsBox, {
  SalesItem,
  MoneyBreakdown,
  SummaryDraft,
} from "./boxes/EditSalesItemsBox";

/* ================= TYPES ================= */

type Props = {
  order: any;
  items: SalesItem[];

  branches: Branch[];
  staffs: Staff[];
  orderSources: OrderSource[];
  
  addressV1: any;        
  addressV2: any;       
  customerGroups: any[]; 
  currentUserId: string;
   extraCosts: any[];
   payments: any[]; 
};

/* ================= COMPONENT ================= */

export default function EditSalesClient({
  order,
  items: initialItems,
  branches,
  staffs,
  orderSources,
  
  addressV1,
  addressV2,
  customerGroups,
  currentUserId,
  extraCosts,
   payments,
}: Props) {

  /* ================= INIT STATE ================= */

  const [customer, setCustomer] = useState<Customer | null>(() => {
  if (!order.customer) return null;

  return {
    ...order.customer,
    selected_address:
      order.customer.selected_address ??
      (order.address_snapshot
        ? { address_line: order.address_snapshot }
        : null),
  };
});
  const [salesInfo, setSalesInfo] = useState<SalesInfoDraft>({
    branch_id: order.branch_id ?? "",
    created_by: order.created_by ?? "",
   sale_date: toInputDateTime(order.sale_date),
  expected_delivery_at: toInputDateTime(order.expected_delivery_at),
    order_source: order.order_source ?? "",
  });
  
  
useEffect(() => {
  if (!order.created_by) return;
  if (!staffs?.length) return;

  const exists = staffs.find((s) => s.id === order.created_by);

  if (exists) {
    setSalesInfo((prev) => ({
      ...prev,
      created_by: order.created_by,
    }));
  }
}, [order.created_by, staffs]);


const [prevCustomerId, setPrevCustomerId] = useState<string | null>(order.customer_id ?? null);

useEffect(() => {
  if (!customer?.id) return;

  // 👉 chỉ reset khi đổi customer
  if (prevCustomerId && prevCustomerId !== customer.id) {
    setCustomer((prev) => ({
      ...prev!,
      selected_address: null,
    }));
  }

  setPrevCustomerId(customer.id);
}, [customer?.id]);



  const [items, setItems] = useState<SalesItem[]>(
    initialItems ?? []
  );

  const [totals, setTotals] = useState({
  total_quantity: order.total_quantity ?? 0,
  total_amount: order.subtotal_amount ?? 0,
});

  const [moneyBreakdown, setMoneyBreakdown] =
    useState<MoneyBreakdown | null>(null);

const [summaryDraft, setSummaryDraft] = useState<SummaryDraft>({
  note: order.note ?? "",

  /* 🔥 totals */
  totals: {
    total_quantity: order.total_quantity ?? 0,
    total_amount: order.subtotal_amount ?? 0,
  },

  breakdown: {
    total_quantity: order.total_quantity ?? 0,
    items_subtotal_amount: order.subtotal_amount ?? 0,
    items_discount_amount: 0,
    items_total_amount: order.subtotal_amount ?? 0,
  },

  /* 🔥 discount */
  orderDiscountValue: order.discount_amount ?? 0,
  orderDiscountType: "amount",
  orderDiscountAmount: order.discount_amount ?? 0,

  /* 🔥 costs */
  extraCosts: (extraCosts ?? []).map((c: any) => ({
    id: c.id,
    label: c.label,
    amount: c.amount,
  })),

  importCost: (extraCosts ?? []).reduce(
    (sum: number, c: any) => sum + (c.amount || 0),
    0
  ),

  /* 🔥 payments */
  payments: (payments ?? []).map((p: any) => ({
    method: p.method,
    amount: p.amount,
    note: p.note ?? null,
    paid_at: p.paid_at ?? null,
  })),

  paidAmount: (payments ?? []).reduce(
    (sum: number, p: any) => sum + (p.amount || 0),
    0
  ),

  /* 🔥 FINAL */
  grandTotal: order.total_amount ?? 0,
  remaining:
    (order.total_amount ?? 0) -
    (payments ?? []).reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    ),
});


  /* ================= BUILD PAYLOAD ================= */

  const buildPayload = useMemo(() => {
    return () => {
      if (!summaryDraft) return null;
      if (!items.length) return null;
	  
const address =
  customer?.selected_address ??
  customer?.default_address;

const address_snapshot: string | null =
  !customer?.id
    ? null
    : address && address.address_line
    ? [
        address.address_line,
        address.ward_name,
        address.district_name,
        address.province_name,
        address.commune_name,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

      return {
        id: order.id, // 🔥 quan trọng

        branch_id: salesInfo.branch_id,
        customer_id: customer?.id ?? null,
		
		 address_snapshot, 

        // ❌ KHÔNG dùng created_by từ order
        order_source: salesInfo.order_source,
        note: summaryDraft.note ?? null,
        expected_delivery_at: salesInfo.expected_delivery_at ?? null,

        order_discount_amount:
          summaryDraft.orderDiscountAmount ?? 0,

        /* ================= ITEMS ================= */
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
            unit_id: i.unit_conversion_id ?? null,
            factor_snapshot: i.factor ?? 1,
            base_quantity: qty * (i.factor ?? 1),
            sku_snapshot: i.sku,
            name_snapshot: i.unit_conversion_id
              ? i.unit_name
              : i.variant_name,
            quantity: qty,
            price: price,
            discount_value: i.discount_value ?? 0,
            discount_type: i.discount_type ?? "amount",
            discount_amount: unitDiscount,
            line_total: qty * unitAfter,
            cost_price_snapshot: i.cost_price_snapshot ?? 0,
          };
        }),

        /* ================= COSTS ================= */
        costs: (summaryDraft.extraCosts ?? [])
          .filter(
            (c) =>
              (c.label ?? "").trim() !== "" &&
              Number(c.amount) > 0
          )
          .map((c) => ({
            reason: c.label,
            amount: Number(c.amount),
          })),

        /* ================= PAYMENTS ================= */
        payments: (summaryDraft.payments ?? [])
          .filter(
            (p) =>
              (p.method ?? "").trim() !== "" &&
              Number(p.amount) > 0
          )
          .map((p) => ({
            method: p.method,
            amount: Number(p.amount),
            note: p.note ?? null,
            paid_at: p.paid_at ?? null,
          })),
      };
    };
  }, [order.id, customer, salesInfo, items, summaryDraft]);

  /* ================= VALID ================= */

  const canSave =
  !!salesInfo.branch_id &&
  items.length > 0 &&
  !!summaryDraft ;
  

  /* ================= RENDER ================= */

  return (
    <>
      <PageHeader
        title={`Sửa đơn: ${order.order_code}`}
        left={<BackButton href={`/orders/${order.order_code}`} />}
        right={
          <EditSalesHeaderActions
            onSave={buildPayload}
            canSave={canSave}
          />
        }
      />

      <div className={pageUI.contentWideTable}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

          <div className="xl:col-span-8 space-y-4">
            <CustomerBox
			  customerId={order.customer_id} 
              value={customer}
              onChange={setCustomer}
              staffs={staffs}
			   currentUserId={currentUserId}
  customerGroups={customerGroups}
  addressV1={addressV1} 
  addressV2={addressV2}
            />
          </div>

          <div className="xl:col-span-4 space-y-4">
            <EditSalesInfoBox
              branches={branches}
              staffs={staffs}
              value={salesInfo}
              onChange={setSalesInfo}
              orderSources={orderSources}
            />
          </div>
        </div>

      <EditSalesItemsBox
  branch_id={salesInfo.branch_id}
  items={items}
  onChange={setItems}
  onTotalsChange={setTotals}
  onMoneyBreakdownChange={setMoneyBreakdown}
  onSummaryChange={setSummaryDraft}
  initialSummary={summaryDraft} // 🔥 thêm dòng này
/>
      </div>
    </>
  );
}