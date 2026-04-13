import { STATUS_MAP, SystemStatus } from "./status.config";

export default function StatusDot({
  status,
}: {
  status: SystemStatus;
}) {
  const s = STATUS_MAP[status];
  if (!s) return null;

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${s.dotClassName}`}
    />
  );
}
