import { cardUI, textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type SupplierInfo = {
  supplier_code: string;
  supplier_name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  current_debt: number;
  created_at: string;
  updated_at?: string | null;
};

type Props = {
  supplier: SupplierInfo;
};

/* ================= HELPERS ================= */

function formatDate(v?: string | null) {
  if (!v) return "-";
  return new Date(v).toLocaleString("vi-VN");
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3">
      <div className={`${textUI.body} text-sm`}>
        {label}
      </div>

      <div
        className={`col-span-2 ${textUI.body} font-medium ${
          mono ? "font-mono" : ""
        }`}
      >
        {value ?? "-"}
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function SupplierInfoBox({ supplier }: Props) {
  return (
    <div className={cardUI.base}>
      {/* ===== HEADER ===== */}
      <div className={cardUI.header}>
        <h2 className={textUI.cardTitle}>
          Thông tin nhà cung cấp
        </h2>
      </div>

      {/* ===== CONTENT ===== */}
      <div className={`${cardUI.body} divide-y`}>
        <InfoRow
          label="Mã nhà cung cấp"
          value={supplier.supplier_code}
          mono
        />
        <InfoRow
          label="Tên nhà cung cấp"
          value={supplier.supplier_name}
        />
        <InfoRow
          label="Số điện thoại"
          value={supplier.phone || "-"}
        />
        <InfoRow
          label="Email"
          value={supplier.email || "-"}
        />
        <InfoRow
          label="Địa chỉ"
          value={supplier.address || "-"}
        />
        <InfoRow
          label="Công nợ hiện tại"
          value={
            supplier.current_debt > 0 ? (
              <span className="text-red-600">
                {supplier.current_debt.toLocaleString("vi-VN")}
              </span>
            ) : (
              "0"
            )
          }
        />
        <InfoRow
          label="Ngày tạo"
          value={formatDate(supplier.created_at)}
        />
        <InfoRow
          label="Cập nhật gần nhất"
          value={formatDate(supplier.updated_at)}
        />
      </div>
    </div>
  );
}
