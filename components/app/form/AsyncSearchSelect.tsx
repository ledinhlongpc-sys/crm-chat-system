"use client";

import {
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import { Search } from "lucide-react";
import clsx from "clsx";

import { inputUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type AsyncOption = {
  id: string;
  label: React.ReactNode;
  data?: any;
};

export type AsyncResult = {
  data: AsyncOption[];
  hasMore: boolean;
};

type Props = {
  placeholder?: string;
  disabled?: boolean;

  fetchOptions: (
    keyword?: string,
    page?: number
  ) => Promise<AsyncResult>;

  onSelect?: (opt: AsyncOption) => void;
};

/* ================= COMPONENT ================= */

export default function AsyncSearchInput({
  placeholder = "Tìm kiếm...",
  disabled = false,
  fetchOptions,
  onSelect,
}: Props) {

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);

  const [options, setOptions] = useState<AsyncOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [highlight, setHighlight] = useState(0);

  const loadingRef = useRef(false);

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= MERGE UNIQUE ================= */

  const mergeUnique = (
    prev: AsyncOption[],
    next: AsyncOption[]
  ) => {

    const map = new Map<string, AsyncOption>();

    for (const item of prev) {
      map.set(item.id, item);
    }

    for (const item of next) {
      map.set(item.id, item);
    }

    return Array.from(map.values());
  };

  /* ================= LOAD PAGE ================= */

  const loadPage = async (
    rawKeyword: string,
    pageNumber: number,
    reset?: boolean
  ) => {

    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {

      const res = await fetchOptions(rawKeyword, pageNumber);

      const incoming = res?.data ?? [];

      const merged = reset
        ? incoming
        : mergeUnique(options, incoming);

      setOptions(merged);
      setHasMore(res?.hasMore ?? false);
      setPage(pageNumber);
      setHighlight(0);

    } finally {

      loadingRef.current = false;
      setLoading(false);

    }
  };

  /* ================= OPEN ================= */

  const handleOpen = () => {

    if (disabled) return;

    setOpen(true);

  };

  /* ================= SEARCH (DEBOUNCE) ================= */

  useEffect(() => {

    if (!open) return;

    const kw = keyword.trim();

    if (kw.length < 2) {
      setOptions([]);
      return;
    }

    const t = setTimeout(() => {

      loadPage(kw, 1, true);

    }, 400);

    return () => clearTimeout(t);

  }, [keyword, open]);

  /* ================= SCROLL LOAD ================= */

  const handleScroll = () => {

    const el = listRef.current;

    if (!el) return;

    if (!hasMore) return;

    if (
      el.scrollTop + el.clientHeight >=
      el.scrollHeight - 20
    ) {
      loadPage(keyword.trim(), page + 1);
    }

  };

  /* ================= KEYBOARD ================= */

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {

    if (!options.length) return;

    if (e.key === "ArrowDown") {

      e.preventDefault();

      setHighlight((v) =>
        v + 1 >= options.length ? 0 : v + 1
      );

    }

    if (e.key === "ArrowUp") {

      e.preventDefault();

      setHighlight((v) =>
        v - 1 < 0 ? options.length - 1 : v - 1
      );

    }

    if (e.key === "Enter") {

      e.preventDefault();

      const opt = options[highlight];

      if (opt) {

        onSelect?.(opt);

        setOpen(false);
        setKeyword("");

      }

    }

  };

  /* ================= RENDER ================= */

  return (

    <div ref={wrapperRef} className="relative">

      {/* INPUT */}

      <div
        className={clsx(
          inputUI.base,
          "flex items-center gap-2",
          disabled && "bg-neutral-100"
        )}
      >

        <Search size={16} className="text-neutral-400" />

        <input
          ref={inputRef}
          value={keyword}
          disabled={disabled}
          onFocus={handleOpen}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="flex-1 outline-none bg-transparent text-sm"
        />

      </div>

      {/* DROPDOWN */}

      {open && !disabled && (

        <div
          className="
          absolute top-full left-0 z-50 w-full
          rounded-xl border border-neutral-200
          bg-white shadow-xl
        "
        >

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-80 overflow-y-auto"
          >

            {/* CHƯA NHẬP */}

            {keyword.trim().length < 2 && (

              <div className="px-4 py-3 text-sm text-neutral-400">

                Nhập tên hoặc SĐT để tìm khách hàng

              </div>

            )}

            {/* OPTIONS */}

            {options.map((opt, i) => (

              <div
                key={`${opt.id}-${i}`}
                onClick={() => {

                  onSelect?.(opt);

                  setOpen(false);
                  setKeyword("");

                }}
                className={clsx(
                  "px-4 py-3 cursor-pointer hover:bg-neutral-50",
                  i === highlight && "bg-blue-50"
                )}
              >

                {opt.label}

              </div>

            ))}

            {/* LOADING */}

            {loading && (

              <div className="px-4 py-3 text-sm text-neutral-400">

                Đang tải...

              </div>

            )}

            {/* NO RESULT */}

            {!loading &&
              keyword.trim().length >= 2 &&
              options.length === 0 && (

              <div className="px-4 py-3 text-sm text-neutral-400">

                Không tìm thấy dữ liệu

              </div>

            )}

            {/* END */}

            {!loading && !hasMore && options.length > 0 && (

              <div className="px-4 py-3 text-xs text-neutral-400 text-center">

                Đã tải hết

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );

}