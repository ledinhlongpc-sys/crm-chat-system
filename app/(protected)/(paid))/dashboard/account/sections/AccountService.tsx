"use client";

import {
  cardUI,
  buttonUI,
  textUI,
} from "@/ui-tokens";

/* =========================
   TYPES
========================= */
type Props = {
  user: {
    service_status: string;
    service_start: string | null;
    service_end: string | null;
  };
};

/* =========================
   HELPERS
========================= */
function getServiceLabel(status: string) {
  switch (status) {
    case "active":
      return "Đang hoạt động";
    case "trial":
      return "Dùng thử";
    case "expired":
      return "Hết hạn";
    default:
      return status;
  }
}

/* =========================
   COMPONENT
========================= */
export default function AccountService({ user }: Props) {
  const { service_status, service_start, service_end } =
    user;

  const hasEndDate = Boolean(service_end);

  const daysLeft = hasEndDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(service_end!).getTime() -
            Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const endDateText = hasEndDate
    ? new Date(service_end!).toLocaleDateString(
        "vi-VN"
      )
    : "Không giới hạn";

  const isExpiringSoon =
    typeof daysLeft === "number" &&
    daysLeft <= 3;

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className={cardUI.header}>
        <h3 className={cardUI.title}>
          Gói dịch vụ
        </h3>
        <p className={cardUI.description}>
          Thông tin sử dụng dịch vụ hiện tại
        </p>
      </div>

      {/* ===== BODY ===== */}
      <div className={`${cardUI.body} space-y-3`}>
        <ServiceRow label="Trạng thái">
          <span className="font-semibold text-blue-600">
            {getServiceLabel(service_status)}
          </span>
        </ServiceRow>

        <ServiceRow label="Ngày bắt đầu">
          <span className="font-medium">
            {service_start
              ? new Date(
                  service_start
                ).toLocaleDateString("vi-VN")
              : "—"}
          </span>
        </ServiceRow>

        <ServiceRow label="Ngày hết hạn">
          <span className="font-medium">
            {endDateText}
          </span>
        </ServiceRow>

        {daysLeft !== null && (
          <ServiceRow label="Số ngày còn lại">
            <span
              className={`font-semibold ${
                isExpiringSoon
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {daysLeft} ngày
            </span>
          </ServiceRow>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <div className={cardUI.footer}>
        <button
          disabled
          className={`${buttonUI.primary} opacity-60 cursor-not-allowed`}
        >
          Gia hạn (sắp có)
        </button>
      </div>
    </>
  );
}

/* =========================
   ROW ITEM
========================= */
function ServiceRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-neutral-50 px-4 py-3 text-sm">
      <span className="text-neutral-600">
        {label}
      </span>
      <span>{children}</span>
    </div>
  );
}
