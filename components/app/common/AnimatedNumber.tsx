"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
};

export default function AnimatedNumber({ value }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 400;
    const step = value / (duration / 16);

    const interval = setInterval(() => {
      start += step;

      if (start >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value]);

  return <>{display.toLocaleString("vi-VN")}</>;
}