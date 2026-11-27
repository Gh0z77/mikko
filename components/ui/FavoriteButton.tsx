'use client';

import { Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { useStore } from '@/components/providers/StoreProvider';

interface FavoriteButtonProps {
  slug: string;
  className?: string;
  variant?: 'solid' | 'bare';
  withLabel?: boolean;
}

export function FavoriteButton({
  slug,
  className,
  variant = 'solid',
  withLabel = false,
}: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useStore();
  const reduceMotion = useReducedMotion();
  const active = isFavorite(slug);

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(slug);
      }}
      whileTap={reduceMotion ? undefined : { scale: 0.88 }}
      className={clsx(
        'group/fav inline-flex items-center justify-center gap-2 transition-colors duration-300',
        variant === 'solid'
          ? 'h-10 w-10 rounded-full bg-white/90 text-ink shadow-tag backdrop-blur hover:bg-white'
          : 'text-ink',
        withLabel && 'h-12 w-auto rounded-full px-5 text-sm font-semibold',
        className,
      )}
    >
      <Heart
        className={clsx(
          'h-[18px] w-[18px] transition-all duration-300',
          active ? 'scale-110 fill-orange text-orange' : 'fill-transparent text-ink/70',
        )}
        strokeWidth={2}
      />
      {withLabel && (active ? 'Sevimlilarda' : 'Sevimlilarga')}
    </motion.button>
  );
}
