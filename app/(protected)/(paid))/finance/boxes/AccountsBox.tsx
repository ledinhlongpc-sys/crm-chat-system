"use client";

import { cardUI, textUI } from "@/ui-tokens";

/* ================= HELPER ================= */

function formatMoney(v?: number | null) {
  return (v || 0).toLocaleString("vi-VN") + " đ";
}

/* ================= COMPONENT ================= */

export default function AccountsBox({ accounts }: any) {
  const list = accounts || [];

  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <div className={cardUI.title}>Số Dư Tài khoản</div>
      </div>

      <div className={`${cardUI.body} space-y-3`}>
        {list.length === 0 ? (
          <div className={textUI.muted}>
            Chưa có tài khoản
          </div>
        ) : (
          list.slice(0, 4).map((a: any) => (
            <div
              key={a.id || a.account_name} // 👈 FIX KEY
              className="flex justify-between text-sm"
            >
              <div className={textUI.body}>
                {a.account_name || "-"}
              </div>

              <div className="font-semibold text-green-600">
                {formatMoney(a.current_balance)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}