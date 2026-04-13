"use client";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import { useSupport } from "./SupportContext";

export default function SupportCreateButton() {
  const { openCreate } = useSupport();

  return (
    <PrimaryButton onClick={openCreate}>
      + Tạo yêu cầu
    </PrimaryButton>
  );
}