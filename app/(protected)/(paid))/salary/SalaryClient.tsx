"use client";

import KPIBox from "./boxes/KPIBox";
import SalaryChartBox from "./SalaryChartBox";

/* ================= HELPER ================= */

function KPIWrap({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  if (!href) return <>{children}</>;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <div className="cursor-pointer hover:scale-[1.02] transition">
        {children}
      </div>
    </a>
  );
}

/* ================= COMPONENT ================= */

export default function SalaryClient({
  totalSalary,
  totalAllowance,
  totalPenalty,
  totalAdvance,
  netSalary,
  attendanceBonus,
  seniorityBonus,
  staffCount,
  chartData,
}: any) {
  return (
    <div className="space-y-4">
      {/* KPI 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPIWrap href="/salary/payroll">
          <KPIBox title="Tổng lương" value={totalSalary} />
        </KPIWrap>

        <KPIWrap href="/salary/allowance">
          <KPIBox title="Phụ cấp" value={totalAllowance} type="income" />
        </KPIWrap>

        <KPIWrap href="/salary/penalties">
          <KPIBox title="Phạt" value={totalPenalty} type="expense" />
        </KPIWrap>

        <KPIWrap href="/salary/advances">
          <KPIBox title="Tạm ứng" value={totalAdvance} type="expense" />
        </KPIWrap>
      </div>

      {/* KPI 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* ❌ không link */}
        <KPIBox title="Thực nhận" value={netSalary} type="profit" />

        {/* ❌ không link */}
        <KPIBox title="Chuyên cần" value={attendanceBonus} />

        {/* ❌ không link */}
        <KPIBox title="Thâm niên" value={seniorityBonus} />

        <KPIWrap href="/salary/staff">
          <KPIBox title="Nhân viên" value={staffCount} type="count" />
        </KPIWrap>
      </div>

      {/* CHART */}
      <SalaryChartBox data={chartData} />
    </div>
  );
}