import { Star } from 'lucide-react';
import clsx from 'clsx';

interface RatingProps {
  value: number;
  reviews?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function Rating({ value, reviews, className, size = 'sm' }: RatingProps) {
  const stars = Math.round(value);
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]';

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={clsx(
              iconSize,
              index < stars ? 'fill-orange text-orange' : 'fill-transparent text-ink/20',
            )}
            strokeWidth={1.6}
          />
        ))}
      </div>
      <span className={clsx('font-semibold tabular-nums', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {value.toFixed(1)}
      </span>
      {reviews !== undefined && (
        <span className={clsx('text-cocoa/70', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({reviews} sharh)
        </span>
      )}
    </div>
  );
}
