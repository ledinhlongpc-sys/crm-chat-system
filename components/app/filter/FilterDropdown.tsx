"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type FilterOption = {
  id: string;
  label: string;
};

type Props = {
  placeholder: string;
  options?: FilterOption[];
  value?: string[];
  onChange: (ids: string[]) => void;
  widthClassName?: string;
  dropdownWidthClassName?: string;
};

const PAGE_SIZE = 20;

/* ================= COMPONENT ================= */

export default function FilterDropdown({
  placeholder,
  options = [],
  value,
  onChange,
  widthClassName = "w-[160px]",
  dropdownWidthClassName = "w-[320px]",
}: Props) {
  /* 🔥 FIX CỨNG CHỐNG LỖI */
  const safeValue = Array.isArray(value) ? value : [];

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(safeValue);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const wrapRef = useRef<HTMLDivElement | null>(null);

  /* ================= SYNC ================= */

  useEffect(() => {
    setDraft(Array.isArray(value) ? value : []);
  }, [value]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  /* ================= FILTER ================= */

  const filteredOptions = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return options;

    return options.filter((o) =>
      o.label.toLowerCase().includes(key)
    );
  }, [q, options]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOptions.length / PAGE_SIZE)
  );

  const pagedOptions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOptions.slice(start, start + PAGE_SIZE);
  }, [filteredOptions, page]);

  /* ================= HANDLERS ================= */

  function toggle(id: string) {
    setDraft((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  function toggleAll(checked: boolean) {
    setDraft(
      checked ? options.map((o) => o.id) : []
    );
  }

  function apply() {
    onChange(draft);
    close();
  }

  function close() {
    setOpen(false);
    setQ("");
    setPage(1);
  }

  function onBlurCapture(e: React.FocusEvent) {
    const next = e.relatedTarget as Node | null;
    if (!wrapRef.current) return;
    if (next && wrapRef.current.contains(next)) return;
    close();
  }

  /* ================= LABEL ================= */

  const selectedLabels = useMemo(() => {
    return options
      .filter((o) => safeValue.includes(o.id))
      .map((o) => o.label);
  }, [options, safeValue]);

  function renderButtonText() {
    if (!safeValue.length) {
      return (
        <span className="text-neutral-400">
          {placeholder}
        </span>
      );
    }

    if (safeValue.length === 1) {
      return (
        <span className="truncate">
          {selectedLabels[0]}
        </span>
      );
    }

    return (
      <span className="truncate">
        Đã chọn ({safeValue.length})
      </span>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div
      ref={wrapRef}
      className="relative"
      tabIndex={-1}
      onBlurCapture={onBlurCapture}
    >
      {/* ===== BUTTON ===== */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          `
          h-10 ${widthClassName}
          px-3 pr-3
          text-sm
          rounded-md
          border border-neutral-200
          bg-white
          text-left
          flex items-center justify-between
          transition-all

          hover:border-green-400
          hover:bg-green-50

          focus:border-green-500
          `,
          safeValue.length > 0 &&
            "border-green-600 bg-green-100 text-green-800"
        )}
      >
        {renderButtonText()}
        <ChevronDown
          size={14}
          className={clsx(
            "transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* ===== DROPDOWN ===== */}
      {open && (
        <div
  className={clsx(
    `
    absolute right-0 mt-1
    bg-white
    border border-neutral-200
    rounded-md
    shadow-lg
    z-50
    overflow-hidden
    flex flex-col
    `,
    dropdownWidthClassName
  )}
>
          {/* ===== SEARCH ===== */}
          <div className="px-4 py-3 border-b border-neutral-200">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Tìm ${placeholder.toLowerCase()}`}
                className={`
                  h-9 w-full rounded-md
                  border border-neutral-300
                  pl-8 pr-3
                  ${textUI.body}
                  outline-none
                  focus:border-green-500
                  focus:ring-1 focus:ring-green-100
                `}
              />
            </div>
          </div>

          {/* ===== LIST ===== */}
          <div className="max-h-[260px] overflow-auto px-2 py-2">
            <label className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-green-100 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  options.length > 0 &&
                  draft.length === options.length
                }
                onChange={(e) =>
                  toggleAll(e.target.checked)
                }
              />
              <span className={textUI.bodyStrong}>
                Chọn tất cả
              </span>
            </label>

            <div className="my-1 border-t border-neutral-200" />

            {pagedOptions.map((o) => (
              <label
                key={o.id}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                  draft.includes(o.id)
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "hover:bg-green-100"
                )}
              >
                <input
                  type="checkbox"
                  checked={draft.includes(o.id)}
                  onChange={() => toggle(o.id)}
                />
                <span className={`${textUI.body} truncate`}>
                  {o.label}
                </span>
              </label>
            ))}

            {!pagedOptions.length && (
              <div className="px-3 py-4 text-neutral-400 text-sm">
                Không có kết quả
              </div>
            )}
          </div>

          {/* ===== PAGINATION ===== */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200 bg-neutral-50">
              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                className={`${textUI.body} flex items-center gap-1 text-neutral-600 disabled:opacity-40`}
              >
                <ChevronLeft size={14} />
                Trước
              </button>

              <span className="text-neutral-500 text-sm">
                {page} / {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
                className={`${textUI.body} flex items-center gap-1 text-neutral-600 disabled:opacity-40`}
              >
                Sau
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* ===== FOOTER ===== */}
          <div className="border-t border-neutral-200 px-4 py-3 bg-white">
            <button
              type="button"
              onClick={apply}
              className={`
                w-full h-9 rounded-md
                bg-green-600 text-white
                ${textUI.bodyStrong}
                hover:bg-green-700
              `}
            >
              Lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}