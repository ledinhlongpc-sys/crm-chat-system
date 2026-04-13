import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

export default async function PrintPage({ params, searchParams }: any) {
  const { id } = await params;

  // ✅ NEXT 15
  const sp = await searchParams;
  const size = sp?.size || "A4";

  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  const { data } = await supabase
    .from("system_salary_payrolls")
    .select(`
      *,
      staff:system_salary_staffs (full_name)
    `)
    .eq("id", id)
    .eq("tenant_id", tenant_id)
    .single();

  const formatMoney = (v: number) =>
    Math.round(v || 0).toLocaleString("vi-VN");

  /* ================= CONFIG ================= */

  const payload = data?.payload || {};
  const config = payload.config || {};

  const workingDays = Number(data?.working_days || 0);
  const totalHours = Number(data?.total_hours || 0);
  const normalHours = Math.min(totalHours, workingDays * 8);

  /* ================= SIZE ================= */

  const sizeClass =
    size === "A4"
      ? "w-[210mm] min-h-[297mm]"
      : size === "A5"
      ? "w-[148mm] min-h-[210mm]"
      : "w-[105mm] min-h-[148mm]";

  return (
    <div className="flex justify-center bg-gray-100 print:bg-white">
      <div
        className={`bg-white p-6 ${sizeClass}`}
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* ===== HEADER ===== */}
        <div className="text-center mb-4">
          <div className="text-lg font-bold">BẢNG LƯƠNG</div>
          <div className="text-sm">
            Tháng {data.month}/{data.year}
          </div>
        </div>

        {/* ===== INFO ===== */}
        <div className="mb-2 text-sm">
          Nhân viên: <b>{data.staff?.full_name}</b>
        </div>

        {/* ===== TABLE ===== */}
        <table className="w-full text-sm border border-gray-300">
          <tbody>

            {/* LƯƠNG CHUẨN */}
            <tr className="border-b">
              <td className="p-2">
                {config.base_salary > 0
                  ? `Lương cơ bản (${workingDays} ngày công)`
                  : `Lương theo giờ (${workingDays} ngày công)`
                }
              </td>

              <td className="p-2 text-right">
                {formatMoney(
                  config.base_salary > 0
                    ? config.base_salary
                    : config.salary_per_hour
                )} đ
              </td>
            </tr>

            {/* LOẠI LƯƠNG */}
            <tr className="border-b">
              <td className="p-2">Loại lương</td>
              <td className="p-2 text-right">
                {config.base_salary > 0 ? "Theo tháng" : "Theo giờ"}
              </td>
            </tr>

            {/* LƯƠNG NGÀY THƯỜNG */}
            <tr className="border-b">
              <td className="p-2">
                {`Lương ngày thường (${normalHours.toFixed(2)}h)`}
              </td>
              <td className="p-2 text-right">
                {formatMoney(data.normal_salary)} đ
              </td>
            </tr>

            {/* TĂNG CA */}
            <tr className="border-b">
              <td className="p-2">Tổng tăng ca</td>
              <td className="p-2 text-right">
                {formatMoney(
                  (data.ot_salary || 0) +
                  (data.sunday_salary || 0) +
                  (data.holiday_salary || 0)
                )} đ
              </td>
            </tr>

            {/* PHỤ CẤP */}
            <tr className="border-b">
              <td className="p-2">Phụ cấp</td>
              <td className="p-2 text-right">
                {formatMoney(data.allowance_total)} đ
              </td>
            </tr>

            {/* CHUYÊN CẦN */}
            <tr className="border-b">
              <td className="p-2">Chuyên cần</td>
              <td className="p-2 text-right">
                {formatMoney(data.attendance_bonus)} đ
              </td>
            </tr>

            {/* THÂM NIÊN */}
            <tr className="border-b">
              <td className="p-2">Thâm niên</td>
              <td className="p-2 text-right">
                {formatMoney(data.seniority_bonus)} đ
              </td>
            </tr>

            {/* PHẠT */}
            <tr className="border-b text-red-600">
              <td className="p-2">Phạt</td>
              <td className="p-2 text-right">
                -{formatMoney(data.penalty_total)} đ
              </td>
            </tr>

            {/* TẠM ỨNG */}
            <tr className="border-b text-red-600">
              <td className="p-2">Tạm ứng</td>
              <td className="p-2 text-right">
                -{formatMoney(data.advance_total)} đ
              </td>
            </tr>

            {/* THỰC NHẬN */}
            <tr className="font-bold bg-gray-100">
              <td className="p-2">THỰC NHẬN</td>
              <td className="p-2 text-right text-green-600">
                {formatMoney(data.final_salary)} đ
              </td>
            </tr>

          </tbody>
        </table>

        {/* ===== SIGN ===== */}
        <div className="flex justify-between mt-4 text-sm">
          <div className="text-center">Người lập</div>
          <div className="text-center">Người nhận</div>
        </div>
      </div>

      {/* AUTO PRINT */}
      <script
        dangerouslySetInnerHTML={{
          __html: "window.onload = () => window.print()",
        }}
      />

      {/* PRINT CSS */}
      <style>
        {`
          @media print {
            body {
              margin: 0;
              background: white;
            }
          }
        `}
      </style>
    </div>
  );
}