"use client";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "draft";

type Props = {
  status?: StatusType | string;
  size?: "sm" | "md";
};

/* =========================
   STATUS CONFIG (DÙNG CHUNG)
========================= */
const STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  active: {
    label: "Đang hoạt động",
    className:
      "bg-green-100 text-green-700 border-green-200",
  },
  inactive: {
    label: "Ngừng",
    className:
      "bg-gray-100 text-gray-600 border-gray-200",
  },
  pending: {
    label: "Chờ xử lý",
    className:
      "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  processing: {
    label: "Đang giao dịch",
    className:
      "bg-blue-100 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Hoàn thành",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Đã hủy",
    className:
      "bg-red-100 text-red-700 border-red-200",
  },
  draft: {
    label: "Nháp",
    className:
      "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
};

/* =========================
   COMPONENT
========================= */
export default function StatusBadge({
  status = "draft",
  size = "sm",
}: Props) {
  const config =
    STATUS_MAP[status] || STATUS_MAP["draft"];

  return (
    <span
      className={`
        inline-flex items-center rounded-full border
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}
        ${config.className}
      `}
    >
      {config.label}
    </span>
  );
}
