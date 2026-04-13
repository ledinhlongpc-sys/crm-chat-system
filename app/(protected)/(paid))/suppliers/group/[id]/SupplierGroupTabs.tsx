"use client";

import { useState } from "react";

import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import LinkButtonLoading from "@/components/app/button/LinkButtonLoading";

/* ================= TYPES ================= */

type TabKey = "suppliers" | "note" | "info";

type Supplier = {
  id: string;
  supplier_code: string;
  supplier_name: string;
  phone?: string | null;
  email?: string | null;
  status: "active" | "inactive";
};

type Group = {
  id: string;
  is_active: boolean;
};

type Props = {
  group: Group;
  suppliers: Supplier[];
};

/* ================= COMPONENT ================= */

export default function SupplierGroupTabs({
  group,
  suppliers,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<TabKey>("suppliers");

  return (
    <div className="rounded-xl border bg-white">
      {/* ===== TAB HEADER ===== */}
      <div className="border-b px-6">
        <div className="flex gap-6">
          <TabButton
            active={activeTab === "suppliers"}
            onClick={() => setActiveTab("suppliers")}
          >
            Danh sách nhà cung cấp
          </TabButton>

          <TabButton
            active={activeTab === "note"}
            onClick={() => setActiveTab("note")}
          >
            Ghi chú
          </TabButton>

          <TabButton
            active={activeTab === "info"}
            onClick={() => setActiveTab("info")}
          >
            Thông tin
          </TabButton>
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="p-6">
        {activeTab === "suppliers" && (
          <SuppliersInGroupTab
            suppliers={suppliers}
            disabled={!group.is_active}
          />
        )}

        {activeTab === "note" && (
          <EmptyTab text="Chưa có ghi chú cho nhóm này" />
        )}

        {activeTab === "info" && (
          <EmptyTab text="Thông tin nhóm nhà cung cấp" />
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
      onClick={onClick}
      className={`
        relative py-3 font-medium transition
        ${
          active
            ? "text-blue-600"
            : "text-neutral-500 hover:text-neutral-800"
        }
      `}
    >
      {children}
      {active && (
        <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-blue-600" />
      )}
    </button>
  );
}

function EmptyTab({ text }: { text: string }) {
  return (
    <div className="text-neutral-500">
      {text}
    </div>
  );
}

/* ================= TAB: SUPPLIERS ================= */

function SuppliersInGroupTab({
  suppliers,
  disabled,
}: {
  suppliers: Supplier[];
  disabled: boolean;
}) {
  if (suppliers.length === 0) {
    return (
      <div className="text-neutral-500">
        Chưa có nhà cung cấp trong nhóm này
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!disabled && (
        <div className="font-medium">
          Danh sách nhà cung cấp thuộc nhóm
        </div>
      )}

      {disabled && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Nhóm nhà cung cấp đang{" "}
          <b>ngưng kích hoạt</b>.  
          Danh sách chỉ ở chế độ xem.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHead
            columns={[
              {
                key: "code",
                label: "Mã NCC",
              },
              {
                key: "name",
                label: "Tên nhà cung cấp",
              },
              {
                key: "phone",
                label: "Số điện thoại",
              },
              {
                key: "email",
                label: "Email",
              },
            ]}
          />

          <tbody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
               <TableCell className="font-mono">
  <LinkButtonLoading href={`/suppliers/${s.id}`}>
    {s.supplier_code}
  </LinkButtonLoading>
</TableCell>

                <TableCell>
                  {s.supplier_name}
                </TableCell>

                <TableCell>
                  {s.phone || "-"}
                </TableCell>

                <TableCell>
                  {s.email || "-"}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
