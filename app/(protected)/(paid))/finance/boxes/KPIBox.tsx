import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/helpers/format";
type Props = {
  title: string;
  value: number;
  type?: "balance" | "income" | "expense" | "profit";
  subtitle?: string;
  className?: string; // 🔥 NEW
};

const formatMoney = (v?: number) =>
  (v || 0).toLocaleString("vi-VN") + " đ";

export default function KPIBox({
  title,
  value,
  type = "balance",
  subtitle,
  className = "",
}: Props) {
  const map = {
    balance: {
      color: "text-blue-600",
      hoverBg: "hover:bg-blue-50",
      icon: <Wallet size={18} />,
    },
    income: {
      color: "text-green-600",
      hoverBg: "hover:bg-green-50",
      icon: <ArrowUpRight size={18} />,
    },
    expense: {
      color: "text-red-600",
      hoverBg: "hover:bg-red-50",
      icon: <ArrowDownRight size={18} />,
    },
    profit: {
      color:
        value >= 0 ? "text-green-600" : "text-red-600",
      hoverBg:
        value >= 0 ? "hover:bg-green-50" : "hover:bg-red-50",
      icon:
        value >= 0 ? (
          <ArrowUpRight size={18} />
        ) : (
          <ArrowDownRight size={18} />
        ),
    },
  };

  const s = map[type];

  return (
    <div
      className={`
        border border-neutral-200 rounded-xl p-4
        flex items-center justify-between
        bg-white
        transition-all duration-200
        hover:shadow-md hover:scale-[1.01]
        ${s.hoverBg}
        ${className}
      `}
    >
      {/* LEFT */}
      <div>
        <div className="text-sm text-neutral-500">{title}</div>

        <div className={`text-lg font-semibold mt-1 ${s.color}`}>
          {formatCurrency(value)}
        </div>

        {subtitle && (
          <div className="text-xs text-neutral-400 mt-1">
            {subtitle}
          </div>
        )}
      </div>

      {/* RIGHT ICON */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-100`}
      >
        <div className={s.color}>{s.icon}</div>
      </div>
    </div>
  );
}