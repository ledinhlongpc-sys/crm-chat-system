"use client";

import { ReactNode, Children, isValidElement } from "react";
import { tableUI, tableTopUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  children: ReactNode;
  /** dùng khi table nằm trong FormBox → không cần border ngoài */
  noBorder?: boolean;
};

/* ================= HEADER (FILTER BAR OUTSIDE TABLE) ================= */

function TableHeader({ children }: { children: ReactNode }) {
  return <div className={tableTopUI.wrapper}>{children}</div>;
}

/* ================= BODY ================= */

function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

/* ================= CONTAINER ================= */

function TableContainer({ children, noBorder = false }: Props) {
  const headers: ReactNode[] = [];
  const tableChildren: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === TableHeader) {
      headers.push(child);
    } else {
      tableChildren.push(child);
    }
  });

  return (
    <div
      className={
        noBorder
          ? "overflow-hidden"
          : tableUI.container
      }
    >
      {/* ===== HEADER BAR (OUTSIDE TABLE) ===== */}
      {headers}

      {/* ===== TABLE ===== */}
      <table className="w-full border-collapse table-fixed">
        {tableChildren}
      </table>
    </div>
  );
}

/* ================= ATTACH STATIC SUB COMPONENTS ================= */

TableContainer.Header = TableHeader;
TableContainer.Body = TableBody;

export default TableContainer;