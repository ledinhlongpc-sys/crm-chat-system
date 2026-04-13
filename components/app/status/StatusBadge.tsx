import { STATUS_MAP, SystemStatus } from "./status.config";

/* =========================
   COMPONENT
========================= */
export default function StatusBadge({
  status,
}: {
  status: SystemStatus;
}) {
  const s = STATUS_MAP[status];
  if (!s) return null;

  return (
    <span
      className={`
        inline-flex
        items-center
        px-2.5
        py-0.5
        text-xs
        rounded-full
        whitespace-nowrap
        ${s.className}
      `}
    >
      {s.label}
    </span>
  );
}
