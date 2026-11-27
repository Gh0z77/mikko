'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import { freeShippingThreshold } from '@/lib/nav';
import { buttonClass } from '@/components/ui/buttonClass';
import { MascotSign } from '@/components/ui/MascotSign';

export function CartDrawer() {
  const { cartOpen, setCartOpen, cart, subtotal, setQty, removeLine, cartCount } = useStore();
  const pathname = usePathname();

  useEffect(() => {
    setCartOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCartOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [cartOpen, setCartOpen]);

  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[78]">
          <motion.button
            type="button"
            aria-label="Savatni yopish"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Savat"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-cream shadow-lift sm:rounded-l-[32px]"
          >
            <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl">Savat</h2>
                <span className="text-sm text-cocoa">{cartCount} ta</span>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Yopish"
                className="grid h-10 w-10 place-items-center rounded-full bg-ink/[0.06] transition-colors hover:bg-ink/[0.12]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <MascotSign text="Hali bo'sh" height={160} />
                <h3 className="mt-2 text-2xl">Savat hozircha bo&apos;sh</h3>
                <p className="mt-2 text-sm leading-relaxed text-cocoa">
                  Kolleksiyadan yoqqan narsani tanlang — savat sizni kutmoqda.
                </p>
                <Link
                  href="/catalog"
                  onClick={() => setCartOpen(false)}
                  className={buttonClass('primary', 'md', 'mt-6')}
                >
                  Katalogga o&apos;tish
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <ul className="space-y-3">
                    {cart.map((line) => {
                      const product = products.find((item) => item.slug === line.slug);
                      if (!product) return null;
                      return (
                        <motion.li
                          key={line.key}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 24 }}
                          className="flex gap-3 rounded-3xl bg-white/70 p-3"
                        >
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={() => setCartOpen(false)}
                            className="relative h-[88px] w-[74px] shrink-0 overflow-hidden rounded-2xl bg-cream"
                          >
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="74px"
                              className="object-contain p-1.5"
                            />
                          </Link>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/product/${product.slug}`}
                                onClick={() => setCartOpen(false)}
                                className="line-clamp-2 text-[13.5px] font-semibold leading-snug"
                              >
                                {product.name}
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeLine(line.key)}
                                aria-label={`${product.name}ni savatdan olib tashlash`}
                                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-cocoa/60 transition-colors hover:bg-ink/10 hover:text-ink"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="mt-0.5 text-[11.5px] text-cocoa">
                              O&apos;lcham {line.size} · {line.color}
                            </p>

                            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                              <div className="inline-flex items-center rounded-full border border-ink/12 bg-white">
                                <button
                                  type="button"
                                  aria-label="Kamaytirish"
                                  onClick={() => setQty(line.key, line.qty - 1)}
                                  className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-ink/[0.07]"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold tabular-nums">
                                  {line.qty}
                                </span>
                                <button
                                  type="button"
                                  aria-label="Ko'paytirish"
                                  onClick={() => setQty(line.key, line.qty + 1)}
                                  className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-ink/[0.07]"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="text-[13px] font-semibold tabular-nums">
                                {formatPrice(product.price * line.qty)}
                              </span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>

                <div className="border-t border-ink/8 bg-shell px-5 pb-5 pt-4 sm:rounded-bl-[32px]">
                  <div className="rounded-2xl bg-cream px-3.5 py-3">
                    <p className="text-[12px] font-medium text-cocoa">
                      {remaining > 0 ? (
                        <>
                          Bepul yetkazishga{' '}
                          <span className="font-semibold text-ink">{formatPrice(remaining)}</span>{' '}
                          qoldi
                        </>
                      ) : (
                        'Bepul yetkazib berish sizga tegishli'
                      )}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                      <motion.div
                        className="h-full rounded-full bg-orange"
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-cocoa">Jami</span>
                    <span className="text-xl font-semibold tabular-nums">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <Link
                      href="/checkout"
                      onClick={() => setCartOpen(false)}
                      className={buttonClass('primary', 'md', 'w-full')}
                    >
                      Rasmiylashtirish
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setCartOpen(false)}
                      className={buttonClass('outline', 'md', 'w-full')}
                    >
                      Savatni ko&apos;rish
                    </Link>
                  </div>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-cocoa/70">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    To&apos;lov yetkazib berishda — naqd yoki karta
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
