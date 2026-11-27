'use client';

import { useRef } from 'react';
import clsx from 'clsx';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';

/** 3D tilt that follows the mouse, with a soft glare. Touch and reduced-motion users get a flat card. */
export function TiltCard({
  children,
  className,
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const spring = { stiffness: 220, damping: 20, mass: 0.6 };
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);
  const gx = useMotionValue(50);
  const gy = useMotionValue(0);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 55%)`;

  function move(event: React.PointerEvent) {
    if (reduce || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * max * 2);
    rotateX.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  }

  function leave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={clsx('group/tilt relative will-change-transform', className)}
    >
      {children}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover/tilt:opacity-100"
        />
      )}
    </motion.div>
  );
}
