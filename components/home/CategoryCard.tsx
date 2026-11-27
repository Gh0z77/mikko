import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { ArrowUpRight } from 'lucide-react';
import type { Category } from '@/lib/types';
import { TiltCard } from '@/components/ui/TiltCard';

interface CategoryCardProps {
  category: Category;
  count: number;
  className?: string;
  variant?: 'tall' | 'wide';
  ratio?: string;
}

export function CategoryCard({ category, count, className, variant = 'tall', ratio = 'aspect-[4/3.1]' }: CategoryCardProps) {
  if (variant === 'wide') {
    return (
      <Link
        href={category.href}
        className={clsx(
          'group relative flex items-center overflow-hidden rounded-[28px] px-6 py-6 md:px-10',
          className,
        )}
        style={{ backgroundColor: category.tint }}
      >
        <div className="relative z-10 max-w-[62%] md:max-w-[55%]">
          <span className="text-[11px] font-semibold text-ink/55">Chegirmalar</span>
          <h3 className="mt-1 text-[26px] leading-[1.05] md:text-[32px]">
            {category.title}
            <span className="text-orange-deep"> gacha 30%</span>
          </h3>
          <p className="mt-1.5 hidden text-sm text-cocoa sm:block">{category.description}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
            Ko&apos;rish
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream transition-transform duration-300 group-hover:translate-x-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </span>
        </div>

        <Image
          src="/images/decor-arrow.webp"
          alt=""
          aria-hidden="true"
          width={1536}
          height={1024}
          className="pointer-events-none absolute right-[41%] top-1/2 hidden h-9 w-auto -translate-y-1/2 opacity-90 md:block"
        />

        <div className="pointer-events-none absolute -bottom-6 right-2 h-[120%] w-[38%] md:right-8 md:w-[30%]">
          <Image
            src={category.image}
            alt=""
            fill
            sizes="(min-width: 768px) 30vw, 38vw"
            className="object-contain object-right-bottom transition-transform duration-700 ease-silk group-hover:scale-105"
          />
        </div>
      </Link>
    );
  }

  return (
    <TiltCard max={6} className={clsx('rounded-[28px]', className)}>
    <Link
      href={category.href}
      className={clsx(
        'group relative block overflow-hidden rounded-[28px] p-5 transition-shadow duration-500 hover:shadow-lift md:p-6',
        ratio,
      )}
      style={{ backgroundColor: category.tint }}
    >
      {/* Sunburst that spins up behind the model on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[62%] h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 scale-75 rounded-full bg-[repeating-conic-gradient(rgba(255,255,255,0.55)_0deg_10deg,transparent_10deg_20deg)] opacity-0 transition-all duration-700 ease-silk group-hover:scale-100 group-hover:opacity-100 motion-safe:group-hover:animate-[spin_18s_linear_infinite]"
      />
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[21px] leading-[1.1] md:text-[25px]">{category.title}</h3>
          <p className="mt-1 text-[11.5px] font-medium text-cocoa">{count} ta mahsulot</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/85 text-ink shadow-sm transition-all duration-300 group-hover:bg-ink group-hover:text-cream">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="absolute inset-x-3 bottom-1 top-[30%]">
        <Image
          src={category.image}
          alt={category.title}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
          className="object-contain object-bottom transition-transform duration-700 ease-silk group-hover:-translate-y-2 group-hover:scale-[1.07] group-hover:-rotate-2"
        />
      </div>
    </Link>
    </TiltCard>
  );
}
