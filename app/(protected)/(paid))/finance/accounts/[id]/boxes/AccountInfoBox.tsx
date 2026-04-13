"use client";

import { cardUI, textUI, badgeUI } from "@/ui-tokens";

type Props = {
  account: any;
  branch: any;
};

const formatMoney = (v?: number | null) =>
  (v || 0).toLocaleString("vi-VN") + " đ";

export default function AccountInfoBox({
  account,
  branch,
}: Props) {
  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <div className={cardUI.title}>
          Thông tin tài khoản
        </div>
      </div>

      <div className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-6`}>
        {/* LEFT */}
        <div className="space-y-4">
          <div>
            <div className={textUI.label}>Tên tài khoản</div>
            <div className={textUI.title}>
              {account.account_name || "-"}
            </div>
          </div>

          <div>
            <div className={textUI.label}>Chi nhánh</div>
            <div className={textUI.body}>
              {branch?.name || "-"}
            </div>
          </div>

          <div>
            <div className={textUI.label}>Loại</div>
            <div className={textUI.body}>
              {account.account_type === "cash"
                ? "Tiền mặt"
                : account.account_type === "bank"
                ? "Ngân hàng"
                : "Ví điện tử"}
            </div>
          </div>

          <div>
            <div className={textUI.label}>Ngân hàng</div>
            <div className={textUI.body}>
              {account.bank_name || "-"}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div>
            <div className={textUI.label}>Số tài khoản</div>
            <div className={textUI.body}>
              {account.account_number || "-"}
            </div>
          </div>

          <div>
            <div className={textUI.label}>Chủ tài khoản</div>
            <div className={textUI.body}>
              {account.account_holder || "-"}
            </div>
          </div>

          <div>
            <div className={textUI.label}>Số dư hiện tại</div>
            <div className="text-green-600 font-semibold">
              {formatMoney(account.current_balance)}
            </div>
          </div>

          <div>
            <div className={textUI.label}>Trạng thái</div>
            <span
              className={
                account.is_active
                  ? badgeUI.success
                  : badgeUI.neutral
              }
            >
              {account.is_active ? "Hoạt động" : "Ngưng"}
            </span>
          </div>

          {account.is_default && (
            <div>
              <span className={badgeUI.primary}>
                Tài khoản mặc định
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}