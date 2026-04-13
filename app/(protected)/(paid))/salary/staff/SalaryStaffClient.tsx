"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import TableContainer from "@/components/app/table/TableContainer";
import TableActionBar from "@/components/app/table/TableActionBar";
import TableSearchInput from "@/components/app/table/TableSearchInput";
import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";
import SelectFilter from "@/components/app/form/SelectFilter";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import { tableUI, badgeUI } from "@/ui-tokens";
import SalaryStaffCreateModal from "./SalaryStaffCreateModal";
import PayrollGenerateModal from "./PayrollGenerateModal";
import TableCheckbox from "@/components/app/form/TableCheckbox";
/* ================= TYPES ================= */

type Branch = {
  id: string;
  name: string;

};

type Position = {
  id: string;
  name: string;
  code: string;
};

type SalaryStaff = {
  id: string;
  full_name: string;
  phone: string | null;
  birth_date?: string | null;
  join_date?: string | null;
  position?: Position | null;

  status: string | null;
  created_at: string | null;

  branch?: Branch | null;
};

type Props = {
  data: SalaryStaff[];
  page: number;
  limit: number;
  total: number;
  q: string;
  status: string;
  position: string; 
  branch: string;
  branches: Branch[];
   positions: Position[];
   userType: string;
};

/* ================= COLUMNS ================= */


/* ================= HELPERS ================= */

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "-";
  
  const getSeniority = (date?: string | null) => {
  if (!date) return "-";

  const start = new Date(date);
  const now = new Date();

  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (months <= 0) return "Dưới 1 tháng";

  const years = Math.floor(months / 12);
  const remainMonths = months % 12;

  if (years === 0) {
    return `${months} tháng`;
  }

  if (remainMonths === 0) {
    return `${years} năm`;
  }

  return `${years} năm ${remainMonths} tháng`;
};


function getStatusLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "Đang làm";
    case "inactive":
      return "Ngưng làm";
    default:
      return status || "-";
  }
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700 border-green-200";
    case "inactive":
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}


/* ================= COMPONENT ================= */

export default function SalaryStaffClient({
  data,
  page,
  limit,
  total,
  q,
  status,
  position,
  branch,
  branches,
  positions,
  userType,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [keyword, setKeyword] = useState(q);
  const [statusValue, setStatusValue] = useState(status);
  const [positionValue, setPositionValue] = useState(position);
  const [branchValue, setBranchValue] = useState(branch);
  const [openCreate, setOpenCreate] = useState(false);
  
  const [openPayrollModal, setOpenPayrollModal] = useState(false);
  
  const [selected, setSelected] = useState<string[]>([]);
const [payrollLoading, setPayrollLoading] = useState(false);
const canGeneratePayroll = ["tenant", "admin", "manager"].includes(userType);

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
  { key: "index", label: "STT", align: "center", width: "60px" },
  { key: "name", label: "Họ tên", width: "220px" },
  { key: "phone", label: "SĐT", width: "140px" },
  { key: "birth_date", label: "Năm sinh", width: "100px" },
  { key: "position", label: "Chức vụ", width: "140px" },

  { key: "branch", label: "Chi nhánh", width: "200px" },
  
  { key: "join_date", label: "Ngày vào làm", width: "120px", align: "right" },
   { key: "seniority", label: "Thâm niên", width: "140px" },
   { key: "status", label: "Trạng thái", align: "center", width: "100px" },
];


  useEffect(() => {
    setStatusValue(searchParams.get("status") || "");
    setPositionValue(searchParams.get("position") || "");
    setBranchValue(searchParams.get("branch") || "");
  }, [searchParams]);

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applySearch(v: string) {
    setKeyword(v);

    const params = new URLSearchParams(searchParams.toString());

    if (v.trim()) {
      params.set("q", v.trim());
    } else {
      params.delete("q");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilter() {
    setKeyword("");
    setStatusValue("");
    setPositionValue("");
    setBranchValue("");
    router.push(pathname);
  }

  function handleView(id: string) {
    setLoadingId(id);
    router.push(`/salary/staff/${id}`);
  }

function toggleSelect(id: string) {
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
    setSelected(data.map((s) => s.id));
  }
}
async function handleGeneratePayroll(month: number, year: number) {
  if (selected.length === 0) return;

  try {
    setPayrollLoading(true);

    const res = await fetch("/api/salary/payroll/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        staff_ids: selected,
        month,
        year,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result?.error || "Tính lương thất bại");
    }
	toast.success("Tính lương thành công");
    // 🔥 reset + đóng modal
    setSelected([]);
    setOpenPayrollModal(false);

    router.refresh();
  } catch (error: any) {
    console.error(error);
    alert(error.message || "Có lỗi khi tính lương");
  } finally {
    setPayrollLoading(false);
  }
}



  return (
    <>
      <div>
        {/* ===== ACTION BAR ===== */}
        <TableActionBar
          left={
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 mr-2">
                <TableSearchInput
                  value={keyword}
                  onChange={setKeyword}
                  onEnter={() => applySearch(keyword)}
                  placeholder="Tìm tên, SĐT, vai trò..."
                />
              </div>
			     {/* 🔥 BUTTON TÍNH LƯƠNG */}
     {selected.length > 0 && (
  <PrimaryButton
    onClick={() => setOpenPayrollModal(true)}
    disabled={!canGeneratePayroll}
	 title={!canGeneratePayroll ? "Bạn không có quyền tính lương" : ""}
  >
    Tính lương ({selected.length})
  </PrimaryButton>
)}
            </div>
          }
          right={
            <div className="flex items-center gap-2">
              <SelectFilter
                value={statusValue}
                onChange={(v) => {
                  setStatusValue(v);
                  applyFilter("status", v);
                }}
                placeholder="Trạng thái"
                options={[
                  { value: "active", label: "Đang làm" },
                  { value: "inactive", label: "Ngưng làm" },
                ]}
              />

              <SelectFilter
  value={positionValue}
  onChange={(v) => {
    setPositionValue(v);
    applyFilter("position", v);
  }}
  placeholder="Chức vụ"
  options={[
     ...positions.map((p) => ({
      value: p.id,
      label: p.name,
    })),
  ]}
/>

              <SelectFilter
                value={branchValue}
                onChange={(v) => {
                  setBranchValue(v);
                  applyFilter("branch", v);
                }}
                placeholder="Chi nhánh"
                options={[
                  { value: "", label: "Chi nhánh" },
                  ...branches.map((item) => ({
                    value: item.id,
                    label: item.name,
                  })),
                ]}
              />

              {(q || statusValue || positionValue || branchValue) && (
                <SecondaryButton onClick={clearFilter}>
                  Xóa lọc
                </SecondaryButton>
              )}
            </div>
          }
        />

        {/* ===== TABLE / EMPTY ===== */}
        <div className="mt-2">
          {data.length === 0 ? (
            <EmptyState
              title={q ? "Không tìm thấy nhân viên" : "Không có nhân viên"}
              description={
                q
                  ? `Không có kết quả phù hợp với "${q}"`
                  : "Không có dữ liệu phù hợp với bộ lọc"
              }
              action={
                q || statusValue || positionValue || branchValue ? (
                  <PrimaryButton onClick={clearFilter}>
                    Xóa tìm kiếm
                  </PrimaryButton>
                ) : (
                  <PrimaryButton onClick={() => setOpenCreate(true)}>
  Thêm nhân viên
</PrimaryButton>
                )
              }
            />
          ) : (
            <TableContainer>
              <TableHead columns={columns} />

              <TableContainer.Body>
                {data.map((item, index) => (
				
				<TableRow
        key={item.id}
        className={selected.includes(item.id) ? "bg-blue-50" : ""}
      >
  <TableCell align="center" >
    <TableCheckbox
      checked={selected.includes(item.id)}
      onChange={() => toggleSelect(item.id)}
    />
  </TableCell>
                  

                    <TableCell align="center">
                      {(page - 1) * limit + index + 1}
                    </TableCell>

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
                          item.full_name
                        )}
                      </button>
                    </TableCell>

                    <TableCell>{item.phone || "-"}</TableCell>
<TableCell>
  {item.birth_date
    ? new Date(item.birth_date).toLocaleDateString("vi-VN")
    : "-"}
</TableCell>
					<TableCell>
  {item.position?.name || "-"}
</TableCell>


                    <TableCell>{item.branch?.name || "-"}</TableCell>

                    

                    <TableCell align="right">
  {item.join_date
    ? new Date(item.join_date).toLocaleDateString("vi-VN")
    : "-"}
</TableCell>
<TableCell>
  {getSeniority(item.join_date)}
</TableCell>
<TableCell align="center">
                      <span
                        className={`${badgeUI.base} ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </TableCell>
					
                  </TableRow>
                ))}
              </TableContainer.Body>
	
            </TableContainer>
          )}
        </div>

        {/* ===== PAGINATION ===== */}
        <div className={`mt-4 ${tableUI.container}`}>
          <PaginationControls page={page} limit={limit} total={total} />
        </div>
      </div>
	  <SalaryStaffCreateModal
  open={openCreate}
  onClose={() => setOpenCreate(false)}
  branches={branches}
  positions={positions}
/>
<PayrollGenerateModal
  open={openPayrollModal}
  onClose={() => setOpenPayrollModal(false)}
  onSubmit={handleGeneratePayroll} // 👈 truyền vào đây
  loading={payrollLoading}
/>
    </>
  );
}