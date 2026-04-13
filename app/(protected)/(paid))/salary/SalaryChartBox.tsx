"use client";

import { useEffect, useRef, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import FormBox from "@/components/app/form/FormBox";
import { textUI } from "@/ui-tokens";
import { formatCurrency } from "@/lib/helpers/format";

/* ================= TYPES ================= */

type ChartItem = {
  month: string;
  total: number;
};

type Props = {
  data?: ChartItem[];
};

/* ================= COMPONENT ================= */

export default function SalaryChartBox({ data = [] }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    if (!wrapRef.current) return;

    const el = wrapRef.current;

    const updateSize = () => {
      setChartWidth(el.clientWidth || 0);
    };

    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(el);

    window.addEventListener("resize", updateSize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const hasData = data.length > 0;

  return (
    <FormBox title="Chi lương 7 tháng gần nhất">
      <div
        ref={wrapRef}
         className="w-full min-w-0"
      >
        {chartWidth > 0 && hasData ? (
          <ComposedChart
            width={chartWidth}
            height={320}
            data={data}
            margin={{ top: 20, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 14, fill: "#737373" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              width={60}
              tick={{ fontSize: 14, fill: "#737373" }}
              axisLine={false}
              tickLine={false}
              domain={[0, (dataMax: number) => dataMax * 1.2]}
              tickFormatter={(v: number) => {
                if (v >= 1_000_000_000) {
                  return `${Math.round(v / 1_000_000_000)} tỷ`;
                }
                if (v >= 1_000_000) {
                  return `${Math.round(v / 1_000_000)}tr`;
                }
                return v.toLocaleString("vi-VN");
              }}
            />

            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              }}
              cursor={{ fill: "rgba(37,99,235,0.06)" }}
            />

            <Bar
              dataKey="total"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
              barSize={36}
            />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        ) : (
          <div
            className={`flex h-[320px] items-center justify-center ${textUI.subtle}`}
          >
            Chưa có dữ liệu biểu đồ
          </div>
        )}
      </div>
    </FormBox>
  );
}