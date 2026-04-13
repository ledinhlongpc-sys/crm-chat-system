"use client";

import { cardUI, textUI, badgeUI } from "@/ui-tokens";

/* ================= HELPER ================= */

function formatMoney(v?: number | null) {
  return (v || 0).toLocaleString("vi-VN") + " đ";
}

function formatDateSmart(date?: string) {
  if (!date) return "";

  const d = new Date(date);
  const now = new Date();

  const isToday =
    d.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    d.toDateString() === yesterday.toDateString();

  if (isToday) return "Hôm nay";
  if (isYesterday) return "Hôm qua";

  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

/* ================= COMPONENT ================= */

export default function TransactionsBox({
  transactions,
}: any) {
  const list = transactions || [];

  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <div className={cardUI.title}>
          Giao Dịch Gần Đây
        </div>
      </div>

      <div className={`${cardUI.body} space-y-2`}>
        {list.length === 0 ? (
          <div className={textUI.muted}>
            Chưa có giao dịch
          </div>
        ) : (
          list.map((t: any) => (
            <div
              key={t.id || `${t.description}-${t.amount}`}
              className="flex justify-between items-center text-sm"
            >
              {/* LEFT */}
              <div className="flex items-center gap-2">
                <span className={textUI.body}>
                  {t.description || "Giao dịch"}
                </span>

                {/* 🔥 DATE */}
                <span className="text-xs text-neutral-400">
  {formatDateSmart(t.transaction_date)}
</span>
              </div>

              {/* RIGHT */}
              <span
                className={`${badgeUI.base} ${
                  t.direction === "in"
                    ? badgeUI.money.in
                    : badgeUI.money.out
                }`}
              >
                {formatMoney(t.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}