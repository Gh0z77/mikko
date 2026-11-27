'use client';

import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  className?: string;
  priorityCount?: number;
  animate?: boolean;
}

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
  animate = true,
}: ProductGridProps) {
  const reduceMotion = useReducedMotion();
  const gridClass = clsx(
    'grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4',
    className,
  );

  if (!animate || reduceMotion) {
    return (
      <div className={gridClass}>
        {products.map((product, index) => (
          <ProductCard key={product.slug} product={product} priority={index < priorityCount} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={gridClass}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.slug}
          variants={{
            hidden: { opacity: 0, y: 34, rotate: -1.5, scale: 0.96 },
            show: {
              opacity: 1,
              y: 0,
              rotate: 0,
              scale: 1,
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <ProductCard product={product} priority={index < priorityCount} />
        </motion.div>
      ))}
    </motion.div>
  );
}
