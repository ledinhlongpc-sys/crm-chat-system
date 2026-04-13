"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { textUI } from "@/ui-tokens";
import FormBox from "@/components/app/form/FormBox";
import Switch from "@/components/app/form/Switch";

import SalesProductSearchDropdown, {
  SalesProductSearchItem,
  SalesProductSearchRef,
} from "@/components/app/product/SalesProductSearchDropdown";

import SalesItemsTableBox from "./SalesItemsTableBox";
import SalesNoteBox from "./SalesNoteBox";
import SalesSummaryBox, { ExtraCostRow, PaymentRow } from "./SalesSummaryBox";

/* ================= CONFIG ================= */

const MAX_ORDER_DISCOUNT_PERCENT = 100; // ✅ anh muốn 50 thì đổi 50

/* ================= TYPES ================= */

export type SalesItem = {
  key: string;

  product_id: string;
  variant_id: string;
  unit_conversion_id: string | null;

  product_name: string;
  variant_name: string;
  sku: string;
  image?: string | null;

  unit_name: string;
 
  factor: number;

  quantity: number;
  price: number;

  discount_value: number;
  discount_type: "amount" | "percent";

  cost_price_snapshot: number;
};

export type SalesItemCalculated = SalesItem & {
  base_quantity: number;
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

  extraCosts: ExtraCostRow[];
  importCost: number;

  payments: PaymentRow[];
  paidAmount: number;

  grandTotal: number;
  remaining: number;
};

/* ================= HELPERS ================= */

function clamp(n: number, min: number, max: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.min(Math.max(x, min), max);
}

function clamp0(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, x);
}

/* ================= CALCULATE ================= */

function calculateLine(item: SalesItem) {
  const qty = Number(item.quantity || 0);
  const price = Number(item.price || 0);

  const unitDiscountRaw =
    item.discount_type === "amount"
      ? Number(item.discount_value || 0)
      : (price * Number(item.discount_value || 0)) / 100;

  const unitDiscount = Math.min(Math.max(0, unitDiscountRaw), price);
  const unitAfter = price - unitDiscount;

  const base_quantity = qty * (item.factor || 1);
  const baseTotal = qty * price;
  const discountAmount = qty * unitDiscount;
  const lineTotal = qty * unitAfter;

  return {
    base_quantity,
    baseTotal,
    unitDiscount,
    unitAfter,
    discountAmount,
    lineTotal,
  };
}

/* ================= COMPONENT ================= */

export default function SalesItemsBox({
  branch_id,
  items,
  onChange,
  onTotalsChange,
  onMoneyBreakdownChange,
  onSummaryChange,
}: {
  branch_id?: string;
  items: SalesItem[];
  onChange: (items: SalesItem[]) => void;
  onTotalsChange?: (totals: {
    total_quantity: number;
    total_amount: number;
  }) => void;
  onMoneyBreakdownChange?: (breakdown: MoneyBreakdown) => void;
  onSummaryChange?: (draft: SummaryDraft) => void;
}) {
  const searchRef = useRef<SalesProductSearchRef>(null);

  const [splitLineState, setSplitLineState] = useState(false);
  const [note, setNote] = useState("");

  /* ================= ADD ITEM ================= */

  const addItem = (product: SalesProductSearchItem) => {
    if (!splitLineState) {
      const existing = items.find(
        (i) =>
          i.variant_id === product.variant_id &&
          i.unit_conversion_id === product.unit_conversion_id &&
          i.price === product.price &&
          i.discount_value === 0 &&
          i.discount_type === "amount"
      );

      if (existing) {
        onChange(
          items.map((i) =>
            i.key === existing.key ? { ...i, quantity: i.quantity + 1 } : i
          )
        );
        return;
      }
    }

    const newItem: SalesItem = {
      key: crypto.randomUUID(),
      product_id: product.product_id,
      variant_id: product.variant_id,
      unit_conversion_id: product.unit_conversion_id,

      product_name: product.product_name,
      variant_name: product.variant_name,
      sku: product.sku,
      image: product.image,

      unit_name: product.unit_name,
    
      factor: product.factor,

      quantity: 1,
      price: product.price,

      discount_value: 0,
      discount_type: "amount",

      cost_price_snapshot: 0,
    };

    onChange([...items, newItem]);
  };

  const updateItem = (key: string, patch: Partial<SalesItem>) => {
    onChange(items.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  };

  const removeItem = (key: string) => {
    onChange(items.filter((i) => i.key !== key));
  };

  /* ================= CALCULATED ================= */

  const calculated: SalesItemCalculated[] = useMemo(() => {
    return items.map((item) => ({
      ...item,
      ...calculateLine(item),
    }));
  }, [items]);

  /* ================= TOTALS ================= */

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

    return {
      total_quantity,
      items_subtotal_amount,
      items_discount_amount,
      items_total_amount,
    };
  }, [calculated]);

  useEffect(() => onTotalsChange?.(totals), [totals, onTotalsChange]);
  useEffect(
    () => onMoneyBreakdownChange?.(breakdown),
    [breakdown, onMoneyBreakdownChange]
  );

  /* ================= ORDER DISCOUNT ================= */

  const [orderDiscountValue, setOrderDiscountValue] = useState(0);
  const [orderDiscountType, setOrderDiscountType] =
    useState<"amount" | "percent">("amount");

  // ✅ clamp value theo type (để UI không bao giờ giữ số "bậy")
  useEffect(() => {
    if (orderDiscountType === "percent") {
      setOrderDiscountValue((prev) =>
        clamp(prev, 0, MAX_ORDER_DISCOUNT_PERCENT)
      );
    } else {
      setOrderDiscountValue((prev) => clamp0(prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDiscountType]);

  // ✅ clamp chiết khấu KHÔNG BAO GIỜ > tổng tiền
  const orderDiscountAmount = useMemo(() => {
    const base = totals.total_amount || 0;
    let v = orderDiscountValue || 0;

    if (orderDiscountType === "percent") {
      v = clamp(v, 0, MAX_ORDER_DISCOUNT_PERCENT);
      const amount = (base * v) / 100;
      return Math.min(Math.max(0, amount), base);
    }

    v = clamp0(v);
    return Math.min(v, base);
  }, [totals.total_amount, orderDiscountValue, orderDiscountType]);

  const totalAfterOrderDiscount = useMemo(() => {
    return Math.max(0, totals.total_amount - orderDiscountAmount);
  }, [totals.total_amount, orderDiscountAmount]);

  /* ================= EXTRA COSTS ================= */

  const [extraCosts, setExtraCosts] = useState<ExtraCostRow[]>([]);
  const importCost = useMemo(
    () => extraCosts.reduce((sum, c) => sum + (c.amount || 0), 0),
    [extraCosts]
  );

  /* ================= PAYMENTS ================= */

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const paidAmount = useMemo(
    () => payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments]
  );

  const grandTotal = useMemo(() => {
    return Math.max(0, totalAfterOrderDiscount + importCost);
  }, [totalAfterOrderDiscount, importCost]);

  const remaining = useMemo(() => {
    return Math.max(0, grandTotal - paidAmount);
  }, [grandTotal, paidAmount]);

  /* ================= REPORT ================= */

  useEffect(() => {
    onSummaryChange?.({
      note,
      totals,
      breakdown,
      orderDiscountValue:
        orderDiscountType === "percent"
          ? clamp(orderDiscountValue, 0, MAX_ORDER_DISCOUNT_PERCENT)
          : clamp0(orderDiscountValue),
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

  /* ================= TABLE ================= */

  const columns = [
    { key: "stt", label: "STT", width: 60, align: "center" },
    { key: "image", label: "Ảnh", width: 70, align: "center" },
    { key: "name", label: "Tên sản phẩm" },
    { key: "unit", label: "Đơn vị", width: 110, align: "center" },
    { key: "qty", label: "SL bán", width: 150, align: "center" },
    { key: "price", label: "Đơn giá", width: 200, align: "right" },
    { key: "discount", label: "Chiết khấu", width: 160, align: "right" },
    { key: "total", label: "Thành tiền", width: 170, align: "right" },
    { key: "actions", label: "", width: 60, align: "center" },
  ];

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
        <div className="flex-1 min-w-[320px]">
          <SalesProductSearchDropdown
            ref={searchRef}
            branch_id={branch_id}
            onSelect={addItem}
          />
        </div>

        <SalesItemsTableBox
          columns={columns}
          items={calculated}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          fmt={fmt}
          onAddProduct={() => searchRef.current?.focusAndOpen()}
        />

        {/* NOTE + SUMMARY */}
        <div className={`hidden lg:grid ${TABLE_GRID}`}>
          <div />

          <div className="col-span-2">
            <SalesNoteBox note={note} onChange={setNote} />
          </div>

          <div className="col-span-2" />

          <div className="col-span-3">
            <SalesSummaryBox
              totals={totals}
              orderDiscountValue={
                orderDiscountType === "percent"
                  ? clamp(orderDiscountValue, 0, MAX_ORDER_DISCOUNT_PERCENT)
                  : clamp0(orderDiscountValue)
              }
              setOrderDiscountValue={(v) =>
                setOrderDiscountValue(
                  orderDiscountType === "percent"
                    ? clamp(v, 0, MAX_ORDER_DISCOUNT_PERCENT)
                    : clamp0(v)
                )
              }
              orderDiscountType={orderDiscountType}
              setOrderDiscountType={setOrderDiscountType}
              orderDiscountAmount={orderDiscountAmount}
              extraCosts={extraCosts}
              setExtraCosts={setExtraCosts}
              payments={payments}
              setPayments={setPayments}
              grandTotal={grandTotal}
              fmt={fmt}
              // ✅ nếu SalesSummaryBox cần maxPercent để UI clamp
              maxOrderDiscountPercent={MAX_ORDER_DISCOUNT_PERCENT as any}
			 />
          </div>

          <div />
        </div>

        {/* MOBILE */}
        <div className="lg:hidden space-y-4">
          <SalesNoteBox note={note} onChange={setNote} />

          <SalesSummaryBox
            totals={totals}
            orderDiscountValue={
              orderDiscountType === "percent"
                ? clamp(orderDiscountValue, 0, MAX_ORDER_DISCOUNT_PERCENT)
                : clamp0(orderDiscountValue)
            }
            setOrderDiscountValue={(v) =>
              setOrderDiscountValue(
                orderDiscountType === "percent"
                  ? clamp(v, 0, MAX_ORDER_DISCOUNT_PERCENT)
                  : clamp0(v)
              )
            }
            orderDiscountType={orderDiscountType}
            setOrderDiscountType={setOrderDiscountType}
            orderDiscountAmount={orderDiscountAmount}
            extraCosts={extraCosts}
            setExtraCosts={setExtraCosts}
            payments={payments}
            setPayments={setPayments}
            grandTotal={grandTotal}
            fmt={fmt}
            maxOrderDiscountPercent={MAX_ORDER_DISCOUNT_PERCENT as any}
            
          />
        </div>
      </div>
    </FormBox>
  );
}