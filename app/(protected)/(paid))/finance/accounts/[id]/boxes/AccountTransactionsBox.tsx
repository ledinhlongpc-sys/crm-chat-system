"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import TableContainer from "@/components/app/table/TableContainer";
import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";

import { cardUI, badgeUI, tableUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Transaction = {
  id: string;
  transaction_date: string;
  description: string | null;
  direction: "in" | "out";
  amount: number;
  balance_after: number | null;
  reference_type?: string | null;
  category?: {
    id: string;
    category_name: string;
    category_type: string;
  } | null;
};

type Props = {
  data: Transaction[];
  page: number;
  limit: number;
  total: number;

};

/* ================= COLUMNS ================= */

const columns: Column[] = [
  { key: "date", label: "Ngày", width: "120px" },
  { key: "description", label: "Nội dung" },
  { key: "category", label: "Loại giao dịch", width: "180px" },
  { key: "direction", label: "Dòng tiền", align: "center", width: "120px" },
  { key: "amount", label: "Số tiền", align: "right", width: "160px" },
  { key: "balance", label: "Số dư", align: "right", width: "160px" },
];


/* ================= HELPER ================= */

const formatMoney = (v?: number | null) =>
  (v || 0).toLocaleString("vi-VN") + " đ";

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "-";
  
const getCategoryName = (item: Transaction) => {
  if (item.category?.category_name) {
    return item.category.category_name;
  }

  if (item.reference_type === "capital") {
    return "Góp Cổ Phần";
  }

  return "-";
};

/* ================= COMPONENT ================= */

export default function AccountTransactionsBox({
  data,
  page,
  limit,
  total,
}: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleView(id: string) {
    setLoadingId(id);
    router.push(`/finance/transactions/${id}`);
  }

  return (
    <div className={cardUI.base}>
      {/* HEADER */}
      <div className={cardUI.header}>
        <div className={cardUI.title}>
          Lịch sử giao dịch
        </div>
      </div>

      {/* BODY */}
      <div className={cardUI.body}>
        {data.length === 0 ? (
          <EmptyState
            title="Chưa có giao dịch"
            description="Tài khoản này chưa phát sinh giao dịch"
          />
        ) : (
          <>
            <TableContainer>
              <TableHead columns={columns} />

              <TableContainer.Body>
                {data.map((item) => {
                  const isIncome = item.direction === "in";

                  return (
                    <TableRow key={item.id}>
                      {/* DATE */}
                      <TableCell>
                        <button
                          onClick={() => handleView(item.id)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {formatDate(item.transaction_date)}
                        </button>
                      </TableCell>

                      {/* DESC */}
                      <TableCell>
                        {item.description || "-"}
                      </TableCell>
					 <TableCell>
  {getCategoryName(item)}
</TableCell>
                      {/* DIRECTION */}
                      <TableCell align="center">
                        <span
                          className={`${badgeUI.base} ${
                            isIncome
                              ? badgeUI.money.in
                              : badgeUI.money.out
                          }`}
                        >
                          {isIncome ? "Thu" : "Chi"}
                        </span>
                      </TableCell>

                      {/* AMOUNT */}
                      <TableCell align="right">
                        <span
                          className={
                            isIncome
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {isIncome ? "+" : "-"}{" "}
                          {formatMoney(item.amount)}
                        </span>
                      </TableCell>

                      {/* BALANCE */}
                      <TableCell align="right">
                        {formatMoney(item.balance_after)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableContainer.Body>
            </TableContainer>

            {/* PAGINATION */}
            <div className={`mt-4 ${tableUI.container}`}>
              <PaginationControls
                page={page}
                limit={limit}
                total={total}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}