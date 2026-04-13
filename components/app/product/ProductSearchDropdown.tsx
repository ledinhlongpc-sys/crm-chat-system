"use client";

import React, {
  useCallback,
  useEffect,
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

export type ProductSearchItem = {
  product_id: string;
  product_name: string;
  variant_id: string;
  variant_name: string;
  sku: string;
  image?: string | null;
  unit_name: string;
  import_price: number;
  stock_qty: number;
};

type FetchResponse = {
  data: ProductSearchItem[];
  hasMore: boolean;
};

export type ProductSearchRef = {
  focusAndOpen: () => void;
};

type Props = {
  branch_id?: string | null;
  placeholder?: string;
  onSelect: (item: ProductSearchItem) => void;

  /** bật/tắt hotkey F3 (default true) */
  enableF3?: boolean;
};

type CacheValue = {
  items: ProductSearchItem[];
  hasMore: boolean;
  page: number; // trang hiện tại đã load xong
};

const LIMIT = 20;
const GAP_Y = 8;

function clamp0(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function makeKey(branch_id: string | null | undefined, keyword: string) {
  return `${branch_id ?? "no-branch"}::${keyword.trim()}`;
}

/* ================= COMPONENT ================= */

const ProductSearchDropdown = forwardRef<ProductSearchRef, Props>(
  ({
    branch_id,
    placeholder = "Tìm theo tên, mã SKU, hoặc quét mã Barcode...(F3)",
    onSelect,
    enableF3 = true,
  }, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [items, setItems] = useState<ProductSearchItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // ✅ dropdown style để fixed bám theo input
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [dropdownReady, setDropdownReady] = useState(false);

  const disabled = !branch_id;
  
  

  // ✅ cache theo (branch + keyword)
  const cacheRef = useRef<Map<string, CacheValue>>(new Map());

  // ✅ chống spam load-more khi scroll rung
  const loadMoreLockRef = useRef(false);

  // ✅ abort request cũ khi gõ nhanh
  const abortRef = useRef<AbortController | null>(null);

  // ✅ nhớ key hiện tại đã load để không fetch lại khi chỉ “open/close”
  const lastLoadedKeyRef = useRef<string>("");

  const syncRectNow = useCallback(() => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) {
      setDropdownReady(false);
      return null;
    }

    setDropdownStyle({
      top: rect.bottom + GAP_Y,
      left: rect.left,
      width: rect.width,
    });
    setDropdownReady(true);
    return rect;
  }, []);

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= F3 HOTKEY ================= */

  useEffect(() => {
    if (!enableF3) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "F3") return;
      e.preventDefault();
      if (disabled) return;

      // set rect trước khi mở (hết nhấp nháy)
      syncRectNow();
      setOpen(true);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });

      // ✅ khi F3 mở: nếu chưa có cache cho keyword hiện tại thì fetch luôn 20 sp
      const k = makeKey(branch_id, keyword);
      if (cacheRef.current.has(k)) {
        const cached = cacheRef.current.get(k)!;
        setItems(cached.items);
        setHasMore(cached.hasMore);
        setPage(cached.page);
        lastLoadedKeyRef.current = k;
      } else {
        // fetch page 1
        triggerFetchFirstPage(k);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableF3, disabled, branch_id, keyword, syncRectNow]);

  /* ================= RESET WHEN BRANCH CHANGE ================= */

  useEffect(() => {
    // abort inflight
    abortRef.current?.abort();
    abortRef.current = null;

    cacheRef.current.clear();
    lastLoadedKeyRef.current = "";
    loadMoreLockRef.current = false;

    setItems([]);
    setPage(1);
    setHasMore(true);
    setKeyword("");
    setOpen(false);

    setDropdownReady(false);
    setDropdownStyle({});
  }, [branch_id]);

  /* ================= FETCH CORE ================= */

  const fetchPage = useCallback(
    async (targetKeyword: string, targetPage: number, reset: boolean) => {
      if (!branch_id) return;
      if (loading) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setLoading(true);

        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(
            targetKeyword
          )}&page=${targetPage}&limit=${LIMIT}&branch_id=${branch_id}`,
          { signal: controller.signal }
        );

        if (!res.ok) return;

        const json: FetchResponse = await res.json();

        setItems((prev) => {
          const next = reset ? json.data : [...prev, ...json.data];

          const k = makeKey(branch_id, targetKeyword);
          cacheRef.current.set(k, {
            items: next,
            hasMore: json.hasMore,
            page: targetPage,
          });

          return next;
        });

        setHasMore(json.hasMore);
        setPage(targetPage);
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
        loadMoreLockRef.current = false;
      }
    },
    [branch_id, loading]
  );

  const triggerFetchFirstPage = useCallback(
    (keyForLoad: string) => {
      const currentKey = keyForLoad;
      const currentKeyword = keyword.trim();

      // nếu đang load đúng key này rồi thì thôi
      if (lastLoadedKeyRef.current === currentKey) return;

      setItems([]);
      setPage(1);
      setHasMore(true);

      lastLoadedKeyRef.current = currentKey;
      fetchPage(currentKeyword, 1, true);
    },
    [fetchPage, keyword]
  );

  /* ================= OPEN HANDLER ================= */

  const openDropdown = useCallback(() => {
    if (disabled) return;

    // set rect trước khi open để hết nhấp nháy
    syncRectNow();
    setOpen(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const k = makeKey(branch_id, keyword);

    // ✅ có cache => dùng cache, không gọi API
    const cached = cacheRef.current.get(k);
    if (cached) {
      setItems(cached.items);
      setHasMore(cached.hasMore);
      setPage(cached.page);
      lastLoadedKeyRef.current = k;
      return;
    }

    // ✅ chưa cache => lần đầu click (keyword rỗng cũng vậy) => fetch 20 sp luôn
    triggerFetchFirstPage(k);
  }, [disabled, syncRectNow, branch_id, keyword, triggerFetchFirstPage]);

  /* ================= DEBOUNCE WHEN KEYWORD CHANGES ================= */
  // ✅ Chỉ khi keyword thay đổi (và open) mới fetch page=1
  const lastKeywordRef = useRef<string>("");

  useEffect(() => {
    if (!open || disabled) return;

    const kword = keyword.trim();
    if (lastKeywordRef.current === kword) return;

    const t = setTimeout(() => {
      lastKeywordRef.current = kword;

      const k = makeKey(branch_id, kword);

      // có cache keyword này => dùng cache luôn
      const cached = cacheRef.current.get(k);
      if (cached) {
        setItems(cached.items);
        setHasMore(cached.hasMore);
        setPage(cached.page);
        lastLoadedKeyRef.current = k;
        return;
      }

      // chưa cache => fetch page=1
      lastLoadedKeyRef.current = k;
      fetchPage(kword, 1, true);
    }, 300);

    return () => clearTimeout(t);
  }, [keyword, open, disabled, branch_id, fetchPage]);

  /* ================= LOAD MORE ON SCROLL ================= */

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    if (loading) return;
    if (!hasMore) return;
    if (loadMoreLockRef.current) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      loadMoreLockRef.current = true;

      const nextPage = clamp0(page + 1);
      const kword = keyword.trim();

      fetchPage(kword, nextPage, false);
    }
  };

  /* ================= SYNC RECT ON RESIZE (no scroll to avoid jitter) ================= */

  useEffect(() => {
    if (!open) return;

    const onResize = () => syncRectNow();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, syncRectNow]);

  /* ================= UI ================= */
  useImperativeHandle(ref, () => ({
  focusAndOpen() {
    if (disabled) return;

    syncRectNow();
    setOpen(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    const k = makeKey(branch_id, keyword);
    const cached = cacheRef.current.get(k);

    if (cached) {
      setItems(cached.items);
      setHasMore(cached.hasMore);
      setPage(cached.page);
      lastLoadedKeyRef.current = k;
    } else {
      triggerFetchFirstPage(k);
    }
  },
}));

  

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
      {open && !disabled && dropdownReady && (
        <div
          className="fixed z-[9999] rounded-xl border border-neutral-200 bg-white shadow-xl"
          style={dropdownStyle}
        >
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-96 overflow-y-auto"
          >
            {items.map((item) => (
              <div
                key={item.variant_id}
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                  setKeyword("");
                  // ✅ không reset lastLoadedKey ở đây, để lần mở lại không gọi API lại vô duyên
                }}
                className="flex gap-3 p-3 cursor-pointer hover:bg-neutral-50"
              >
               <ProductThumb src={item.image} alt={item.product_name} size="lg" />

                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {item.product_name} - {item.variant_name}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {item.sku} | ĐVT: {item.unit_name}
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div>Giá nhập: {item.import_price.toLocaleString("vi-VN")}</div>
                  <div className="text-neutral-500">Tồn: {item.stock_qty}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="p-3 text-sm text-neutral-400">Đang tải...</div>
            )}

            {!loading && items.length === 0 && (
              <div className="p-3 text-sm text-neutral-400">
                Không có sản phẩm
              </div>
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

}); 
  export default ProductSearchDropdown;
