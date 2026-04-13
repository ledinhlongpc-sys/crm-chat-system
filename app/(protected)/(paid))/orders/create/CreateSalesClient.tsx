"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";
import { getNowVietnamForInput } from "@/lib/utils/date";

import CreateSalesHeaderActions from "./CreateSalesHeaderActions";
import CustomerBox, { Customer } from "./boxes/CustomerBox";
import SalesInfoBox, { Branch, Staff, SalesInfoDraft, OrderSource } from "./boxes/SalesInfoBox";

import SalesItemsBox, { SalesItem, MoneyBreakdown, SummaryDraft } from "./boxes/SalesItemsBox";

/* ================= TYPES ================= */

// dùng cho modal tạo nhanh
type AddressOption = { code: string; name: string };
type AddressProvincesOnly = { provinces: AddressOption[] };

type CustomerGroup = {
  id: string;
  name: string;
};

type Props = {
  branches: Branch[];
  staffs: Staff[];
  currentUserId: string;
  orderSources: OrderSource[];

  /** ===== modal create customer ===== */
  customerGroups: CustomerGroup[];
  addressV1: AddressProvincesOnly;
  addressV2: AddressProvincesOnly;
};

/* ================= COMPONENT ================= */

export default function CreateSalesClient({
  branches,
  staffs,
  currentUserId,
  orderSources,
  customerGroups,
  addressV1,
  addressV2,
}: Props) {
  const defaultBranch = branches.find((b) => b.is_default) || branches[0];

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [salesInfo, setSalesInfo] = useState<SalesInfoDraft>({
  branch_id: defaultBranch?.id ?? "",
  created_by: currentUserId ?? "",
  sale_date: getNowVietnamForInput(),
  expected_delivery_at: undefined,
  order_source: "",  
});

  const [items, setItems] = useState<SalesItem[]>([]);

  const [totals, setTotals] = useState({
    total_quantity: 0,
    total_amount: 0,
  });

  const [moneyBreakdown, setMoneyBreakdown] = useState<MoneyBreakdown | null>(null);

  const [summaryDraft, setSummaryDraft] = useState<SummaryDraft | null>(null);

  /* ================= BUILD PAYLOAD ================= */

const address = customer?.selected_address;

const address_snapshot =
  address && address.address_line
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
  
  /* ================= BUILD PAYLOAD ================= */

const buildPayload = useMemo(() => {
  return () => {
    if (!summaryDraft) return null;
    if (!items.length) return null;

    return {
      branch_id: salesInfo.branch_id,
      customer_id: customer?.id ?? null,
      created_by: salesInfo.created_by,
      order_source: salesInfo.order_source,
      note: summaryDraft.note ?? null,
      sale_date: salesInfo.sale_date,
      expected_delivery_at: salesInfo.expected_delivery_at ?? null,
	  address_snapshot, 

      // 🔥 Giảm giá toàn đơn
      order_discount_amount: summaryDraft.orderDiscountAmount ?? 0,

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

      /* ================= COSTS (NEW) ================= */
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
}, [customer, salesInfo, items, summaryDraft]);

  /* ================= VALIDATION ================= */

 const canSave =
  !!salesInfo.branch_id &&
  !!salesInfo.created_by &&
  items.length > 0 &&
  !!summaryDraft;


  /* ================= RENDER ================= */

  return (
    <>
      <PageHeader
        title="Tạo đơn bán hàng"
        left={<BackButton href="/orders" />}
        right={<CreateSalesHeaderActions onSave={buildPayload} canSave={canSave} />}
      />

      <div className={pageUI.contentWideTable}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 space-y-4">
            <CustomerBox
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
            <SalesInfoBox
              branches={branches}
              staffs={staffs}
              currentUserId={currentUserId}
              value={salesInfo}
              onChange={setSalesInfo}
              orderSources={orderSources}
            />
          </div>
        </div>

        <SalesItemsBox
          branch_id={salesInfo.branch_id}
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