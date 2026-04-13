"use client";

type Props = {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md";
};

const VARIANT_MAP = {
  default: "bg-neutral-100 text-neutral-700 border-neutral-200",
  primary: "bg-blue-100 text-blue-700 border-blue-200",
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  danger: "bg-red-100 text-red-700 border-red-200",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
}: Props) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full border
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}
        ${VARIANT_MAP[variant]}
      `}
    >
      {children}
    </span>
  );
}
