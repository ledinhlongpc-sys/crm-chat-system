"use client";

import StaffInfoMergedBox from "./boxes/StaffInfoMergedBox";
import StaffPayrollBox from "./boxes/StaffPayrollBox";
import StaffSalaryConfigBox from "./boxes/StaffSalaryConfigBox";
import StaffAllowanceConfigBox from "./boxes/StaffAllowanceConfigBox";
import StaffSeniorityBox from "./boxes/StaffSeniorityBox";
import StaffAttendanceBonusBox from "./boxes/StaffAttendanceBonusBox";
type Props = {
  staff: any;
  payrolls: any[];
  salaryConfig: any | null;
  allowanceItems: any[];
    itemTypes: any[];
	userType: string;
	seniorityConfig?: any;
	attendanceBonusConfig?: any;
};

export default function SalaryStaffDetailClient({
  staff,
  payrolls,
  salaryConfig,
  allowanceItems,
  itemTypes,
  userType,
  seniorityConfig,
  attendanceBonusConfig,
}: Props) {
  return (
    <div className="space-y-4">

      {/* ================= TOP LAYOUT ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT: INFO */}
        <div className="xl:col-span-2">
          <StaffInfoMergedBox staff={staff} />
        </div>

        {/* RIGHT: CONFIG */}
        <div className="space-y-4">
          <StaffSalaryConfigBox
            config={salaryConfig}
            staff_id={staff.id}
			userType={userType}      
			staffStatus={staff.status}
          />
			<StaffAllowanceConfigBox
    items={allowanceItems}
    staff_id={staff.id}
	userType={userType} 
	staffStatus={staff.status}
	  itemTypes={itemTypes}

  />
  <StaffAttendanceBonusBox
  config={attendanceBonusConfig}
  userType={userType}
  staffStatus={staff.status}
/>
          <StaffSeniorityBox
  config={seniorityConfig}
  staff={staff}
  userType={userType}
  staffStatus={staff.status}
/>
        </div>

      </div>

      {/* ================= PAYROLL ================= */}
      <StaffPayrollBox payrolls={payrolls} />

    </div>
  );
}