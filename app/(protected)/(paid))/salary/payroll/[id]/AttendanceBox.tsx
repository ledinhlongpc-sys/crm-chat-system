"use client";

import FormBox from "@/components/app/form/FormBox";
import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import EmptyState from "@/components/app/empty-state/EmptyState";

/* ================= TYPES ================= */

type Attendance = {
  work_date: string;
  morning_check_in?: string;
  morning_check_out?: string;
  afternoon_check_in?: string;
  afternoon_check_out?: string;
  total_hours?: number;
};

/* ================= CONFIG ================= */

const columns: Column[] = [
   { key: "weekday", label: "Thứ", width: "80px" },
  { key: "date", label: "Ngày", width: "120px" },
  { key: "morning", label: "Ca sáng", align: "center", width: "200px" },
  { key: "afternoon", label: "Ca chiều", align: "center", width: "200px" },
  { key: "hours", label: "Giờ", align: "right", width: "100px" },
];

/* ================= HELPER ================= */

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN");
}
function getWeekday(date: string) {
  const d = new Date(date).getDay();

  const map = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  return map[d];
}
/* ================= COMPONENT ================= */

export default function AttendanceBox({
  attendance,
}: {
  attendance: Attendance[];
}) {
  return (
    <FormBox title="Chi Tiết Chấm Công Trong Tháng">

      {attendance.length === 0 ? (
        <EmptyState
          title="Chưa có dữ liệu"
          description="Nhân viên chưa có chấm công"
        />
      ) : (
        <div className="overflow-x-auto rounded-2 border border-neutral-200 bg-white">
          <table className="w-full min-w-[600px] border-collapse">
            <TableHead columns={columns} />

            <tbody>
              {attendance.map((a, i) => {
                const isSunday =
                  new Date(a.work_date).getDay() === 0;

                const isLow = (a.total_hours || 0) < 8;

                return (
                  <TableRow
                    key={i}
                    className={`
                      ${isSunday ? "bg-green-50" : ""}
                      ${isLow ? "bg-red-50" : ""}
                    `}
                  >
				  <TableCell>
  <span
    className={
      new Date(a.work_date).getDay() === 0
        ? "text-green-600 font-medium"
        : ""
    }
  >
    {getWeekday(a.work_date)}
  </span>
</TableCell>
                    {/* NGÀY */}
                    <TableCell>
                      {formatDate(a.work_date)}
                    </TableCell>

                    {/* SÁNG */}
                    <TableCell align="center">
                      {a.morning_check_in && a.morning_check_out
                        ? `${a.morning_check_in} - ${a.morning_check_out}`
                        : "-"}
                    </TableCell>

                    {/* CHIỀU */}
                    <TableCell align="center">
                      {a.afternoon_check_in && a.afternoon_check_out
                        ? `${a.afternoon_check_in} - ${a.afternoon_check_out}`
                        : "-"}
                    </TableCell>

                    {/* GIỜ */}
                    <TableCell align="right">
                      <span className="font-medium">
                        {a.total_hours || 0}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </FormBox>
  );
}