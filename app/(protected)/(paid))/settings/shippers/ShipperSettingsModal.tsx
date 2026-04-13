"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  carrier: string | null;
  onClose: () => void;
};

/* ================= LOGO MAP ================= */

const logoMap: Record<string, string> = {
  ghn: "/logos/ghn.png",
  ghtk: "/logos/ghtk.png",
  viettel: "/logos/viettel.png",
  jt: "/logos/jt.png",
  best: "/logos/best.png",
  spx: "/logos/spx.png",
  vnpost: "/logos/vnpost.png",
  grab: "/logos/grab.png",
  ahamove: "/logos/ahamove.png",
};

/* ================= COMPONENT ================= */

export default function ShipperSettingsModal({
  open,
  carrier,
  onClose,
}: Props) {

  const [loading, setLoading] = useState(false);

  const [payerType, setPayerType] = useState<"shop" | "customer">("shop");

  const [pickupType, setPickupType] = useState<
    "warehouse" | "post_office"
  >("warehouse");

  const [insurance, setInsurance] = useState(false);
  const [partialDelivery, setPartialDelivery] = useState(false);
  const [mergePackage, setMergePackage] = useState(false);
  const [codFailedCollect, setCodFailedCollect] = useState(false);

  const [isDefault, setIsDefault] = useState(true);
  
  const router = useRouter();

  if (!open || !carrier) return null;

  const logo = logoMap[carrier];

  /* ================= CONNECT ================= */

  async function handleSave() {

    setLoading(true);

    try {

      const res = await fetch("/api/shipper/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carrier,
          payer_type: payerType,
          pickup_type: pickupType,
          insurance_enabled: insurance,
          partial_delivery: partialDelivery,
          merge_package: mergePackage,
          cod_failed_collect: codFailedCollect,
          is_default: isDefault,
        }),
      });

      const data = await res.json();

if (!res.ok || !data.success) {
  alert(data?.error || "Lưu cài đặt thất bại");
  return;
}

      onClose();

      router.refresh();

    } catch {

      alert("Có lỗi xảy ra");

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="bg-white w-[720px] rounded-lg shadow-lg">

        {/* ===== HEADER ===== */}

        <div className="flex items-center justify-between px-6 py-4 border-b">

          <div className="font-semibold text-lg">
            Cài đặt vận chuyển
          </div>

          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* ===== BODY ===== */}

        <div className="p-6 space-y-6">

          {/* LOGO */}

          {logo && (
            <img
              src={logo}
              className="h-10 object-contain"
            />
          )}

          {/* ===== PAYER ===== */}

          <div>

            <div className="font-medium mb-2">
              Người trả phí
            </div>

            <div className="flex gap-6">

              <label className="flex items-center gap-2">

                <input
                  type="radio"
                  checked={payerType === "customer"}
                  onChange={() =>
                    setPayerType("customer")
                  }
                />

                Khách trả

              </label>

              <label className="flex items-center gap-2">

                <input
                  type="radio"
                  checked={payerType === "shop"}
                  onChange={() =>
                    setPayerType("shop")
                  }
                />

                Shop trả

              </label>

            </div>

          </div>

          {/* ===== PICKUP TYPE ===== */}

          <div>

            <div className="font-medium mb-2">
              Hình thức lấy hàng
            </div>

            <div className="flex gap-6">

              <label className="flex items-center gap-2">

                <input
                  type="radio"
                  checked={pickupType === "post_office"}
                  onChange={() =>
                    setPickupType("post_office")
                  }
                />

                Tại bưu cục

              </label>

              <label className="flex items-center gap-2">

                <input
                  type="radio"
                  checked={pickupType === "warehouse"}
                  onChange={() =>
                    setPickupType("warehouse")
                  }
                />

                Tại kho hàng

              </label>

            </div>

          </div>

          {/* ===== SERVICES ===== */}

          <div>

            <div className="font-medium mb-3">
              Dịch vụ cộng thêm
            </div>

            <div className="grid grid-cols-2 gap-3">

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={insurance}
                  onChange={(e) =>
                    setInsurance(e.target.checked)
                  }
                />

                Bảo hiểm hàng hóa

              </label>

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={partialDelivery}
                  onChange={(e) =>
                    setPartialDelivery(
                      e.target.checked
                    )
                  }
                />

                Giao hàng 1 phần

              </label>

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={mergePackage}
                  onChange={(e) =>
                    setMergePackage(
                      e.target.checked
                    )
                  }
                />

                Gộp kiện

              </label>

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={codFailedCollect}
                  onChange={(e) =>
                    setCodFailedCollect(
                      e.target.checked
                    )
                  }
                />

                Giao thất bại - thu tiền

              </label>

            </div>

          </div>

          {/* ===== DEFAULT ===== */}

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) =>
                setIsDefault(e.target.checked)
              }
            />

            Đặt làm đơn vị vận chuyển mặc định

          </label>

        </div>

        {/* ===== FOOTER ===== */}

        <div className="flex justify-end gap-3 px-6 py-4 border-t">

          <SecondaryButton onClick={onClose}>
            Thoát
          </SecondaryButton>

          <PrimaryButton
            loading={loading}
            onClick={handleSave}
          >
            Cập nhật
          </PrimaryButton>

        </div>

      </div>

    </div>

  );

}