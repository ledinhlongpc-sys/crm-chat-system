"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import { tableUI, inputUI, textUI, buttonUI } from "@/ui-tokens";
import Select from "@/components/app/form/Select";

/* ================= TYPES ================= */

type Staff = {
  id: string;
  full_name: string;
};

type AttendanceRow = {
  staff_id: string;
  morning_check_in?: string;
  morning_check_out?: string;
  afternoon_check_in?: string;
  afternoon_check_out?: string;
  note?: string;
  approved?: boolean | null;
  status?: "working" | "absent" | null;
  day_type?: "normal" | "sunday" | "holiday";
};

/* ================= DEFAULT TIME ================= */

const DEFAULT_TIME = {
  morning_check_in: "07:30",
  morning_check_out: "11:30",
  afternoon_check_in: "13:00",
  afternoon_check_out: "17:00",
};

const dayTypeOptions = [
  { value: "normal", label: "Thường" },
  { value: "sunday", label: "Chủ nhật" },
  { value: "holiday", label: "Lễ" },
];
/* ================= COMPONENT ================= */

export default function AttendanceClient({
  staffs,
  attendances,
  selectedDate,
  userType,
}: {
  staffs: Staff[];
  attendances: any[];
  selectedDate: string;
  userType: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const canEditApproved = ["tenant", "admin", "manager"].includes(userType);
 

  /* ================= INIT ================= */

const initialMap = useMemo(() => {
  const map: Record<string, AttendanceRow> = {};

  const isSunday = new Date(selectedDate).getDay() === 0;

  staffs.forEach((s) => {
    const found = attendances.find((a) => a.staff_id === s.id);
    
    const isAbsent = found?.status === "absent";

    map[s.id] = {
      staff_id: s.id,

      morning_check_in: isAbsent
        ? ""
        : found?.morning_check_in || DEFAULT_TIME.morning_check_in,

      morning_check_out: isAbsent
        ? ""
        : found?.morning_check_out || DEFAULT_TIME.morning_check_out,

      afternoon_check_in: isAbsent
        ? ""
        : found?.afternoon_check_in || DEFAULT_TIME.afternoon_check_in,

      afternoon_check_out: isAbsent
        ? ""
        : found?.afternoon_check_out || DEFAULT_TIME.afternoon_check_out,

      note: found?.note || "",
      approved: found?.approved ?? null,
      status: found?.status ?? "working",

      // 🔥 THÊM DÒNG NÀY
      day_type:
        found?.day_type ||
        (isSunday ? "sunday" : "normal"),
    };
  });

  return map;
}, [staffs, attendances, selectedDate]);



  const [data, setData] = useState(initialMap);
  const isDirty =
  JSON.stringify(data) !== JSON.stringify(initialMap);
   const hasEditable = Object.values(data).some(
  (r) => !(r.approved === true && !canEditApproved)
);
const hasApprovable = selected.some(
  (id) => !data[id]?.approved
);
const isEdited = attendances.some(a => a.approved !== null);
useEffect(() => {
  setData(initialMap);
}, [initialMap]);

const canApprove = ["tenant", "admin", "manager"].includes(userType);

const [approving, setApproving] = useState(false);

  /* ================= HANDLE ================= */

  function updateField(
    staff_id: string,
    field: keyof AttendanceRow,
    value: any
  ) {
    setData((prev) => {
      let newRow = {
        ...prev[staff_id],
        [field]: value,
      };

      if (field === "status" && value === "absent") {
        newRow = {
          ...newRow,
          morning_check_in: "",
          morning_check_out: "",
          afternoon_check_in: "",
          afternoon_check_out: "",
        };
      }

      if (
  [
    "morning_check_in",
    "morning_check_out",
    "afternoon_check_in",
    "afternoon_check_out",
  ].includes(field)
) {
  newRow.status = "working";
}

      return {
        ...prev,
        [staff_id]: newRow,
      };
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

  function toggleAll() {
    if (selected.length === staffs.length) {
      setSelected([]);
    } else {
      setSelected(staffs.map((s) => s.id));
    }
  }

  /* ================= SAVE ================= */

  async function handleSave() {
    try {
      setLoading(true);

      const payload = Object.values(data);

      await fetch("/api/salary/attendance/save", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    work_date: selectedDate,
    items: payload,
  }),
});

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  /* ================= APPROVE ================= */

 async function handleApprove() {
  try {
    setApproving(true);

    await fetch("/api/salary/attendance/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        staff_ids: selected,
        work_date: selectedDate,
      }),
    });

    setSelected([]);
    router.refresh();
  } finally {
    setApproving(false);
  }
}

  /* ================= UI ================= */

  return (
    <div className="space-y-4">
      <TableContainer>
        <TableHead
          columns={[
            
{
      key: "check",
      width: "40px",
      align: "center",
      compact: true,
      header: (
        <TableCheckbox
      checked={
  selected.length === staffs.length && staffs.length > 0
}
      onChange={toggleAll}
    />
      ),
    },
            { key: "index", label: "STT", width: "40px", align: "center" },
            { key: "name", label: "Nhân viên" },

            // 🔥 GỘP CỘT
            { key: "work", label: "Trạng thái", align: "center" },

            { key: "m_in", label: "Sáng Làm", align: "center" },
            { key: "m_out", label: "Sáng Về", align: "center" },
            { key: "a_in", label: "Chiều Làm", align: "center" },
            { key: "a_out", label: "Chiều Về", align: "center" },
            { key: "total", label: "Tổng giờ", align: "center" },
			{ key: "day_type", label: "Loại ngày", align: "center" },
            { key: "note", label: "Ghi chú" },

            // 🔥 CỘT MỚI
            { key: "approval", label: "Tình trạng", align: "center" },
          ]}
        />

        <TableContainer.Body>
          {staffs.map((staff, index) => {
            const row = data[staff.id];
            const total = calcTotal(row);

            const isLocked =
              row.approved === true && !canEditApproved;

            return (
              <TableRow
                key={staff.id}
                className={`
                  ${selected.includes(staff.id) ? "bg-blue-50" : ""}
                  ${row.approved === true ? "bg-green-50" : ""}
                `}
              >
                <TableCell align="center">
                  <TableCheckbox
                    checked={selected.includes(staff.id)}
                    onChange={() => toggleSelect(staff.id)}
                    disabled={row.approved === true}
                  />
                </TableCell>

                <TableCell align="center">{index + 1}</TableCell>

                <TableCell>{staff.full_name}</TableCell>

                {/* 🔥 GỘP NGHỈ + TRẠNG THÁI */}
                <TableCell align="center">
                  <div className="flex items-center justify-center gap-2">
                    <TableCheckbox
                      checked={row.status === "absent"}
                      onChange={() =>
                        updateField(
                          staff.id,
                          "status",
                          row.status === "absent" ? "working" : "absent"
                        )
                      }
                      disabled={isLocked}
                    />

                    <span
                      className={`text-xs px-2 py-1 rounded border ${
                        row.status === "absent"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                      }`}
                    >
                      {row.status === "absent" ? "Nghỉ" : "Đi làm"}
                    </span>
                  </div>
                </TableCell>

            {/* TIME INPUT */}
{[
  "morning_check_in",
  "morning_check_out",
  "afternoon_check_in",
  "afternoon_check_out",
].map((field) => (
  <TableCell key={field}>
    <input
      type="text"
      inputMode="numeric"
      placeholder="HH:mm"
      maxLength={5}
      value={(row as any)[field] || ""}
      onChange={(e) =>
        updateField(
          staff.id,
          field as keyof AttendanceRow,
          normalizeTimeInput(e.target.value)
        )
      }
      onBlur={(e) =>
        updateField(
          staff.id,
          field as keyof AttendanceRow,
          finalizeTimeInput(e.target.value)
        )
      }
      disabled={isLocked || row.status === "absent"}
      className={inputUI.base + " h-8 text-center"}
    />
  </TableCell>
))}

<TableCell align="center">
  <span className={textUI.bodyStrong}>{total}</span>
</TableCell>
<TableCell align="center">
  <Select
  value={row.day_type || "normal"}
  onChange={(v) =>
    updateField(staff.id, "day_type", v)
  }
  options={dayTypeOptions}
  disabled={isLocked}
  noWrapper
  className="h-8 text-center"
/>
</TableCell>

<TableCell>
  <input
    value={row.note || ""}
    onChange={(e) =>
      updateField(staff.id, "note", e.target.value)
    }
    disabled={isLocked}
    className={inputUI.base + " h-8"}
  />
</TableCell>


                {/* 🔥 TÌNH TRẠNG */}
                <TableCell align="center">
                  <span
                    className={`px-2 py-1 text-xs rounded border ${
                      row.approved === true
                        ? "bg-green-100 text-green-700 border-green-200"
                        : row.approved === false
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {row.approved === true
                      ? "Đã duyệt"
                      : row.approved === false
                      ? "Chưa duyệt"
                      : "Chưa chấm công"}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableContainer.Body>
      </TableContainer>

   

<div className="flex justify-end items-center gap-2 mt-4">
  {selected.length > 0 && (
  <SecondaryButton
  onClick={handleApprove}
  disabled={approving || !hasApprovable}
>
  {approving
    ? "Đang duyệt..."
    : `Duyệt (${selected.length})`}
</SecondaryButton>
)}

  <PrimaryButton
  onClick={handleSave}
  disabled={loading || !hasEditable || !isDirty}
>
  {loading
    ? "Đang lưu..."
    : isEdited
    ? "Sửa chấm công"
    : "Lưu chấm công"}
</PrimaryButton>

</div>
 </div>
  );
}

/* ================= HELPERS ================= */
function normalizeTimeInput(value: string) {
  if (!value) return "";

  const only = value.replace(/[^\d:]/g, "");

  if (only.includes(":")) {
    const [h = "", m = ""] = only.split(":");
    return `${h.slice(0, 2)}${m ? ":" + m.slice(0, 2) : ""}`;
  }

  const digits = only.slice(0, 4);

  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}
/* ================= HELPERS ================= */


function finalizeTimeInput(value: string) {
  if (!value) return "";

  const cleaned = normalizeTimeInput(value);

  let [rawH = "", rawM = ""] = cleaned.split(":");

  // 🔥 nếu chỉ nhập giờ (vd: "7") → hiểu là 07:00
  if (rawH !== "" && rawM === "") {
    rawM = "00";
  }

  // 🔥 nếu thiếu giờ → bỏ luôn
  if (rawH === "") return "";

  let h = Number(rawH);
  let m = Number(rawM);

  if (Number.isNaN(h)) return "";

  if (Number.isNaN(m)) m = 0;

  // 🔥 clamp
  h = Math.max(0, Math.min(23, h));
  m = Math.max(0, Math.min(59, m));

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(h)}:${pad(m)}`;
}



function calcTotal(row: AttendanceRow) {
  const diff = (start?: string, end?: string) => {
    if (!start || !end) return 0;

    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);

    if (
      Number.isNaN(h1) ||
      Number.isNaN(m1) ||
      Number.isNaN(h2) ||
      Number.isNaN(m2)
    ) {
      return 0;
    }

    return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
  };

  const total =
    diff(row.morning_check_in, row.morning_check_out) +
    diff(row.afternoon_check_in, row.afternoon_check_out);

  return total > 0 ? total.toFixed(2) + "h" : "-";
}


