"use client";

import { useMemo } from "react";
import { cardUI, textUI } from "@/ui-tokens";
import { InfoList, InfoRow } from "@/components/app/info/InfoList";

type PriceItem = {
  policy_id: string;
  policy_name: string;
  sort_order: number | null;
  price: number | null;
};

export default function VariantPriceCard({
  prices,
}: {
  prices: PriceItem[];
}) {
  /* ================= SORT PRICES ================= */

  const sortedPrices = useMemo(() => {
    if (!prices || prices.length === 0) return [];

    return [...prices].sort((a, b) => {
      // Giá bán lẻ (3) luôn lên đầu
      if (a.sort_order === 3) return -1;
      if (b.sort_order === 3) return 1;

      // Giá nhập (1) luôn xuống cuối
      if (a.sort_order === 1) return 1;
      if (b.sort_order === 1) return -1;

      // Các giá khác sort tăng dần
      return (a.sort_order ?? 999) - (b.sort_order ?? 999);
    });
  }, [prices]);

  /* ================= SPLIT INTO 2 COLUMNS ================= */

  const half = Math.ceil(sortedPrices.length / 2);

  const leftColumn = sortedPrices.slice(0, half);
  const rightColumn = sortedPrices.slice(half);

  /* ================= EMPTY STATE ================= */

  if (!sortedPrices.length) {
    return (
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <h4 className={cardUI.title}>Giá sản phẩm</h4>
        </div>
        <div className={cardUI.body}>
          <div className={textUI.hint}>
            Chưa có giá cho phiên bản này
          </div>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <h4 className={cardUI.title}>Giá sản phẩm</h4>
      </div>

      <div className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-6`}>
        <InfoList>
          {leftColumn.map((p) => (
            <InfoRow
              key={p.policy_id}
              label={p.policy_name}
              value={
                p.price == null
                  ? "—"
                  : p.price.toLocaleString("vi-VN")
              }
            />
          ))}
        </InfoList>

        <InfoList>
          {rightColumn.map((p) => (
            <InfoRow
              key={p.policy_id}
              label={p.policy_name}
              value={
                p.price == null
                  ? "—"
                  : p.price.toLocaleString("vi-VN")
              }
            />
          ))}
        </InfoList>
      </div>
    </div>
  );
}
