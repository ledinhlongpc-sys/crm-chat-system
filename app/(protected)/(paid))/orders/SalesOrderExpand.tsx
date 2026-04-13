"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";

import ProductThumb from "@/components/app/image/ProductThumb";

import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  order: any;
  items: any[];
  payments?: any[];
};

/* ================= HELPERS ================= */

function formatMoney(n: number) {
  return (n ?? 0).toLocaleString("vi-VN");
}

function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleString("vi-VN");
}

/* ================= COMPONENT ================= */

export default function SalesOrderExpand({
  order,
  items,
  payments,
}: Props) {

  const subtotal =
    items?.reduce(
      (sum, item) => sum + (item.line_total || 0),
      0
    ) ?? 0;

  const discount = order?.discount_amount ?? 0;
  const costs = order?.costs ?? [];
  const total = order?.total_amount ?? 0;

  const displayOrderCode =
    order?.external_order_id?.trim() || order?.order_code;
	
  const router = useRouter();
  const [loadingDetail, setLoadingDetail] = useState(false);
const [loadingCopy, setLoadingCopy] = useState(false);

const handleDuplicate = async () => {
  if (loadingCopy) return;

  try {
    setLoadingCopy(true);

    const res = await fetch("/api/sales/duplicate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: order.id,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error || "Không thể sao chép");
    }

    router.push(`/orders/${json.order_code}/edit`);
  } catch (err: any) {
    alert(err?.message || "Không thể sao chép đơn");
  } finally {
    setLoadingCopy(false);
  }
};


  return (
    <div className="space-y-4">

      {/* ================= BOX THÔNG TIN ================= */}

      <div className="grid grid-cols-10 gap-4">

        {/* LEFT */}

        <div className="col-span-9 bg-white border border-neutral-200 rounded-lg p-4">

<div className="grid grid-cols-3 gap-6 text-sm">

  {/* ================= CỘT 1: ĐƠN HÀNG ================= */}
  <div className="grid grid-cols-[140px_1fr] gap-y-2">

    <div className="text-neutral-500">Mã Vận Đơn</div>
    <div className="font-medium">
      {order?.external_order_id?.trim() || order?.order_code}
    </div>

    <div className="text-neutral-500">Ngày Bán</div>
    <div className="font-medium">
      {order?.sale_date
        ? new Date(order.sale_date).toLocaleString("vi-VN")
        : "—"}
    </div>

    <div className="text-neutral-500">Nguồn bán hàng</div>
    <div className="font-medium">
      {order?.external_platform || order?.order_source_name || order?.order_source || "—"}
    </div>

    <div className="text-neutral-500">Nhân viên bán</div>
    <div className="font-medium">
      {order?.creator?.full_name || "—"}
    </div>

  </div>

  {/* ================= CỘT 2: KHÁCH HÀNG ================= */}
  <div className="grid grid-cols-[120px_1fr] gap-y-2">

    <div className="text-neutral-500">Khách Hàng</div>
    <div className="font-medium">
      {order?.customer?.name || "—"}
    </div>

    <div className="text-neutral-500">Điện Thoại</div>
    <div className="font-medium">
      {order?.customer?.phone || "—"}
    </div>

    {/* ĐỊA CHỈ FULL */}
  
    <div className="font-medium col-span-2 leading-relaxed">
     {order?.address_snapshot || "—"}
    </div>

  </div>

  {/* ================= CỘT 3: GHI CHÚ ================= */}
  <div className="space-y-2">

    <div className="text-neutral-500">Ghi chú đơn hàng</div>
    <div className="font-medium">
      {order?.note || "Đơn hàng chưa có ghi chú"}
    </div>

  </div>

</div>




        </div>

        {/* RIGHT BUTTON BOX */}
<div className="col-span-1 space-y-2">

  {/* 🔥 CHI TIẾT */}
  <SecondaryButton
    className="w-full"
    disabled={loadingDetail || loadingCopy}
    onClick={() => {
      if (loadingDetail) return;

      setLoadingDetail(true);
      router.push(`/orders/${order.order_code}`);
    }}
  >
    {loadingDetail ? "Đang mở..." : "Chi tiết"}
  </SecondaryButton>

  {/* 🔥 SAO CHÉP */}
  <SecondaryButton
    className="w-full"
    disabled={loadingCopy || loadingDetail}
    onClick={handleDuplicate}
  >
    {loadingCopy ? "Đang sao chép..." : "Sao chép"}
  </SecondaryButton>

</div>

      </div>

      {/* ================= BOX ITEM TABLE ================= */}

      <div className="bg-white border border-neutral-200 rounded-lg p-4">

        <TableContainer>

          <TableHead
            columns={[
              { key: "stt", label: "STT", width: "60px", align: "center" },
              { key: "image", label: "Ảnh", width: "80px", align: "center" },
              { key: "sku", label: "SKU", width: "160px" },
              { key: "name", label: "Tên sản phẩm" },
              { key: "qty", label: "Số lượng", width: "120px", align: "center" },
              { key: "price", label: "Đơn giá", width: "150px", align: "right" },
              { key: "discount", label: "Chiết khấu", width: "120px", align: "right" },
              { key: "total", label: "Thành tiền", width: "160px", align: "right" },
            ]}
          />

          <tbody className={textUI.body}>

            {items.map((item, index) => (
              <TableRow key={item.id}>

                <TableCell align="center">{index + 1}</TableCell>

                <TableCell align="center">
                  <ProductThumb
                    src={item.image}
                    alt={item.variant_name}
                    size="md"
                  />
                </TableCell>

                <TableCell>{item.sku || "—"}</TableCell>

                <TableCell>
                  <div className="font-medium">
                    {item.variant_name || "—"}
                  </div>
                </TableCell>

                <TableCell align="center">
                  {item.quantity}
                </TableCell>

                <TableCell align="right">
                  {formatMoney(item.price)}
                </TableCell>

                <TableCell align="right">
                  {formatMoney(item.discount_amount)}
                </TableCell>

                <TableCell align="right" className="font-medium">
                  {formatMoney(item.line_total)}
                </TableCell>

              </TableRow>
            ))}

          </tbody>

        </TableContainer>

        {/* ================= SUMMARY ================= */}

        <div className="flex justify-end mt-4">

          <div className="w-[360px] space-y-2 text-sm">

            <SummaryRow label="Tạm tính" value={subtotal} />
            <SummaryRow label="Giảm giá" value={-discount} />

            {costs.map((c: any, i: number) => (
              <SummaryRow
                key={i}
                label={c.reason || "Chi phí"}
                value={c.amount}
              />
            ))}

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
      <span>
        {value < 0 ? "-" : ""}
        {Math.abs(value).toLocaleString("vi-VN")} đ
      </span>
    </div>
  );
}