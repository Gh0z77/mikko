'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const colors = ['#FE6700', '#FFB36B', '#FFD9D9', '#D9ECFF', '#26201C', '#FFE6D3'];

// One celebratory burst; pieces are positioned relative to the parent (make it `relative`).
export function Confetti({ count = 44 }: { count?: number }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 140 + Math.random() * 180;
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance * 0.7 - 80,
          rotate: Math.random() * 540 - 270,
          color: colors[i % colors.length],
          size: 6 + Math.random() * 6,
          round: i % 3 === 0,
          delay: Math.random() * 0.15,
        };
      }),
    [count],
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-16 z-10" aria-hidden="true">
      {pieces.map((piece, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: piece.x, y: [0, piece.y, piece.y + 260], opacity: [1, 1, 0], rotate: piece.rotate, scale: 1 }}
          transition={{ duration: 2.2, delay: piece.delay, ease: [0.16, 1, 0.3, 1], times: [0, 0.45, 1] }}
          className="absolute block"
          style={{
            width: piece.size,
            height: piece.round ? piece.size : piece.size * 0.45,
            borderRadius: piece.round ? 999 : 2,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </div>
  );
}
