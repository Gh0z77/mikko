'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { formatNumber } from '@/lib/format';

/** Counts the number inside a label like "171 000+" up from zero when it scrolls into view. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const target = Number(value.replace(/\D/g, ''));
  const suffix = value.replace(/[\d\s ]/g, '');
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!inView || reduce || !target) return;
    const controls = animate(0, target, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(`${formatNumber(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, reduce, target, suffix]);

  return (
    <span ref={ref} className={className} aria-label={value}>
      {shown}
    </span>
  );
}
