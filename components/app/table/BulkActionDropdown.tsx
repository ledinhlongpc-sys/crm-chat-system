"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type ActionItem = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
};

type ActionGroup = {
  label?: string;
  items: ActionItem[];
};

type Props = {
  groups: ActionGroup[];
  buttonLabel?: string;
};

export default function BulkActionDropdown({
  groups,
  buttonLabel = "Chọn thao tác",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* ===== CLICK OUTSIDE ===== */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-white hover:bg-neutral-50 text-sm"
      >
        {buttonLabel}
        <ChevronDown size={16} />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 text-sm">
          {groups.map((group, gIndex) => (
            <div key={gIndex}>
              {group.label && (
                <div className="px-3 py-2 text-xs text-neutral-500 uppercase">
                  {group.label}
                </div>
              )}

              {group.items.map((item, i) => (
                <button
  key={i}
  disabled={item.disabled}
  onClick={() => {
    if (item.disabled) return;

    item.onClick();
    setOpen(false);
  }}
  className={`
    w-full text-left px-3 py-2 flex items-center gap-2
    ${item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-100"}
    ${
      item.danger && !item.disabled
        ? "text-red-600 hover:bg-red-50"
        : ""
    }
  `}
>
  {item.icon}
  {item.label}
</button>
              ))}

              {gIndex !== groups.length - 1 && (
                <div className="border-t my-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
