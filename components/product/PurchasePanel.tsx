'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/interests';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { SizeGuideModal } from '@/components/ui/SizeGuideModal';
import { buttonClass } from '@/components/ui/buttonClass';
import { categoryLabels } from '@/lib/products';
import type { Product } from '@/lib/types';

export function PurchasePanel({ product }: { product: Product }) {
  const { addToCart, setCartOpen } = useStore();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(product.colors[0]?.name ?? 'Standart');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => track({ type: 'view', slug: product.slug }), [product.slug]);
  const [justAdded, setJustAdded] = useState(false);


  function add(goToCheckout = false) {
    if (!size) {
      setError(true);
      return;
    }
    addToCart({ slug: product.slug, size, color, qty });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
    if (goToCheckout) router.push('/checkout');
    else setCartOpen(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/${product.category}`}
          className="text-[11.5px] font-semibold text-orange-deep hover:underline"
        >
          {categoryLabels[product.category]}
        </Link>
        <span className="h-3 w-px bg-ink/15" />
        <Rating value={product.rating} reviews={product.reviews} />
      </div>

      <h1 className="mt-3 text-[30px] leading-[1.05] sm:text-[38px]">{product.name}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Price price={product.price} oldPrice={product.oldPrice} size="lg" showDiscount />
      </div>

      <p className="mt-4 text-[14px] leading-relaxed text-cocoa md:text-[15px]">
        {product.description}
      </p>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[12.5px] font-bold">Rang</h2>
          <span className="text-[12px] text-cocoa">{color}</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {product.colors.map((option) => (
            <button
              key={option.name}
              type="button"
              onClick={() => setColor(option.name)}
              aria-label={option.name}
              aria-pressed={color === option.name}
              className={clsx(
                'grid h-10 w-10 place-items-center rounded-full border-2 transition-all',
                color === option.name
                  ? 'border-ink'
                  : 'border-transparent hover:border-ink/25',
              )}
            >
              <span
                className="h-7 w-7 rounded-full ring-1 ring-ink/10"
                style={{ backgroundColor: option.hex }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[12.5px] font-bold">O&apos;lcham</h2>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-cocoa underline underline-offset-2 hover:text-ink"
          >
            <Ruler className="h-3.5 w-3.5" />
            O&apos;lchamlar jadvali
          </button>
        </div>

        <motion.div
          animate={error && !reduceMotion ? { x: [0, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="mt-2.5 flex flex-wrap gap-2"
        >
          {product.sizes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSize(option);
                setError(false);
              }}
              aria-pressed={size === option}
              className={clsx(
                'h-11 min-w-[52px] rounded-xl border text-[13px] font-semibold tabular-nums transition-all',
                size === option
                  ? 'border-ink bg-ink text-cream'
                  : 'border-ink/12 bg-white/60 hover:border-ink/45',
              )}
            >
              {option}
            </button>
          ))}
        </motion.div>

        {error && (
          <p className="mt-2 text-[12px] font-medium text-orange-deep">
            Iltimos, o&apos;lchamni tanlang
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} />
        <button
          type="button"
          onClick={() => add(false)}
          className={buttonClass('primary', 'md', 'h-12 flex-1 min-w-[180px]')}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" strokeWidth={3} />
              Savatga qo&apos;shildi
            </>
          ) : (
            "Savatga qo'shish"
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => add(true)}
        className={buttonClass('outline', 'md', 'mt-3 h-12 w-full')}
      >
        Darhol xarid qilish
      </button>

      <div className="mt-6 space-y-2.5 rounded-2xl bg-white/60 p-4 text-[12.5px] text-cocoa">
        <p className="flex items-center gap-2">
          <Truck className="h-4 w-4 shrink-0 text-orange-deep" />
          Buxoro va Toshkent bo&apos;ylab 1 kunda yetkazib beramiz
        </p>
        <p className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-orange-deep" />
          14 kun ichida almashtirish yoki qaytarish
        </p>
        <p className="flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-orange-deep" />
          Sotuvda mavjud — {product.sizes.length} o&apos;lcham
        </p>
      </div>

      <div className="mt-6 divide-y divide-ink/8 border-y border-ink/8">
        <details className="group py-4" open>
          <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-bold">
            Tavsif va detallar
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-cocoa">
            {product.details.map((detail) => (
              <li key={detail} className="flex gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-deep" />
                {detail}
              </li>
            ))}
          </ul>
        </details>

        <details className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-bold">
            Material va parvarish
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-cocoa">
            <p>Tarkibi: {product.material}</p>
            <p>30°C da yuvish, xlorli oqartirgichlardan foydalanmaslik.</p>
            <p>Past haroratda dazmollash tavsiya etiladi.</p>
          </div>
        </details>

        <details className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-bold">
            Yetkazib berish va qaytarish
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-cocoa">
            <p>Buxoro shahri ichida 1 kun, viloyatlarga 2–4 ish kuni.</p>
            <p>500 000 so&apos;mdan ortiq xaridga yetkazib berish bepul.</p>
            <p>Mahsulot yorlig&apos;i saqlangan bo&apos;lsa, 14 kun ichida qaytarish mumkin.</p>
          </div>
        </details>
      </div>

      <SizeGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
