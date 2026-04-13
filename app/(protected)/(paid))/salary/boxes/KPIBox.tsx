import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/helpers/format"; 
type Props = {
  title: string;
  value: number;
  type?: "balance" | "income" | "expense" | "profit" | "count"; // 👈 thêm
  subtitle?: string;
  className?: string; // 🔥 NEW
};
const formatValue = (v: number, type?: string) => {
  if (type === "count") return `${v} Nhân viên`;
  return formatCurrency(v); // ✅ dùng chuẩn hệ thống
};


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
    color: value >= 0 ? "text-green-600" : "text-red-600",
    hoverBg: value >= 0 ? "hover:bg-green-50" : "hover:bg-red-50",
    icon:
      value >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />,
  },

  // 🔥 THÊM ĐOẠN NÀY
  count: {
    color: "text-indigo-600",
    hoverBg: "hover:bg-indigo-50",
    icon: <Wallet size={18} />, // hoặc đổi Users nếu thích
  },
};

  const s = map[type] || map.balance;

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
  {formatValue(value, type)}
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