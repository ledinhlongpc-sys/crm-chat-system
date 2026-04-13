"use client";

import { useMemo, useEffect, useState, useRef } from "react";

/* ===== UI TOKENS ===== */
import { textUI } from "@/ui-tokens";

/* ===== COMPONENTS ===== */
import FormBox from "@/components/app/form/FormBox";
import Switch from "@/components/app/form/Switch";

import ProductSearchDropdown, {
  ProductSearchItem,
  ProductSearchRef,
} from "@/components/app/product/ProductSearchDropdown";

import PurchaseNoteBox from "./PurchaseNoteBox";
import PurchaseItemsTableBox from "./PurchaseItemsTableBox";
import PurchaseSummaryBox, {
  ExtraCostRow,
  PaymentRow,
} from "./PurchaseSummaryBox";

/* ================= TYPES ================= */

export type PurchaseItem = {
  key: string;
  product_id: string;
  variant_id: string;
  unit_id: string | null;

  product_name: string;
  variant_name: string;
  sku: string;
  image?: string | null;
  unit_name: string;

  quantity: number;

  /** giá nhập 1 đơn vị (giá gốc trước CK) */
  price: number;

  /** chiết khấu nhập từ UI */
  discount_value: number;
  discount_type: "amount" | "percent";
};

export type PurchaseItemCalculated = PurchaseItem & {
  baseTotal: number;
  unitDiscount: number;
  unitAfter: number;
  discountAmount: number;
  lineTotal: number;
};

export type MoneyBreakdown = {
  total_quantity: number;
  items_subtotal_amount: number;
  items_discount_amount: number;
  items_total_amount: number;
};

export type SummaryDraft = {
  note: string;

  totals: { total_quantity: number; total_amount: number };
  breakdown: MoneyBreakdown;

  orderDiscountValue: number;
  orderDiscountType: "amount" | "percent";
  orderDiscountAmount: number;

  /** NEW: chi phí chi tiết */
  extraCosts: ExtraCostRow[];
  importCost: number;

  /** NEW: thanh toán chi tiết */
  payments: PaymentRow[];
  paidAmount: number;

  grandTotal: number;
  remaining: number;
};

type Props = {
  branch_id?: string;

  items: PurchaseItem[];
  onChange: (items: PurchaseItem[]) => void;

  onTotalsChange?: (totals: { total_quantity: number; total_amount: number }) => void;
  onMoneyBreakdownChange?: (breakdown: MoneyBreakdown) => void;
  onSummaryChange?: (draft: SummaryDraft) => void;

  splitLine?: boolean;

  note?: string;
  onNoteChange?: (note: string) => void;
};

/* ================= CALCULATE ================= */

function calculateLine(item: PurchaseItem) {
  const qty = Number(item.quantity || 0) || 0;
  const price = Number(item.price || 0) || 0;

  const unitDiscountRaw =
    item.discount_type === "amount"
      ? Number(item.discount_value || 0) || 0
      : (price * (Number(item.discount_value || 0) || 0)) / 100;

  const unitDiscount = Math.min(Math.max(0, unitDiscountRaw), price);
  const unitAfter = Math.max(0, price - unitDiscount);

  const baseTotal = qty * price;
  const discountAmount = qty * unitDiscount;
  const lineTotal = qty * unitAfter;

  return { baseTotal, unitDiscount, unitAfter, discountAmount, lineTotal };
}

/* ================= COMPONENT ================= */

export default function PurchaseItemsBox({
  branch_id,
  items,
  onChange,
  onTotalsChange,
  onMoneyBreakdownChange,
  onSummaryChange,
  splitLine = false,
  note: noteProp,
  onNoteChange,
}: Props) {
  const searchRef = useRef<ProductSearchRef>(null);

  const [splitLineState, setSplitLineState] = useState(splitLine);
  useEffect(() => setSplitLineState(splitLine), [splitLine]);

  const [noteLocal, setNoteLocal] = useState(noteProp ?? "");
  const note = noteProp ?? noteLocal;

  useEffect(() => {
    if (typeof noteProp === "string") setNoteLocal(noteProp);
  }, [noteProp]);

  const setNote = (val: string) => {
    onNoteChange ? onNoteChange(val) : setNoteLocal(val);
  };

  /* ================= ADD ITEM ================= */

  const addItem = (variant: ProductSearchItem) => {
    if (!splitLineState) {
      const existing = items.find(
        (i) =>
          i.variant_id === variant.variant_id &&
          i.unit_id === null &&
          i.price === variant.import_price &&
          i.discount_value === 0 &&
          i.discount_type === "amount"
      );

      if (existing) {
        onChange(
          items.map((i) =>
            i.key === existing.key
              ? { ...i, quantity: (i.quantity || 0) + 1 }
              : i
          )
        );
        return;
      }
    }

    const newItem: PurchaseItem = {
      key: crypto.randomUUID(),
      product_id: variant.product_id,
      variant_id: variant.variant_id,
      unit_id: null,

      product_name: variant.product_name,
      variant_name: variant.variant_name,
      sku: variant.sku,
      image: variant.image,
      unit_name: variant.unit_name,

      quantity: 1,
      price: variant.import_price,
      discount_value: 0,
      discount_type: "amount",
    };

    onChange([...items, newItem]);
  };

  const updateItem = (key: string, patch: Partial<PurchaseItem>) => {
    onChange(items.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  };

  const removeItem = (key: string) => {
    onChange(items.filter((i) => i.key !== key));
  };

  /* ================= CALCULATED ================= */

  const calculated: PurchaseItemCalculated[] = useMemo(() => {
    return items.map((item) => ({ ...item, ...calculateLine(item) }));
  }, [items]);

  const totals = useMemo(() => {
    let total_quantity = 0;
    let total_amount = 0;

    for (const item of calculated) {
      total_quantity += Number(item.quantity || 0) || 0;
      total_amount += Number(item.lineTotal || 0) || 0;
    }

    return { total_quantity, total_amount };
  }, [calculated]);

  const breakdown: MoneyBreakdown = useMemo(() => {
    let total_quantity = 0;
    let items_subtotal_amount = 0;
    let items_discount_amount = 0;
    let items_total_amount = 0;

    for (const item of calculated) {
      const qty = Number(item.quantity || 0) || 0;
      total_quantity += qty;
      items_subtotal_amount += Number(item.baseTotal || 0) || 0;
      items_discount_amount += Number(item.discountAmount || 0) || 0;
      items_total_amount += Number(item.lineTotal || 0) || 0;
    }

    return { total_quantity, items_subtotal_amount, items_discount_amount, items_total_amount };
  }, [calculated]);

  useEffect(() => onTotalsChange?.(totals), [totals, onTotalsChange]);
  useEffect(() => onMoneyBreakdownChange?.(breakdown), [breakdown, onMoneyBreakdownChange]);

  /* ================= ORDER DISCOUNT ================= */

  const [orderDiscountValue, setOrderDiscountValue] = useState(0);
  const [orderDiscountType, setOrderDiscountType] =
    useState<"amount" | "percent">("amount");

  const orderDiscountAmount = useMemo(() => {
    const base = totals.total_amount || 0;
    const v = orderDiscountValue || 0;

    return orderDiscountType === "percent"
      ? Math.max(0, (base * v) / 100)
      : Math.max(0, v);
  }, [totals.total_amount, orderDiscountValue, orderDiscountType]);

  const totalAfterOrderDiscount = useMemo(() => {
    return Math.max(0, totals.total_amount - orderDiscountAmount);
  }, [totals.total_amount, orderDiscountAmount]);

  /* ================= NEW: EXTRA COSTS & PAYMENTS (lifted) ================= */

  const [extraCosts, setExtraCosts] = useState<ExtraCostRow[]>([]);
  const importCost = useMemo(() => {
    return extraCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
  }, [extraCosts]);

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const paidAmount = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  const grandTotal = useMemo(() => {
    return Math.max(0, totalAfterOrderDiscount + importCost);
  }, [totalAfterOrderDiscount, importCost]);

  const remaining = useMemo(() => {
    return Math.max(0, grandTotal - paidAmount);
  }, [grandTotal, paidAmount]);

  /* ================= REPORT DRAFT ================= */

  useEffect(() => {
    onSummaryChange?.({
      note,
      totals,
      breakdown,
      orderDiscountValue,
      orderDiscountType,
      orderDiscountAmount,
      extraCosts,
      importCost,
      payments,
      paidAmount,
      grandTotal,
      remaining,
    });
  }, [
    note,
    totals,
    breakdown,
    orderDiscountValue,
    orderDiscountType,
    orderDiscountAmount,
    extraCosts,
    importCost,
    payments,
    paidAmount,
    grandTotal,
    remaining,
    onSummaryChange,
  ]);

  /* ================= TABLE COLUMNS ================= */

  const columns = useMemo(
    () => [
      { key: "stt", label: "STT", width: 60, align: "center" },
      { key: "image", label: "Ảnh", width: 70, align: "center" },
      { key: "name", label: "Tên sản phẩm" },
      { key: "unit", label: "Đơn vị", width: 110, align: "center" },
      { key: "qty", label: "SL nhập", width: 150, align: "center" },
      { key: "price", label: "Đơn giá", width: 200, align: "right" },
      { key: "discount", label: "Chiết khấu", width: 160, align: "right" },
      { key: "total", label: "Thành tiền", width: 170, align: "right" },
      { key: "actions", label: "", width: 60, align: "center" },
    ],
    []
  );

  const fmt = (n: number) => (Number(n || 0) || 0).toLocaleString("vi-VN");

  const TABLE_GRID =
    "lg:grid-cols-[60px_70px_1fr_110px_150px_200px_160px_170px_60px]";

  return (
    <FormBox
      title="Thông tin sản phẩm"
      actions={
        <div className="flex items-center gap-2">
          <Switch
            checked={splitLineState}
            onChange={(val) => setSplitLineState(val)}
          />
          <span className={textUI.body}>Tách dòng</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* SEARCH */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 min-w-[320px]">
            <ProductSearchDropdown
              ref={searchRef}
              branch_id={branch_id}
              onSelect={addItem}
            />
          </div>
        </div>

        {/* TABLE */}
        <PurchaseItemsTableBox
          columns={columns}
          items={calculated}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          fmt={fmt}
          onAddProduct={() => searchRef.current?.focusAndOpen()}
        />

        {/* NOTE + SUMMARY aligned with table */}
        <div className={`hidden lg:grid ${TABLE_GRID}`}>
          <div />

          <div className="col-span-2">
            <PurchaseNoteBox note={note} onChange={setNote} />
          </div>

          <div className="col-span-2" />

          <div className="col-span-3">
            <PurchaseSummaryBox
              totals={totals}
              orderDiscountValue={orderDiscountValue}
              setOrderDiscountValue={setOrderDiscountValue}
              orderDiscountType={orderDiscountType}
              setOrderDiscountType={setOrderDiscountType}
              orderDiscountAmount={orderDiscountAmount}
              extraCosts={extraCosts}
              setExtraCosts={setExtraCosts}
              payments={payments}
              setPayments={setPayments}
              grandTotal={grandTotal}
              fmt={fmt}
            />
          </div>

          <div />
        </div>

        {/* MOBILE fallback */}
        <div className="lg:hidden space-y-4">
          <PurchaseNoteBox note={note} onChange={setNote} />

          <PurchaseSummaryBox
            totals={totals}
            orderDiscountValue={orderDiscountValue}
            setOrderDiscountValue={setOrderDiscountValue}
            orderDiscountType={orderDiscountType}
            setOrderDiscountType={setOrderDiscountType}
            orderDiscountAmount={orderDiscountAmount}
            extraCosts={extraCosts}
            setExtraCosts={setExtraCosts}
            payments={payments}
            setPayments={setPayments}
            grandTotal={grandTotal}
            fmt={fmt}
          />
        </div>
      </div>
    </FormBox>
  );
}