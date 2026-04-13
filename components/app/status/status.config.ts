export type SystemStatus =
  | "active"
  | "inactive"
  | "draft"
  | "pending"
  | "archived"
  | "error"
  | "syncing"
  | "synced";

export const STATUS_MAP: Record<
  SystemStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  active: {
    label: "Đang hoạt động",
    className: "bg-green-100 text-green-700",
    dotClassName: "bg-green-500",
  },
  inactive: {
    label: "Ngưng hoạt động",
    className: "bg-neutral-200 text-neutral-600",
    dotClassName: "bg-neutral-400",
  },
  draft: {
    label: "Nháp",
    className: "bg-yellow-100 text-yellow-700",
    dotClassName: "bg-yellow-500",
  },
  pending: {
    label: "Đang xử lý",
    className: "bg-blue-100 text-blue-700",
    dotClassName: "bg-blue-500",
  },
  archived: {
    label: "Lưu trữ",
    className: "bg-neutral-100 text-neutral-500",
    dotClassName: "bg-neutral-400",
  },
  error: {
    label: "Lỗi",
    className: "bg-red-100 text-red-700",
    dotClassName: "bg-red-500",
  },
  syncing: {
    label: "Đang đồng bộ",
    className: "bg-indigo-100 text-indigo-700",
    dotClassName: "bg-indigo-500 animate-pulse",
  },
  synced: {
    label: "Đã đồng bộ",
    className: "bg-emerald-100 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
};
