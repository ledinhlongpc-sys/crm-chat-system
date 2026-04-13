"use client";

import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cardUI, textUI } from "@/ui-tokens";
import { formatCurrency } from "@/lib/helpers/format";

import { useOrderSummary } from "@/lib/hooks/useOrderSummary";
import AnimatedNumber from "@/components/app/common/AnimatedNumber";
import OrderProcessingSkeleton from "./OrderProcessingSkeleton";

/* ================= CONFIG ================= */

const CONFIG = [
  {
    key: "unfulfilled",
    label: "Chờ duyệt",
    color: "text-yellow-600",
    query: "fulfillment_status=unfulfilled",
  },
  {
    key: "unpaid",
    label: "Chờ thanh toán",
    color: "text-red-600",
    query: "payment_status=unpaid",
  },
  {
    key: "preparing",
    label: "Chờ đóng gói",
    color: "text-blue-600",
    query: "fulfillment_status=preparing",
  },
  {
    key: "ready_to_ship",
    label: "Chờ lấy hàng",
    color: "text-indigo-600",
    query: "fulfillment_status=ready_to_ship",
  },
  {
    key: "shipping",
    label: "Đang giao",
    color: "text-purple-600",
    query: "fulfillment_status=shipping",
  },
  {
    key: "failed",
    label: "Chờ giao lại",
    color: "text-orange-600",
    query: "fulfillment_status=failed",
  },
];

/* ================= COMPONENT ================= */

export default function OrderProcessingBox() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ ĐẶT HOOK LÊN TRÊN HẾT
  const [range, setRange] = useState("90");

const { data, isLoading } = useOrderSummary(range);

  const currentFulfillment = searchParams.get("fulfillment_status");
  const currentPayment = searchParams.get("payment_status");

  /* ================= LOADING ================= */

  if (isLoading || !data) {
    return <OrderProcessingSkeleton />;
  }

  /* ================= UI ================= */
  /* ================= UI ================= */

  return (
    <div className={clsx(cardUI.base, "p-4")}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div className={textUI.pageTitle}>Đơn hàng cần xử lý</div>

        <div className="flex items-center gap-1 text-xs">
  {["30", "90", "180"].map((r) => (
    <button
      key={r}
      onClick={() => setRange(r)}
      className={clsx(
        "px-2 py-1 rounded",
        range === r
          ? "bg-blue-100 text-blue-700"
          : "text-neutral-500 hover:bg-neutral-100"
      )}
    >
      {r} ngày
    </button>
  ))}
</div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {CONFIG.map((item) => {
          const value = data[item.key];

          /* ================= ACTIVE ================= */

          let isActive = false;

          if (item.key === "unpaid") {
            isActive = currentPayment === "unpaid";
          } else {
            isActive = currentFulfillment === item.key;
          }

          return (
            <button
              key={item.key}
              onClick={() => {
  if (isActive) {
    router.push("/orders");
  } else {
    router.push(`/orders?${item.query}`);
  }
}}
              className={clsx(
                "flex flex-col gap-2 rounded-lg border p-4 text-left transition-all duration-200",
                "border-neutral-200 hover:bg-blue-50 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md hover:-translate-y-[1px]",

                // 🔥 ACTIVE STYLE
                isActive &&
"ring-2 ring-blue-500 bg-blue-50 shadow-sm scale-[1.02]"
              )}
            >
              {/* TOP: LABEL + COUNT */}
              <div className="flex items-center justify-between">
                {/* LABEL */}
                <div
                  className={clsx(
                    "text-sm font-medium",
                    isActive ? "text-blue-700" : textUI.muted
                  )}
                >
                  {item.label}
                </div>

                {/* COUNT BADGE */}
                <div
                  className={clsx(
                    "px-2 py-0.5 rounded-md text-sm font-semibold",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-neutral-100",
                    item.color
                  )}
                >
                  <AnimatedNumber value={value?.count || 0} />
                </div>
              </div>

              {/* AMOUNT */}
              <div
                className={clsx(
                  "text-sm font-medium",
                  isActive ? "text-blue-700" : "text-neutral-800"
                )}
              >
                {formatCurrency(value?.amount || 0)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}