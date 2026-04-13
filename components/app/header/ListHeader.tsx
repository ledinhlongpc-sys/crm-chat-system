"use client";

import PrimaryButton from "@/components/app/button/PrimaryButton";

type Props = {
  title: string;
  description?: string;
  onCreate?: () => void;
  createLabel?: string;
};

export default function ListHeader({
  title,
  description,
  onCreate,
  createLabel = "Thêm mới",
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-neutral-500">
            {description}
          </p>
        )}
      </div>

      {onCreate && (
        <PrimaryButton onClick={onCreate}>
          + {createLabel}
        </PrimaryButton>
      )}
    </div>
  );
}
