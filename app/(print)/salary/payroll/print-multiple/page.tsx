import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

export default async function PrintMultiplePage({
  searchParams,
}: any) {
  // ✅ NEXT 15
  const sp = await searchParams;
  const ids = sp?.ids?.split(",") || [];

  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);


  const { data } = await supabase
    .from("system_salary_payrolls")
    .select(`
      *,
      staff:system_salary_staffs (full_name)
    `)
    .in("id", ids)
    .eq("tenant_id", tenant_id);

  const formatMoney = (v: number) =>
  Math.round(v || 0).toLocaleString("vi-VN");

  return (
    <div className="bg-gray-100 print:bg-white flex justify-center">
      <div className="w-[210mm]">

        {/* ===== LIST ===== */}
        {data?.map((item: any) => {
          const payload = item?.payload || {};
          const config = payload.config || {};

		
const workingDays = Number(item.working_days || 0);
const totalHours = Number(item.total_hours || 0);
const normalHours = Math.min(totalHours, workingDays * 8);

          return (
            <div
              key={item.id}
              className="bg-white p-6 page-break"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {/* ===== HEADER ===== */}
              <div className="text-center mb-2">
                <div className="text-lg font-bold">
                  BẢNG LƯƠNG
                </div>
                <div className="text-sm">
                  Tháng {item.month}/{item.year}
                </div>
              </div>

              {/* ===== INFO ===== */}
              <div className="mb-2 text-sm">
                Nhân viên: <b>{item.staff?.full_name}</b>
              </div>

              {/* ===== TABLE ===== */}
              <table className="w-full text-sm border border-gray-300">
                <tbody>

                  {/* LƯƠNG CƠ BẢN / GIỜ */}
				  <tr>
<td className="p-2">
  {config.base_salary > 0
    ? `Lương cơ bản (${item.working_days || 0} ngày công)`
    : `Lương theo giờ (${item.working_days || 0} ngày công)`}
</td>
                    <td className="p-2 text-right">
                      {formatMoney(
                        config.base_salary > 0
                          ? config.base_salary
                          : config.salary_per_hour
                      )} đ
                    </td>
                  </tr>

                  {/* LƯƠNG CHÍNH */}
                  <tr className="border-b">
                   <td className="p-2">
  {`Lương ngày thường (${normalHours.toFixed(2)}h)`}
</td>
                    <td className="p-2 text-right">
                      {formatMoney(item.normal_salary)} đ
                    </td>
                  </tr>

                  {/* TĂNG CA */}
                  <tr className="border-b">
                    <td className="p-2">Tổng tăng ca</td>
                    <td className="p-2 text-right">
                      {formatMoney(
                        (item.ot_salary || 0) +
                        (item.sunday_salary || 0) +
                        (item.holiday_salary || 0)
                      )} đ
                    </td>
                  </tr>

                  {/* PHỤ CẤP */}
                  <tr className="border-b">
                    <td className="p-2">Phụ cấp</td>
                    <td className="p-2 text-right">
                      {formatMoney(item.allowance_total)} đ
                    </td>
                  </tr>

                  {/* THƯỞNG */}
                  <tr className="border-b">
                    <td className="p-2">Chuyên cần</td>
                    <td className="p-2 text-right">
                      {formatMoney(item.attendance_bonus)} đ
                    </td>
                  </tr>

                  <tr className="border-b">
                    <td className="p-2">Thâm niên</td>
                    <td className="p-2 text-right">
                      {formatMoney(item.seniority_bonus)} đ
                    </td>
                  </tr>

                  {/* PHẠT */}
                  <tr className="border-b text-red-600">
                    <td className="p-2">Phạt</td>
                    <td className="p-2 text-right">
                      -{formatMoney(item.penalty_total)} đ
                    </td>
                  </tr>

                  <tr className="border-b text-red-600">
                    <td className="p-2">Tạm ứng</td>
                    <td className="p-2 text-right">
                      -{formatMoney(item.advance_total)} đ
                    </td>
                  </tr>

                  {/* TOTAL */}
                  <tr className="font-bold bg-gray-100">
                    <td className="p-2">THỰC NHẬN</td>
                    <td className="p-2 text-right text-green-600">
                      {formatMoney(item.final_salary)} đ
                    </td>
                  </tr>

                </tbody>
              </table>

              {/* ===== SIGN ===== */}
              <div className="flex justify-between mt-2 text-sm">
                <div className="text-center">
                  Người lập
                </div>
                <div className="text-center">
                  Người nhận
                </div>
              </div>
            </div>
          );
        })}

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
          .page-break {
            page-break-after: always;
          }

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