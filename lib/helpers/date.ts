export function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
}

export function formatDateTime(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleString("vi-VN");
}

export function getLastNDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/* =====================================================
   🔥 DÙNG CHO INPUT datetime-local
===================================================== */

export function toInputDateTime(date?: string | null) {
  if (!date) return "";

  const d = new Date(date);

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}