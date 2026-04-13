/* ================= SENIORITY HELPERS ================= */

/* 👉 tính số tháng làm việc */
export function calcSeniorityMonths(joinDate: string) {
  const start = new Date(joinDate);
  const now = new Date();

  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  // 🔥 nếu chưa đủ ngày trong tháng thì trừ 1
  if (now.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(months, 0);
}

/* 👉 tính tiền thâm niên */
export function calcSeniorityAmount(
  joinDate: string,
  config: {
    is_enabled: boolean;
    months_step: number;
    amount_per_step: number;
    max_steps?: number | null;
  }
) {
  if (!config?.is_enabled) return 0;

  const months = calcSeniorityMonths(joinDate);

  let steps = Math.floor(months / config.months_step);

  if (config.max_steps) {
    steps = Math.min(steps, config.max_steps);
  }

  return steps * config.amount_per_step;
}

/* 👉 format thâm niên (UI) */
export function formatSeniority(joinDate: string) {
  const months = calcSeniorityMonths(joinDate);

  const years = Math.floor(months / 12);
  const remain = months % 12;

  if (years <= 0) return `${remain} tháng`;

  return `${years} năm ${remain} tháng`;
}