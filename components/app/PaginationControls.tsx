"use client";

import {
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  limit: number;
  total: number;
  search?: string;
};

export default function PaginationControls({
  page,
  limit,
  total,
  search,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* =====================================================
     🔑 NORMALIZE INPUT (CHỐNG NaN)
  ===================================================== */
  const safePage =
    Number.isFinite(page) && page > 0 ? page : 1;

  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? limit : 20;

  const safeTotal =
    Number.isFinite(total) && total >= 0 ? total : 0;

  const totalPages = Math.max(
    1,
    Math.ceil(safeTotal / safeLimit)
  );

  /* ================= NAVIGATION ================= */

  function go(params: Record<string, string>) {
    const qs = new URLSearchParams(
      searchParams.toString()
    );

    Object.entries(params).forEach(([k, v]) => {
      qs.set(k, v);
    });

    if (search) qs.set("q", search);

    router.push(`${pathname}?${qs.toString()}`, {
      scroll: false,
    });
  }

  /* ================= PAGE LIST ================= */

  function getPages() {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (safePage > 4) pages.push("...");

    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (safePage < totalPages - 3) pages.push("...");

    pages.push(totalPages);

    return pages;
  }

  const pages = getPages();

  const from =
    safeTotal === 0
      ? 0
      : (safePage - 1) * safeLimit + 1;

  const to = Math.min(
    safePage * safeLimit,
    safeTotal
  );

  /* ================= RENDER ================= */

  return (
    <div className="flex w-full items-center justify-between px-6 py-3 text-base">
      {/* LEFT – INFO */}
      <div className="text-base">
        {safeTotal === 0 ? (
          "Hiển thị 0 kết quả"
        ) : (
          <>
            Hiển thị <b>{from}</b> – <b>{to}</b>{" "}
            trên tổng <b>{safeTotal}</b>
          </>
        )}
      </div>

      {/* RIGHT – CONTROLS */}
      <div className="flex items-center gap-4">
        {/* PAGINATION */}
        <div className="flex items-center gap-1">
          <button
            disabled={safePage <= 1}
            onClick={() =>
              go({
                page: String(safePage - 1),
                limit: String(safeLimit),
              })
            }
            className="rounded-md border px-2 py-1 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>

          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-neutral-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() =>
                  go({
                    page: String(p),
                    limit: String(safeLimit),
                  })
                }
                className={`min-w-[32px] rounded-md border px-2 py-1 ${
                  p === safePage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-neutral-100"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={safePage >= totalPages}
            onClick={() =>
              go({
                page: String(safePage + 1),
                limit: String(safeLimit),
              })
            }
            className="rounded-md border px-2 py-1 disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* PAGE SIZE */}
        <div className="flex items-center gap-2 text-neutral-600">
          <span>Hiển thị</span>
          <select
            value={safeLimit}
            onChange={(e) =>
              go({
                page: "1",
                limit: e.target.value,
              })
            }
            className="h-8 rounded-md border px-2"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>kết quả</span>
        </div>
      </div>
    </div>
  );
}
