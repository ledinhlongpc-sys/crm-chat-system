"use client";

import FormBox from "@/components/app/form/FormBox";
import { textUI, badgeUI } from "@/ui-tokens";

export default function StaffInfoMergedBox({ staff }: any) {
  return (
    <FormBox title="Thông tin nhân viên">
      
      <div className="space-y-6">

        {/* ================= THÔNG TIN CÁ NHÂN ================= */}
        <Section title="Thông tin cá nhân">
          <InfoRow label="Họ tên" value={staff.full_name} />
          <InfoRow label="SĐT" value={staff.phone} />
          <InfoRow label="Ngày sinh" value={formatDate(staff.birth_date)} />
          <InfoRow label="CCCD" value={staff.id_number} />
          <InfoRow label="Địa chỉ" value={staff.address} />
        </Section>

        {/* ================= THÔNG TIN CÔNG VIỆC ================= */}
        <Section title="Thông tin công việc">
          <InfoRow label="Chức vụ" value={staff.position?.name} />
          <InfoRow label="Chi nhánh" value={staff.branch?.name} />
          <InfoRow label="Ngày vào làm" value={formatDate(staff.join_date)} />
          
          <BadgeRow
            label="Trạng thái"
            badgeClass={getStatusClass(staff.status)}
            badgeLabel={getStatusLabel(staff.status)}
          />

          <InfoRow
            label="Thâm niên"
            value={getSeniority(staff.join_date)}
          />
        </Section>

      </div>

    </FormBox>
  );
}

/* ================= UI PARTS ================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className={textUI.cardTitle}>{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 items-start">
      <div className={textUI.label}>{label}</div>
      <div className={textUI.body}>{value || "-"}</div>
    </div>
  );
}

function BadgeRow({
  label,
  badgeLabel,
  badgeClass,
}: {
  label: string;
  badgeLabel: string;
  badgeClass: string;
}) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 items-center">
      <div className={textUI.label}>{label}</div>
      <div>
        <span className={`${badgeUI.base} ${badgeClass}`}>
          {badgeLabel}
        </span>
      </div>
    </div>
  );
}

/* ================= HELPER ================= */

const formatDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString("vi-VN") : "-";

function getStatusLabel(status?: string) {
  return status === "active" ? "Đang làm" : "Ngưng làm";
}

function getStatusClass(status?: string) {
  return status === "active"
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-neutral-100 text-neutral-600 border-neutral-200";
}

function getSeniority(date?: string) {
  if (!date) return "-";

  const start = new Date(date);
  const now = new Date();

  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (months <= 0) return "Dưới 1 tháng";

  const years = Math.floor(months / 12);
  const remain = months % 12;

  if (years === 0) return `${months} tháng`;
  if (remain === 0) return `${years} năm`;

  return `${years} năm ${remain} tháng`;
}