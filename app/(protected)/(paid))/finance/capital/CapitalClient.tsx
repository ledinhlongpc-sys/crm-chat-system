"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { tableUI } from "@/ui-tokens";

import TableContainer from "@/components/app/table/TableContainer";
import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import TableSearchInput from "@/components/app/table/TableSearchInput";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";

/* ================= TYPES ================= */

type Item = {
  id: string;
  transaction_date: string;
  note: string | null;
  amount: number;
  transaction_type: "contribute" | "withdraw";

  account?: {
    account_name: string;
  };

  shareholder?: {
    shareholder_name: string;
  };

  created_by_user?: {
    full_name: string;
  };

  money_tx?: {
    id: string;
  };
};

type Props = {
  data: Item[];
  page: number;
  limit: number;
  total: number;
  q: string;
};

/* ================= HELPERS ================= */

const formatMoney = (v?: number | null) =>
  new Intl.NumberFormat("vi-VN").format(v || 0) + " đ";

const formatDate = (v: string) =>
  new Intl.DateTimeFormat("vi-VN").format(new Date(v));

/* ================= COLUMNS ================= */

const columns: Column[] = [
  { key: "stt", label: "STT", width: "60px", align: "center" },
  { key: "date", label: "Ngày", width: "120px" },
  { key: "shareholder", label: "Cổ đông" },
  { key: "account", label: "Tài khoản" },
  { key: "type", label: "Loại giao dịch" },
  { key: "created_by", label: "Người tạo" },
  { key: "amount", label: "Số tiền", align: "right" },
  { key: "note", label: "Ghi chú" },
];

/* ================= COMPONENT ================= */

export default function CapitalClient({
  data,
  page,
  limit,
  total,
  q,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState(q);

  function handleView(id?: string) {
    if (!id) return;

    setLoadingId(id);
    router.push(`/finance/transactions/${id}`);
  }

  function applySearch(v: string) {
    setKeyword(v);

    const params = new URLSearchParams(searchParams.toString());

    if (v.trim()) {
      params.set("q", v);
      params.set("page", "1");
    } else {
      params.delete("q");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  if (total === 0) {
    return <EmptyState title="Chưa có giao dịch góp vốn" />;
  }

  return (
    <>
      <div className={tableUI.container}>
        <TableSearchInput
          value={keyword}
          onChange={applySearch}
        />
      </div>

      <div className="mt-2">
        <TableContainer>
          <TableHead columns={columns} />

          <TableContainer.Body>
            {data.map((item, index) => {
              const isContribute =
                item.transaction_type === "contribute";

              return (
                <TableRow key={item.id}>
                  <TableCell align="center">
                    {(page - 1) * limit + index + 1}
                  </TableCell>

                  <TableCell>
                    {item.money_tx?.id ? (
                      <button
                        type="button"
                        onClick={() => handleView(item.money_tx?.id)}
                        disabled={loadingId === item.money_tx?.id}
                        className="text-blue-600 hover:underline text-sm flex items-center gap-2 disabled:text-neutral-400 disabled:no-underline disabled:cursor-not-allowed"
                      >
                        {loadingId === item.money_tx?.id ? (
                          <>
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            Đang tải
                          </>
                        ) : (
                          formatDate(item.transaction_date)
                        )}
                      </button>
                    ) : (
                      <span className="text-neutral-500 text-sm">
                        {formatDate(item.transaction_date)}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {item.shareholder?.shareholder_name || "-"}
                  </TableCell>

                  <TableCell>
                    {item.account?.account_name || "-"}
                  </TableCell>

                  <TableCell>
                    {isContribute ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Góp vốn
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                        Rút vốn
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {item.created_by_user?.full_name || "-"}
                  </TableCell>

                  <TableCell align="right">
                    <span
                      className={
                        isContribute
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {isContribute ? "+" : "-"}{" "}
                      {formatMoney(item.amount)}
                    </span>
                  </TableCell>

                  <TableCell>
                    {item.note || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableContainer.Body>
        </TableContainer>
      </div>

      <div className={`mt-4 ${tableUI.container}`}>
        <PaginationControls
          page={page}
          limit={limit}
          total={total}
        />
      </div>
    </>
  );
}