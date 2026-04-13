// app/(protected)/(paid)/products/[product_code]/ProductViewHeader.tsx

"use client";

import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";

/* ================= TYPES ================= */

type Props = {
  productCode: string;
};

/* ================= COMPONENT ================= */

export default function ProductViewHeader({ productCode }: Props) {
  return (
    <div className="flex items-center gap-2">
      <PrimaryLinkButton href={`/products/${productCode}/edit`}>
        Sửa sản phẩm
      </PrimaryLinkButton>
    </div>
  );
}
