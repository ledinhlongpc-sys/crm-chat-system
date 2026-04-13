export function getTodayVN() {
  const now = new Date();
  return new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);
}

export function mergeDateTimeVN(date: string, time?: string) {
  if (!date || !time) return null;
  return `${date}T${time}:00`;
}