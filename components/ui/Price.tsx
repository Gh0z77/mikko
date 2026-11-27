import clsx from 'clsx';
import { discountPercent, formatPrice } from '@/lib/format';

interface PriceProps {
  price: number;
  oldPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDiscount?: boolean;
}

export function Price({ price, oldPrice, size = 'md', className, showDiscount }: PriceProps) {
  const discount = discountPercent(price, oldPrice);

  const priceClass = {
    sm: 'text-[15px]',
    md: 'text-[17px]',
    lg: 'text-[30px] leading-none md:text-[34px]',
  }[size];

  return (
    <div className={clsx('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={clsx('font-semibold tabular-nums tracking-[-0.02em]', priceClass)}>
        {formatPrice(price)}
      </span>
      {oldPrice && (
        <span
          className={clsx(
            'text-cocoa/60 line-through decoration-cocoa/40',
            size === 'lg' ? 'text-base' : 'text-[13px]',
          )}
        >
          {formatPrice(oldPrice)}
        </span>
      )}
      {showDiscount && discount && (
        <span className="rounded-full bg-orange-soft px-2 py-0.5 text-[11px] font-bold text-orange-deep">
          -{discount}%
        </span>
      )}
    </div>
  );
}
