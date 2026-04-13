// lib/utils/date.ts

export function getNowVietnamForInput(): string {
  const now = new Date();

  // Convert sang giờ VN (UTC+7)
  const vietnamTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  const pad = (n: number) => String(n).padStart(2, "0");

  const yyyy = vietnamTime.getFullYear();
  const mm = pad(vietnamTime.getMonth() + 1);
  const dd = pad(vietnamTime.getDate());
  const hh = pad(vietnamTime.getHours());
  const mi = pad(vietnamTime.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}