"use client";

import { useState, useEffect } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Loader2 } from "lucide-react";
import TableContainer from "@/components/app/table/TableContainer";
import TableActionBar from "@/components/app/table/TableActionBar";
import TableSearchInput from "@/components/app/table/TableSearchInput";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import { tableUI, textUI, badgeUI } from "@/ui-tokens";
import SelectFilter from "@/components/app/form/SelectFilter";
import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import FilterDate from "@/components/app/form/FilterDate";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import TransactionCreateModal from "./TransactionCreateModal";
import TransactionExportModal from "./TransactionExportModal";
import { FileSpreadsheet } from "lucide-react";

/* ================= TYPES ================= */

type Transaction = {
  id: string;
  transaction_date: string;
  description: string | null;
  transaction_type: string | null;
  direction: "in" | "out";
  amount: number;
  balance_after: number | null;
  
  reference_type?: string;

  account?: {
    id: string;
    account_name: string;
  } | null;

  category?: {
    id: string;
    category_name: string;
    category_type: string;
  } | null;
};

type Account = {
  id: string;
  account_name: string;
};

type Category = {
  id: string;
  category_name: string;
  category_type: string;
};

type Props = {
  data: Transaction[];
  page: number;
  limit: number;
  total: number;
  q: string;
  accounts: Account[];
  categories: Category[];
};

/* ================= COLUMNS ================= */

const columns: Column[] = [
  { key: "index", label: "STT", align: "center", width: "60px" },
  { key: "date", label: "Ngày", width: "120px" },
  { key: "description", label: "Nội dung", width: "240px" },
  { key: "account", label: "Tài khoản", width: "180px" },
  { key: "category", label: "Loại Giao Dịch", width: "160px" },
  { key: "direction", label: "Dòng tiền", align: "center", width: "100px" },
  { key: "amount", label: "Số tiền", align: "right", width: "150px" },
  { key: "balance", label: "Số dư", align: "right", width: "150px" },
 
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

export default function TransactionsClient({
  data,
  page,
  limit,
  total,
  q,
  accounts,
  categories,
}: Props) {
	
  const [openExport, setOpenExport] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [date, setDate] = useState("");
const [category, setCategory] = useState("");
const [direction, setDirection] = useState("");



  const [keyword, setKeyword] = useState(q);
  const [openCreate, setOpenCreate] = useState(false);
  
  
  const handleView = (id: string) => {
  setLoadingId(id);
  router.push(`/finance/transactions/${id}`);
  };  
  
   useEffect(() => {
  setDate(searchParams.get("date") || "");
  setCategory(searchParams.get("category") || "");
  setDirection(searchParams.get("direction") || "");
}, [searchParams]);

  
  function applyFilter(key: string, value: string) {
  const params = new URLSearchParams(
    searchParams.toString()
  );

  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }

  params.set("page", "1");

  router.push(`${pathname}?${params.toString()}`);

  }

  /* ================= SEARCH ================= */

  function applySearch(v: string) {
    setKeyword(v);

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (v.trim()) {
      params.set("q", v.trim());
      params.set("page", "1");
    } else {
      params.delete("q");
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

function clearFilter() {
  setDate("");
  setCategory("");
  setDirection("");
  setKeyword("");

  router.push(pathname);
}
 

  return (
  <>
    <div>
      {/* ===== ACTION BAR ===== */}
      <div >
        <TableActionBar
         left={
    <div className="flex items-center gap-2 flex-1">
      
      {/* SEARCH */}
      <div className="flex-1 mr-2">
        <TableSearchInput
          value={keyword}
          onChange={setKeyword}
          onEnter={() => applySearch(keyword)}
        />
      </div>

    </div>
  }
          right={
            <div className="flex items-center gap-2">
              {/* DATE */}
              <FilterDate
  value={date}
  onChange={(v) => {
    setDate(v);
    applyFilter("date", v);
  }}
/>
 
              {/* CATEGORY */}
              <SelectFilter
  value={category}
  onChange={(v) => {
    setCategory(v);
    applyFilter("category", v);
  }}
  placeholder="Tất cả loại"
  options={[
    { value: "", label: "Loại Giao Dịch" },
    ...categories.map((c) => ({
      value: c.id,
      label: c.category_name,
    })),
  ]}
/>

              {/* DIRECTION */}
              <SelectFilter
  value={direction}
  onChange={(v) => {
    setDirection(v);
    applyFilter("direction", v);
  }}
  placeholder="Tất cả"
  options={[
    { value: "", label: "Tìm Thu Chi" },
    { value: "in", label: "Thu" },
    { value: "out", label: "Chi" },
  ]}
/>
			   {/* 🔥 CLEAR FILTER */}
    {(date || category || direction || q) && (
      <SecondaryButton onClick={clearFilter}>
    Xóa lọc
  </SecondaryButton>
  

    )}
	
	{/* 👇 export */}
    <SecondaryButton  onClick={() => setOpenExport(true)}>
  Xuất Excel
</SecondaryButton>
            </div>
          }
        />
      </div>

      {/* ===== TABLE / EMPTY ===== */}
      <div className="mt-2">
        {data.length === 0 ? (
          <EmptyState
            title={
              q
                ? "Không tìm thấy giao dịch"
                : "Không có giao dịch"
            }
            description={
              q
                ? `Không có kết quả phù hợp với "${q}"`
                : "Không có dữ liệu phù hợp với bộ lọc"
            }
            action={
              q ? (
                <PrimaryButton onClick={() => router.push(pathname)}>
                  Xóa tìm kiếm
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={() => setOpenCreate(true)}>
                  Tạo giao dịch
                </PrimaryButton>
              )
            }
          />
        ) : (
          <TableContainer>
            <TableHead columns={columns} />

            <TableContainer.Body>
              {data.map((item, index) => {
                const isIncome = item.direction === "in";

                return (
                  <TableRow key={item.id}>
                    {/* STT */}
                    <TableCell align="center">
                      {(page - 1) * limit + index + 1}
                    </TableCell>

                    {/* DATE */}
                    <TableCell>
  <button
    onClick={() => handleView(item.id)}
    className="text-blue-600 hover:underline text-sm flex items-center gap-2"
  >
    {loadingId === item.id ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải
      </>
    ) : (
      formatDate(item.transaction_date)
    )}
  </button>
</TableCell>

                    {/* DESCRIPTION */}
                    <TableCell>
                      <div
                        className="max-w-[230px] truncate"
                        title={item.description || ""}
                      >
                        {item.description || "-"}
                      </div>
                    </TableCell>

                    {/* ACCOUNT */}
                    <TableCell>
                      {item.account?.account_name || "-"}
                    </TableCell>

                    {/* CATEGORY */}
                    <TableCell>{getCategoryName(item)}</TableCell>

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
        )}
      </div>

      {/* ===== PAGINATION ===== */}
      <div className={`mt-4 ${tableUI.container}`}>
        <PaginationControls
          page={page}
          limit={limit}
          total={total}
        />
      </div>
    </div>

    {/* ===== MODAL CREATE ===== */}
    <TransactionCreateModal
      open={openCreate}
      onClose={() => setOpenCreate(false)}
      accounts={accounts}
      categories={categories}
    />
	<TransactionExportModal
  open={openExport}
  onClose={() => setOpenExport(false)}
  onExport={(fields) => {
    const params = new URLSearchParams();

    params.set("fields", fields.join(","));

    if (q) params.set("q", q);
    if (date) params.set("date", date);
    if (category) params.set("category", category);
    if (direction) params.set("direction", direction);
	
	setOpenExport(false);

    setTimeout(() => {
    window.open(`/api/finance/transactions/export?${params}`);
  }, 100);
	
  }}
/>
  </>
);
}