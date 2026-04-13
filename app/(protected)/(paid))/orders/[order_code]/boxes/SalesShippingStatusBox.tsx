"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import FormBox from "@/components/app/form/FormBox";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import StatusTitle from "@/components/app/status/StatusTitle";
import DangerButton from "@/components/app/button/DangerButton";

import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type OrderStatus =
  | "draft"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled"
  | "returning"
  | "returned";

type Props = {
  orderStatus: OrderStatus;
  deliveryMethod?: string | null;
  deliveredAt?: string | null;
  
  createdAt?: string | null;
  cancelledAt?: string | null;

  onApprove?: () => Promise<void> | void;
  onCreateCarrier?: () => void;
  onPickup?: () => void;
  onStockout?: () => Promise<void> | void;
  onCancelRequest?: () => void;
};

/* ================= UTIL ================= */

function formatDate(date?: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDeliveryMethodLabel(method?: string | null) {
  switch (method) {
    case "pickup":
      return "Nhận tại cửa hàng";

    case "carrier":
      return "Đơn vị vận chuyển";

    case "internal":
      return "Ship nội bộ";

    case "dropoff":
      return "Nhân viên giao";

    default:
      return "-";
  }
}

/* ================= COMPONENT ================= */

export default function SalesShippingStatusBox({
  orderStatus,
  deliveryMethod,
  deliveredAt,
  createdAt,
  cancelledAt,
  onApprove,
  onCreateCarrier,
  onPickup,
  onStockout,
  onCancelRequest,
}: Props) {
  const [openMenu, setOpenMenu] = useState(false);
  const [approving, setApproving] = useState(false);
  const [stockouting, setStockouting] = useState(false);
  
  const [creating, setCreating] = useState(false);

  const [testingJT, setTestingJT] = useState(false);

  const handleApprove = async () => {
    if (!onApprove) return;

    try {
      setApproving(true);
      await onApprove();
    } finally {
      setApproving(false);
    }
  };
  
  const handleTestJT = async () => {
  try {
    setTestingJT(true);

    const res = await fetch("/api/shipper/jt/test", {
      method: "POST",
    });

    const data = await res.json();

    console.log("JT TEST RESULT:", data);

    alert("Đã test J&T, xem console để xem kết quả");

  } catch (err) {
    console.error(err);
    alert("Test J&T lỗi");
  } finally {
    setTestingJT(false);
  }
};
  
  const handleStockout = async () => {
  if (!onStockout) return;

  try {
    setStockouting(true);
    await onStockout();
  } finally {
    setStockouting(false);
  }
};

  let title = "Đóng gói và giao hàng";
  let description: any = "";
  let actions: any = null;
  let status: "success" | "pending" | "error" | "warning" = "pending";

  /* ================= DRAFT ================= */

  if (orderStatus === "draft") {
    title = "Đơn hàng nháp chờ duyệt";
    description = "Đơn hàng chưa được duyệt";

    actions = (
  <div className="flex items-center gap-2">

    <DangerButton
     onClick={() => onCancelRequest?.()}
    >
      Hủy đơn hàng
    </DangerButton>

    <PrimaryButton
      onClick={handleApprove}
      loading={approving}
    >
      Duyệt đơn hàng
    </PrimaryButton>

  </div>
);
  }

  /* ================= PROCESSING ================= */

  if (orderStatus === "processing") {

    /* ===== CHƯA CHỌN PHƯƠNG THỨC ===== */
if (!deliveryMethod) {
  
  description = "Chưa có thông tin đóng gói và giao hàng";

  actions = (
    <div className="flex items-center gap-2">

      <DangerButton
        onClick={() => onCancelRequest?.()}
      >
        Hủy đơn hàng
      </DangerButton>

      <div className="relative">

        <PrimaryButton
  disabled={creating}
  onClick={() => setOpenMenu(!openMenu)}
  className="flex items-center gap-2"
>
  {creating ? "Đang tạo..." : "Tạo đơn giao hàng"}
  <ChevronDown className="w-4 h-4" />
</PrimaryButton>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-md shadow-md z-20">

            <button
  disabled={creating}
  onClick={async () => {
    try {
      setCreating(true);
      setOpenMenu(false);
      await onCreateCarrier?.();
    } finally {
      setCreating(false);
    }
  }}
  className="w-full text-left px-4 py-2 hover:bg-neutral-100 text-sm"
>
  Đẩy qua hãng vận chuyển
</button>

<button
  disabled={testingJT}
  onClick={async () => {
    setOpenMenu(false);
    await handleTestJT();
  }}
  className="w-full text-left px-4 py-2 hover:bg-neutral-100 text-sm"
>
  Test kết nối J&T
</button>


            <button
  disabled={creating}
  onClick={async () => {
    try {
      setCreating(true);
      setOpenMenu(false);
      await onPickup?.();
    } finally {
      setCreating(false);
    }
  }}
  className="w-full text-left px-4 py-2 hover:bg-neutral-100 text-sm"
>
  Nhận tại cửa hàng
</button>

          </div>
        )}

      </div>

    </div>
  );
}

    /* ===== ĐÃ CHỌN PHƯƠNG THỨC - CHƯA XUẤT KHO ===== */

    if (deliveryMethod && !deliveredAt) {
	title = "Đơn hàng chờ xuất kho";
      description = (
  <div className="space-y-2">

    <div className="flex items-center">
      <div className="w-[220px] text-neutral-600 flex items-center gap-2">
        📦 Phương thức giao hàng
      </div>

      <div className="font-medium text-neutral-800">
        :  {getDeliveryMethodLabel(deliveryMethod)}
      </div>
    </div>

    <div className="flex items-center">
      <div className="w-[220px] text-neutral-600 flex items-center gap-2">
        🧾 Trạng thái
      </div>

      <div className="font-medium text-amber-600">
        :  Chưa xuất kho
      </div>
    </div>

  </div>
);
      actions = (
  <div className="flex items-center gap-2">

    <DangerButton

      onClick={() => onCancelRequest?.()}
    >
      Hủy đơn hàng
    </DangerButton>

    <PrimaryButton
      onClick={handleStockout}
      loading={stockouting}
    >
      Xuất kho
    </PrimaryButton>

  </div>
);
    }

    /* ===== ĐÃ XUẤT KHO ===== */

    if (deliveryMethod && deliveredAt) {

      description = (
        <div className="space-y-1">

          <div>
            📦 <span className="text-neutral-600">Phương thức giao hàng</span>{" "}
            <span className="font-medium text-neutral-800">
              :  {getDeliveryMethodLabel(deliveryMethod)}
            </span>
          </div>

          <div>
            🕒 <span className="text-neutral-600">Đã xuất kho lúc</span>{" "}
            <span className="font-medium text-neutral-800">
              :  {formatDate(deliveredAt)}
            </span>
          </div>

        </div>
      );
    }
  }

  /* ================= SHIPPING ================= */

  if (orderStatus === "shipping") {
    description = "Đơn hàng đang được giao";
  }

  /* ================= COMPLETED ================= */

  if (orderStatus === "completed") {

    status = "success";
    title = "Đã giao hàng thành công";

    description = (
  <div className="space-y-2">

    <div className="flex items-center">
      <div className="w-[220px] text-neutral-600 flex items-center gap-2">
        🚚 Phương thức giao hàng
      </div>

      <div className="font-medium text-neutral-800">
        :  {getDeliveryMethodLabel(deliveryMethod)}
      </div>
    </div>

    <div className="flex items-center">
      <div className="w-[220px] text-neutral-600 flex items-center gap-2">
        🕒 Thời điểm giao hàng
      </div>

      <div className="font-medium text-neutral-800">
        :  {formatDate(deliveredAt)}
      </div>
    </div>

  </div>
);

  actions = (
    <DangerButton
      onClick={() => onCancelRequest?.()}
    >
      Hủy đơn hàng
    </DangerButton>
  );
  }

  /* ================= CANCELLED ================= */

  if (orderStatus === "cancelled") {

  status = "error";
  title = "Đơn hàng đã bị hủy";

  description = (
  <div className="space-y-2">

    <div className="flex items-center">
      <div className="w-[200px] text-neutral-600 flex items-center gap-2">
        🧾 Thời điểm tạo đơn
      </div>

      <div className="font-medium text-neutral-800">
        :  {formatDate(createdAt)}
      </div>
    </div>

    <div className="flex items-center">
      <div className="w-[200px] text-neutral-600 flex items-center gap-2">
        ❌ Thời điểm hủy đơn
      </div>

      <div className="font-medium text-neutral-800">
        :  {formatDate(cancelledAt)}
      </div>
    </div>

  </div>
);
}

  /* ================= RETURNING ================= */

  if (orderStatus === "returning") {
    status = "warning";
    description = "Đơn hàng đang được hoàn";
  }

  /* ================= RETURNED ================= */

  if (orderStatus === "returned") {
    status = "success";
    description = "Đơn hàng đã hoàn thành việc hoàn trả";
  }

  return (

    <FormBox
      title={
        <StatusTitle
          status={status}
          title={title}
        />
      }
      actions={actions}
    >

      <div className={`${textUI.cardTitle} text-neutral-500`}>
        {description}
      </div>

    </FormBox>

  );
}