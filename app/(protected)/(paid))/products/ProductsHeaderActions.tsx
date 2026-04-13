"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import PrimaryButton from "@/components/app/button/PrimaryButton";

export default function ProductsHeaderActions() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      
      {/* NHẬP SẢN PHẨM */}
      <PrimaryButton
        onClick={() =>
          startTransition(() => {
            router.push("/products/import");
          })
        }
        loading={isPending}
      >
        Nhập từ file
      </PrimaryButton>

      {/* THÊM SẢN PHẨM */}
      <PrimaryButton
        onClick={() =>
          startTransition(() => {
            router.push("/products/create");
          })
        }
        loading={isPending}
      >
        + Thêm sản phẩm
      </PrimaryButton>

    </div>
  );
}