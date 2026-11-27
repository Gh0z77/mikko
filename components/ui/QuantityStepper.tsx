'use client';

import { Minus, Plus } from 'lucide-react';
import clsx from 'clsx';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  label?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  className,
  label = 'Miqdor',
}: QuantityStepperProps) {
  return (
    <div
      className={clsx(
        'inline-flex h-12 items-center gap-1 rounded-full border border-ink/12 bg-shell px-1.5',
        className,
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-ink/[0.07] disabled:opacity-30"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Kamaytirish"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className="w-8 text-center text-sm font-semibold tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-ink/[0.07] disabled:opacity-30"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Ko'paytirish"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
