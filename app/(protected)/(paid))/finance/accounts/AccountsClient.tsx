"use client";

import { useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import TableContainer from "@/components/app/table/TableContainer";
import TableActionBar from "@/components/app/table/TableActionBar";
import TableSearchInput from "@/components/app/table/TableSearchInput";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";

import { tableUI, textUI, badgeUI } from "@/ui-tokens";

import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import AccountCreateModal from "./AccountCreateModal";

/* ================= TYPES ================= */
type Branch = {
  id: string;
  name: string;
  is_default: boolean;
};

type Account = {
  id: string;
  account_name: string | null;
  account_type: "cash" | "bank" | "ewallet";
  bank_name: string | null;
  account_number: string | null;
  current_balance: number | null;
  is_default: boolean;
  is_active: boolean;
   branch_id: string | null;
};

type Props = {
  data: Account[];
   branches: Branch[];
  page: number;
  limit: number;
  total: number;
  q: string;
};

/* ================= COLUMNS ================= */

const columns: Column[] = [
  { key: "index", label: "STT", align: "center", width: "60px" },
  { key: "name", label: "Tên tài khoản", width: "260px" },
  { key: "branch", label: "Chi nhánh", align: "center", width: "260px" },
  { key: "type", label: "Loại TK", align: "center", width: "120px" },

  { key: "bank", label: "Ngân hàng", align: "center", width: "200px" },
  { key: "number", label: "Số TK", align: "center",  width: "160px"},
  { key: "balance", label: "Số dư", align: "right", width: "150px" },
  { key: "status", label: "Trạng thái", align: "center" },
  { key: "action", label: "" },
];

/* ================= HELPER ================= */

const formatMoney = (v?: number | null) =>
  (v || 0).toLocaleString("vi-VN") + " đ";

/* ================= COMPONENT ================= */

export default function AccountsClient({
  data,
  branches,
  page,
  limit,
  total,
  q,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(q);
  const [openCreate, setOpenCreate] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  

const branchMap: Record<string, Branch> = Object.fromEntries(
  branches.map((b) => [b.id, b])
);

function handleOpenDetail(id: string) {
  setLoadingDetailId(id);
  router.push(`/finance/accounts/${id}`);
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

  /* ================= EMPTY ================= */

  if (total === 0 && !q) {
    return (
      <EmptyState
        title="Chưa có tài khoản"
        description="Thêm tài khoản tiền để bắt đầu quản lý dòng tiền"
        action={
          <PrimaryButton onClick={() => setOpenCreate(true)}>
            Thêm tài khoản
          </PrimaryButton>
        }
      />
    );
  }

  if (q && data.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy tài khoản"
        description={`Không có kết quả phù hợp với "${q}"`}
        action={
          <PrimaryButton onClick={() => router.push(pathname)}>
            Xóa tìm kiếm
          </PrimaryButton>
        }
      />
    );
  }

  /* ================= RENDER ================= */

  return (
    <>
      <div>
        {/* ===== ACTION BAR ===== */}
        <div className={tableUI.container}>
          <TableActionBar
  left={
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1">
        <TableSearchInput
          value={keyword}
          onChange={setKeyword}
          onEnter={() => applySearch(keyword)}
        />
      </div>
    </div>
  }
  right={null}
/>
        </div>

        {/* ===== TABLE ===== */}
        <div className="mt-2">
          <TableContainer>
            <TableHead columns={columns} />

            <TableContainer.Body>
              {data.map((item, index) => {
                return (
                  <TableRow key={item.id}>
                    {/* STT */}
                    <TableCell align="center">
                      {(page - 1) * limit + index + 1}
                    </TableCell>

                    {/* NAME */}
                    <TableCell
                      className={`${textUI.bodyStrong} min-w-[220px]`}
                    >
                      <div className="flex items-center gap-2">
                        {item.account_name || "-"}

                        {/* default badge */}
                        {item.is_default && (
                          <span className={badgeUI.primary}>
                            Mặc định
                          </span>
                        )}
                      </div>
                    </TableCell>
					
{/* BRANCH ✅ Đưa lên trước */}
<TableCell>
  {item.branch_id
    ? branchMap[item.branch_id]?.name || "-"
    : "-"}
</TableCell>

                    {/* TYPE */}
                    <TableCell align="center">
                      <span className={badgeUI.neutral}>
                        {item.account_type === "cash"
                          ? "Tiền mặt"
                          : item.account_type === "bank"
                          ? "Ngân hàng"
                          : "Ví"}
                      </span>
                    </TableCell>
						
					
					
                    {/* BANK */}
                    <TableCell>
                      {item.bank_name || "-"}
                    </TableCell>

                    {/* NUMBER */}
                    <TableCell>
                      {item.account_number || "-"}
                    </TableCell>

                    {/* BALANCE */}
                    <TableCell align="right">
                      <span className="font-medium">
                        {formatMoney(item.current_balance)}
                      </span>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell align="center">
                      <span
                        className={
                          item.is_active
                            ? badgeUI.success
                            : badgeUI.neutral
                        }
                      >
                        {item.is_active
                          ? "Hoạt động"
                          : "Ngưng"}
                      </span>
                    </TableCell>

                    {/* ACTION */}
                    <TableCell>
  <button
    type="button"
    onClick={() => handleOpenDetail(item.id)}
    disabled={loadingDetailId === item.id}
    className="text-blue-600 hover:underline text-sm disabled:text-neutral-400 disabled:no-underline disabled:cursor-not-allowed"
  >
    {loadingDetailId === item.id ? "Đang mở..." : "Chi tiết"}
  </button>
</TableCell>
                  </TableRow>
                );
              })}
            </TableContainer.Body>
          </TableContainer>
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
      <AccountCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
		  branches={branches}
      />
    </>
  );
}