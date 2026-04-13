"use client";

type Props = {
  color?: "green" | "red" | "yellow" | "gray";
};

const COLOR_MAP = {
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  gray: "bg-gray-400",
};

export default function DotBadge({
  color = "gray",
}: Props) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${COLOR_MAP[color]}`}
    />
  );
}
