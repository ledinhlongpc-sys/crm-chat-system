"use client";

import KPIBox from "./boxes/KPIBox";
import AccountsBox from "./boxes/AccountsBox";
import TransactionsBox from "./boxes/TransactionsBox";
import ShareholdersBox from "./boxes/ShareholdersBox";
import AnalyticsBox from "./boxes/AnalyticsBox";
import CashflowChartBox from "./boxes/CashflowChartBox";

/* ================= TYPES ================= */

type Props = {
  accounts?: any[];
  transactions?: any[];
  shareholders?: any[];

  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  profit: number;

  chartData?: any[];

  from?: string | null;
  to?: string | null;

  /* 🔥 NEW - INVOICE */
  invoiceOutTotal?: number;
  invoiceOutVAT?: number;
  invoiceInTotal?: number;
  invoiceInVAT?: number;
  
   inventoryValue?: number;
   
};

/* ================= COMPONENT ================= */

export default function FinanceClient({
  accounts = [],
  transactions = [],
  shareholders = [],
  totalBalance,
  totalIncome,
  totalExpense,
  profit,
  chartData = [],
  from,
  to,

  /* 🔥 NEW */
  invoiceOutTotal = 0,
  invoiceOutVAT = 0,
  invoiceInTotal = 0,
  invoiceInVAT = 0,
   inventoryValue = 0,
}: Props) {
  /* ================= SAFE CHART ================= */

  const safeChartData =
    !chartData || chartData.length === 0
      ? [
          { date: "01-01", income: 0, expense: 0 },
          { date: "01-02", income: 0, expense: 0 },
        ]
      : chartData;

  function getSubtitle(from?: string | null, to?: string | null) {
    if (from && to) {
      return `${from} → ${to}`;
    }
    return "30 ngày gần nhất";
  }

  /* ================= FORMAT ================= */

  const f = (v: number) =>
    (v || 0).toLocaleString("vi-VN") + " đ";

  const profitInvoice = invoiceOutTotal - invoiceInTotal;
  const vatPayable = invoiceOutVAT - invoiceInVAT;

  return (
    <div className="space-y-4">
      {/* ================= KPI ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPIBox
          title="Số Dư Hiện Tại"
          value={totalBalance}
          type="balance"
        />

        <KPIBox
          title="Tổng Thu Trong Kì"
          value={totalIncome}
          type="income"
          subtitle={getSubtitle(from, to)}
        />

        <KPIBox
          title="Tổng Chi Trong Kì"
          value={totalExpense}
          type="expense"
          subtitle={getSubtitle(from, to)}
        />

        <KPIBox
          title="Biến Động Trong Kì"
          value={profit}
          type="profit"
          subtitle={getSubtitle(from, to)}
        />
      </div>

      {/* ================= 📊 HÓA ĐƠN & TỒN KHO ================= */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  
    <KPIBox
  title="Tồn kho"
  value={inventoryValue}
  type="balance"
  subtitle="Hiện tại"
/>
<a
  href="/finance/purchase-invoices"
  target="_blank"
  className="block rounded-lg transition-all duration-200 hover:bg-green-50 hover:shadow-md cursor-pointer"
>
  <KPIBox
  title="Hóa Đơn Đầu Vào"
  value={invoiceInTotal}
  type="expense"
  subtitle={`VAT Đầu Vào: ${f(invoiceInVAT)} • ${getSubtitle(from, to)}`}
/>
</a>

<a
  href="/finance/order-invoices"
  target="_blank"
  className="block rounded-lg transition-all duration-200 hover:bg-red-50 hover:shadow-md cursor-pointer"
>

<KPIBox
  title="Hóa Đơn Đầu Ra"
  value={invoiceOutTotal}
  type="income"
  subtitle={`VAT Đầu Ra: ${f(invoiceOutVAT)} • ${getSubtitle(from, to)}`}
/>
</a>
 <KPIBox
  title="Chênh lệch HĐ"
  value={invoiceOutTotal - invoiceInTotal}
  type="profit"
  subtitle={`VAT Phải Nộp: ${f(invoiceOutVAT - invoiceInVAT )} • ${getSubtitle(from, to)}`}
/>



</div>

      {/* ================= CHART ================= */}
      <CashflowChartBox data={safeChartData} />

      {/* ================= MAIN ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AccountsBox accounts={accounts} />
        <TransactionsBox transactions={transactions} />
      </div>

      {/* ================= SUB ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShareholdersBox shareholders={shareholders} />

        <AnalyticsBox
          income={totalIncome}
          expense={totalExpense}
          profit={profit}
        />
      </div>
    </div>
  );
}