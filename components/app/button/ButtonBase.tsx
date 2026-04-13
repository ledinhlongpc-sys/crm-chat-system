"use client";

import clsx from "clsx";
import React from "react";
import { buttonUI } from "@/ui-tokens";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "back";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>; 
 type?: "button" | "submit" | "reset";
};

export default function ButtonBase({
  children,
  variant = "primary",
  size = "md",
  disabled,
  className,
  onClick,
  type = "button",
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        buttonUI.base,
        buttonUI.size[size],
        buttonUI[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
