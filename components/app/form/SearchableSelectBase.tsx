"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import clsx from "clsx";

import SelectOptionRow from "./SelectOptionRow";
import { inputUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type SelectOption = {
  id: string;
  label: string | React.ReactNode;
  onUpdate?: (name: string) => Promise<void>;
  onDelete?: () => Promise<void>;
};

type Props = {
  value?: string;
  valueLabel?: string | null;

  options: SelectOption[];

  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: boolean;

  creatable?: boolean;
  onCreate?: (name: string) => void | Promise<void>;

  onChange?: (value?: string) => void;
};

/* ================= COMPONENT ================= */

export default function SearchableSelectBase({
  value,
  valueLabel,
  options,

  placeholder = "Chọn",
  searchable = true,
  disabled = false,
  error = false,

  creatable = false,
  onCreate,
  onChange,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  // 🔥 loading create
  const [creating, setCreating] = useState(false);

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setKeyword("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= SELECTED OPTION ================= */

  const selectedOption = useMemo(() => {
    if (!value) return null;

    const found = options.find((o) => o.id === value);
    if (found) return found;

    if (valueLabel) {
      return { id: value, label: valueLabel };
    }

    return null;
  }, [options, value, valueLabel]);

  /* ================= FILTER ================= */

  const filteredOptions = useMemo(() => {
    if (!searchable || !keyword.trim()) return options;

    const k = keyword.toLowerCase();

    return options.filter((o) => {
      if (typeof o.label !== "string") return true;
      return o.label.toLowerCase().includes(k);
    });
  }, [options, keyword, searchable]);

  /* ================= HANDLE CREATE ================= */

  const handleCreate = async () => {
    if (!onCreate || !keyword.trim() || creating) return;

    try {
      setCreating(true);

      const name = keyword.trim();
      const result = await onCreate(name);

      // 👉 nếu API trả về id thì auto select luôn (optional nâng cấp)
      if (typeof result === "string") {
        onChange?.(result);
      }

      setOpen(false);
      setKeyword("");
    } catch (err) {
      console.error("Create error:", err);
    } finally {
      setCreating(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div ref={wrapperRef} className="relative">
      {/* ===== CONTROL ===== */}
    <button
  type="button"
  disabled={disabled}
  onClick={() => !disabled && setOpen((v) => !v)}
  className={clsx(
    inputUI.base,
    "flex items-center justify-between",
    "h-10 px-4 min-w-[160px]",
    "transition-colors",
    "hover:border-neutral-400",
    "gap-2",
    disabled && inputUI.disabled,
    error && inputUI.error
  )}
>
  <span
    className={clsx(
      "truncate",
      selectedOption?.label
        ? "text-neutral-800"
        : "text-neutral-400"
    )}
  >
    {selectedOption?.label || placeholder}
  </span>

  <ChevronDown
    size={16}
    className={clsx(
      "text-neutral-500 transition-transform",
      open && "rotate-180",
      "ml-1"
    )}
  />
</button>


      {/* ===== DROPDOWN ===== */}
      {open && !disabled && (
        <div
  className="
    absolute z-50 mt-2 right-0
    min-w-[260px] w-max max-w-[320px]
    rounded-xl
    border border-neutral-200
    bg-white
    shadow-xl
  "
>
          {/* ===== SEARCH ===== */}
          {searchable && (
            <div className="sticky top-0 z-10 border-b border-neutral-100 bg-neutral-50 p-3">
              <input
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm..."
                className="
                  h-10 w-full
                  rounded-lg
                  border border-neutral-200
                  bg-white
                  px-3
                  text-sm
                  outline-none
                  transition-colors
                  focus:border-blue-500
                "
              />
            </div>
          )}

          {/* ===== OPTIONS ===== */}
          <div className="max-h-64 overflow-y-auto border-t border-neutral-100">
           {filteredOptions.map((opt, index) => (
  <SelectOptionRow
    key={`${opt.id}-${index}`}
    label={opt.label}
    active={opt.id === value}
    onSelect={() => {
      onChange?.(opt.id);
      setOpen(false);
      setKeyword("");
    }}
    onUpdate={opt.onUpdate}
    onDelete={opt.onDelete}
  />
))}

            {/* ===== CREATE ===== */}
            {creatable && keyword.trim() && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="
                  flex items-center gap-2
                  w-full h-10 px-4
                  text-sm font-medium
                  text-blue-600
                  hover:bg-blue-50
                  transition-colors
                  disabled:opacity-50
                "
              >
                {creating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Đang tạo...
                  </span>
                ) : (
                  <>
                    <Plus size={14} />
                    Tạo: “{keyword.trim()}”
                  </>
                )}
              </button>
            )}

            {!creatable && filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-sm text-neutral-400">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}