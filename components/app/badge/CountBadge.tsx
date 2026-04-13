"use client";

type Props = {
  count: number;
  max?: number;
};

export default function CountBadge({
  count,
  max = 99,
}: Props) {
  if (count <= 0) return null;

  return (
    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
      {count > max ? `${max}+` : count}
    </span>
  );
}
