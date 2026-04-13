"use client";

import { CheckCircle, Circle, XCircle, AlertCircle } from "lucide-react";

type Props = {
  status: "success" | "pending" | "error" | "warning";
  title: string;
};

export default function StatusTitle({ status, title }: Props) {
  let icon = null;
  let color = "";

  switch (status) {
    case "success":
      icon = <CheckCircle className="w-5 h-5 text-green-600" />;
      color = "text-green-600 font-medium";
      break;

    case "pending":
      icon = <Circle className="w-5 h-5 text-neutral-400" />;
      break;

    case "warning":
      icon = <AlertCircle className="w-5 h-5 text-amber-500" />;
      color = "text-amber-600 font-medium";
      break;

    case "error":
      icon = <XCircle className="w-5 h-5 text-red-600" />;
      color = "text-red-600 font-medium";
      break;
  }

  return (
    <div className="flex items-center gap-2 h-6">
      {icon}
      <span className={color}>{title}</span>
    </div>
  );
}