"use client";

import { cardUI, textUI } from "@/ui-tokens";

/* ================= HELPER ================= */

function formatMoney(v?: number | null) {
  return (v || 0).toLocaleString("vi-VN") + " đ";
}

/* ================= COMPONENT ================= */

export default function ShareholdersBox({
  shareholders,
}: any) {
  const list = shareholders || [];

  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <div className={cardUI.title}>Cổ đông</div>
      </div>

      <div className={`${cardUI.body} space-y-3`}>
        {list.length === 0 ? (
          <div className={textUI.muted}>
            Chưa có cổ đông
          </div>
        ) : (
          list.slice(0, 3).map((s: any) => (
            <div
              key={s.id || s.shareholder_name} // 👈 FIX KEY
              className="flex justify-between text-sm"
            >
              <div className={textUI.body}>
                {s.shareholder_name || "-"}
              </div>

              <div className="font-medium">
                {formatMoney(s.capital_contributed)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}