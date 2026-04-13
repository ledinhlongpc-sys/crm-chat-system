import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";
import AttendanceHeaderActions from "./AttendanceHeaderActions";
import AttendanceClient from "./AttendanceClient";
import { getTodayVN } from "@/lib/helpers/date-vn";
/* ================= TYPES ================= */

type Props = {
  searchParams?: {
    date?: string;
  };
};

export default async function AttendancePage({
  searchParams,
}: Props) {
  const params = await searchParams;

  /* 🔥 DATE VN */
  const selectedDate = params?.date || getTodayVN();

  const supabase = await createSupabaseServerComponentClient();
  const tenant_id = await getTenantId(supabase);

  /* ================= USER ================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userType = "staff";

  if (user?.id) {
    const { data: userInfo } = await supabase
      .from("system_user")
      .select("user_type")
      .eq("system_user_id", user.id)
      .maybeSingle();

    userType = userInfo?.user_type || "staff";
  }

  /* ================= STAFF ================= */

  const { data: staffs, error: staffError } = await supabase
    .from("system_salary_staffs")
    .select("id, full_name")
    .eq("tenant_id", tenant_id)
    .eq("status", "active")
    .order("full_name", { ascending: true });

  if (staffError) throw new Error(staffError.message);

  /* ================= ATTENDANCE ================= */

  const { data: attendances, error: attendanceError } = await supabase
    .from("system_salary_attendance")
    .select("*")
    .eq("tenant_id", tenant_id)
    .eq("work_date", selectedDate);

  if (attendanceError) throw new Error(attendanceError.message);

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Chấm công nhân viên"
          
		  left={<BackButton href="/salary" />}
          right={
            <AttendanceHeaderActions selectedDate={selectedDate} />
          }
        />

        <AttendanceClient
          staffs={staffs || []}
          attendances={attendances || []}
          selectedDate={selectedDate}
          userType={userType}
        />
      </div>
    </div>
  );
}