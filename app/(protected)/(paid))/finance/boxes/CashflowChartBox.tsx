"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { cardUI, textUI } from "@/ui-tokens";

type Props = {
  data: {
    date: string;
    income: number;
    expense: number;
  }[];
};

export default function CashflowChartBox({ data }: Props) {
  const list = data || [];

  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <div className={cardUI.title}>
          Dòng tiền 7 ngày
        </div>
      </div>

      <div className={cardUI.body}>
        {list.length === 0 ? (
          <div className={textUI.muted}>
            Chưa có dữ liệu
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <LineChart
              width={800} // 👈 FIX CỨNG
              height={260}
              data={list}
			  margin={{ top: 10, right: 20, left: 40, bottom: 0 }} // 👈 FIX
            >
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tickFormatter={(v) => `Ngày ${v.slice(-2)}`}
              />

              <YAxis />

              <Tooltip
                formatter={(value: any, name: string) => {
                  const label =
                    name === "income" ? "Thu" : "Chi";

                  return [
                    (value || 0).toLocaleString("vi-VN") + " đ",
                    label,
                  ];
                }}
              />

              <Line
                type="monotone"
                dataKey="income"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="expense"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </div>
        )}
      </div>
    </div>
  );
}