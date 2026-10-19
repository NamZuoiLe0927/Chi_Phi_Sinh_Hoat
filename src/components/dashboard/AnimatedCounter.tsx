"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { formatVnd } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  formatter?: (value: number) => string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  formatter = formatVnd,
  className,
  duration = 0.7,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      currentRef.current = value;
      setDisplay(value);
      return;
    }

    const controls = animate(currentRef.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        currentRef.current = latest;
        setDisplay(latest);
      },
    });

    return () => controls.stop();
  }, [value, duration, reducedMotion]);

  return <span className={className}>{formatter(display)}</span>;
}
