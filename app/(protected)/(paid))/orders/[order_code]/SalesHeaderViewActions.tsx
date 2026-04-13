"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import SecondaryButton from "@/components/app/button/SecondaryButton";
import DangerButton from "@/components/app/button/DangerButton";
import PrimaryButton from "@/components/app/button/PrimaryButton";

type Props = {
  orderId: string;
  orderCode: string;
  orderStatus:
    | "draft"
    | "processing"
    | "shipping"
    | "completed"
    | "cancelled";

  fulfillmentStatus?: string;

  deliveryMethod?: string | null;
  deliveredAt?: string | null;

  onApprove?: () => Promise<void>;
  onPickup?: () => Promise<void>;
  onCreateCarrier?: () => Promise<void>;
  onStockout?: () => Promise<void>;
  onCancel?: () => Promise<void>;
};

export default function SalesHeaderViewActions({
  orderId,
  orderCode,
  orderStatus,
  fulfillmentStatus, 
  deliveryMethod,
  deliveredAt,
  onApprove,
  onPickup,
  onCreateCarrier,
  onStockout,
  onCancel,
}: Props) {
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
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
        order_id: orderId,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error || "Không thể sao chép đơn");
    }

    router.push(`/orders/${json.order_code}/edit`);
  } catch (err: any) {
    alert(err?.message || "Không thể sao chép đơn");
  } finally {
    setLoadingCopy(false);
  }
};


  const run = async (fn?: () => Promise<void>) => {
    if (!fn || loading) return;

    try {
      setLoading(true);
      await fn();
    } finally {
      setLoading(false);
    }
  };

  const locked =
    orderStatus === "completed" ||
    orderStatus === "cancelled";

  /* ================= CHECK EDIT ================= */

  const canEdit =
    fulfillmentStatus === "unfulfilled" ||
    fulfillmentStatus === "preparing";

  let actions: React.ReactNode = null;

  /* ================= DRAFT ================= */

  if (orderStatus === "draft") {
    actions = (
      <div className="flex items-center gap-2">
        <DangerButton
          loading={loading}
          disabled={loading}
          onClick={() => run(onCancel)}
        >
          Hủy đơn hàng
        </DangerButton>

        <PrimaryButton
          loading={loading}
          disabled={loading}
          onClick={() => run(onApprove)}
        >
          Duyệt đơn hàng
        </PrimaryButton>
      </div>
    );
  }

  /* ================= PROCESSING CHƯA CHỌN SHIPPING ================= */

  if (orderStatus === "processing" && !deliveryMethod) {
    actions = (
      <div className="relative">
        <PrimaryButton
          loading={loading}
          disabled={loading}
          onClick={() => setOpenMenu(!openMenu)}
          className="flex items-center gap-2"
        >
          Tạo đơn giao hàng
          <ChevronDown className="w-4 h-4" />
        </PrimaryButton>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-md shadow-md z-20">
            <button
              disabled={loading}
              onClick={() => {
                setOpenMenu(false);
                run(onCreateCarrier);
              }}
              className="w-full text-left px-4 py-2 hover:bg-neutral-100 text-sm"
            >
              🚚 Đẩy qua hãng vận chuyển
            </button>

            <button
              disabled={loading}
              onClick={() => {
                setOpenMenu(false);
                run(onPickup);
              }}
              className="w-full text-left px-4 py-2 hover:bg-neutral-100 text-sm"
            >
              🏪 Nhận tại cửa hàng
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ================= PROCESSING CHƯA XUẤT KHO ================= */

  if (
    orderStatus === "processing" &&
    deliveryMethod &&
    !deliveredAt
  ) {
    actions = (
      <div className="flex items-center gap-2">
        <DangerButton
          loading={loading}
          disabled={loading}
          onClick={() => run(onCancel)}
        >
          Hủy đơn hàng
        </DangerButton>

        <PrimaryButton
          loading={loading}
          disabled={loading}
          onClick={() => run(onStockout)}
        >
          Xuất kho
        </PrimaryButton>
      </div>
    );
  }

  /* ================= COMPLETED / CANCELLED ================= */

  if (locked) {
    actions = null;
  }

  /* ================= RENDER ================= */
return (
  <div className="flex items-center gap-2">

    <SecondaryButton onClick={() => window.print()}>
      In Đơn Hàng
    </SecondaryButton>
    {/* 🔥 SAO CHÉP */}
        <PrimaryButton
          loading={loadingCopy}
          disabled={loading || loadingCopy}
          onClick={handleDuplicate}
        >
          Sao chép
        </PrimaryButton>
    {canEdit && (
      <>
        
        {/* 🔥 SỬA ĐƠN */}
        <PrimaryButton
          loading={loadingEdit}
          disabled={loading || loadingEdit || loadingCopy}
          onClick={() => {
            if (loadingEdit) return;

            setLoadingEdit(true);
            router.push(`/orders/${orderCode}/edit`);
          }}
        >
          Sửa Đơn Hàng
        </PrimaryButton>
      </>
    )}

    {/* 🔥 HỦY ĐƠN */}
    {orderStatus !== "cancelled" &&
      orderStatus !== "draft" && (
        <DangerButton
          loading={loading}
          disabled={loading}
          onClick={() => run(onCancel)}
        >
          Hủy Đơn Hàng
        </DangerButton>
      )}

    {actions}
  </div>
);
}