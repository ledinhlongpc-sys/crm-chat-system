"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import TableContainer from "@/components/app/table/TableContainer";
import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import TableCheckbox from "@/components/app/form/TableCheckbox";

import TableSearchInput from "@/components/app/table/TableSearchInput";
import TableActionBar from "@/components/app/table/TableActionBar";
import PaginationControls from "@/components/app/PaginationControls";
import SelectFilter from "@/components/app/form/SelectFilter";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import LinkButtonLoading from "@/components/app/button/LinkButtonLoading";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import PrintPayrollModal from "./PrintPayrollModal";
import { badgeUI, tableUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Payroll = {
  id: string;
  month: number;
  year: number;

  total_hours: number;

  normal_salary: number;
  ot_salary: number;
  sunday_salary: number;
  holiday_salary: number;

  allowance_total: number;
  attendance_bonus: number;
  seniority_bonus: number;

  penalty_total: number;
  advance_total: number;

  final_salary: number;
  status: string;

  staff?: {
    id: string;
    full_name: string;
    phone?: string;
    branch_id?: string;
    status: string;
  };
};

type Staff = {
  id: string;
  full_name: string;
};

type Branch = {
  id: string;
  name: string;
};

/* ================= HELPERS ================= */

const formatMoney = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(v || 0) + " đ";

function getStatusLabel(status: string) {
  if (status === "paid") return "Đã thanh toán";
  if (status === "confirmed") return "Đã duyệt";
  return "Chờ duyệt";
}

function getStatusClass(status: string) {
  if (status === "paid") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (status === "confirmed") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  return "bg-amber-100 text-amber-700 border-amber-200";
}
/* ================= COMPONENT ================= */

export default function PayrollClient({
  data,
  page,
  limit,
  total,
  q,
  month,
  year,
  staffs,
  branches,
  staff,
  branch,
  status,
}: {
  data: Payroll[];
  page: number;
  limit: number;
  total: number;
  q: string;
  month: string;
  year: string;
  staffs: Staff[];
  branches: Branch[];
  staff: string;
  branch: string;
  status: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<string[]>([]);
  const [keyword, setKeyword] = useState(q || "");
  const [staffValue, setStaffValue] = useState(staff || "");
  const [branchValue, setBranchValue] = useState(branch || "");
  const [monthValue, setMonthValue] = useState(month || "");
  const [yearValue, setYearValue] = useState(year || "");
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);
  const [statusValue, setStatusValue] = useState(status || "");

  /* ================= SELECT ================= */

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

  function toggleAll() {
    if (selected.length === data.length) {
      setSelected([]);
    } else {
      setSelected(data.map((i) => i.id));
    }
  }

  /* ================= FILTER ================= */

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applySearch() {
    updateParams("q", keyword);
  }

  function clearFilter() {
    setKeyword("");
    setBranchValue("");
    setMonthValue("");
    setYearValue("");
	 setStatusValue("");
    router.push(pathname);
  }

  /* ================= APPROVE ================= */

  async function approve() {
    if (selected.length === 0) return;

    try {
	  setLoadingApprove(true);
      await fetch("/api/salary/payroll/approve", {
        method: "POST",
        body: JSON.stringify({ ids: selected }),
      });

      toast.success("Duyệt thành công");
      setSelected([]);
	  setLoadingApprove(false); 
      router.refresh();
    } catch {
      toast.error("Lỗi duyệt");
    }
  }


/* ================= PRINT ================= */

function printPayroll() {
  if (selected.length === 0) return;

  setOpenPrint(true); // 👉 mở modal
}

/* ================= PAY ================= */

async function payPayroll() {
  if (selected.length === 0) return;

  try {
    await fetch("/api/salary/payroll/pay", {
      method: "POST",
      body: JSON.stringify({ ids: selected }),
    });

    toast.success("Đã thanh toán");
    setSelected([]);
    router.refresh();
  } catch {
    toast.error("Lỗi thanh toán");
  }
}

  /* ================= COLUMNS ================= */

  const columns: Column[] = [
    
{
      key: "check",
      width: "40px",
      align: "center",
      compact: true,
      header: (
        <TableCheckbox
      checked={selected.length === data.length && data.length > 0}
            onChange={toggleAll}

    />
      ),
    },
    { key: "month", label: "Kỳ Lương", width: "80px" },
  { key: "name", label: "Nhân viên", width: "160px" },

  { key: "hours", label: "Giờ làm", align: "right", width: "80px" },

  { key: "normal", label: "Lương tháng", align: "right", width: "100px" },
  { key: "ot_total", label: "Tổng tăng ca", align: "right", width: "120px" },

  { key: "allowance", label: "Phụ cấp", align: "right", width: "120px" },
  { key: "attendance", label: "Chuyên cần", align: "right", width: "120px" },
  { key: "seniority", label: "Thâm niên", align: "right", width: "120px" },

  { key: "penalty", label: "Phạt", align: "right", width: "120px" },
  { key: "advance", label: "Tạm ứng", align: "right", width: "120px" },

  { key: "total", label: "Tổng lương", align: "right", width: "120px" },
  { key: "status", label: "Trạng thái", align: "center", width: "120px" },
];

  /* ================= UI ================= */

  return (
    <div>
      {/* ===== ACTION BAR ===== */}
      <TableActionBar
        left={
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 mr-2">
              <TableSearchInput
                value={keyword}
                onChange={setKeyword}
                onEnter={applySearch}
                placeholder="Tìm tên, SĐT..."
              />
            </div>

            {selected.length > 0 && (
  <>
    <span className="text-sm text-neutral-500 mr-2">
      Đã chọn {selected.length}
    </span>

    <PrimaryButton
  onClick={approve}
  loading={loadingApprove}
  disabled={loadingApprove}
>
  Duyệt
</PrimaryButton>

    <SecondaryButton onClick={printPayroll}>
  In
</SecondaryButton>

    <SecondaryButton onClick={payPayroll}>
      Thanh toán
    </SecondaryButton>
  </>
)}
          </div>
        }
        right={
          <div className="flex items-center gap-2">

            {/* 🏢 Chi nhánh */}
            <SelectFilter
              value={branchValue}
              onChange={(v) => {
                setBranchValue(v);
                updateParams("branch", v);
              }}
              placeholder="Chi nhánh"
              options={[
              
                ...branches.map((b) => ({
                  value: b.id,
                  label: b.name,
                })),
              ]}
            />
			{/* 📌 Trạng thái */}
<SelectFilter
  value={statusValue}
  onChange={(v) => {
    setStatusValue(v);
    updateParams("status", v);
  }}
  placeholder="Trạng thái"
  options={[
    
    { value: "draft", label: "Chờ duyệt" },
    { value: "confirmed", label: "Đã duyệt" },
    { value: "paid", label: "Đã thanh toán" },
  ]}
/>
            {/* 📅 Tháng */}
            <SelectFilter
              value={monthValue}
              onChange={(v) => {
                setMonthValue(v);
                updateParams("month", v);
              }}
              placeholder="Tháng"
              options={Array.from({ length: 12 }).map((_, i) => ({
                value: String(i + 1),
                label: `Tháng ${i + 1}`,
              }))}
            />

            {/* 📅 Năm */}
            <SelectFilter
              value={yearValue}
              onChange={(v) => {
                setYearValue(v);
                updateParams("year", v);
              }}
              placeholder="Năm"
              options={[
                { value: "2025", label: "2025" },
                { value: "2026", label: "2026" },
              ]}
            />

           {(keyword || branchValue || monthValue || yearValue || statusValue) && (
  <SecondaryButton onClick={clearFilter}>
    Xóa lọc
  </SecondaryButton>
)}
          </div>
        }
      />

      {/* ===== TABLE ===== */}
     <div className={`${tableUI.container} mt-2`}>
  <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[1200px] border-collapse">
         <TableHead columns={columns} />

          <TableContainer.Body>
            {data.map((item) => (
              <TableRow
  key={item.id}
  className={selected.includes(item.id) ? "bg-blue-50" : ""}
>
  {/* checkbox */}
  <TableCell align="center">
    <TableCheckbox
  checked={selected.includes(item.id)}
  onChange={(e) => {

    toggle(item.id);
  }}
/>
  </TableCell>

  {/* kỳ */}
  <TableCell>
  <LinkButtonLoading
    href={`/salary/payroll/${item.id}`}
    title={`${item.month}/${item.year}`}
  >
    {item.month}/{item.year}
  </LinkButtonLoading>
</TableCell>

  {/* nhân viên */}
  <TableCell>
    {item.staff?.full_name || "-"}
  </TableCell>

  {/* giờ */}
  <TableCell align="right">
    {item.total_hours ?? 0}
  </TableCell>

  {/* lương tháng */}
  <TableCell align="right">
    {formatMoney(item.normal_salary)}
  </TableCell>

  {/* tổng tăng ca */}
  <TableCell align="right">
    {formatMoney(
      (item.ot_salary || 0) +
      (item.sunday_salary || 0) +
      (item.holiday_salary || 0)
    )}
  </TableCell>

  {/* phụ cấp */}
  <TableCell align="right">
    {formatMoney(item.allowance_total)}
  </TableCell>

  {/* chuyên cần */}
  <TableCell align="right">
    {formatMoney(item.attendance_bonus)}
  </TableCell>

  {/* thâm niên */}
  <TableCell align="right">
    {formatMoney(item.seniority_bonus)}
  </TableCell>

  {/* phạt */}
  <TableCell align="right">
    <span className="text-red-600">
      - {formatMoney(item.penalty_total)}
    </span>
  </TableCell>

  {/* tạm ứng */}
  <TableCell align="right">
    <span className="text-red-600">
      - {formatMoney(item.advance_total)}
    </span>
  </TableCell>

  {/* tổng */}
  <TableCell align="right">
    <span className="font-semibold text-neutral-900">
      {formatMoney(item.final_salary)}
    </span>
  </TableCell>

  {/* trạng thái */}
  <TableCell align="center">
    <span className={`${badgeUI.base} ${getStatusClass(item.status)}`}>
      {getStatusLabel(item.status)}
    </span>
  </TableCell>
</TableRow>
            ))}
          </TableContainer.Body>
		  </table>
  </div>
</div>
    
      {/* ===== PAGINATION ===== */}
      <div className={`mt-4 ${tableUI.container}`}>
        <PaginationControls page={page} limit={limit} total={total} />
      </div>
	  <PrintPayrollModal
  open={openPrint}
  onClose={() => setOpenPrint(false)}
  payrollIds={selected}
/>
    </div>
  );
}