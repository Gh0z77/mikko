'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { Check, CreditCard, Crosshair, Loader2, MapPin, Package, Store, Truck } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { buttonClass } from '@/components/ui/buttonClass';
import { Confetti } from '@/components/ui/Confetti';
import { TELEGRAM_READY, telegramApp } from '@/components/providers/TelegramWebApp';
import { formatPrice } from '@/lib/format';
import { shippingFor, storePhone, storePhoneHref } from '@/lib/nav';
import { branches } from '@/lib/branches';
import { locateErrorText, locateMe } from '@/lib/locate';
import { products } from '@/lib/products';

const regions = [
  'Buxoro shahri',
  'Buxoro viloyati',
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  "Farg'ona viloyati",
  'Andijon viloyati',
  "Namangan viloyati",
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  'Navoiy viloyati',
  'Xorazm viloyati',
  "Qoraqalpog'iston",
];

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean);
  return `+998${parts.length ? ` ${parts.join(' ')}` : ' '}`.trimEnd();
}

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, hydrated } = useStore();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    region: regions[0],
    address: '',
    comment: '',
  });
  const [delivery, setDelivery] = useState<'courier' | 'pickup'>('courier');
  const [payment, setPayment] = useState<'cash' | 'card'>('cash');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState(0);
  const [trackUrl, setTrackUrl] = useState<string | null>(null);
  const pickupBranches = branches.filter((b) => b.address);
  const [branchId, setBranchId] = useState(pickupBranches[0]?.id ?? '');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateNote, setLocateNote] = useState('');

  async function detectLocation() {
    setLocating(true);
    setLocateNote('');
    try {
      const found = await locateMe();
      setCoords({ lat: found.lat, lon: found.lon });
      setForm((prev) => ({
        ...prev,
        address: found.address,
        region: regions.includes(found.region) ? found.region : prev.region,
      }));
      setErrors((prev) => ({ ...prev, address: '' }));
      setLocateNote(
        `Aniqlandi${found.nearest ? ` · eng yaqin filial: ${found.nearest.name.replace('MIKKO ', '')} (${found.nearest.km} km)` : ''}`,
      );
      if (found.nearest) setBranchId(found.nearest.id);
    } catch {
      setLocateNote(locateErrorText);
    } finally {
      setLocating(false);
    }
  }

  // Inside the Telegram Mini App, prefill the name from the user's Telegram profile.
  useEffect(() => {
    const prefill = () => {
      const user = telegramApp()?.initDataUnsafe.user;
      const tgName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
      if (tgName) setForm((prev) => (prev.name ? prev : { ...prev, name: tgName }));
    };
    prefill();
    window.addEventListener(TELEGRAM_READY, prefill);
    return () => window.removeEventListener(TELEGRAM_READY, prefill);
  }, []);

  const lines = cart
    .map((line) => ({ ...line, product: products.find((item) => item.slug === line.slug) }))
    .filter((line): line is typeof line & { product: NonNullable<typeof line.product> } =>
      Boolean(line.product),
    );

  const shipping = shippingFor(subtotal, delivery, form.region);
  const total = subtotal + shipping;

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 3) nextErrors.name = "Ismingizni to'liq kiriting";
    if (form.phone.replace(/\D/g, '').length < 12) nextErrors.phone = "Telefon raqamini to'liq kiriting";
    if (delivery === 'courier' && form.address.trim().length < 5)
      nextErrors.address = 'Manzilni aniqroq kiriting';
    if (!agree) nextErrors.agree = "Shartlarga rozilik bildiring";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('sending');
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          ...form,
          delivery,
          payment,
          branchId: delivery === 'pickup' ? branchId : undefined,
          lat: delivery === 'courier' ? coords?.lat : undefined,
          lon: delivery === 'courier' ? coords?.lon : undefined,
          initData: telegramApp()?.initData,
          items: lines.map((line) => ({
            slug: line.slug,
            size: line.size,
            color: line.color,
            qty: line.qty,
          })),
        }),
      });
      const data = (await response.json()) as { ok: boolean; orderId?: string; token?: string };
      if (!response.ok || !data.ok) throw new Error('failed');
      if (data.orderId && data.token) {
        // Remember the order on this device so /buyurtmalar can show its live status.
        const saved = JSON.parse(localStorage.getItem('mikko:orders') ?? '[]') as { id: string; token: string }[];
        localStorage.setItem('mikko:orders', JSON.stringify([{ id: data.orderId, token: data.token }, ...saved].slice(0, 20)));
        setTrackUrl('/buyurtmalar');
      }
      telegramApp()?.HapticFeedback?.notificationOccurred('success');
      setPlacedTotal(total);
      setOrderId(data.orderId ?? null);
      setStatus('done');
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setStatus('error');
    }
  }

  if (!hydrated) {
    return <div className="container-page min-h-[50vh] py-10" aria-busy="true" />;
  }

  if (status === 'done') {
    return (
      <div className="container-page py-12 md:py-20">
        <div className="relative mx-auto max-w-xl rounded-[32px] bg-white/70 px-6 py-10 text-center md:px-10">
          <Confetti />
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange text-white">
            <Check className="h-8 w-8" strokeWidth={3} />
          </span>
          <h1 className="mt-5 text-[30px] md:text-[36px]">Buyurtma qabul qilindi!</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-cocoa">
            Rahmat! Operatorimiz 15 daqiqa ichida qo&apos;ng&apos;iroq qilib, buyurtmani
            tasdiqlaydi.
          </p>

          <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-cream px-5 py-4 text-left text-[13px]">
            <div className="flex justify-between">
              <span className="text-cocoa">Buyurtma raqami</span>
              <span className="font-semibold">{orderId}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-cocoa">Jami summa</span>
              <span className="font-semibold tabular-nums">{formatPrice(placedTotal)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-cocoa">To&apos;lov</span>
              <span className="font-semibold">Yetkazib berishda</span>
            </div>
          </div>

          <p className="mt-4 text-[12px] text-cocoa">
            Savol bo&apos;lsa:{' '}
            <a href={storePhoneHref} className="font-semibold text-ink underline underline-offset-2">
              {storePhone}
            </a>
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {trackUrl && (
              <Link href={trackUrl} className={buttonClass('primary', 'md')}>
                <Package className="h-4 w-4" />
                Holatini kuzatish
              </Link>
            )}
            <Link href="/catalog" className={buttonClass(trackUrl ? 'outline' : 'primary', 'md')}>
              Xaridni davom ettirish
            </Link>
            <Link href="/" className={buttonClass('outline', 'md')}>
              Bosh sahifa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-16 text-center md:py-24">
        <h1 className="text-[30px] md:text-[38px]">Savat bo&apos;sh</h1>
        <p className="mt-2 text-[14px] text-cocoa">
          Buyurtmani rasmiylashtirish uchun avval savatga mahsulot qo&apos;shing.
        </p>
        <Link href="/catalog" className={buttonClass('primary', 'md', 'mt-6')}>
          Katalogga o&apos;tish
        </Link>
      </div>
    );
  }

  const inputClass =
    'h-12 w-full rounded-xl border bg-white/70 px-4 text-[14px] outline-none transition-colors placeholder:text-cocoa/50 focus:border-ink';

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-[32px] leading-none md:text-[42px]">Buyurtmani rasmiylashtirish</h1>
      <p className="mt-2 text-[13px] text-cocoa">
        Ma&apos;lumotlaringiz faqat buyurtmani yetkazish uchun ishlatiladi.
      </p>

      <form onSubmit={submit} className="mt-7 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
        <div className="space-y-8">
          <section className="rounded-[24px] border border-ink/8 bg-white/50 p-5 md:p-6">
            <h2 className="text-[16px]">1. Aloqa ma&apos;lumotlari</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-[12px] font-semibold">
                  Ism va familiya *
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="Aziza Karimova"
                  autoComplete="name"
                  className={clsx(inputClass, errors.name ? 'border-orange-deep' : 'border-ink/12')}
                />
                {errors.name && (
                  <p className="mt-1 text-[11.5px] text-orange-deep">{errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="text-[12px] font-semibold">
                  Telefon raqam *
                </label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={(event) => update('phone', formatPhone(event.target.value))}
                  placeholder="+998 90 123 45 67"
                  inputMode="tel"
                  autoComplete="tel"
                  className={clsx(inputClass, errors.phone ? 'border-orange-deep' : 'border-ink/12')}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11.5px] text-orange-deep">{errors.phone}</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-ink/8 bg-white/50 p-5 md:p-6">
            <h2 className="text-[16px]">2. Yetkazib berish</h2>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {[
                { key: 'courier' as const, icon: Truck, title: 'Kuryer bilan', note: 'Buxoro va Toshkentda 1 kun' },
                { key: 'pickup' as const, icon: Store, title: 'Olib ketish', note: "Do'kondan" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setDelivery(option.key)}
                  aria-pressed={delivery === option.key}
                  className={clsx(
                    'flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors',
                    delivery === option.key
                      ? 'border-ink bg-white'
                      : 'border-ink/10 bg-transparent hover:border-ink/30',
                  )}
                >
                  <option.icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-deep" />
                  <span>
                    <span className="block text-[13px] font-semibold">{option.title}</span>
                    <span className="block text-[11.5px] text-cocoa">{option.note}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="region" className="text-[12px] font-semibold">
                  Viloyat / shahar
                </label>
                <select
                  id="region"
                  value={form.region}
                  onChange={(event) => update('region', event.target.value)}
                  className={clsx(inputClass, 'border-ink/12')}
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="address" className="text-[12px] font-semibold">
                    Manzil {delivery === 'courier' ? '*' : '(ixtiyoriy)'}
                  </label>
                  {delivery === 'courier' && (
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={locating}
                      className="inline-flex items-center gap-1 rounded-full bg-orange-soft px-2.5 py-1 text-[11.5px] font-bold text-orange-deep transition-colors hover:bg-orange hover:text-white disabled:opacity-60"
                    >
                      {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3 w-3" />}
                      Joylashuvimni aniqlash
                    </button>
                  )}
                </div>
                <input
                  id="address"
                  value={form.address}
                  onChange={(event) => {
                    update('address', event.target.value);
                    setCoords(null);
                  }}
                  placeholder="5-kichik nohiya, 12-uy, 45-xonadon"
                  autoComplete="street-address"
                  className={clsx(
                    inputClass,
                    errors.address ? 'border-orange-deep' : 'border-ink/12',
                  )}
                />
                {errors.address && (
                  <p className="mt-1 text-[11.5px] text-orange-deep">{errors.address}</p>
                )}
              </div>
            </div>

            {locateNote && delivery === 'courier' && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-orange-soft/70 px-3.5 py-2.5 text-[12px] font-medium text-cocoa">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-deep" /> {locateNote}
              </p>
            )}

            {delivery === 'pickup' && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {pickupBranches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBranchId(b.id)}
                    aria-pressed={branchId === b.id}
                    className={clsx(
                      'flex items-start gap-2 rounded-2xl border p-3 text-left text-[12px] transition-colors',
                      branchId === b.id ? 'border-ink bg-white' : 'border-ink/10 hover:border-ink/30',
                    )}
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-deep" />
                    <span>
                      <span className="block font-semibold text-ink">{b.name.replace('MIKKO ', '')}</span>
                      <span className="block text-cocoa">{b.landmark} · {b.hours}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[24px] border border-ink/8 bg-white/50 p-5 md:p-6">
            <h2 className="text-[16px]">3. To&apos;lov</h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {[
                { key: 'cash' as const, icon: Truck, title: 'Yetkazishda naqd', note: "Kuryerga to'lov" },
                { key: 'card' as const, icon: CreditCard, title: 'Yetkazishda karta', note: 'Terminal orqali' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPayment(option.key)}
                  aria-pressed={payment === option.key}
                  className={clsx(
                    'flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors',
                    payment === option.key
                      ? 'border-ink bg-white'
                      : 'border-ink/10 bg-transparent hover:border-ink/30',
                  )}
                >
                  <option.icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-deep" />
                  <span>
                    <span className="block text-[13px] font-semibold">{option.title}</span>
                    <span className="block text-[11.5px] text-cocoa">{option.note}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label htmlFor="comment" className="text-[12px] font-semibold">
                Izoh (ixtiyoriy)
              </label>
              <textarea
                id="comment"
                value={form.comment}
                onChange={(event) => update('comment', event.target.value)}
                rows={3}
                placeholder="Masalan: 14:00 dan keyin qo'ng'iroq qiling"
                className="mt-1 w-full resize-none rounded-xl border border-ink/12 bg-white/70 px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-cocoa/50 focus:border-ink"
              />
            </div>
          </section>
        </div>

        <aside>
          <div className="sticky top-28 rounded-[24px] border border-ink/8 bg-white/70 p-5">
            <h2 className="text-[18px]">Buyurtmangiz</h2>

            <ul className="mt-4 space-y-3">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center gap-3">
                  <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                    <Image
                      src={line.product.images[0]}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold">
                      {line.product.name}
                    </span>
                    <span className="block text-[11px] text-cocoa">
                      {line.size} · {line.qty} dona
                    </span>
                  </span>
                  <span className="text-[12.5px] font-semibold tabular-nums">
                    {formatPrice(line.product.price * line.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-dashed border-ink/15 pt-4 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-cocoa">Mahsulotlar</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cocoa">Yetkazib berish</dt>
                <dd className="font-semibold tabular-nums">
                  {shipping === 0 ? <span className="text-orange-deep">Bepul</span> : formatPrice(shipping)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex items-end justify-between border-t border-ink/10 pt-3">
              <span className="text-[13px] font-semibold">Jami</span>
              <span className="text-[22px] font-semibold tabular-nums">{formatPrice(total)}</span>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[11.5px] leading-relaxed text-cocoa">
              <input
                type="checkbox"
                checked={agree}
                onChange={(event) => {
                  setAgree(event.target.checked);
                  setErrors((prev) => ({ ...prev, agree: '' }));
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink/25 accent-orange"
              />
              <span>
                Buyurtma shartlari va{' '}
                <Link href="/about" className="underline underline-offset-2">
                  qaytarish qoidalari
                </Link>
                ga roziman.
              </span>
            </label>
            {errors.agree && <p className="mt-1 text-[11.5px] text-orange-deep">{errors.agree}</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className={buttonClass('primary', 'md', 'mt-4 w-full')}
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                'Buyurtmani tasdiqlash'
              )}
            </button>

            {status === 'error' && (
              <p className="mt-3 rounded-xl bg-orange-soft px-3 py-2 text-[11.5px] text-orange-deep">
                Yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko&apos;ring yoki{' '}
                <a href={storePhoneHref} className="underline">
                  qo&apos;ng&apos;iroq qiling
                </a>
                .
              </p>
            )}

            <p className="mt-3 text-center text-[11px] text-cocoa">
              To&apos;lov faqat yetkazib berishda amalga oshiriladi
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
