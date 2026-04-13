"use client";

import FormBox from "@/components/app/form/FormBox";
import AttendanceBox from "./AttendanceBox";

/* ================= HELPER ================= */

const formatMoney = (v?: number) =>
  new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(v || 0) + " đ";

function Row({ label, value }: any) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function PayrollDetailClient({ item, attendance }: any) {
  const payload = item.payload || {};

  const att = payload.attendance || {};
  const s = payload.salaries || {};
  const allowances = payload.allowances || [];
  const config = payload.config || {};

  return (
    <div className="grid grid-cols-3 gap-4">

      {/* ===== LEFT: CHẤM CÔNG ===== */}
      <div className="col-span-2">
        <AttendanceBox attendance={attendance} />
      </div>

      {/* ===== RIGHT: LƯƠNG ===== */}
      <div className="space-y-4">

        {/* ===== NHÂN VIÊN ===== */}
        <FormBox title="Thông tin nhân viên">
          <div className="space-y-2">
            <Row label="Tên" value={item.staff?.full_name} />
            <Row label="SĐT" value={item.staff?.phone} />
            <Row label="Chi nhánh" value={item.staff?.branch?.name} />
            <Row label="Ngày vào làm" value={item.staff?.join_date} />
          </div>
        </FormBox>

        {/* ===== TỔNG LƯƠNG ===== */}
        <FormBox title="Tổng lương">
          <div className="text-3xl font-bold text-blue-600">
            {formatMoney(item.final_salary)}
          </div>

          <div className="mt-2 text-sm space-y-1">

  {/* STATUS */}
  <div>
    Trạng thái:{" "}
    <span
      className={
        item.status === "paid"
          ? "text-green-600 font-medium"
          : item.status === "confirmed"
          ? "text-blue-600 font-medium"
          : "text-amber-600 font-medium"
      }
    >
      {item.status === "paid"
        ? "Đã thanh toán"
        : item.status === "confirmed"
        ? "Đã duyệt"
        : "Chờ duyệt"}
    </span>
  </div>

  {/* APPROVED */}
  {item.approved_at && (
    <div className="text-neutral-500">
      Duyệt lúc:{" "}
      {new Date(item.approved_at).toLocaleString("vi-VN")}
      {" - "}
      {item.approved_user?.full_name || "N/A"}
    </div>
  )}

  {/* PAID */}
  {item.status === "paid" && item.paid_at && (
    <div className="text-green-600">
      Thanh toán lúc:{" "}
      {new Date(item.paid_at).toLocaleString("vi-VN")}
      {" - "}
      {item.paid_user?.full_name || "N/A"}
    </div>
  )}

</div>
        </FormBox>

        {/* ===== GIỜ LÀM ===== */}
        <FormBox title="Giờ Làm Trong Tháng">
          <div className="space-y-2">
            <Row label="Ngày công" value={att.working_days} />
            <Row label="Giờ chuẩn" value={`${att.required_hours || 0}h`} />
            <Row label="Tổng Giờ Làm" value={`${att.total_hours || 0}h`} />
            <Row label="Tổng Giờ Tăng ca" value={`${att.ot_hours || 0}h`} />
            <Row label="Tổng Giờ Chủ nhật" value={`${att.sunday_hours || 0}h`} />
            <Row label="Tổng Giờ Ngày lễ" value={`${att.holiday_hours || 0}h`} />
          </div>
        </FormBox>

        {/* ===== LƯƠNG ===== */}
        <FormBox title="Lương chi tiết">
          <div className="space-y-2">
            <Row label="Lương tháng" value={formatMoney(s.normal_salary)} />
            <Row label="Tăng ca" value={formatMoney(s.ot_salary)} />
            <Row label="Chủ nhật" value={formatMoney(s.sunday_salary)} />
            <Row label="Ngày lễ" value={formatMoney(s.holiday_salary)} />
          </div>
        </FormBox>

        {/* ===== PHỤ CẤP ===== */}
        <FormBox title="Tiền Phụ Cấp">
          <div className="space-y-2">
            {allowances.length === 0 && <div>Không có</div>}
            {allowances.map((a: any, i: number) => (
              <Row
                key={i}
                label={a.name}
                value={formatMoney(a.adjusted_amount)}
              />
            ))}
          </div>
        </FormBox>

        {/* ===== THƯỞNG ===== */}
        <FormBox title="Tiền Thưởng">
          <div className="space-y-2">
            <Row label="Chuyên Cần" value={formatMoney(item.attendance_bonus)} />
            <Row label="Thâm Niên" value={formatMoney(item.seniority_bonus)} />
          </div>
        </FormBox>

        {/* ===== PHẠT ===== */}
        <FormBox title="Phạt & Tạm ứng">
          <div className="space-y-2">
            <Row label="Phạt" value={`- ${formatMoney(item.penalty_total)}`} />
            <Row label="Tạm ứng" value={`- ${formatMoney(item.advance_total)}`} />
          </div>
        </FormBox>

        {/* ===== CONFIG ===== */}
        <FormBox title="Cấu Hình Lương">
          <div className="space-y-2">
            {config.base_salary > 0 ? (
  <>
    <Row label="Lương Cơ Bản" value={formatMoney(config.base_salary)} />
    <Row label="Loại Lương" value="Theo Tháng" />
  </>
) : (
  <>
    <Row label="Lương Theo Giờ" value={formatMoney(config.salary_per_hour)} />
    <Row label="Loại Lương" value="Theo Giờ" />
  </>
)}
            <Row label="Hệ Số Tăng Ca" value={config.ot_rate} />
          </div>
        </FormBox>

      </div>
    </div>
  );
}