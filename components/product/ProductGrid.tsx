'use client';

import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeletons';
import { useIncremental } from '@/components/ui/useIncremental';
import type { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  className?: string;
  priorityCount?: number;
  animate?: boolean;
}

export function ProductGrid({ products, className, priorityCount = 0, animate = true }: ProductGridProps) {
  const reduceMotion = useReducedMotion();
  const { visible, hasMore, sentinel } = useIncremental(products, 12);
  const gridClass = clsx('grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4', className);
  const motionOn = animate && !reduceMotion;

  return (
    <>
      <div className={gridClass}>
        {visible.map((product, index) =>
          motionOn ? (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 34, rotate: -1.5, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              // cascade across a row of four
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.06 }}
            >
              <ProductCard product={product} priority={index < priorityCount} />
            </motion.div>
          ) : (
            <ProductCard key={product.slug} product={product} priority={index < priorityCount} />
          ),
        )}
        {hasMore && Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={`s${i}`} />)}
      </div>
      {hasMore && <div ref={sentinel} aria-hidden="true" className="h-px" />}
    </>
  );
}
