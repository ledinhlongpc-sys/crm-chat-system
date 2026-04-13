"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import { SidebarMenu } from "./menu";

type Props = {
  item: SidebarMenu;
  pathname: string;
  level: number;
  openKey: string | null;
  setOpenKey: (key: string | null) => void;
};

/* ================= ICON MAP ================= */

const iconMap: Record<string, any> = {
  dashboard: Icons.LayoutDashboard,
  orders: Icons.ShoppingCart,
  shipping: Icons.Truck,
  products: Icons.Package,
  customers: Icons.Users,
  finance: Icons.Wallet,
  reports: Icons.BarChart3,
  settings: Icons.Settings,
  users: Icons.Users,
  hr: Icons.Users,
};

/* ================= COMPONENT ================= */

export default function SidebarItem({
  item,
  pathname,
  level,
  openKey,
  setOpenKey,
}: Props) {
  /* ================= ACTIVE LINK ================= */

  const isActiveLink = (href?: string) => {
    if (!href) return false;

    const normalize = (s: string) => s.replace(/\/+$/, "");

    const current = normalize(pathname);
    const target = normalize(href);

    return current === target || current.startsWith(target + "/");
  };

  /* ================= CHILD ACTIVE ================= */

  const hasActiveChild = item.children?.some((c) =>
    isActiveLink(c.href)
  );

  const isOpen = openKey === item.key || hasActiveChild;

  const paddingLeft = level === 0 ? "pl-4" : "pl-8";
  const textSize = level === 0 ? "text-[15px]" : "text-[14px]";

  const Icon = item.iconKey ? iconMap[item.iconKey] : null;

  /* ================= MENU CHA ================= */

  if (item.children?.length) {
    return (
      <div>
        <button
          onClick={() => {
            // 🔥 nếu đang active child thì không đóng
            if (hasActiveChild) {
              setOpenKey(item.key);
            } else {
              setOpenKey(isOpen ? null : item.key);
            }
          }}
          className={`
            group flex w-full items-center gap-3 py-2 pr-4
            ${paddingLeft}
            ${textSize}
            font-medium
            transition-all duration-200
            ${
              isOpen
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:translate-x-1"
            }
          `}
        >
          {/* ICON */}
          {Icon && (
            <Icon className="h-4 w-4 text-slate-400 group-hover:text-white" />
          )}

          {/* LABEL */}
          <span className="flex-1 text-left">
            {item.label}
          </span>

          {/* ARROW */}
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </button>

        {/* CHILDREN */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 mt-1">
            {item.children.map((child) => (
              <SidebarItem
                key={`${item.key}-${child.href}`}
                item={child}
                pathname={pathname}
                level={level + 1}
                openKey={openKey}
                setOpenKey={setOpenKey}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ================= MENU LINK ================= */

  if (!item.href) return null;

  const isActive = isActiveLink(item.href);

  return (
    <Link
      href={item.href}
      className={`
        group relative flex items-center gap-3 py-2 pr-4
        ${paddingLeft}
        ${textSize}
        transition-all duration-200
        ${
          isActive
            ? "bg-blue-600/20 text-white border-l-2 border-blue-500"
            : "text-slate-300 hover:text-white hover:bg-slate-800 hover:translate-x-1"
        }
      `}
    >
      {/* ICON */}
      {level === 0 && Icon && (
        <Icon className="h-4 w-4 text-slate-400 group-hover:text-white" />
      )}

      {/* DOT CHILD ACTIVE */}
      {level > 0 && isActive && (
        <span className="absolute left-3 h-1.5 w-1.5 rounded-full bg-blue-400" />
      )}

      <span>{item.label}</span>
    </Link>
  );
}