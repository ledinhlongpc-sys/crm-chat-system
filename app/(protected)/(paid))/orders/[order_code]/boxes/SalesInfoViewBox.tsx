"use client";

import FormBox from "@/components/app/form/FormBox";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type Branch = {
  id: string;
  name: string;
};

export type Staff = {
  id: string;
  full_name: string | null;
};

export type OrderSource = {
  id: string;
  source_code: string;
  source_name: string;
};

export type SalesInfoView = {
  branch_id: string;
  created_by: string;
  sale_date: string;
  expected_delivery_at?: string | null;
  order_source: string;
};

/* ================= HELPERS ================= */

function formatDateTime(v?: string | null) {
  if (!v) return "—";

  try {
    const d = new Date(v);

    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return v;
  }
}

/* ================= PROPS ================= */

type Props = {
  branches?: Branch[];
  staffs?: Staff[];
  orderSources?: OrderSource[];

  value: SalesInfoView | null;

  onChange?: (v: SalesInfoView) => void; // giữ để khỏi sửa chỗ gọi
};

/* ================= COMPONENT ================= */

export default function SalesInfoViewBox({
  branches = [],
  staffs = [],
  orderSources = [],
  value = null,
}: Props) {

  const branchName =
    branches.find((b) => b.id === value?.branch_id)?.name ?? "—";

  const staffName =
    staffs.find((s) => s.id === value?.created_by)?.full_name ?? "—";

  const sourceName =
    orderSources.find((s) => s.source_code === value?.order_source)
      ?.source_name ?? value?.order_source ?? "—";

  return (
    <FormBox title="Thông tin bổ sung">
      {!value && (
        <div className="flex flex-col items-center justify-center py-14 text-neutral-400">
          <span className={textUI.cardTitle}>—</span>
        </div>
      )}

      {value && (
        <div className="space-y-5">

          {/* ===== NGÀY BÁN ===== */}
          <div className="flex items-center gap-2">
            <div className="w-28 shrink-0">
              <span className={textUI.cardTitle}>Ngày bán:</span>
            </div>

            <div className="flex-1">
              <span className={textUI.cardTitle}>
                {formatDateTime(value.sale_date)}
              </span>
            </div>
          </div>

          {/* ===== BÁN TẠI ===== */}
          <div className="flex items-center gap-2">
            <div className="w-28 shrink-0">
              <span className={textUI.cardTitle}>Bán tại:</span>
            </div>

            <div className="flex-1">
              <span className={textUI.cardTitle}>{branchName}</span>
            </div>
          </div>

          {/* ===== BÁN BỞI ===== */}
          <div className="flex items-center gap-2">
            <div className="w-28 shrink-0">
              <span className={textUI.cardTitle}>Bán bởi:</span>
            </div>

            <div className="flex-1">
              <span className={textUI.cardTitle}>{staffName}</span>
            </div>
          </div>

          {/* ===== NGUỒN ===== */}
          <div className="flex items-center gap-2">
            <div className="w-28 shrink-0">
              <span className={textUI.cardTitle}>Nguồn:</span>
            </div>

            <div className="flex-1">
              <span className={textUI.cardTitle}>{sourceName}</span>
            </div>
          </div>

          {/* ===== HẸN GIAO ===== */}
          <div className="flex items-center gap-2">
            <div className="w-28 shrink-0">
              <span className={textUI.cardTitle}>Hẹn giao:</span>
            </div>

            <div className="flex-1">
              <span className={textUI.cardTitle}>
                {formatDateTime(value.expected_delivery_at)}
              </span>
            </div>
          </div>

        </div>
      )}
    </FormBox>
  );
}