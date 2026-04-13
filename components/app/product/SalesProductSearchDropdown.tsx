"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import { inputUI } from "@/ui-tokens";
import ProductThumb from "@/components/app/image/ProductThumb";

/* ================= TYPES ================= */

export type SalesProductSearchItem = {
  product_id: string;

  variant_id: string;
  unit_conversion_id: string | null;

  product_name: string;
  variant_name: string;

  sku: string;
  image?: string | null;

  unit_name: string;

  factor: number;

  price: number;
  available_qty: number;
};

type FetchResponse = {
  data: SalesProductSearchItem[];
  hasMore: boolean;
};

export type SalesProductSearchRef = {
  focusAndOpen: () => void;
};

type Props = {
  branch_id?: string | null;
  placeholder?: string;
  onSelect: (item: SalesProductSearchItem) => void;
  enableF3?: boolean;
};

const LIMIT = 20;

/* ================= HELPERS ================= */

const makeKey = (branch_id: string, keyword: string) =>
  `${branch_id}::${keyword.trim().toLowerCase()}`;

/* ================= COMPONENT ================= */

const SalesProductSearchDropdown = forwardRef<SalesProductSearchRef, Props>(
  (
    {
      branch_id,
      placeholder = "Tìm sản phẩm bán...(F3)",
      onSelect,
      enableF3 = true,
    },
    ref
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);
    const [keyword, setKeyword] = useState("");

    const [items, setItems] = useState<SalesProductSearchItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const disabled = !branch_id;

    // ===== Anti spam / race =====
    const loadingRef = useRef(false);
    const abortRef = useRef<AbortController | null>(null);

    // ===== Cache per (branch_id + keyword) =====
    // value: { items, page, hasMore, loadedAll }
    const cacheRef = useRef<
      Map<
        string,
        {
          items: SalesProductSearchItem[];
          page: number;
          hasMore: boolean;
          loadedAll: boolean;
        }
      >
    >(new Map());

    const cacheKey = useMemo(() => {
      if (!branch_id) return "";
      return makeKey(branch_id, keyword);
    }, [branch_id, keyword]);

    /* ================= CACHE APPLY ================= */

    const applyCache = useCallback(() => {
      if (!branch_id) return false;

      const key = cacheKey;
      const cached = cacheRef.current.get(key);
      if (!cached) return false;

      setItems(cached.items);
      setPage(cached.page);
      setHasMore(cached.hasMore);
      return true;
    }, [branch_id, cacheKey]);

    const writeCache = useCallback(
      (patch: {
        items: SalesProductSearchItem[];
        page: number;
        hasMore: boolean;
      }) => {
        if (!branch_id) return;

        const key = cacheKey;
        const prev =
          cacheRef.current.get(key) ??
          ({
            items: [],
            page: 1,
            hasMore: true,
            loadedAll: false,
          } as const);

        const next = {
          items: patch.items,
          page: patch.page,
          hasMore: patch.hasMore,
          loadedAll: prev.loadedAll || patch.hasMore === false,
        };

        cacheRef.current.set(key, next);
      },
      [branch_id, cacheKey]
    );

    /* ================= RESET WHEN BRANCH CHANGES ================= */

    const prevBranchRef = useRef<string | null>(null);

    useEffect(() => {
      const b = branch_id ?? null;
      if (prevBranchRef.current === null) {
        prevBranchRef.current = b;
        return;
      }

      // branch changed
      if (prevBranchRef.current !== b) {
        prevBranchRef.current = b;

        // clear UI states
        setKeyword("");
        setItems([]);
        setPage(1);
        setHasMore(true);

        // cancel request
        abortRef.current?.abort();
        abortRef.current = null;
        loadingRef.current = false;
        setLoading(false);

        // NOTE: cacheRef giữ lại các branch khác cũng ok,
        // nhưng theo yêu cầu "đổi branch reset", ta không xóa toàn bộ map.
        // Nếu anh muốn xóa luôn cache các branch cũ: cacheRef.current.clear();
      }
    }, [branch_id]);

    /* ================= FETCH ================= */

    const fetchPage = useCallback(
      async (pageNumber: number, reset: boolean) => {
        if (!branch_id) return;

        const key = cacheKey;
        const cached = cacheRef.current.get(key);

        // Nếu đã load hết rồi và không reset -> không gọi nữa
        if (cached?.loadedAll && !reset) return;

        // Chặn spam khi đang loading
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        // Abort request cũ (khi gõ keyword liên tục)
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const q = keyword.trim();

          const res = await fetch(
            `/api/sales/products/search?q=${encodeURIComponent(
              q
            )}&page=${pageNumber}&limit=${LIMIT}&branch_id=${branch_id}`,
            { signal: controller.signal }
          );

          if (!res.ok) return;

          const json: FetchResponse = await res.json();

          const nextItems = reset
            ? json.data
            : [...(cached?.items ?? items), ...json.data];

          // Update UI
          setItems(nextItems);
          setHasMore(json.hasMore);
          setPage(pageNumber);

          // Update cache
          writeCache({
            items: nextItems,
            page: pageNumber,
            hasMore: json.hasMore,
          });
        } catch (err: any) {
          // Abort thì bỏ qua
          if (err?.name !== "AbortError") {
            console.error(err);
          }
        } finally {
          loadingRef.current = false;
          setLoading(false);
        }
      },
      // items cần để append khi cached chưa có (edge case), nhưng chủ yếu lấy cached
      [branch_id, cacheKey, keyword, writeCache, items]
    );

    /* ================= OPEN ================= */

    const openDropdown = useCallback(() => {
      if (disabled) return;

      setOpen(true);

      // Nếu có cache thì apply luôn, không gọi API
      const hasCached = applyCache();

      // Nếu chưa có cache cho key hiện tại -> load page 1
      if (!hasCached) {
        fetchPage(1, true);
      }

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }, [disabled, applyCache, fetchPage]);

    /* ================= SEARCH DEBOUNCE ================= */
    // Khi đang open và keyword thay đổi:
    // - nếu có cache theo keyword đó -> dùng luôn
    // - nếu không -> fetch page 1
    useEffect(() => {
      if (!open || disabled) return;

      const t = setTimeout(() => {
        const hasCached = applyCache();
        if (!hasCached) {
          fetchPage(1, true);
        }
      }, 300);

      return () => clearTimeout(t);
    }, [keyword, open, disabled, applyCache, fetchPage]);

    /* ================= LOAD MORE ================= */

    const handleScroll = () => {
      const el = listRef.current;
      if (!el) return;
      if (loadingRef.current || loading || !hasMore) return;

      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
        fetchPage(page + 1, false);
      }
    };

    /* ================= CLICK OUTSIDE TO CLOSE ================= */

    useEffect(() => {
      if (!open) return;

      const onDocDown = (e: MouseEvent) => {
        const w = wrapperRef.current;
        if (!w) return;
        if (!w.contains(e.target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", onDocDown);
      return () => document.removeEventListener("mousedown", onDocDown);
    }, [open]);

    /* ================= HOTKEY ================= */

    useEffect(() => {
      if (!enableF3) return;

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "F3") {
          e.preventDefault();
          openDropdown();
        }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [enableF3, openDropdown]);

    /* ================= REF ================= */

    useImperativeHandle(ref, () => ({
      focusAndOpen() {
        openDropdown();
      },
    }));

    /* ================= UI ================= */

    return (
      <div ref={wrapperRef} className="relative">
        {/* INPUT */}
        <div
          onClick={openDropdown}
          className={clsx(
            inputUI.base,
            "flex items-center gap-2 cursor-text",
            disabled && "bg-neutral-100 cursor-not-allowed"
          )}
        >
          <Search size={16} className="text-neutral-400" />
          <input
            ref={inputRef}
            disabled={disabled}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={disabled ? "Vui lòng chọn chi nhánh trước" : placeholder}
            className="flex-1 outline-none bg-transparent text-sm"
          />
        </div>

        {/* DROPDOWN */}
        {open && !disabled && (
          <div className="absolute z-[9999] mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-xl">
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="max-h-96 overflow-y-auto"
            >
              {items.map((item) => (
                <div
                  key={`${item.variant_id}-${item.unit_conversion_id ?? "base"}`}
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                    // ❗ không clear keyword để lần sau mở lại còn filter theo key (tuỳ anh)
                    // nếu anh muốn clear sau chọn thì mở lại sẽ show full, anh bật lại dòng dưới:
                    // setKeyword("");
                  }}
                  className="flex gap-3 p-3 cursor-pointer hover:bg-neutral-50"
                >
                  <ProductThumb src={item.image} alt={item.product_name} size="lg" />

                  <div className="flex-1">
                    <div className="text-sm font-medium">
  {item.unit_conversion_id
    ? item.unit_name
    : item.variant_name}
</div>

<div className="text-xs text-neutral-500">
  {item.sku} | ĐVT: {item.unit_name}
</div>
                  </div>

                  <div className="text-right text-xs tabular-nums">
                    <div>Giá bán: {item.price.toLocaleString("vi-VN")}</div>
                    <div className="text-neutral-500">Tồn Kho: {Number(item.available_qty || 0)
  .toFixed(2)
  .replace(/\.00$/, "")
  .replace(/(\.\d)0$/, "$1")}
  </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="p-3 text-sm text-neutral-400">Đang tải...</div>
              )}

              {!loading && items.length === 0 && (
                <div className="p-3 text-sm text-neutral-400">Không có sản phẩm</div>
              )}

              {!loading && items.length > 0 && !hasMore && (
                <div className="p-3 text-xs text-neutral-400 text-center">
                  Đã tải hết sản phẩm
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SalesProductSearchDropdown.displayName = "SalesProductSearchDropdown";

export default SalesProductSearchDropdown;