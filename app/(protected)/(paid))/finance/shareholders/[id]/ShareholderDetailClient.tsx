"use client";

import {
  cardUI,
  textUI,
  badgeUI,
} from "@/ui-tokens";
import Link from "next/link";
import TableContainer from "@/components/app/table/TableContainer";
import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";

/* ================= TYPES ================= */

type Shareholder = {
  shareholder_name: string | null;
  phone: string | null;
  email: string | null;
  capital_commitment: number | null;
  capital_contributed: number | null;
  ownership_percent: number | null;
  status: "active" | "inactive";

  branch?: {
    id: string;
    name: string;
    branch_code?: string;
  } | null;
};

type Capital = {
  id: string;
  amount: number;
  transaction_type: "contribute" | "withdraw";
  transaction_date: string;
  note: string | null;
  account?: { // 👈 THÊM
    account_name: string;
  } | null;
   money_tx_id?: string | null;
};

type Props = {
  shareholder: Shareholder;
  capitalData: Capital[];
};

const formatDate = (v?: string | null) => {
  if (!v) return "-";
  return new Date(v).toLocaleDateString("vi-VN");
};

/* ================= COLUMNS ================= */

const columns: Column[] = [
  { key: "date", label: "Ngày" },
  { key: "type", label: "Loại" },
  { key: "account", label: "Tài khoản" },
  { key: "amount", label: "Số tiền", align: "right" },
  { key: "note", label: "Ghi chú" },
];

/* ================= HELPER ================= */

const formatMoney = (v?: number | null) =>
  (v || 0).toLocaleString("vi-VN") + " đ";

/* ================= COMPONENT ================= */

export default function ShareholderDetailClient({
  shareholder,
  capitalData,
}: Props) {
  const isWarning =
    (shareholder.capital_contributed || 0) <
    (shareholder.capital_commitment || 0);

  return (
    <div className="space-y-6">
      
      {/* ================= INFO ================= */}
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <div className={cardUI.title}>
            Thông tin cổ đông
          </div>
        </div>

        <div
          className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-6`}
        >
          {/* LEFT */}
          <div className="space-y-4">
            <div>
              <div className={textUI.label}>Tên cổ đông</div>
              <div className={textUI.title}>
                {shareholder.shareholder_name || "-"}
              </div>
            </div>

            <div>
              <div className={textUI.label}>SĐT</div>
              <div className={textUI.body}>
                {shareholder.phone || "-"}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Email</div>
              <div className="text-neutral-600">
                {shareholder.email || "-"}
              </div>
            </div>

            {/* 🔥 CHI NHÁNH */}
            <div>
              <div className={textUI.label}>
                Công ty / Chi nhánh
              </div>
              <div className={textUI.bodyStrong}>
                {shareholder.branch
                  ? `${shareholder.branch.name}${
                      shareholder.branch.branch_code
                        ? ` (${shareholder.branch.branch_code})`
                        : ""
                    }`
                  : "-"}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            <div>
              <div className={textUI.label}>Vốn cam kết</div>
              <div className={textUI.bodyStrong}>
                {formatMoney(
                  shareholder.capital_commitment
                )}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Đã góp</div>
              <div
                className={
                  isWarning
                    ? "text-red-500 font-semibold"
                    : textUI.bodyStrong
                }
              >
                {formatMoney(
                  shareholder.capital_contributed
                )}
              </div>
            </div>

            <div>
              <div className={textUI.label}>% sở hữu</div>
              <div className={textUI.bodyStrong}>
                {shareholder.ownership_percent || 0}%
              </div>
            </div>

            <div>
              <div className={textUI.label}>Trạng thái</div>
              <span
                className={
                  shareholder.status === "active"
                    ? badgeUI.success
                    : badgeUI.neutral
                }
              >
                {shareholder.status === "active"
                  ? "Hoạt động"
                  : "Ngưng"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CAPITAL HISTORY ================= */}
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <div className={cardUI.title}>
            Lịch sử góp vốn
          </div>
        </div>

        <div className={cardUI.body}>
          {capitalData.length === 0 ? (
            <div className="text-sm text-neutral-500">
              Chưa có giao dịch góp vốn
            </div>
          ) : (
            <TableContainer>
              <TableHead columns={columns} />

              <TableContainer.Body>
                {capitalData.map((item) => (
                  <TableRow key={item.id}>
 <TableCell>
  {item.money_tx_id ? (
    <Link
      href={`/finance/transactions/${item.money_tx_id}`}
      className="text-blue-600 hover:underline text-sm"
    >
      {formatDate(item.transaction_date)}
    </Link>
  ) : (
    <span className="text-neutral-400 text-sm">
      {formatDate(item.transaction_date)}
    </span>
  )}
</TableCell>

  <TableCell>
    {item.transaction_type === "contribute"
      ? "Góp vốn"
      : "Rút vốn"}
  </TableCell>

  {/* 👇 NEW COLUMN */}
  <TableCell>
    {item.account?.account_name || "-"}
  </TableCell>

  <TableCell align="right">
    {formatMoney(item.amount)}
  </TableCell>

  <TableCell>
    {item.note || "-"}
  </TableCell>
</TableRow>
                ))}
              </TableContainer.Body>
            </TableContainer>
          )}
        </div>
      </div>
    </div>
  );
}