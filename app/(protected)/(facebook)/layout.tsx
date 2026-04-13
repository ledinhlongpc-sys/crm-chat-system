import { ReactNode } from "react";

export default function SocialLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* 🔵 SIDEBAR SOCIAL */}
      <aside className="w-[240px] bg-slate-900 text-white flex flex-col">
        <div className="p-4 font-semibold border-b border-white/10">
          Social
        </div>

        <div className="p-2 space-y-1">
          <MenuItem label="Hội thoại" active />
          <MenuItem label="Livestream" />
          <MenuItem label="Chatbot" />
          <MenuItem label="Công cụ tự động" />
          <MenuItem label="Khách tương tác" />
          <MenuItem label="Bài viết" />
          <MenuItem label="Báo cáo" />
          <MenuItem label="Cấu hình" />
        </div>
      </aside>

      {/* 🟡 CONTENT */}
      <main className="flex-1 bg-white">{children}</main>
    </div>
  );
}

function MenuItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`px-3 py-2 rounded cursor-pointer text-sm ${
        active
          ? "bg-blue-600"
          : "text-gray-300 hover:bg-white/10"
      }`}
    >
      {label}
    </div>
  );
}