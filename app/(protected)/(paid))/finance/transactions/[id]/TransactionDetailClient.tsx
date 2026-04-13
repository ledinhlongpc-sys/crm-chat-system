"use client";

import {
  cardUI,
  textUI,
  badgeUI,
} from "@/ui-tokens";

import TransactionProofBox from "./TransactionProofBox";

/* ================= TYPES ================= */

type Transaction = {
  id: string;
  amount: number;
  direction: "in" | "out";
  transaction_date: string;
  description: string | null;
  balance_after?: number | null;
  reference_type?: string | null;

  created_by_user?: {
    full_name: string;
  } | null;

  account?: {
    account_name: string;
    current_balance?: number;
  } | null;

  category?: {
    category_name: string;
    category_type: string;
  } | null;

  proof_images?: string[] | null;
};

type Props = {
  transaction: Transaction;
};
function getCategoryLabel(transaction: Transaction) {
  const ref = transaction.reference_type?.toLowerCase().trim();

  if (transaction.category?.category_name) {
    return transaction.category.category_name;
  }

  if (ref === "capital") {
    return "Góp cổ phần";
  }

  return "-";
}
/* ================= HELPER ================= */

const formatMoney = (v?: number | null) =>
  (v || 0).toLocaleString("vi-VN") + " đ";

/* ================= COMPONENT ================= */

export default function TransactionDetailClient({
  transaction,
}: Props) {
  return (
    <div className="space-y-6">

      {/* ================= INFO ================= */}
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <div className={cardUI.title}>
            Chi tiết giao dịch
          </div>
        </div>

        <div
          className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-6`}
        >
          {/* LEFT */}
          <div className="space-y-4">

            <div>
              <div className={textUI.label}>Ngày giao dịch</div>
              <div className={textUI.bodyStrong}>
                {new Date(
                  transaction.transaction_date
                ).toLocaleDateString("vi-VN")}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Tài khoản</div>
              <div className={textUI.body}>
                {transaction.account?.account_name || "-"}
              </div>

             
            </div>

            <div>
              <div className={textUI.label}>Danh mục</div>
              <div className={textUI.body}>
  {getCategoryLabel(transaction)}
</div>
            </div>

            <div>
              <div className={textUI.label}>Nội dung</div>
              <div className={textUI.body}>
                {transaction.description || "-"}
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-4">

            <div>
              <div className={textUI.label}>Loại Giao Dịch</div>
              <span
                className={`${badgeUI.base} ${
  transaction.direction === "in"
    ? badgeUI.money.in
    : badgeUI.money.out
}`}
              >
                {transaction.direction === "in"
                  ? "Thu tiền"
                  : "Chi tiền"}
              </span>
            </div>

            <div>
              <div className={textUI.label}>Số tiền</div>
              <div
                className={
                  transaction.direction === "in"
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {transaction.direction === "in" ? "+" : "-"}{" "}
                {formatMoney(transaction.amount)}
              </div>
			  {/* SỐ DƯ HIỆN TẠI */}
<div>
  <div className={textUI.label}>Số dư sau giao dịch</div>
  <div className="text-neutral-800 font-semibold">
    {formatMoney(transaction.balance_after)}
  </div>
</div>
            </div>

            {/* 🔥 NEW: NGƯỜI TẠO */}
            <div>
              <div className={textUI.label}>Tạo bởi</div>
              <div className={textUI.body}>
                {transaction.created_by_user?.full_name || "-"}
              </div>
            </div>

           

          </div>
        </div>
      </div>

      {/* ================= PROOF ================= */}
      <TransactionProofBox
        transactionId={transaction.id}
        images={transaction.proof_images}
        onUploaded={() => location.reload()}
      />

    </div>
  );
}