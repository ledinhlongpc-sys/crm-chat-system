"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import clsx from "clsx";
import { inputUI } from "@/ui-tokens";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

type Props = {
  valueFrom?: string;
  valueTo?: string;
  onChange: (from: string, to: string) => void;
};

/* ================= COMPONENT ================= */

export default function DateRangeFilter({
  valueFrom,
  valueTo,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const [from, setFrom] = useState(valueFrom || "");
  const [to, setTo] = useState(valueTo || "");

  const [baseDate, setBaseDate] = useState(new Date());

  const ref = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [alignRight, setAlignRight] = useState(true);



  /* ================= LABEL ================= */

  const label =
    from && to
      ? `${formatDate(from)} - ${formatDate(to)}`
      : "Chọn khoảng ngày";

  /* ================= AUTO ALIGN ================= */

  useEffect(() => {
    if (!open) return;

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const screenWidth = window.innerWidth;

    if (rect.right + 700 > screenWidth) {
      setAlignRight(true);
    } else {
      setAlignRight(false);
    }
  }, [open]);

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= AUTO APPLY ================= */

  useEffect(() => {
    if (from && to) {
      onChange(from, to);
    }
  }, [from, to]);

  const handleApply = () => {
    onChange(from, to);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* INPUT */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          inputUI.base,
          "h-10 flex items-center justify-between px-3 min-w-[240px]",
          "!border-blue-500",
          "hover:!border-blue-600",
          open && "!border-blue-600 !ring-2 !ring-blue-500"
        )}
      >
        <span className={!from ? "text-gray-400" : ""}>
          {label}
        </span>
        <CalendarDays size={16} />
      </button>

      {/* POPUP */}
      {open && (
        <div
          ref={popupRef}
          className={clsx(
            "absolute z-50 mt-2 bg-white border rounded-xl shadow-lg p-4 w-[700px] max-w-[95vw] space-y-4 transition-all duration-200",

            // 🔥 align thông minh
            alignRight ? "right-0" : "left-0",

            // 🔥 animation
            "origin-top scale-100 opacity-100 animate-in fade-in zoom-in-95"
          )}
        >
          {/* TOP */}
          <div className="flex gap-4">
            {/* PRESET */}
            <div className="w-32 text-sm space-y-2">
              <Preset label="Hôm nay" onClick={() => setToday(setFrom, setTo)} />
              <Preset label="Hôm qua" onClick={() => setYesterday(setFrom, setTo)} />
              <Preset label="7 ngày" onClick={() => setLastDays(7, setFrom, setTo)} />
              <Preset label="30 ngày" onClick={() => setLastDays(30, setFrom, setTo)} />
              <Preset label="90 ngày" onClick={() => setLastDays(90, setFrom, setTo)} />
              <Preset label="180 ngày" onClick={() => setLastDays(180, setFrom, setTo)} />
            </div>

            {/* CALENDAR */}
            <div className="flex gap-4 flex-1">
              <Calendar
                date={baseDate}
                from={from}
                to={to}
                setFrom={setFrom}
                setTo={setTo}
              />
              <Calendar
                date={addMonth(baseDate, 1)}
                from={from}
                to={to}
                setFrom={setFrom}
                setTo={setTo}
              />
            </div>

            {/* ARROWS */}
            <div className="flex flex-col gap-2 pt-6">
              <button onClick={() => setBaseDate(addMonth(baseDate, -1))}>
                <ChevronLeft />
              </button>
              <button onClick={() => setBaseDate(addMonth(baseDate, 1))}>
                <ChevronRight />
              </button>
            </div>
          </div>

          {/* ACTION */}
          <div className="border-t pt-3 flex justify-end gap-2">
            <SecondaryButton onClick={() => setOpen(false)}>
              Hủy
            </SecondaryButton>

            <PrimaryButton onClick={handleApply}>
              Xác nhận
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function handleSelect(
  value: string,
  from: string,
  to: string,
  setFrom: any,
  setTo: any
) {
  if (!from || (from && to)) {
    setFrom(value);
    setTo("");
  } else {
    if (value < from) {
      setTo(from);
      setFrom(value);
    } else {
      setTo(value);
    }
  }
}

function getDaysInMonth(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const days = [];
  const startDay = start.getDay();

  for (let i = 0; i < startDay; i++) days.push(null);

  for (let d = 1; d <= end.getDate(); d++) {
    days.push(
      new Date(date.getFullYear(), date.getMonth(), d)
    );
  }

  return days;
}

/* 🔥 FIX CHÍNH: KHÔNG dùng toISOString nữa */
function toISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function addMonth(date: Date, n: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

/* ================= PRESETS ================= */

function Preset({ label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left hover:text-blue-600"
    >
      {label}
    </button>
  );
}

function setToday(setFrom: any, setTo: any) {
  const d = new Date();
  const v = toISO(d);
  setFrom(v);
  setTo(v);
}

function setYesterday(setFrom: any, setTo: any) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const v = toISO(d);
  setFrom(v);
  setTo(v);
}

function setLastDays(
  n: number,
  setFrom: any,
  setTo: any
) {
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - (n - 1));

  setFrom(toISO(from));
  setTo(toISO(today));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN");
}

/* ================= CALENDAR ================= */

function Calendar({ date, from, to, setFrom, setTo }: any) {
  const days = getDaysInMonth(date);

  return (
    <div className="w-[220px]">
      <div className="text-center font-medium mb-2">
        Tháng {date.getMonth() + 1} {date.getFullYear()}
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-center">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
          <div key={d}>{d}</div>
        ))}

        {days.map((d: any, i: number) => {
          if (!d) return <div key={i} />;

          const value = toISO(d);

          const isSelected =
            (from && value === from) ||
            (to && value === to);

          return (
            <button
              key={i}
              onClick={() =>
                handleSelect(value, from, to, setFrom, setTo)
              }
              className={clsx(
                "p-1 rounded",
                isSelected && "bg-blue-600 text-white"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}