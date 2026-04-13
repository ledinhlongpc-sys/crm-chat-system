export function formatMoney(
  value: number | null | undefined,
  options?: {
    showCurrency?: boolean;
    minimumFractionDigits?: number;
  }
) {
  const amount = Number(value ?? 0);

  const {
    showCurrency = false,
    minimumFractionDigits = 0,
  } = options || {};

  const formatted = amount.toLocaleString("vi-VN", {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  });

  return showCurrency ? `${formatted} ₫` : formatted;
}