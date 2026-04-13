"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import FilterDate from "@/components/app/form/FilterDate";

import { getTodayVN } from "@/lib/helpers/date-vn";

export default function AttendanceHeaderActions({
  selectedDate,
}: {
  selectedDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ================= CHANGE DATE ================= */

  function changeDate(date: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", date);
    router.push(`${pathname}?${params.toString()}`);
  }

  /* ================= DATE NAV ================= */

  function getPrevDate(date: string) {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  function getNextDate(date: string) {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  /* ================= QUICK ================= */

  function getToday() {
    return getTodayVN();
  }

  function getYesterday() {
    const today = new Date(getTodayVN());
    today.setDate(today.getDate() - 1);
    return today.toISOString().slice(0, 10);
  }

  const isToday = selectedDate === getTodayVN();

  /* ================= UI ================= */

  return (
    <div className="flex items-center gap-3">
      {/* CHỌN NGÀY + NAV */}
      <div className="flex items-center gap-2">
       
	   {/* ← TRƯỚC */}
        <SecondaryButton
          onClick={() => changeDate(getPrevDate(selectedDate))}
        >
          ← Trước
        </SecondaryButton>

        {/* DATE PICKER */}
        <FilterDate
          value={selectedDate}
          onChange={changeDate}
        />

        {/* TIẾP → */}
        <SecondaryButton
          onClick={() => changeDate(getNextDate(selectedDate))}
          disabled={isToday}
        >
          Tiếp →
        </SecondaryButton>
      </div>

      {/* QUICK */}
      <SecondaryButton onClick={() => changeDate(getToday())}>
        Hôm nay
      </SecondaryButton>

      <SecondaryButton onClick={() => changeDate(getYesterday())}>
        Hôm qua
      </SecondaryButton>

      {/* COPY */}
      <PrimaryButton>
        Copy hôm qua
      </PrimaryButton>
    </div>
  );
}