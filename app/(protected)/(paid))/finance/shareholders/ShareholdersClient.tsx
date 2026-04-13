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
import ShareholderCreateModal from "./ShareholderCreateModal";

/* ================= TYPES ================= */

type Shareholder = {
  id: string;
  shareholder_name: string | null;
  phone: string | null;
  email: string | null;
  capital_commitment: number | null;
  capital_contributed: number | null;
  ownership_percent: number | null;
  status: "active" | "inactive";
  branch_id: string | null;
};
type Branch = {
  id: string;
  name: string;
  branch_code?: string;
  is_default?: boolean;
};

type Props = {
  data: Shareholder[];
  page: number;
  limit: number;
  total: number;
  q: string;
   branches: Branch[];
};


/* ================= COLUMNS ================= */

const columns: Column[] = [
   { key: "index", label: "STT", align: "center", width: "60px" },
   
  { key: "name", label: "Tên cổ đông",  width: "220px"},
  { key: "phone", label: "SĐT", width: "100px", align: "center" },
  { key: "email", label: "Email", width: "200px", align: "center" },
  { key: "branch", label: "Chi Nhánh", width: "240px",  align: "center" }, 
  { key: "commit", label: "Vốn cam kết", align: "right", width: "150px" },
  { key: "contributed", label: "Đã góp", align: "right" , width: "150px" },
  { key: "percent", label: "% sở hữu", width: "80px",  align: "center" },
  { key: "status", label: "Trạng thái", align: "center" },
  { key: "action", label: "" },
];

/* ================= HELPER ================= */

const formatMoney = (v?: number | null) =>
  (v || 0).toLocaleString("vi-VN") + " đ";

/* ================= COMPONENT ================= */

export default function ShareholdersClient({
  data,
  page,
  limit,
  total,
  q,
  branches,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(q);
  const [openCreate, setOpenCreate] = useState(false);
  

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
    <>
      <EmptyState
        title="Chưa có cổ đông"
        description="Thêm cổ đông đầu tiên để bắt đầu quản lý vốn"
        action={
          <PrimaryButton onClick={() => setOpenCreate(true)}>
            Thêm cổ đông
          </PrimaryButton>
        }
      />

      {/* 👇 THÊM CÁI NÀY */}
      <ShareholderCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
		branches={branches}
      />
    </>
  );
}

  if (q && data.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy cổ đông"
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
        <div >
          <TableActionBar
         left={
    <div className="flex items-center gap-2 flex-1">
      
      {/* SEARCH */}
      <div className="flex-1">
        <TableSearchInput
          value={keyword}
          onChange={setKeyword}
          onEnter={() => applySearch(keyword)}
        />
      </div>

    </div>
  }
/>
        </div>

        {/* ===== TABLE ===== */}
        <div className="mt-2">
          <TableContainer>
            <TableHead columns={columns} />

            <TableContainer.Body>
  {data.map((item, index) => {
    const isWarning =
      (item.capital_contributed || 0) <
      (item.capital_commitment || 0);

    return (
      <TableRow key={item.id}>
        {/* STT */}
        <TableCell align="center">
          {(page - 1) * limit + index + 1}
        </TableCell>

			
        <TableCell className={`${textUI.bodyStrong} min-w-[220px]`}>
          {item.shareholder_name || "-"}
        </TableCell>

        <TableCell className="w-[130px]">
          {item.phone || "-"}
        </TableCell>

        <TableCell className="max-w-[200px] truncate">
          {item.email || "-"}
        </TableCell>
	
		<TableCell>
  {branches.find((b) => b.id === item.branch_id)?.name || "-"}
</TableCell>

        <TableCell align="right">
          {formatMoney(item.capital_commitment)}
        </TableCell>

        <TableCell align="right">
          <span
            className={
              isWarning ? "text-red-500 font-medium" : ""
            }
          >
            {formatMoney(item.capital_contributed)}
          </span>
        </TableCell>

        <TableCell align="right">
          {item.ownership_percent
            ? item.ownership_percent + "%"
            : "-"}
        </TableCell>

        <TableCell align="center">
          <span
            className={
              item.status === "active"
                ? badgeUI.success
                : badgeUI.neutral
            }
          >
            {item.status === "active"
              ? "Hoạt động"
              : "Ngưng"}
          </span>
        </TableCell>

        <TableCell>
          <a
            href={`/finance/shareholders/${item.id}`}
            className="text-blue-600 hover:underline text-sm"
          >
            Chi tiết
          </a>
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
      <ShareholderCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
		branches={branches}
      />
    </>
  );
}