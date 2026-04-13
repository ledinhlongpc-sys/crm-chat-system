import KPIBox from "./KPIBox";
import AccountsBox from "./AccountsBox";
import TransactionsBox from "./TransactionsBox";
import ShareholdersBox from "./ShareholdersBox";
import AnalyticsBox from "./AnalyticsBox";

export default function FinanceClient(props: any) {
  const {
    accounts,
    transactions,
    shareholders,
    totalBalance,
    totalIncome,
    totalExpense,
    profit,
  } = props;

  return (
    <div className="space-y-4">

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPIBox title="Tổng tiền" value={totalBalance} />
        <KPIBox title="Thu tháng" value={totalIncome} color="text-green-600" />
        <KPIBox title="Chi tháng" value={totalExpense} color="text-red-600" />
        <KPIBox title="Còn Lại" value={profit} color="text-blue-600" />
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AccountsBox accounts={accounts} />
        <TransactionsBox transactions={transactions} />
      </div>

      {/* SUB */}
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