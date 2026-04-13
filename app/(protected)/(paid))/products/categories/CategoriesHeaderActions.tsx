"use client";

import PrimaryButton from "@/components/app/button/PrimaryButton";

type Props = {
  onCreateRoot: () => void;
};

export default function CategoriesHeaderActions({ onCreateRoot }: Props) {
  return (
    <div className="flex items-center gap-2">
      <PrimaryButton onClick={onCreateRoot}>
        + Thêm danh mục gốc
      </PrimaryButton>
    </div>
  );
}
