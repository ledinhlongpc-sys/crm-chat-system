"use client";

export default function useConfirm() {
  const confirm = (message: string) => {
    return window.confirm(message);
  };

  return { confirm };
}
