"use client";

import { useState } from "react";

import { Settings } from "lucide-react";
import PrimaryButton from "@/components/app/button/PrimaryButton";

import ShipperConnectModal from "./ShipperConnectModal";
import ShipperSettingsModal from "./ShipperSettingsModal";

import { cardUI, textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Shipper = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

type Props = {
  shippers: Shipper[];
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
  internal: "/logos/internal.png",
};

/* ================= COMPONENT ================= */

export default function ShippersClient({ shippers }: Props) {

  const [openConnect, setOpenConnect] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const [carrier, setCarrier] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-6">

        {shippers.map((shipper) => {

          const logo = logoMap[shipper.code];

          return (

            <div
              key={shipper.id}
              className={`${cardUI.base} p-6`}
            >

              {/* ===== TOP ===== */}

              <div className="flex items-start justify-between mb-4">

                <div className="flex items-center gap-4">

                  {logo && (
                    <img
                      src={logo}
                      className="h-10 w-auto object-contain"
                    />
                  )}

                  <div>

                    <div className="font-semibold text-lg">
                      {shipper.name}
                    </div>

                    {shipper.is_active ? (
                      <span className="text-green-600 text-sm">
                        Đã kết nối
                      </span>
                    ) : (
                      <span className="text-red-500 text-sm">
                        Chưa kết nối
                      </span>
                    )}

                  </div>

                </div>

                {/* SETTINGS ICON */}

                {shipper.is_active && (
                  <button
                    onClick={() => {
                      setCarrier(shipper.code);
                      setOpenSettings(true);
                    }}
                  >
                    <Settings className="w-5 h-5 text-neutral-400" />
                  </button>
                )}

              </div>

              {/* ===== DESCRIPTION ===== */}

              <p className={`${textUI.body} mb-6`}>
                Kết nối trực tiếp với đơn vị vận chuyển để tạo vận đơn và theo dõi trạng thái giao hàng.
              </p>

              {/* ===== ACTION ===== */}

              {shipper.is_active ? (

                <PrimaryButton
                  onClick={() => {
                    setCarrier(shipper.code);
                    setOpenSettings(true);
                  }}
                >
                  Cài đặt
                </PrimaryButton>

              ) : (

                <PrimaryButton
                  onClick={() => {
                    setCarrier(shipper.code);
                    setOpenConnect(true);
                  }}
                >
                  Kết nối
                </PrimaryButton>

              )}

            </div>

          );

        })}

      </div>

      {/* ===== CONNECT MODAL ===== */}

      <ShipperConnectModal
        open={openConnect}
        carrier={carrier}
        onClose={() => setOpenConnect(false)}
        onConnected={() => {
          setOpenConnect(false);
          setOpenSettings(true);
        }}
      />

      {/* ===== SETTINGS MODAL ===== */}

      <ShipperSettingsModal
        open={openSettings}
        carrier={carrier}
        onClose={() => setOpenSettings(false)}
      />

    </>
  );
}