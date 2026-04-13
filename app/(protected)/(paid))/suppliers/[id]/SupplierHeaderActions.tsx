"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Switch from "@/components/app/input/Switch";
import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";

type Props = {
  supplierId: string;
  status: "active" | "inactive";
};

export default function SupplierHeaderActions({
  supplierId,
  status,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(status === "active");

  async function toggleStatus(next: boolean) {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/suppliers/${supplierId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: next ? "active" : "inactive",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);

      setActive(next);
      toast.success(
        next
          ? "Đã kích hoạt nhà cung cấp"
          : "Đã ngưng hoạt động nhà cung cấp"
      );

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Cập nhật trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600">
          Hoạt động
        </span>
        <Switch
          checked={active}
          onChange={toggleStatus}
          disabled={loading}
        />
      </div>

      <PrimaryLinkButton
        href={`/suppliers/${supplierId}/edit`}
      >
        Chỉnh Sửa
      </PrimaryLinkButton>
    </div>
  );
}
