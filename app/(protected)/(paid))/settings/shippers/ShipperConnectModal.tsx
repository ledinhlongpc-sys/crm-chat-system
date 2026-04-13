"use client";

import { X, Link } from "lucide-react";
import { useState } from "react";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  carrier: string | null;
  onClose: () => void;
  onConnected: () => void;
};

/* ================= CARRIER AUTH TYPE ================= */

const carrierAuthType: Record<
  string,
  "api" | "token" | "login" | "manual"
> = {
  ghn: "token",      // 🔥 GHN chỉ cần TOKEN
  ghtk: "api",
  viettel: "api",
  jt: "api",
  best: "login",
  spx: "api",
  vnpost: "api",
  grab: "api",
  ahamove: "api",
  internal: "manual",
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
  internal: "/logos/internal.png",
};

/* ================= COMPONENT ================= */

export default function ShipperConnectModal({
  open,
  carrier,
  onClose,
  onConnected,
}: Props) {

  const [loading, setLoading] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [shopId, setShopId] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!open || !carrier) return null;

  const type = carrierAuthType[carrier];
  const carrierLogo = logoMap[carrier];

  /* ================= CONNECT ================= */

  async function handleConnect() {

    setLoading(true);

    try {

      const res = await fetch("/api/shipper/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carrier,
          apiKey,
          shopId,
          username,
          password,
        }),
      });

     if (!res.ok) {
  alert("Kết nối thất bại");
  return;
}

onClose();
onConnected();

    } catch (err) {

      alert("Có lỗi xảy ra");

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="bg-white w-[720px] rounded-lg shadow-lg">

        {/* ================= HEADER ================= */}

        <div className="flex items-center justify-between px-6 py-4 border-b">

          <div className="font-semibold text-lg">
            Kết nối đối tác
          </div>

          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* ================= BODY ================= */}

        <div className="p-6">

          {/* ===== LOGO ===== */}

          <div className="flex items-center gap-6 mb-6">

            {carrierLogo && (
              <img
                src={carrierLogo}
                className="h-10 object-contain"
              />
            )}

            <Link className="w-6 h-6 text-neutral-400" />

            <img
              src="/logos/longthu.png"
              className="h-10 object-contain"
            />

          </div>

          {/* ===== DESCRIPTION ===== */}

          <p className="text-sm text-neutral-600 mb-2">
            LongThu CRM kết nối 2 chiều với đơn vị vận chuyển giúp:
          </p>

          <ul className="text-sm text-neutral-500 list-disc ml-4 mb-6 space-y-1">
            <li>Tự động tạo vận đơn</li>
            <li>Shipper đến lấy hàng không cần gọi</li>
            <li>Cập nhật trạng thái vận chuyển</li>
          </ul>

          {/* ================= FORM ================= */}

          {/* 🔥 GHN TOKEN */}

          {type === "token" && (
            <div className="mb-6">

              <label className="text-sm font-medium">
                Token API GHN
              </label>

              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Dán Token API từ GHN"
                className="w-full border rounded px-3 py-2 mt-1"
              />

            </div>
          )}

          {/* ===== API KEY + SHOP ID ===== */}

          {type === "api" && (
            <div className="grid grid-cols-2 gap-4 mb-6">

              <div>

                <label className="text-sm font-medium">
                  API Key
                </label>

                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Shop ID
                </label>

                <input
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                />

              </div>

            </div>
          )}

          {/* ===== LOGIN TYPE ===== */}

          {type === "login" && (
            <div className="grid grid-cols-2 gap-4 mb-6">

              <div>

                <label className="text-sm font-medium">
                  Tên đăng nhập
                </label>

                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Mật khẩu
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                />

              </div>

            </div>
          )}

          {/* ===== MANUAL ===== */}

          {type === "manual" && (
            <div className="text-sm text-neutral-500 mb-6">
              Đơn vị giao hàng nội bộ. Không cần kết nối API.
            </div>
          )}

          {/* ================= ACTION ================= */}

          <div className="flex justify-end gap-3">

            <SecondaryButton onClick={onClose}>
    Thoát
  </SecondaryButton>

            {type !== "manual" && (
              <PrimaryButton
                loading={loading}
                onClick={handleConnect}
              >
                Kết nối
              </PrimaryButton>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}