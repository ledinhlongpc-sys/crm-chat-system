// app/(protected)/(paid)/finance/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

import PageHeader from "@/components/app/header/PageHeader";
import { pageUI } from "@/ui-tokens";

import FinanceClient from "./FinanceClient";
import FinanceHeaderActions from "./FinanceHeaderActions";
import FinanceFilterBar from "./FinanceFilterBar";

/* ================= TYPES ================= */

type Props = {
  searchParams: Promise<{
    branch_id?: string;
    account_id?: string;
    from?: string;
    to?: string;
    inventoryValue?: number;
  }>;
};

type InvoiceSummaryRow = {
  total: number | string | null;
  vat: number | string | null;
};

/* ================= HELPERS ================= */

function toDateStringLocal(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getDaysAgoLocal(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return toDateStringLocal(d);
}

function toNumber(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isNaN(n) ? 0 : n;
}

export default async function FinancePage({ searchParams }: Props) {
  const params = await searchParams;

  const branch_id = params.branch_id || null;
  const account_id = params.account_id || null;
  const from = params.from || null;
  const to = params.to || null;

  const isTransactionFiltering =
    !!branch_id || !!account_id || !!from || !!to;

  const isInvoiceFiltering = !!branch_id || !!from || !!to;

  const supabase = await createSupabaseServerComponentClient();

  /* ================= TENANT ================= */

  const tenant_id = await getTenantId(supabase);

  /* ================= BRANCHES ================= */

  const { data: branches } = await supabase
    .from("system_branches")
    .select("id, name")
    .eq("tenant_id", tenant_id);

  /* ================= ACCOUNTS ================= */

  let accountQuery = supabase
    .from("system_financial_accounts")
    .select("id, account_name, current_balance, branch_id")
    .eq("tenant_id", tenant_id);

  if (branch_id) {
    accountQuery = accountQuery.eq("branch_id", branch_id);
  }

  const { data: accounts } = await accountQuery;

  /* =========================================================
     🔥 KPI TRANSACTION
  ========================================================= */

  let transactionKPIQuery = supabase
    .from("system_money_transactions")
    .select("amount, direction, transaction_date")
    .eq("tenant_id", tenant_id);

  if (isTransactionFiltering) {
    if (from) {
      transactionKPIQuery = transactionKPIQuery.gte(
        "transaction_date",
        from
      );
    }

    if (to) {
      transactionKPIQuery = transactionKPIQuery.lte(
        "transaction_date",
        to
      );
    }
  } else {
    const fromDate30 = getDaysAgoLocal(30);
    transactionKPIQuery = transactionKPIQuery.gte(
      "transaction_date",
      fromDate30
    );
  }

  if (account_id) {
    transactionKPIQuery = transactionKPIQuery.eq(
      "account_id",
      account_id
    );
  }

  if (branch_id) {
    transactionKPIQuery = transactionKPIQuery.eq(
      "branch_id",
      branch_id
    );
  }

  const { data: transactionsKPI } = await transactionKPIQuery;

  /* ================= KPI TRANSACTION CALC ================= */

  const totalBalance =
    accounts?.reduce(
      (sum, a) => sum + toNumber(a.current_balance),
      0
    ) || 0;

  const totalIncomeTransaction =
    transactionsKPI
      ?.filter((t) => t.direction === "in")
      .reduce((sum, t) => sum + toNumber(t.amount), 0) || 0;

  const totalExpenseTransaction =
    transactionsKPI
      ?.filter((t) => t.direction === "out")
      .reduce((sum, t) => sum + toNumber(t.amount), 0) || 0;

  /* =========================================================
     🔥 INVOICE SUMMARY (RPC - KHÔNG CỘNG BẰNG JS)
  ========================================================= */

  const invoiceDefaultFrom = getDaysAgoLocal(30);

  const invoiceFrom = isInvoiceFiltering
    ? from
    : invoiceDefaultFrom;

  const invoiceTo = isInvoiceFiltering ? to : null;

  const [
    { data: invoiceOutSummary, error: invoiceOutError },
    { data: invoiceInSummary, error: invoiceInError },
  ] = await Promise.all([
    supabase.rpc("finance_invoice_out_summary", {
      p_tenant_id: tenant_id,
      p_branch_id: branch_id,
      p_from: invoiceFrom,
      p_to: invoiceTo,
    }),
    supabase.rpc("finance_invoice_in_summary", {
      p_tenant_id: tenant_id,
      p_branch_id: branch_id,
      p_from: invoiceFrom,
      p_to: invoiceTo,
    }),
  ]);

  if (invoiceOutError) {
    throw new Error(
      `finance_invoice_out_summary failed: ${invoiceOutError.message}`
    );
  }

  if (invoiceInError) {
    throw new Error(
      `finance_invoice_in_summary failed: ${invoiceInError.message}`
    );
  }

  const invoiceOutRow = (invoiceOutSummary?.[0] ||
    null) as InvoiceSummaryRow | null;

  const invoiceInRow = (invoiceInSummary?.[0] ||
    null) as InvoiceSummaryRow | null;

  const invoiceOutTotal = toNumber(invoiceOutRow?.total);
  const invoiceOutVAT = toNumber(invoiceOutRow?.vat);

  const invoiceInTotal = toNumber(invoiceInRow?.total);
  const invoiceInVAT = toNumber(invoiceInRow?.vat);

  /* ================= INVENTORY ================= */

  const { data: inventory } = await supabase
    .from("system_product_inventory")
    .select("stock_qty, avg_cost_price")
    .eq("tenant_id", tenant_id);

  const inventoryValue =
    inventory?.reduce(
      (sum, i) =>
        sum +
        toNumber(i.stock_qty) * toNumber(i.avg_cost_price),
      0
    ) || 0;

  /* ================= KPI FINAL ================= */

  const totalIncome = totalIncomeTransaction;
  const totalExpense = totalExpenseTransaction;
  const profit = totalIncome - totalExpense;

  /* =========================================================
     🔥 CHART (7 NGÀY)
  ========================================================= */

  const fromDate7 = getDaysAgoLocal(6);

  const { data: transactionsChart } = await supabase
    .from("system_money_transactions")
    .select("id, amount, direction, transaction_date")
    .eq("tenant_id", tenant_id)
    .gte("transaction_date", fromDate7)
    .order("transaction_date", { ascending: true });

  const last7Days = Array.from({ length: 7 }).map((_, i) =>
    getDaysAgoLocal(6 - i)
  );

  const chartMap: Record<
    string,
    { date: string; income: number; expense: number }
  > = {};

  last7Days.forEach((d) => {
    chartMap[d] = {
      date: d.slice(5),
      income: 0,
      expense: 0,
    };
  });

  transactionsChart?.forEach((t) => {
    if (!t.transaction_date) return;

    const d = String(t.transaction_date).slice(0, 10);

    if (chartMap[d]) {
      if (t.direction === "in") {
        chartMap[d].income += toNumber(t.amount);
      } else {
        chartMap[d].expense += toNumber(t.amount);
      }
    }
  });

  const chartData = Object.values(chartMap);

  /* =========================================================
     🔥 RECENT
  ========================================================= */

  const { data: recentTransactions } = await supabase
    .from("system_money_transactions")
    .select(
      "id, amount, direction, description, transaction_date"
    )
    .eq("tenant_id", tenant_id)
    .order("transaction_date", { ascending: false })
    .limit(10);

  /* ================= SHAREHOLDERS ================= */

  const { data: shareholders } = await supabase
    .from("system_company_shareholders")
    .select("id, shareholder_name, capital_contributed")
    .eq("tenant_id", tenant_id);

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Tổng Quan Tài Chính"
          right={<FinanceHeaderActions />}
        />

        <FinanceFilterBar
          branches={branches ?? []}
          accounts={accounts ?? []}
        />

        <FinanceClient
          accounts={accounts ?? []}
          transactions={recentTransactions ?? []}
          shareholders={shareholders ?? []}
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          profit={profit}
          chartData={chartData}
          from={from}
          to={to}
          invoiceOutTotal={invoiceOutTotal}
          invoiceOutVAT={invoiceOutVAT}
          invoiceInTotal={invoiceInTotal}
          invoiceInVAT={invoiceInVAT}
          inventoryValue={inventoryValue}
        />
      </div>
    </div>
  );
}