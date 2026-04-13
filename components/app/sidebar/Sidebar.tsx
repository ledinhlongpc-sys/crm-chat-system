"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import SidebarItem from "./SidebarItem";
import { sidebarMenu } from "./menu";
import { canViewMenu } from "@/lib/permissions";

/* ================= TYPES ================= */

type Props = {
  userType?: string;
};

/* ================= COMPONENT ================= */

export default function Sidebar({ userType }: Props) {
  const pathname = usePathname();
  const [openKey, setOpenKey] = useState<string | null>(null);

  /* ================= FILTER MENU ================= */

  const filteredMenu = useMemo(() => {
    return sidebarMenu
      .map((item) => {
        // ❌ không có quyền cha → bỏ luôn
        if (!canViewMenu(item.key as any, userType)) return null;

        // 🔥 filter children
        if (item.children) {
          const filteredChildren = item.children.filter((c) =>
            canViewMenu(c.key as any, userType)
          );

          // ❌ không còn child → bỏ luôn cha
          if (filteredChildren.length === 0) return null;

          return {
            ...item,
            children: filteredChildren,
          };
        }

        return item;
      })
      .filter(Boolean);
  }, [userType]);

  /* ================= AUTO OPEN ================= */

  useEffect(() => {
    const found = filteredMenu.find((item: any) =>
      item.children?.some((c: any) =>
        pathname.startsWith(c.href || "")
      )
    );

    if (found) setOpenKey(found.key);
  }, [pathname, filteredMenu]);

  /* ================= RENDER ================= */

  return (
    <aside className="fixed top-0 left-0 z-40 flex h-screen w-64 flex-col bg-slate-900 text-white">
      {/* LOGO */}
      <div className="flex h-14 items-center gap-2 px-4 text-[18px] font-semibold border-b border-slate-800">
        <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
          L
        </div>
        <span className="tracking-wide">LongThu CRM</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
        {filteredMenu.map((item: any) => (
          <SidebarItem
            key={item.key}
            item={item}
            pathname={pathname}
            level={0}
            openKey={openKey}
            setOpenKey={setOpenKey}
          />
        ))}
      </nav>
    </aside>
  );
}