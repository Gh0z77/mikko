'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Trash2, Truck } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { buttonClass } from '@/components/ui/buttonClass';
import { formatPrice } from '@/lib/format';
import { deliveryFeeCity, freeShippingThreshold } from '@/lib/nav';
import { products } from '@/lib/products';
import { MascotSign } from '@/components/ui/MascotSign';

export default function CartPage() {
  const { cart, setQty, removeLine, clearCart, subtotal, hydrated } = useStore();

  const lines = cart
    .map((line) => ({ ...line, product: products.find((item) => item.slug === line.slug) }))
    .filter((line): line is typeof line & { product: NonNullable<typeof line.product> } =>
      Boolean(line.product),
    );

  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : deliveryFeeCity;
  const total = subtotal + shipping;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (!hydrated) {
    return <div className="container-page min-h-[50vh] py-10" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-12 md:py-20">
        <div className="mx-auto max-w-lg rounded-[32px] bg-white/60 px-6 py-12 text-center md:px-10">
          <MascotSign text="Hali bo'sh" height={144} className="mx-auto" />
          <h1 className="mt-5 text-[30px] md:text-[36px]">Savat hozircha bo&apos;sh</h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-cocoa">
            Katalogdan yoqtirgan mahsulotni tanlab, savatga qo&apos;shing — biz qolganini
            o&apos;zimiz qilamiz.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/catalog" className={buttonClass('primary', 'md')}>
              Katalogga o&apos;tish
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/sale" className={buttonClass('outline', 'md')}>
              Aksiyalar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] leading-none md:text-[42px]">Savat</h1>
          <p className="mt-2 text-[13px] text-cocoa">{lines.length} xil mahsulot</p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-cocoa underline underline-offset-2 hover:text-ink"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Savatni tozalash
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.45fr_0.55fr] lg:gap-12">
        <div>
          <div className="rounded-[22px] bg-white/55 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-soft text-orange-deep">
                <Truck className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold">
                  {remaining === 0
                    ? 'Yetkazib berish bepul!'
                    : `Bepul yetkazishga ${formatPrice(remaining)} qoldi`}
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                  <div
                    className="h-full rounded-full bg-orange transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <ul className="mt-5 divide-y divide-ink/8">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-3 py-4 md:gap-5 md:py-5">
                <Link
                  href={`/product/${line.product.slug}`}
                  className="relative h-[104px] w-[88px] shrink-0 overflow-hidden rounded-2xl bg-white md:h-[120px] md:w-[104px]"
                >
                  <Image
                    src={line.product.images[0]}
                    alt={line.product.name}
                    fill
                    sizes="104px"
                    className="object-contain p-2"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${line.product.slug}`}
                        className="line-clamp-2 text-[14px] font-semibold leading-snug hover:text-orange-deep"
                      >
                        {line.product.name}
                      </Link>
                      <p className="mt-1 text-[11.5px] text-cocoa">
                        O&apos;lcham: {line.size} · Rang: {line.color}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      aria-label={`${line.product.name} ni savatdan olib tashlash`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-cocoa/70 transition-colors hover:bg-ink/[0.06] hover:text-ink"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                    <QuantityStepper
                      value={line.qty}
                      onChange={(qty) => setQty(line.key, qty)}
                      className="h-10"
                    />
                    <div className="text-right">
                      <p className="text-[15px] font-semibold tabular-nums">
                        {formatPrice(line.product.price * line.qty)}
                      </p>
                      {line.qty > 1 && (
                        <p className="text-[11px] text-cocoa">
                          {formatPrice(line.product.price)} / dona
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/catalog"
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:text-orange-deep"
          >
            ← Xaridni davom ettirish
          </Link>
        </div>

        <aside>
          <div className="sticky top-28 rounded-[24px] border border-ink/8 bg-white/70 p-5 md:p-6">
            <h2 className="text-[18px]">Buyurtma hisobi</h2>

            <dl className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-cocoa">Mahsulotlar</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cocoa">Yetkazib berish (Buxoro)</dt>
                <dd className="font-semibold tabular-nums">
                  {shipping === 0 ? (
                    <span className="text-orange-deep">Bepul</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-end justify-between border-t border-dashed border-ink/15 pt-4">
              <span className="text-[13px] font-semibold">Jami</span>
              <span className="text-[22px] font-semibold tabular-nums">{formatPrice(total)}</span>
            </div>

            <Link href="/checkout" className={buttonClass('primary', 'md', 'mt-5 w-full')}>
              Rasmiylashtirish
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-cocoa">
              <ShieldCheck className="h-3.5 w-3.5" />
              To&apos;lov yetkazib berishda
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-1.5">
              {['Payme', 'Click', 'Uzum', 'Naqd'].map((method) => (
                <span
                  key={method}
                  className="rounded-md bg-ink/[0.05] px-2 py-1 text-[10px] font-semibold text-cocoa"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
