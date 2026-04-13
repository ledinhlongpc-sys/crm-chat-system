"use client";

import { cardUI, textUI } from "@/ui-tokens";

export default function AnalyticsBox({
  income,
  expense,
  profit,
}: any) {
  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <div className={cardUI.title}>
          Phân Tích Nhanh
        </div>
      </div>

      <div className={`${cardUI.body} space-y-3`}>
        <div className="flex justify-between text-sm">
          <span className={textUI.label}>Thu</span>
          <span className="text-green-600 font-medium">
            {income.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className={textUI.label}>Chi</span>
          <span className="text-red-600 font-medium">
            {expense.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div className="flex justify-between text-sm border-t pt-2">
          <span className={textUI.title}>
            Số Tiền Hiện Tại
          </span>
          <span className="text-blue-600 font-semibold">
            {profit.toLocaleString("vi-VN")} đ
          </span>
        </div>
      </div>
    </div>
  );
}