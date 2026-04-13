/* ================= CORE ================= */

export function toVNDate(date?: string | Date) {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;

  return new Date(
    d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
}

/* ================= TODAY ================= */

export function getTodayVN() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

/* ================= TIME ================= */

export function formatTimeVN(date?: string | Date) {
  const d = toVNDate(date);
  if (!d) return "";

  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ================= DATE ================= */

export function formatDateVN(date?: string | Date) {
  const d = toVNDate(date);
  if (!d) return "-";

  return d.toLocaleDateString("vi-VN");
}

/* ================= DATETIME ================= */

export function formatDateTimeVN(date?: string | Date) {
  const d = toVNDate(date);
  if (!d) return "-";

  return d.toLocaleString("vi-VN");
}

/* ================= CHAT ================= */

export function formatChatTime(date?: string | Date) {
  const d = toVNDate(date);
  if (!d) return "";

  const now = toVNDate(new Date());
  if (!now) return "";

  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút`;

  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (sameDay) {
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return "Hôm qua";
  }

  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

/* ================= MERGE ================= */

export function mergeDateTimeVN(date: string, time?: string) {
  if (!date || !time) return null;

  return `${date}T${time}:00+07:00`;
}