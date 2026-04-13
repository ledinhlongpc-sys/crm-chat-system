"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import ButtonBase from "./ButtonBase";

type Props = {
  href: string;
  label?: string;
};

export default function BackButton({
  href,
  label = "Quay lại",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (loading) return;
    setLoading(true);
    router.push(href);
  }

  return (
    <ButtonBase
      variant="back"     // 👈 nút phụ
      size="md"               // 👈 nhỏ hơn primary
      disabled={loading}
      onClick={handleClick}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowLeft className="h-4 w-4" />
      )}
      {label}
    </ButtonBase>
  );
}
