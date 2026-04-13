/* ================= NUMBER ================= */

export function formatNumber(value?: number) {
  if (value === null || value === undefined) return "-";

  return Math.round(value).toLocaleString("vi-VN");
}

/* ================= MONEY ================= */

export function formatCurrency(value?: number) {
  if (value === null || value === undefined) return "-";

  const num = Number(value || 0);

  return Math.round(num).toLocaleString("vi-VN") + " ₫";
}

/* ================= SHORT MONEY ================= */

export function formatShortCurrency(value?: number) {
  if (value === null || value === undefined) return "-";

  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + " tỷ";
  }

  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + " tr";
  }

  return value.toLocaleString("vi-VN") + " ₫";
}

/* ================= DATE ================= */

export function formatDateVN(date?: string | Date) {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("vi-VN");
}

/* ================= DATETIME ================= */

export function formatDateTimeVN(date?: string | Date) {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleString("vi-VN");
}

/* ================= PERCENT ================= */

export function formatPercent(value?: number) {
  if (value === null || value === undefined) return "-";
  return value.toFixed(2) + " %";
}

/* ================= SIGNED MONEY ================= */
/* dùng cho báo cáo lời/lỗ */

export function formatSignedCurrency(value?: number) {
  if (value === null || value === undefined) return "-";

  const num = Math.round(Number(value || 0));
  const formatted = num.toLocaleString("vi-VN") + " ₫";

  if (num > 0) return "+" + formatted;
  if (num < 0) return "-" + formatted.replace("-", "");

  return formatted;
}