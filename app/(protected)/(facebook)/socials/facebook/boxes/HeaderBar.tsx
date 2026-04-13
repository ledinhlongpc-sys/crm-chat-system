export default function HeaderBar() {
  return (
    <div className="h-[64px] flex items-center justify-between border-b px-4">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button>←</button>

        <div className="font-semibold text-lg">
          Hội thoại
        </div>

        {/* 👉 dropdown chọn page */}
        <button className="px-3 py-1 border rounded">
          Đã chọn 6 trang ▼
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full" />
      </div>

    </div>
  );
}