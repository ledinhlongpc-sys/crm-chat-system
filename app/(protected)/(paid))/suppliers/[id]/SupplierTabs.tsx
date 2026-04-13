"use client";

import { useState } from "react";

import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";

import { cardUI, textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type TabKey =
  | "purchase_history"
  | "debt"
  | "contact"
  | "address"
  | "note";

type Props = {
  supplierId: string;
};

/* ================= COMPONENT ================= */

export default function SupplierTabs({ supplierId }: Props) {
  const [activeTab, setActiveTab] =
    useState<TabKey>("purchase_history");

  return (
    <div className={cardUI.base}>
      {/* ===== TAB HEADER ===== */}
      <div className={`${cardUI.header} pb-0`}>
        <div className="flex gap-6">
          <TabButton
            active={activeTab === "purchase_history"}
            onClick={() =>
              setActiveTab("purchase_history")
            }
          >
            Lịch sử nhập hàng
          </TabButton>

          <TabButton
            active={activeTab === "debt"}
            onClick={() => setActiveTab("debt")}
          >
            Công nợ
          </TabButton>

          <TabButton
            active={activeTab === "contact"}
            onClick={() => setActiveTab("contact")}
          >
            Liên hệ
          </TabButton>

          <TabButton
            active={activeTab === "address"}
            onClick={() => setActiveTab("address")}
          >
            Địa chỉ
          </TabButton>

          <TabButton
            active={activeTab === "note"}
            onClick={() => setActiveTab("note")}
          >
            Ghi chú
          </TabButton>
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className={cardUI.body}>
        {activeTab === "purchase_history" && (
          <PurchaseHistoryTab supplierId={supplierId} />
        )}

        {activeTab === "debt" && (
          <EmptyTab text="Chưa có dữ liệu công nợ" />
        )}

        {activeTab === "contact" && (
          <EmptyTab text="Chưa có thông tin liên hệ" />
        )}

        {activeTab === "address" && (
          <EmptyTab text="Chưa có thông tin địa chỉ" />
        )}

        {activeTab === "note" && (
          <EmptyTab text="Chưa có ghi chú" />
        )}
      </div>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        pb-3
        text-sm
        font-medium
        transition
        ${
          active
            ? "text-blue-600"
            : "text-neutral-600 hover:text-neutral-900"
        }
      `}
    >
      {children}

      {active && (
        <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-blue-600" />
      )}
    </button>
  );
}

function EmptyTab({ text }: { text: string }) {
  return (
    <div className="py-8 text-center">
      <p className={`${textUI.body} text-sm`}>
        {text}
      </p>
    </div>
  );
}

/* ================= TAB: PURCHASE HISTORY ================= */

function PurchaseHistoryTab({
  supplierId,
}: {
  supplierId: string;
}) {
  return (
    <div className="space-y-4">
      <h3 className={textUI.body}>
        Lịch sử nhập hàng
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHead
            columns={[
              { key: "code", label: "Mã đơn nhập" },
              { key: "status", label: "Trạng thái" },
              {
                key: "stock",
                label: "Nhập kho",
                align: "center",
              },
              {
                key: "payment",
                label: "Thanh toán",
                align: "center",
              },
              {
                key: "total",
                label: "Giá trị",
                align: "right",
              },
              { key: "branch", label: "Chi nhánh" },
              { key: "created", label: "Ngày tạo" },
              { key: "updated", label: "Cập nhật cuối" },
            ]}
          />

          <tbody>
            <TableRow>
              <TableCell colSpan={8} align="center">
                <span className={textUI.body}>
                  Chưa có đơn nhập hàng
                </span>
              </TableCell>
            </TableRow>
          </tbody>
        </table>
      </div>
    </div>
  );
}
