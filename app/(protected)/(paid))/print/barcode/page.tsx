"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pageUI, cardUI, textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type PriceItem = {
  policy_id: string;
  policy_name: string;
  sort_order: number | null;
  price: number | null;
};

type Variant = {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  prices: PriceItem[];
};

/* ================= UTILS ================= */

function formatPrice(value?: number | null) {
  if (value == null) return "—";
  return value.toLocaleString("vi-VN") + " ₫";
}

/* ================= PAGE ================= */

export default function PrintBarcodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ================= PARAM ================= */
  // 👉 hỗ trợ cả 2 key cho an toàn
  const idsParam =
    searchParams.get("variant_ids") ||
    searchParams.get("ids");

  const variantIds = useMemo(() => {
    if (!idsParam) return [];
    return idsParam.split(",").filter(Boolean);
  }, [idsParam]);

  /* ================= STATE ================= */

  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  // 👉 chặn gọi API 2 lần ở dev
  const didLoadRef = useRef(false);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (variantIds.length === 0) return;
    if (didLoadRef.current) return;

    didLoadRef.current = true;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `/api/variants/by-ids?ids=${variantIds.join(",")}`
        );

        const json = await res.json();

        if (json?.variants) {
          setVariants(json.variants);
        }
      } catch (err) {
        console.error("[print barcode] load error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [variantIds]);

  /* ================= GUARD ================= */

  if (variantIds.length === 0) {
    return (
      <div className={pageUI.contentWide}>
        <div className={textUI.hint}>
          Không có phiên bản để in mã vạch
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.contentWide}>
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className={textUI.link}
        >
          ← Quay lại
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="
            px-4 py-2
            rounded-md
            bg-blue-600
            text-white
            text-sm
            hover:bg-blue-700
          "
        >
          In mã vạch
        </button>
      </div>

      {/* ===== CONTENT ===== */}
      {loading ? (
        <div className={textUI.hint}>Đang tải dữ liệu…</div>
      ) : (
        <div className="space-y-6">
          {variants.map((v) => {
            const retailPrice = v.prices.find(
              (p) => p.policy_name === "Giá bán lẻ"
            );

            return (
              <div
                key={v.id}
                className={`
                  ${cardUI.base}
                  max-w-md
                  mx-auto
                  print:shadow-none
                `}
              >
                <div className={cardUI.body}>
                  {/* NAME */}
                  <div className="text-center text-sm font-medium mb-2">
                    {v.name}
                  </div>

                  {/* BARCODE – MVP TEXT */}
                  <div className="flex justify-center mb-2">
                    <div
                      className="
                        h-16
                        w-56
                        border
                        flex items-center justify-center
                        text-xs
                        tracking-widest
                        bg-white
                      "
                    >
                      {v.barcode || v.sku || "NO-BARCODE"}
                    </div>
                  </div>

                  {/* SKU */}
                  <div className="text-center text-xs text-neutral-600 mb-1">
                    {v.sku || "—"}
                  </div>

                  {/* PRICE */}
                  <div className="text-center text-base font-semibold">
                    {formatPrice(retailPrice?.price)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
