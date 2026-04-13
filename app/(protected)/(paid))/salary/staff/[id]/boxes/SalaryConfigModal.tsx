"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import PercentageInput from "@/components/app/form/PercentageInput";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import MoneyInput from "@/components/app/form/MoneyInput";
import { textUI } from "@/ui-tokens";
import toast from "react-hot-toast";

type Props = {
open: boolean;
onClose: () => void;
staff_id: string;
config?: any | null;
userType: string;
};

export default function SalaryConfigModal({
open,
onClose,
staff_id,
config,
userType,
}: Props) {
const [loading, setLoading] = useState(false);
const router = useRouter();

const [salaryType, setSalaryType] = useState("monthly");
const [baseSalary, setBaseSalary] = useState("");
const [salaryPerHour, setSalaryPerHour] = useState("");
const [otRate, setOtRate] = useState("1.5");
const [commission, setCommission] = useState("");

// 🔥 NEW
const [otRateSunday, setOtRateSunday] = useState("2");
const [otRateHoliday, setOtRateHoliday] = useState("3");
const [isHolidayPaid, setIsHolidayPaid] = useState(true);

const canEditSalary = ["tenant", "admin", "manager"].includes(userType);
const isEdit = !!config;

useEffect(() => {
if (!open) return;


if (config) {
  setSalaryType(config.salary_type || "monthly");
  setBaseSalary(String(config.base_salary ?? ""));
  setSalaryPerHour(String(config.salary_per_hour ?? ""));
  setOtRate(String(config.ot_rate ?? "1.5"));
  setCommission(String(config.commission_percent ?? ""));

  // 🔥 NEW
  setOtRateSunday(String(config.ot_rate_sunday ?? "2"));
  setOtRateHoliday(String(config.ot_rate_holiday ?? "3"));
  setIsHolidayPaid(config.is_holiday_paid ?? true);

  return;
}

// reset
setSalaryType("monthly");
setBaseSalary("");
setSalaryPerHour("");
setOtRate("1.5");
setCommission("");

setOtRateSunday("2");
setOtRateHoliday("3");
setIsHolidayPaid(true);


}, [config, open]);

function handleChangeSalaryType(v: string) {
setSalaryType(v);

if (v === "monthly") {
  setSalaryPerHour("");
  setCommission("");
  if (!otRate) setOtRate("1.5");
}

if (v === "hourly") {
  setBaseSalary("");
  setCommission("");
  if (!otRate) setOtRate("1.5");
}

if (v === "commission") {
  setBaseSalary("");
  setSalaryPerHour("");
  setOtRate("1.5");
}


}

async function handleSubmit() {
if (!canEditSalary) {
toast.error("Bạn không có quyền chỉnh sửa lương");
return;
}


if (loading) return;

try {
  setLoading(true);

  const payload = {
    staff_id,
    salary_type: salaryType,
    base_salary:
      salaryType === "monthly" ? Number(baseSalary || 0) : 0,
    salary_per_hour:
      salaryType === "hourly" ? Number(salaryPerHour || 0) : 0,
    ot_rate:
      salaryType === "commission"
        ? 1
        : Number(otRate || 1.5),
    commission_percent:
      salaryType === "commission"
        ? Number(commission || 0)
        : 0,

    // 🔥 NEW
    ot_rate_sunday: Number(otRateSunday || 2),
    ot_rate_holiday: Number(otRateHoliday || 3),
    is_holiday_paid: isHolidayPaid,
  };

  if (salaryType === "monthly" && payload.base_salary <= 0) {
    toast.error("Nhập lương cứng");
    setLoading(false);
    return;
  }

  if (salaryType === "hourly" && payload.salary_per_hour <= 0) {
    toast.error("Nhập lương theo giờ");
    return;
  }

  if (
    salaryType === "commission" &&
    payload.commission_percent <= 0
  ) {
    toast.error("Nhập % hoa hồng");
    return;
  }

  const res = await fetch("/api/salary/config/upsert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    toast.error(data.error || "Lưu thất bại");
    return;
  }

  toast.success(
    isEdit ? "Đã cập nhật cấu hình" : "Đã tạo cấu hình"
  );
  onClose();
  router.refresh();
} finally {
  setLoading(false);
}


}

if (!open) return null;

return ( <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"> <div className="w-full max-w-lg rounded-xl bg-white p-5"> <div className={textUI.pageTitle}>
{isEdit
? "Cập nhật cấu hình lương"
: "Thiết lập cấu hình lương"} </div>


    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormGroup label="Loại Lương">
        <Select
          value={salaryType}
          onChange={handleChangeSalaryType}
          disabled={!canEditSalary}
          options={[
            { value: "monthly", label: "Lương Tháng" },
            { value: "hourly", label: "Lương Theo Giờ" },
            { value: "commission", label: "Hoa Hồng" },
          ]}
        />
      </FormGroup>

      {(salaryType === "monthly" || salaryType === "hourly") && (
        <FormGroup label="Hệ Số Tăng Ca">
          <Input value={otRate} onChange={setOtRate} />
        </FormGroup>
      )}

      {salaryType === "monthly" && (
        <>
          <FormGroup label="Lương Căn Bản">
            <MoneyInput
              value={Number(baseSalary || 0)}
              onChange={(v) => setBaseSalary(String(v))}
            />
          </FormGroup>

          {/* 🔥 NEW */}
          <FormGroup label="Hệ số CN">
            <Input value={otRateSunday} onChange={setOtRateSunday} />
          </FormGroup>

          <FormGroup label="Hệ số ngày lễ">
            <Input value={otRateHoliday} onChange={setOtRateHoliday} />
          </FormGroup>

          <FormGroup label="Lễ tính lương">
            <Select
              value={isHolidayPaid ? "true" : "false"}
              onChange={(v) => setIsHolidayPaid(v === "true")}
              options={[
                { value: "true", label: "Có tính lương" },
                { value: "false", label: "Không tính lương" },
              ]}
            />
          </FormGroup>
        </>
      )}

      {salaryType === "hourly" && (
	  <>
        <FormGroup label="Lương Theo Giờ">
          <MoneyInput
            value={Number(salaryPerHour || 0)}
            onChange={(v) => setSalaryPerHour(String(v))}
          />
        </FormGroup>
		 {/* 🔥 NEW */}
          <FormGroup label="Hệ số CN">
            <Input value={otRateSunday} onChange={setOtRateSunday} />
          </FormGroup>

          <FormGroup label="Hệ số ngày lễ">
            <Input value={otRateHoliday} onChange={setOtRateHoliday} />
          </FormGroup>

          <FormGroup label="Lễ tính lương">
            <Select
              value={isHolidayPaid ? "true" : "false"}
              onChange={(v) => setIsHolidayPaid(v === "true")}
              options={[
                { value: "true", label: "Có tính lương" },
                { value: "false", label: "Không tính lương" },
              ]}
            />
          </FormGroup>
		
	</>
      )}

      {salaryType === "commission" && (
        <FormGroup label="% Hoa hồng">
          <PercentageInput
            value={Number(commission || 0)}
            onChange={(v) => setCommission(String(v))}
          />
        </FormGroup>
		
	
      )}
    </div>

    <div className="mt-5 flex justify-end gap-2">
      <SecondaryButton onClick={onClose} disabled={loading}>
        Huỷ
      </SecondaryButton>

      <PrimaryButton
        onClick={handleSubmit}
        disabled={loading || !canEditSalary}
      >
        {loading
          ? isEdit
            ? "Đang cập nhật..."
            : "Đang lưu..."
          : isEdit
          ? "Cập nhật"
          : "Lưu"}
      </PrimaryButton>
    </div>
  </div>
</div>

);
}
