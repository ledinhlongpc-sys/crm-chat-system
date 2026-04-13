"use client";

import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";

import ProductThumb from "@/components/app/image/ProductThumb";

import { textUI, tableUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  order: any;
  items: any[];
  payments?: any[];
  costs?: any[];
};

/* ================= HELPERS ================= */

function formatMoney(n: number) {
  return (n ?? 0).toLocaleString("vi-VN");
}

/* ================= COMPONENT ================= */

export default function PurchaseOrderExpand({
  order,
  items,
  payments,
  costs,
}: Props) {
  const subtotal = order?.subtotal_amount ?? 0;
  const discount = order?.discount_amount ?? 0;
  const extraCost = order?.extra_cost_amount ?? 0;
  const total = order?.total_amount ?? 0;

  return (
    <div className="space-y-4">

      {/* ================= BOX THÔNG TIN ================= */}

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT */}
        <div className="col-span-9 bg-white border border-neutral-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-6 text-sm">

            <div>
              <div className="text-neutral-500">Nhà cung cấp</div>
              <div className="font-medium">
                {order?.supplier?.supplier_name ?? "—"}
              </div>
            </div>

            <div>
              <div className="text-neutral-500">Chi nhánh</div>
              <div className="font-medium">
                {order?.branch?.name ?? "—"}
              </div>
            </div>

            <div>
              <div className="text-neutral-500">Nhân viên tạo</div>
              <div className="font-medium">
                {order?.creator?.full_name ?? "—"}
              </div>
            </div>

            <div>
              <div className="text-neutral-500">Ngày tạo</div>
              <div className="font-medium">
                {order?.created_at
                  ? new Date(order.created_at).toLocaleString("vi-VN")
                  : "—"}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT BUTTON BOX */}
        <div className="col-span-3 bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
          <button className="w-full h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
            In đơn
          </button>

          <button className="w-full h-10 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition">
            Chi tiết
          </button>

          <button className="w-full h-10 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition">
            Sửa đơn
          </button>
        </div>
      </div>

      {/* ================= BOX ITEM TABLE ================= */}

      <div className="bg-white border border-neutral-200 rounded-lg p-4">

        <TableContainer>
          <TableHead
            columns={[
              { key: "stt", label: "STT", width: "60px", align: "center" },
              { key: "image", label: "Ảnh", width: "80px", align: "center" },
              { key: "sku", label: "Mã SKU", width: "160px" },
              { key: "name", label: "Tên sản phẩm" },
              { key: "qty", label: "Số lượng", width: "120px", align: "center" },
              { key: "price", label: "Giá nhập", width: "150px", align: "right" },
              { key: "discount", label: "Chiết khấu", width: "120px", align: "right" },
              { key: "total", label: "Thành tiền", width: "160px", align: "right" },
            ]}
          />

          <tbody className={textUI.body}>
            {items.map((item, index) => {
              const variant = item.variant;

              return (
                <TableRow key={item.id}>

                  <TableCell align="center">
                    {index + 1}
                  </TableCell>

                  <TableCell align="center">
                    <ProductThumb
                      src={variant?.image_url}
                      alt={variant?.variant_name}
                      size="md"
                    />
                  </TableCell>

                  <TableCell>
                    {variant?.sku ?? "—"}
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">
                      {variant?.variant_name ?? "—"}
                    </div>
                  </TableCell>

                  <TableCell align="center">
                    {item.quantity}
                  </TableCell>

                  <TableCell align="right">
                    {formatMoney(item.cost_price)}
                  </TableCell>

                  <TableCell align="right">
                    {formatMoney(item.discount_amount)}
                  </TableCell>

                  <TableCell align="right" className="font-medium">
                    {formatMoney(item.line_total)}
                  </TableCell>

                </TableRow>
              );
            })}
          </tbody>
        </TableContainer>

        {/* ================= SUMMARY ================= */}

        <div className="flex justify-end mt-4">
          <div className="w-[360px] space-y-2 text-sm">

            <SummaryRow label="Tạm tính" value={subtotal} />
            <SummaryRow label="Giảm giá" value={-discount} />
            <SummaryRow label="Chi phí khác" value={extraCost} />

            <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
              <span>Tổng cộng</span>
              <span>{formatMoney(total)} đ</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= SUMMARY ROW ================= */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-600">{label}</span>
      <span>{value < 0 ? "-" : ""}{Math.abs(value).toLocaleString("vi-VN")} đ</span>
    </div>
  );
}