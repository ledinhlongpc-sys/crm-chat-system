export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>; // ❌ KHÔNG dùng layout chính
}