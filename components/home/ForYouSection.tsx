'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { INTERESTS_CHANGED, recommend } from '@/lib/interests';
import type { Product } from '@/lib/types';

/** Personal picks from the interest cookie; hidden until we know something about the visitor. */
export function ForYouSection() {
  const [picks, setPicks] = useState<Product[]>([]);

  useEffect(() => {
    const sync = () => setPicks(recommend(4));
    sync();
    window.addEventListener(INTERESTS_CHANGED, sync);
    return () => window.removeEventListener(INTERESTS_CHANGED, sync);
  }, []);

  return (
    <AnimatePresence>
      {picks.length > 0 && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="container-page mt-16 overflow-hidden md:mt-24"
          aria-labelledby="for-you-title"
        >
          <div id="for-you-title">
            <SectionHeading
              eyebrow="Faqat siz uchun"
              title="Sizga yoqishi mumkin"
              description="Ko'rgan va tanlagan kiyimlaringiz asosida tanladik — har tashrifda aniqroq bo'lib boradi."
            />
          </div>
          <ProductGrid products={picks} className="mt-8" />
        </motion.section>
      )}
    </AnimatePresence>
  );
}
