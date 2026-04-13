"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";

import SalesPaymentModal from "./boxes/SalesPaymentModal";
import SalesHeaderViewActions from "./SalesHeaderViewActions";

import CustomerViewBox from "./boxes/CustomerViewBox";
import SalesInfoViewBox from "./boxes/SalesInfoViewBox";
import SalesItemsViewBox from "./boxes/SalesItemsViewBox";
import SalesPaymentStatusBox from "./boxes/SalesPaymentStatusBox";
import SalesShippingStatusBox from "./boxes/SalesShippingStatusBox";

import TransferQRModal from "@/components/app/payment/TransferQRModal";

import type { Branch, Staff } from "./boxes/SalesInfoViewBox";
import type { SalesItem, SummaryView } from "./boxes/SalesItemsViewBox";
import SalesInvoiceStatusBox from "./boxes/SalesInvoiceStatusBox";
import InvoiceCreateModal from "./boxes/InvoiceCreateModal";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import DangerButton from "@/components/app/button/DangerButton";





/* ================= TYPES ================= */

type Customer = {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  current_debt?: number;
};

type Shipment = {
  delivery_method?: string | null;
  printed_at?: string | null;
  picking_at?: string | null;
  packed_at?: string | null;
  handover_at?: string | null;
  delivered_at?: string | null;
  returned_at?: string | null;
};
type OrderSource = {
  id: string;
  source_code: string;
  source_name: string;
};
type Order = {
  id: string;
  order_code: string;
  
   fulfillment_status?: string;
  
order_status:
  | "draft"
  | "processing"
  | "completed"
  | "cancelled";
  
  branch_id: string;
  created_by: string;

  sale_date: string | null;
  expected_delivery_at: string | null;

  order_source: string | null;

  note?: string | null;

  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;

  payment_status: "unpaid" | "partial" | "paid";
  
  created_at: string | null;   
  cancelled_at: string | null; 
  
  updated_at: string | null;

  customer?: Customer | null;
  
  einvoice_batch_id?: string | null;

einvoice?: {
  id?: string;
  invoice_number?: string | null;
  invoice_date?: string | null;
  total_amount?: number | null;
} | null;

};

type Props = {
  order: Order;
  shipment?: Shipment | null;

  items: SalesItem[];

  summary: SummaryView;

  branches: Branch[];
  staffs: Staff[];
  orderSources: OrderSource[];
};

/* ================= COMPONENT ================= */

export default function SalesOrderViewClient({
  order,
  shipment,
  items,
  summary,
  branches,
  staffs,
  orderSources,
}: Props) {

  const [openPay, setOpenPay] = useState(false);
  const [openTransferQR, setOpenTransferQR] = useState(false);

  const branch = branches.find((b) => b.id === order.branch_id);
  const staff = staffs.find((s) => s.id === order.created_by);
  const router = useRouter();
  const [openInvoice, setOpenInvoice] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  /* ================= PAYMENT ================= */

  const handlePayment = async (data: {
    method: string;
    amount: number;
    paid_at: string;
    reference?: string;
  }) => {

    const res = await fetch("/api/sales/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: order.id,
        ...data,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error || "Thanh toán thất bại");
    }

    router.refresh();
  };

 /* ================= APPROVE ORDER ================= */

const handleApprove = async () => {
  try {
    const res = await fetch("/api/sales/processing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_code: order.order_code,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error || "Duyệt đơn thất bại");
    }

    router.refresh();
  } catch (err: any) {
    alert(err?.message || "Không thể duyệt đơn");
  }
};
/* ================= PICKUP ORDER ================= */

const handlePickup = async () => {
  try {

    const res = await fetch("/api/sales/create-pickup-shipment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_code: order.order_code,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error || "Không thể tạo đơn giao hàng");
    }

    router.refresh();

  } catch (err: any) {
    alert(err?.message || "Không thể tạo đơn giao hàng");
  }
};
/* ================= Xuất kho ================= */

const handleStockout = async () => {
  try {

    const res = await fetch("/api/sales/stockout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_code: order.order_code,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error || "Xuất kho thất bại");
    }

    router.refresh();

  } catch (err: any) {
    alert(err?.message || "Không thể xuất kho");
  }
};

/* ================= HỦY ĐƠN ================= */

const handleCancel = async () => {
  try {

    setCancelling(true);

    const res = await fetch("/api/sales/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_code: order.order_code,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error || "Hủy đơn thất bại");
    }

    // Đợi chút cho user thấy loading
    await new Promise((r) => setTimeout(r, 400));

    setConfirmCancel(false);

    router.refresh();

  } catch (err: any) {
    alert(err?.message || "Không thể hủy đơn");
  } finally {
    setCancelling(false);
  }
};
  /* ================= RENDER ================= */
return (
  <>
    <PageHeader
      title={`Đơn hàng ${order.order_code}`}
      left={<BackButton href="/orders" />}
      right={
        <SalesHeaderViewActions
		orderId={order.id}
  orderCode={order.order_code}

  orderStatus={order.order_status}
  fulfillmentStatus={order.fulfillment_status}
  deliveryMethod={shipment?.delivery_method ?? null}
  deliveredAt={shipment?.delivered_at ?? null}

  onApprove={handleApprove}
  onPickup={handlePickup}

  onCreateCarrier={async () => {
    console.log("carrier");
  }}

  onStockout={handleStockout}

  onCancel={async () => {
    setConfirmCancel(true);
  }}
/>
      }
    />
     

    <div className={pageUI.contentWideTable}>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

        {/* ROW 1 */}

        <div className="xl:col-span-8">
          <CustomerViewBox value={order?.customer ?? null} />
        </div>

        <div className="xl:col-span-4">
          <SalesInfoViewBox
            branches={branches}
            staffs={staffs}
            orderSources={orderSources}
            value={{
              branch_id: order.branch_id,
              created_by: order.created_by,
              sale_date: order.sale_date,
              expected_delivery_at: order.expected_delivery_at,
              order_source: order.order_source ?? "",
            }}
          />
        </div>

        {/* ROW 2 */}

        <div className="xl:col-span-8">
          <SalesPaymentStatusBox
		    orderStatus={order.order_status}
            paymentStatus={order.payment_status}
            paidAmount={summary.payments.reduce((s, p) => s + (p.amount || 0), 0)}
            grandTotal={summary.grandTotal}
            payments={summary.payments}
            onPay={() => setOpenPay(true)}
            onTransferQR={() => setOpenTransferQR(true)}
          />
        </div>

        <div className="xl:col-span-4">
          <SalesInvoiceStatusBox
		    orderStatus={order.order_status}
            einvoiceBatchId={order.einvoice_batch_id}
            invoice={order.einvoice}
            onCreateInvoice={() => setOpenInvoice(true)}
          />
        </div>

        {/* ROW 3 */}

        <div className="xl:col-span-8">
          <SalesShippingStatusBox
            orderStatus={order.order_status}
            deliveryMethod={shipment?.delivery_method ?? null}
            deliveredAt={shipment?.delivered_at ?? null}
			createdAt={order.created_at}
			cancelledAt={order.cancelled_at}
            onApprove={handleApprove}
            onCreateCarrier={() => console.log("đẩy qua hãng vận chuyển")}
            onPickup={handlePickup}
			onStockout={handleStockout}
			onCancelRequest={() => setConfirmCancel(true)}
          />
        </div>

        {/* ROW 4 */}

        <div className="xl:col-span-12">
          <SalesItemsViewBox items={items} summary={summary} />
        </div>

      </div>

      {/* PAYMENT MODAL */}

      <SalesPaymentModal
        open={openPay}
        onClose={() => setOpenPay(false)}
        onSubmit={handlePayment}
        defaultAmount={
  summary.grandTotal -
  summary.payments.reduce((s, p) => s + (p.amount || 0), 0)
}
      />

      {/* TRANSFER QR */}

      <TransferQRModal
        open={openTransferQR}
        onClose={() => setOpenTransferQR(false)}
        orderCode={order.order_code}
        amount={
  summary.grandTotal -
  summary.payments.reduce((s, p) => s + (p.amount || 0), 0)
}
        branchId={order.branch_id}
      />

      {/* INVOICE */}

      <InvoiceCreateModal
        open={openInvoice}
        onClose={() => setOpenInvoice(false)}
        orderIds={[order.id]}
		defaultAmount={summary.grandTotal}
        onCreated={() => router.refresh()}
      />
	 {confirmCancel && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

    <div className="bg-white rounded-lg shadow-lg p-6 w-[380px]">

      <div className="text-lg font-semibold mb-2">
        Xác nhận hủy đơn
      </div>

      <div className="text-sm text-neutral-600 mb-6">
        Bạn có chắc chắn muốn hủy đơn hàng này không?
      </div>

      <div className="flex justify-end gap-2">

        <SecondaryButton
  disabled={cancelling}
  onClick={() => setConfirmCancel(false)}
>
  Hủy bỏ
</SecondaryButton>

        <DangerButton
  loading={cancelling}
  onClick={handleCancel}
>
  Xác nhận hủy
</DangerButton>

      </div>

    </div>

  </div>
)}
    </div>
  </>
);
}