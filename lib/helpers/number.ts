/* ================= PARSE ================= */

export function parseNumber(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/* ================= CLAMP ================= */

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/* ================= FORMAT NUMBER ================= */

export function formatNumber(value?: number) {
  if (value === null || value === undefined) return "-";

  return Math.round(value).toLocaleString("vi-VN");
}