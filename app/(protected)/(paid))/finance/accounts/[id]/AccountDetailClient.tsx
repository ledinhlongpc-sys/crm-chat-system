"use client";

import AccountInfoBox from "./boxes/AccountInfoBox";
import AccountTransactionsBox from "./boxes/AccountTransactionsBox";
import AccountHeaderActions from "./AccountHeaderActions";

/* ================= TYPES ================= */

type Props = {
  account: any;
  branch: any;
  transactions: any[];

  page: number;
  limit: number;
  total: number;

  categories: any[]; // 👈 THÊM
  branches: any[];   // 👈 nếu header đang cần
};

/* ================= COMPONENT ================= */

export default function AccountDetailClient({
  account,
  branch,
  transactions,
  page,
  limit,
  total,
  categories,
  branches,
}: Props) {
  return (
    <div className="space-y-6">

      {/* INFO */}
      <AccountInfoBox account={account} branch={branch} />

      {/* TRANSACTIONS */}
      <AccountTransactionsBox
        data={transactions}
        page={page}
        limit={limit}
        total={total}
		
      />
    </div>
  );
}