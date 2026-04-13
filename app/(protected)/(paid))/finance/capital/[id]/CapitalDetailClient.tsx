"use client";

import { cardUI, textUI } from "@/ui-tokens";

const formatMoney = (v: number) =>
  v.toLocaleString("vi-VN") + " đ";

export default function CapitalDetailClient({ data }: any) {
  return (
    <div className="space-y-6">
      <div className={cardUI.base}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className={textUI.label}>Cổ đông</div>
            <div className={textUI.bodyStrong}>
              {data.shareholder?.shareholder_name}
            </div>

            <div className={textUI.label}>Loại</div>
            <div>
              {data.transaction_type === "contribute"
                ? "Góp vốn"
                : "Rút vốn"}
            </div>

            <div className={textUI.label}>Số tiền</div>
            <div>{formatMoney(data.amount)}</div>
          </div>

          <div>
            <div className={textUI.label}>Tài khoản</div>
            <div>{data.account?.account_name}</div>

            <div className={textUI.label}>Ngày</div>
            <div>
              {new Date(data.transaction_date).toLocaleDateString("vi-VN")}
            </div>

            <div className={textUI.label}>Ghi chú</div>
            <div>{data.note || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}