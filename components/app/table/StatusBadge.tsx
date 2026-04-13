type Props = {
  status?: "active" | "inactive" | null;
};

export default function StatusBadge({ status }: Props) {
  const isActive = status === "active";

  return isActive ? (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
      Đang giao dịch
    </span>
  ) : (
    <span className="rounded-full bg-neutral-200 px-2 py-1 text-xs text-neutral-600">
      Ngưng
    </span>
  );
}
