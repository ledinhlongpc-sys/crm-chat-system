"use client";

import { badgeUI } from "@/ui-tokens";

import FormBox from "@/components/app/form/FormBox";
import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import EmptyState from "@/components/app/empty-state/EmptyState";

/* ================= TYPES ================= */

type Payroll = {
  id: string;
  month: number;
  year: number;

  total_hours?: number;

  normal_salary?: number;
  ot_salary?: number;
  sunday_salary?: number;
  holiday_salary?: number;

  allowance_total?: number;
  attendance_bonus?: number;
  seniority_bonus?: number;
  penalty_total?: number;
  advance_total?: number;

  final_salary?: number;
  status?: string;
};

/* ================= CONFIG ================= */

const columns: Column[] = [
  { key: "month", label: "Kỳ lương", width: "80px" },
  { key: "hours", label: "Giờ làm", align: "right", width: "80px" },

  { key: "normal", label: "Lương tháng", align: "right", width: "100px" },
  { key: "ot_total", label: "Tổng tăng ca", align: "right", width: "100px" },

  { key: "allowance", label: "Phụ cấp", align: "right", width: "100px" },
  { key: "attendance", label: "Chuyên cần", align: "right", width: "100px" },
  { key: "seniority", label: "Thâm niên", align: "right", width: "100px" },

  { key: "penalty", label: "Phạt", align: "right", width: "100px" },
  { key: "advance", label: "Tạm ứng", align: "right", width: "100px" },

  { key: "total", label: "Tổng lương", align: "right", width: "120px" },
  { key: "status", label: "Trạng thái", align: "center", width: "100px" },
];

/* ================= HELPER ================= */

const formatMoney = (v?: number) =>
  new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(v || 0) + " đ";

function getStatusLabel(status?: string) {
  return status === "confirmed" ? "Đã duyệt" : "Chờ duyệt";
}

function getStatusClass(status?: string) {
  return status === "confirmed"
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-amber-100 text-amber-700 border-amber-200";
}

/* ================= COMPONENT ================= */

export default function StaffPayrollBox({
  payrolls,
}: {
  payrolls: Payroll[];
}) {
  return (
    <FormBox title="Danh sách bảng lương">
      {payrolls.length === 0 ? (
        <EmptyState
          title="Chưa có bảng lương"
          description="Nhân viên chưa được tính lương"
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[1200px] border-collapse">
            <TableHead columns={columns} />

            <tbody>
              {payrolls.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.month}/{item.year}</TableCell>

                  <TableCell align="right">
                    {item.total_hours ?? 0}
                  </TableCell>

                  <TableCell align="right">
                    {formatMoney(item.normal_salary)}
                  </TableCell>

                 <TableCell align="right">
  {formatMoney(
    (item.ot_salary || 0) +
    (item.sunday_salary || 0) +
    (item.holiday_salary || 0)
  )}
</TableCell>

                  <TableCell align="right">
                    {formatMoney(item.allowance_total)}
                  </TableCell>

                  <TableCell align="right">
                    {formatMoney(item.attendance_bonus)}
                  </TableCell>

                  <TableCell align="right">
                    {formatMoney(item.seniority_bonus)}
                  </TableCell>

                  <TableCell align="right">
                    <span className="text-red-600">
                      - {formatMoney(item.penalty_total)}
                    </span>
                  </TableCell>

                  <TableCell align="right">
                    <span className="text-red-600">
                      - {formatMoney(item.advance_total)}
                    </span>
                  </TableCell>

                  <TableCell align="right">
                    <span className="font-semibold text-neutral-900">
                      {formatMoney(item.final_salary)}
                    </span>
                  </TableCell>

                  <TableCell align="center">
                    <span className={`${badgeUI.base} ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </FormBox>
  );
}