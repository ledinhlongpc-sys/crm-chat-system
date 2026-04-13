export default function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-neutral-500">
        <div className="h-8 w-8 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" />
        <div className="text-sm">Đang tải dữ liệu...</div>
      </div>
    </div>
  );
}
