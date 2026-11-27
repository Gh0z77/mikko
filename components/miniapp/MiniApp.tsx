'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Banknote,
  Building2,
  Check,
  CreditCard,
  Crosshair,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Minus,
  Package,
  PartyPopper,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { Confetti } from '@/components/ui/Confetti';
import { categories, products, searchProducts } from '@/lib/products';
import { discountPercent, formatPrice } from '@/lib/format';
import { freeShippingThreshold, shippingFor, storePhone } from '@/lib/nav';
import { branches } from '@/lib/branches';
import { locateErrorText, locateMe } from '@/lib/locate';
import type { PublicOrder } from '@/lib/orderStatus';
import { OrderTimeline } from '@/components/ui/OrderTimeline';
import { MascotSign } from '@/components/ui/MascotSign';
import { Skel } from '@/components/ui/Skeletons';
import { useIncremental } from '@/components/ui/useIncremental';
import type { Product } from '@/lib/types';
import { haptic, useBackButton, useMainButton, useTelegram } from './useTelegram';

type Screen =
  | { name: 'home' }
  | { name: 'list'; title: string; items: Product[] }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'done'; orderId: string; total: string }
  | { name: 'orders' };

const spring = { type: 'spring', stiffness: 380, damping: 34 } as const;

const banners = [
  { title: 'Yangi kolleksiya', text: "Kuz–qish 2026 — issiq va yumshoq", image: '/images/model-boy-winter.webp', bg: 'from-[#FFE1C7] to-[#FFC593]', cat: 'new' },
  { title: '-30% gacha', text: 'Aksiyadagi kiyimlar', image: '/images/product-giftbox.webp', bg: 'from-[#FFD9D9] to-[#FFB8A8]', cat: 'sale' },
  { title: 'Buxoro va Toshkentda 1 kunda', text: "500 000 so'mdan — bepul yetkazish", image: '/images/model-girl.webp', bg: 'from-[#D9ECFF] to-[#B6D8FF]', cat: 'boys' },
] as const;

function listFor(slug: string): { title: string; items: Product[] } {
  if (slug === 'new') return { title: 'Yangi kelganlar', items: [...products].sort((a, b) => b.createdAt - a.createdAt) };
  if (slug === 'sale') return { title: 'Aksiyalar', items: products.filter((p) => p.oldPrice) };
  const cat = categories.find((c) => c.slug === slug);
  return { title: cat?.title ?? 'Katalog', items: products.filter((p) => p.category === slug) };
}

// ---------- Small pieces ----------

function ProductTile({ product, onOpen, index = 0 }: { product: Product; onOpen: (p: Product) => void; index?: number }) {
  const { addToCart } = useStore();
  const discount = discountPercent(product.price, product.oldPrice);
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: Math.min(index, 8) * 0.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        haptic('tap');
        onOpen(product);
      }}
      className="group relative flex flex-col rounded-[22px] bg-white p-2 text-left shadow-[0_10px_30px_-20px_rgba(38,32,28,0.45)]"
    >
      <motion.span layoutId={`img-${product.slug}`} className="relative block aspect-square overflow-hidden rounded-[16px] bg-orange-mist">
        <Image src={product.images[0]} alt={product.name} fill sizes="45vw" className="object-contain p-2" />
      </motion.span>
      {discount && (
        <span className="absolute left-3 top-3 rounded-full bg-orange px-2 py-0.5 text-[10px] font-bold text-white">-{discount}%</span>
      )}
      {product.badge === 'new' && !discount && (
        <span className="absolute left-3 top-3 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">YANGI</span>
      )}
      <span className="mt-2 line-clamp-2 min-h-[2.4em] px-1 text-[12.5px] font-semibold leading-tight">{product.name}</span>
      <span className="mt-1 flex items-center justify-between px-1 pb-1">
        <span className="text-[13px] font-bold tabular-nums text-orange-deep">{formatPrice(product.price)}</span>
        <span
          role="button"
          tabIndex={0}
          aria-label="Tez qo'shish"
          onClick={(event) => {
            event.stopPropagation();
            if (product.sizes.length > 1) return onOpen(product);
            addToCart({ slug: product.slug, size: product.sizes[0], color: product.colors[0]?.name ?? 'Standart' });
            haptic('success');
          }}
          className="grid h-7 w-7 place-items-center rounded-full bg-ink text-white transition-transform active:scale-90"
        >
          <Plus className="h-4 w-4" />
        </span>
      </span>
    </motion.button>
  );
}

function Grid({ items, onOpen }: { items: Product[]; onOpen: (p: Product) => void }) {
  const { visible, hasMore, sentinel } = useIncremental(items, 10);
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((product, index) => (
          <ProductTile key={product.slug} product={product} onOpen={onOpen} index={index % 10} />
        ))}
        {hasMore &&
          [0, 1].map((i) => (
            <div key={`s${i}`} aria-hidden="true" className="rounded-[22px] bg-white p-2">
              <Skel className="aspect-square w-full rounded-[16px]" />
              <Skel className="mt-2 h-3 w-4/5" />
              <Skel className="mt-2 h-3 w-1/2" />
            </div>
          ))}
      </div>
      {hasMore && <div ref={sentinel} aria-hidden="true" className="h-px" />}
    </>
  );
}

// ---------- Product bottom sheet ----------

function ProductSheet({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart } = useStore();
  const reduce = useReducedMotion();
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [shake, setShake] = useState(0);
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product.price, product.oldPrice);
  const images = product.images.slice(0, 1).concat(product.images.slice(1, 3));

  const add = useCallback(() => {
    if (!size) {
      haptic('error');
      setShake((n) => n + 1);
      return;
    }
    addToCart({ slug: product.slug, size, color: product.colors[0]?.name ?? 'Standart', qty });
    haptic('success');
    setAdded(true);
    setTimeout(onClose, 650);
  }, [addToCart, onClose, product, qty, size]);

  return (
    <>
      <motion.button
        type="button"
        aria-label="Yopish"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={spring}
        drag={reduce ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-[30px] bg-shell pb-28"
      >
        <div className="sticky top-0 z-10 flex justify-center bg-shell/90 pb-2 pt-3 backdrop-blur">
          <span className="h-1.5 w-11 rounded-full bg-ink/15" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Swipeable photos with snap points. */}
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, i) => (
            <div key={image} className="relative aspect-square w-[82%] shrink-0 snap-center overflow-hidden rounded-[24px] bg-orange-mist">
              {i === 0 ? (
                <motion.div layoutId={`img-${product.slug}`} className="absolute inset-0">
                  <Image src={image} alt={product.name} fill sizes="80vw" className="object-contain p-4" />
                </motion.div>
              ) : (
                <Image src={image} alt="" fill sizes="80vw" className="object-cover" />
              )}
            </div>
          ))}
        </div>

        <div className="px-5 pt-4">
          <h2 className="text-[22px] leading-tight">{product.name}</h2>
          <p className="mt-1.5 flex items-center gap-2">
            <span className="text-[22px] font-bold tabular-nums text-orange-deep">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="text-[13px] text-cocoa line-through">{formatPrice(product.oldPrice)}</span>}
            {discount && <span className="rounded-full bg-orange-soft px-2 py-0.5 text-[11px] font-bold text-orange-deep">-{discount}%</span>}
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-cocoa">{product.description}</p>

          <p className="mt-5 text-[13px] font-bold">O&apos;lcham</p>
          <motion.div
            key={shake}
            animate={shake && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
            transition={{ duration: 0.4 }}
            className="mt-2 flex flex-wrap gap-2"
          >
            {product.sizes.map((option) => (
              <motion.button
                key={option}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  haptic('select');
                  setSize(option);
                }}
                aria-pressed={size === option}
                className={clsx(
                  'h-11 min-w-[52px] rounded-2xl border px-3 text-[14px] font-semibold tabular-nums transition-colors',
                  size === option ? 'border-orange bg-orange text-white shadow-[0_8px_18px_-8px_rgba(254,103,0,0.8)]' : 'border-ink/10 bg-white',
                )}
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
          {shake > 0 && !size && <p className="mt-2 text-[12px] font-semibold text-orange-deep">O&apos;lchamni tanlang</p>}

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-white p-2">
            <span className="pl-2 text-[13px] font-semibold">Soni</span>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Kamaytirish" onClick={() => { haptic('select'); setQty((q) => Math.max(1, q - 1)); }} className="grid h-9 w-9 place-items-center rounded-xl bg-cream"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center text-[15px] font-bold tabular-nums">{qty}</span>
              <button type="button" aria-label="Ko'paytirish" onClick={() => { haptic('select'); setQty((q) => Math.min(20, q + 1)); }} className="grid h-9 w-9 place-items-center rounded-xl bg-cream"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <SheetButton
          text={added ? "Savatga qo'shildi" : `Savatga qo'shish · ${formatPrice(product.price * qty)}`}
          onClick={add}
        />
      </motion.div>
    </>
  );
}

// The sheet always uses an in-page button: Telegram's MainButton belongs to the page underneath.
function SheetButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-shell via-shell to-transparent px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-6">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="h-14 w-full rounded-2xl bg-orange text-[15px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(254,103,0,0.9)]"
      >
        {text}
      </motion.button>
    </div>
  );
}

// ---------- Main app ----------

export function MiniApp() {
  const app = useTelegram();
  const store = useStore();
  const reduce = useReducedMotion();
  const [stack, setStack] = useState<Screen[]>([{ name: 'home' }]);
  const [sheet, setSheet] = useState<Product | null>(null);
  const [query, setQuery] = useState('');
  const screen = stack[stack.length - 1];

  const push = useCallback((next: Screen) => {
    haptic('tap');
    setStack((s) => [...s, next]);
    window.scrollTo({ top: 0 });
  }, []);
  const back = useCallback(() => {
    haptic('tap');
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);
  const home = useCallback(() => setStack([{ name: 'home' }]), []);

  // Deep link from the bot: /app?p=<slug> opens that product.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('p');
    const product = products.find((p) => p.slug === slug);
    if (product) setSheet(product);
  }, []);

  // Ask before closing while something is in the cart.
  useEffect(() => {
    if (!app) return;
    if (store.cart.length) app.enableClosingConfirmation();
    else app.disableClosingConfirmation();
  }, [app, store.cart.length]);

  const name = app?.initDataUnsafe.user?.first_name;
  const photo = app?.initDataUnsafe.user?.photo_url;
  const count = store.cartCount;

  // ----- checkout form -----
  const pickupBranches = branches.filter((b) => b.address);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    delivery: 'bux' as 'bux' | 'tash' | 'region' | 'pickup',
    payment: 'cash' as 'cash' | 'card',
    branchId: pickupBranches[0]?.id ?? '',
  });
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateNote, setLocateNote] = useState('');
  const [myOrders, setMyOrders] = useState<PublicOrder[] | null>(null);

  const detectLocation = async () => {
    haptic('tap');
    setLocating(true);
    setLocateNote('');
    try {
      const found = await locateMe();
      setCoords({ lat: found.lat, lon: found.lon });
      setForm((f) => ({
        ...f,
        address: found.address,
        delivery: found.region === 'Toshkent shahri' ? 'tash' : found.region === 'Buxoro shahri' ? 'bux' : 'region',
        branchId: found.nearest?.id ?? f.branchId,
      }));
      setLocateNote(`Aniqlandi${found.nearest ? ` · eng yaqin filial ${found.nearest.km} km` : ''}`);
      haptic('success');
    } catch {
      setLocateNote(locateErrorText);
      haptic('error');
    } finally {
      setLocating(false);
    }
  };

  const loadOrders = useCallback(async () => {
    if (app?.initData) {
      const response = await fetch('/api/orders/mine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: app.initData }),
      });
      const data = (await response.json().catch(() => ({}))) as { orders?: PublicOrder[] };
      setMyOrders(data.orders ?? []);
      return;
    }
    const saved = JSON.parse(localStorage.getItem('mikko:orders') ?? '[]') as { id: string; token: string }[];
    const found = await Promise.all(
      saved.map((o) =>
        fetch(`/api/orders/${encodeURIComponent(o.id)}?t=${encodeURIComponent(o.token)}`)
          .then((r) => (r.ok ? (r.json() as Promise<{ order: PublicOrder }>) : null))
          .then((d) => d?.order ?? null)
          .catch(() => null),
      ),
    );
    setMyOrders(found.filter((o): o is PublicOrder => o !== null));
  }, [app]);

  useEffect(() => {
    if (screen.name !== 'orders') return;
    loadOrders();
    const timer = setInterval(loadOrders, 10000);
    return () => clearInterval(timer);
  }, [screen.name, loadOrders]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const user = app?.initDataUnsafe.user;
    const tgName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
    if (tgName) setForm((f) => (f.name ? f : { ...f, name: tgName }));
  }, [app]);

  const pickupBranch = branches.find((b) => b.id === form.branchId);
  const region =
    form.delivery === 'tash'
      ? 'Toshkent shahri'
      : form.delivery === 'region'
        ? 'Viloyat'
        : form.delivery === 'pickup'
          ? `${pickupBranch?.city ?? 'Buxoro'} shahri`
          : 'Buxoro shahri';
  const delivery = form.delivery === 'pickup' ? 'pickup' : 'courier';
  const shipping = shippingFor(store.subtotal, delivery, region);
  const total = store.subtotal + shipping;

  const requestPhone = () => {
    if (!app?.requestContact) return;
    const onContact = (payload: { status?: string; responseUnsafe?: { contact?: { phone_number?: string } } }) => {
      app.offEvent('contactRequested', onContact as never);
      const raw = payload.responseUnsafe?.contact?.phone_number;
      if (payload.status === 'sent' && raw) {
        const digits = raw.replace(/\D/g, '');
        setForm((f) => ({ ...f, phone: `+${digits}` }));
        haptic('success');
      }
    };
    app.onEvent('contactRequested', onContact as never);
    app.requestContact();
  };

  const submit = useCallback(async () => {
    const digits = form.phone.replace(/\D/g, '');
    const phoneOk = digits.length === 12 || digits.length === 9;
    if (form.name.trim().length < 2 || !phoneOk || (delivery === 'courier' && form.address.trim().length < 5)) {
      haptic('error');
      setError(!phoneOk ? "Telefon raqamini to'liq kiriting" : form.name.trim().length < 2 ? 'Ismingizni kiriting' : 'Manzilni aniqroq yozing');
      return;
    }
    setError('');
    setSending(true);
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          name: form.name,
          phone: `+${digits.length === 9 ? `998${digits}` : digits}`,
          region,
          address: form.address,
          delivery,
          payment: form.payment,
          branchId: delivery === 'pickup' ? form.branchId : undefined,
          lat: delivery === 'courier' ? coords?.lat : undefined,
          lon: delivery === 'courier' ? coords?.lon : undefined,
          items: store.cart.map((line) => ({ slug: line.slug, size: line.size, color: line.color, qty: line.qty })),
          initData: app?.initData,
        }),
      });
      const data = (await response.json()) as { ok: boolean; orderId?: string; token?: string };
      if (!response.ok || !data.ok) throw new Error('failed');
      if (data.orderId && data.token) {
        const saved = JSON.parse(localStorage.getItem('mikko:orders') ?? '[]') as { id: string; token: string }[];
        localStorage.setItem('mikko:orders', JSON.stringify([{ id: data.orderId, token: data.token }, ...saved].slice(0, 20)));
      }
      haptic('success');
      store.clearCart();
      setStack([{ name: 'home' }, { name: 'done', orderId: data.orderId ?? '', total: formatPrice(total) }]);
    } catch {
      haptic('error');
      setError(`Yuborib bo'lmadi. Qayta urinib ko'ring yoki qo'ng'iroq qiling: ${storePhone}`);
    } finally {
      setSending(false);
    }
  }, [app, delivery, form, region, store, total]);

  // ----- native buttons -----
  const main = useMemo(() => {
    if (sheet) return null;
    if (screen.name === 'cart')
      return count ? { text: `Rasmiylashtirish · ${formatPrice(store.subtotal)}`, onClick: () => push({ name: 'checkout' }) } : null;
    if (screen.name === 'checkout')
      return { text: sending ? 'Yuborilmoqda...' : `Buyurtma berish · ${formatPrice(total)}`, onClick: submit, progress: sending };
    if (screen.name === 'done') return { text: 'Holatini kuzatish', onClick: () => setStack([{ name: 'home' }, { name: 'orders' }]) };
    if (screen.name === 'orders') return { text: 'Xaridni davom ettirish', onClick: home };
    return count ? { text: `Savat · ${count} ta · ${formatPrice(store.subtotal)}`, onClick: () => push({ name: 'cart' }) } : null;
  }, [sheet, screen.name, count, store.subtotal, sending, total, submit, push, home]);
  const native = useMainButton(app, main);
  const closeSheet = useCallback(() => setSheet(null), []);
  useBackButton(app, sheet ? closeSheet : stack.length > 1 ? back : null);

  const searchResults = query.trim().length > 1 ? searchProducts(query) : null;

  // ---------- Screens ----------

  let body: React.ReactNode;
  if (screen.name === 'home') {
    body = (
      <>
        {/* Greeting */}
        <div className="flex items-center gap-3 px-4 pt-4">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-orange-soft ring-2 ring-orange ring-offset-2 ring-offset-cream">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <Image src="/images/mikko-bear.png" alt="" fill sizes="44px" className="object-contain p-1.5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-cocoa">Assalomu alaykum{name ? ',' : ''}</p>
            <p className="truncate font-display text-[19px] font-semibold leading-tight">{name ?? 'Xush kelibsiz'}</p>
          </div>
          <button
            type="button"
            onClick={() => push({ name: 'orders' })}
            aria-label="Buyurtmalarim"
            className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-soft transition-transform active:scale-90"
          >
            <Package className="h-5 w-5 text-orange-deep" />
          </button>
        </div>

        {/* Search */}
        <label className="mx-4 mt-4 flex h-12 items-center gap-2 rounded-2xl bg-white px-4 shadow-[0_8px_24px_-18px_rgba(38,32,28,0.5)]">
          <Search className="h-4 w-4 text-cocoa" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kiyim qidirish: sviter, etik..."
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-cocoa/60"
            aria-label="Qidiruv"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Tozalash"><X className="h-4 w-4 text-cocoa" /></button>
          )}
        </label>

        {searchResults ? (
          <div className="px-4 pt-5">
            <p className="mb-3 text-[13px] font-semibold text-cocoa">{searchResults.length} ta topildi</p>
            {searchResults.length ? <Grid items={searchResults} onOpen={setSheet} /> : <p className="py-10 text-center text-[14px] text-cocoa">Hech narsa topilmadi</p>}
          </div>
        ) : (
          <>
            {/* Story-like category bubbles */}
            <div className="mt-5 flex gap-3.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat, i) => (
                <motion.button
                  key={cat.slug}
                  type="button"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring, delay: i * 0.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => push({ name: 'list', ...listFor(cat.slug) })}
                  className="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
                >
                  <span className="rounded-full bg-[conic-gradient(from_200deg,#FE6700,#FFB36B,#FF7FA8,#FE6700)] p-[2.5px]">
                    <span className="relative block h-[60px] w-[60px] overflow-hidden rounded-full border-[3px] border-cream" style={{ backgroundColor: cat.tint }}>
                      <Image src={cat.image} alt="" fill sizes="60px" className="object-cover object-top" />
                    </span>
                  </span>
                  <span className="w-full truncate text-center text-[11px] font-semibold">{cat.short}</span>
                </motion.button>
              ))}
            </div>

            {/* Banners */}
            <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {banners.map((banner) => (
                <motion.button
                  key={banner.title}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => push({ name: 'list', ...listFor(banner.cat) })}
                  className={clsx('relative h-[150px] w-[86%] shrink-0 snap-center overflow-hidden rounded-[24px] bg-gradient-to-br p-4 text-left', banner.bg)}
                >
                  <span className="relative z-10 block max-w-[55%] font-display text-[22px] font-semibold leading-[1.05]">{banner.title}</span>
                  <span className="relative z-10 mt-1.5 block max-w-[55%] text-[12px] text-ink/70">{banner.text}</span>
                  <span className="relative z-10 mt-3 inline-block rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-white">Ko&apos;rish →</span>
                  <Image src={banner.image} alt="" width={300} height={300} className="absolute -bottom-3 right-0 h-[160px] w-auto object-contain" />
                </motion.button>
              ))}
            </div>

            {/* New arrivals rail */}
            <div className="mt-6 flex items-end justify-between px-4">
              <h2 className="flex items-center gap-1.5 text-[19px]">Yangi kelganlar <Sparkles className="h-4 w-4 text-orange" /></h2>
              <button type="button" onClick={() => push({ name: 'list', ...listFor('new') })} className="text-[12.5px] font-semibold text-orange-deep">
                Barchasi
              </button>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {listFor('new').items.slice(0, 8).map((product, i) => (
                <div key={product.slug} className="w-[42%] shrink-0">
                  <ProductTile product={product} onOpen={setSheet} index={i} />
                </div>
              ))}
            </div>

            <h2 className="mt-6 px-4 text-[19px]">Barcha kiyimlar</h2>
            <div className="mt-3 px-4">
              <Grid items={products} onOpen={setSheet} />
            </div>
          </>
        )}
      </>
    );
  } else if (screen.name === 'list') {
    body = (
      <div className="px-4 pt-3">
        <p className="mb-3 text-[13px] text-cocoa">{screen.items.length} ta mahsulot</p>
        <Grid items={screen.items} onOpen={setSheet} />
      </div>
    );
  } else if (screen.name === 'cart') {
    const left = freeShippingThreshold - store.subtotal;
    body = !store.cart.length ? (
      <div className="px-6 pt-16 text-center">
        <MascotSign text="Hali bo'sh" height={128} className="mx-auto" />
        <p className="mt-4 font-display text-[20px] font-semibold">Savat hozircha bo&apos;sh</p>
        <p className="mt-1 text-[13px] text-cocoa">Yoqqan kiyimni tanlang — shu yerda paydo bo&apos;ladi.</p>
        <button type="button" onClick={home} className="mt-5 rounded-2xl bg-orange px-6 py-3 text-[14px] font-bold text-white">Katalogga</button>
      </div>
    ) : (
      <div className="px-4 pt-3">
        {/* Free-shipping progress */}
        <div className="rounded-2xl bg-white p-3.5">
          <p className="text-[12.5px] font-semibold">
            {left > 0 ? (
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-orange-deep" /> Bepul yetkazishgacha yana <span className="text-orange-deep">{formatPrice(left)}</span></span>
            ) : (
              <span className="flex items-center gap-1.5"><PartyPopper className="h-4 w-4 text-orange-deep" /> Yetkazib berish bepul!</span>
            )}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-orange-soft">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange to-[#FFB36B]"
              initial={false}
              animate={{ width: `${Math.min(100, (store.subtotal / freeShippingThreshold) * 100)}%` }}
              transition={spring}
            />
          </div>
        </div>
        <ul className="mt-3 space-y-2.5">
          <AnimatePresence initial={false}>
            {store.cart.map((line) => {
              const product = products.find((p) => p.slug === line.slug);
              if (!product) return null;
              return (
                <motion.li
                  key={line.key}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60, height: 0, marginTop: 0 }}
                  transition={spring}
                  className="flex items-center gap-3 rounded-2xl bg-white p-2.5"
                >
                  <span className="relative h-16 w-16 shrink-0 rounded-xl bg-orange-mist">
                    <Image src={product.images[0]} alt="" fill sizes="64px" className="object-contain p-1" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{product.name}</span>
                    <span className="block text-[11.5px] text-cocoa">O&apos;lcham {line.size}</span>
                    <span className="block text-[13px] font-bold tabular-nums text-orange-deep">{formatPrice(product.price * line.qty)}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1.5">
                    <button type="button" aria-label="O'chirish" onClick={() => { haptic('tap'); store.removeLine(line.key); }} className="text-cocoa/60"><Trash2 className="h-4 w-4" /></button>
                    <span className="flex items-center gap-1 rounded-xl bg-cream p-0.5">
                      <button type="button" aria-label="Kamaytirish" onClick={() => { haptic('select'); store.setQty(line.key, line.qty - 1); }} className="grid h-7 w-7 place-items-center"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-5 text-center text-[13px] font-bold tabular-nums">{line.qty}</span>
                      <button type="button" aria-label="Ko'paytirish" onClick={() => { haptic('select'); store.setQty(line.key, line.qty + 1); }} className="grid h-7 w-7 place-items-center"><Plus className="h-3.5 w-3.5" /></button>
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    );
  } else if (screen.name === 'checkout') {
    const field = 'h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-[14px] outline-none focus:border-orange';
    body = (
      <div className="space-y-4 px-4 pt-3">
        <section className="rounded-[22px] bg-white p-4">
          <p className="text-[13px] font-bold">Yetkazib berish</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {([
              ['bux', Truck, 'Buxoro'],
              ['tash', Building2, 'Toshkent'],
              ['region', Package, 'Viloyat'],
              ['pickup', Store, 'Filial'],
            ] as const).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => { haptic('select'); setForm((f) => ({ ...f, delivery: key })); }}
                className={clsx('rounded-2xl border p-3 text-center transition-colors', form.delivery === key ? 'border-orange bg-orange-mist' : 'border-ink/10')}
              >
                <Icon className="mx-auto h-5 w-5 text-orange-deep" />
                <span className="mt-1 block text-[12px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
          {form.delivery === 'pickup' ? (
            <div className="mt-3 space-y-2">
              {pickupBranches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    haptic('select');
                    setForm((f) => ({ ...f, branchId: b.id }));
                  }}
                  className={clsx('block w-full rounded-2xl border p-3 text-left text-[12.5px]', form.branchId === b.id ? 'border-orange bg-orange-mist' : 'border-ink/10')}
                >
                  <span className="block font-semibold">{b.name.replace('MIKKO ', '')}</span>
                  <span className="flex items-center gap-1 text-cocoa"><MapPin className="h-3 w-3" /> {b.landmark}</span>
                </button>
              ))}
            </div>
          ) : (
            <>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={detectLocation}
                disabled={locating}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[13.5px] font-bold text-white disabled:opacity-70"
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                {locating ? 'Aniqlanmoqda...' : 'Joylashuvimni aniqlash'}
              </motion.button>
              {locateNote && (
                <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-cocoa">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-deep" /> {locateNote}
                </p>
              )}
              <textarea
                value={form.address}
                onChange={(event) => {
                  setForm((f) => ({ ...f, address: event.target.value }));
                  setCoords(null);
                }}
                placeholder={form.delivery === 'region' ? "Viloyat, shahar, ko'cha, uy" : "Mahalla, ko'cha, uy, xonadon"}
                rows={2}
                className="mt-2 w-full resize-none rounded-2xl border border-ink/10 bg-white px-4 py-3 text-[14px] outline-none focus:border-orange"
              />
            </>
          )}
        </section>

        <section className="space-y-2.5 rounded-[22px] bg-white p-4">
          <p className="text-[13px] font-bold">Aloqa</p>
          <input value={form.name} onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))} placeholder="Ismingiz" className={field} autoComplete="name" />
          <div className="flex gap-2">
            <input value={form.phone} onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))} placeholder="+998 90 123 45 67" inputMode="tel" className={field} autoComplete="tel" />
            {app?.requestContact && (
              <button type="button" onClick={requestPhone} className="inline-flex shrink-0 items-center gap-1 rounded-2xl bg-ink px-3 text-[12px] font-bold text-white"><Smartphone className="h-4 w-4" /> Ulash</button>
            )}
          </div>
        </section>

        <section className="rounded-[22px] bg-white p-4">
          <p className="text-[13px] font-bold">To&apos;lov (yetkazishda)</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {([
              ['cash', Banknote, 'Naqd'],
              ['card', CreditCard, 'Karta'],
            ] as const).map(([key, PayIcon, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => { haptic('select'); setForm((f) => ({ ...f, payment: key })); }}
                className={clsx('inline-flex h-12 items-center justify-center gap-2 rounded-2xl border text-[13px] font-semibold', form.payment === key ? 'border-orange bg-orange-mist' : 'border-ink/10')}
              >
                <PayIcon className="h-4 w-4 text-orange-deep" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[22px] bg-white p-4 text-[13px]">
          <div className="flex justify-between"><span className="text-cocoa">Mahsulotlar</span><span className="font-semibold tabular-nums">{formatPrice(store.subtotal)}</span></div>
          <div className="mt-1.5 flex justify-between"><span className="text-cocoa">Yetkazish</span><span className="font-semibold tabular-nums">{shipping ? formatPrice(shipping) : 'bepul'}</span></div>
          <div className="mt-2 flex justify-between border-t border-dashed border-ink/15 pt-2 text-[15px]"><span className="font-bold">Jami</span><span className="font-bold tabular-nums text-orange-deep">{formatPrice(total)}</span></div>
        </section>
        {error && <p className="rounded-2xl bg-orange-soft px-4 py-3 text-[12.5px] font-semibold text-orange-deep">{error}</p>}
      </div>
    );
  } else if (screen.name === 'orders') {
    body = (
      <div className="space-y-3 px-4 pt-3">
        {myOrders === null ? (
          <div className="h-40 animate-pulse rounded-[22px] bg-white" />
        ) : myOrders.length === 0 ? (
          <div className="px-6 pt-10 text-center">
            <MascotSign text="Kutamiz!" height={112} className="mx-auto" />
            <p className="mt-4 font-display text-[19px] font-semibold">Hali buyurtma yo&apos;q</p>
            <p className="mt-1 text-[13px] text-cocoa">Birinchi xaridingiz shu yerda kuzatiladi.</p>
          </div>
        ) : (
          myOrders.map((order) => (
            <motion.div key={order.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[22px] bg-white p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[13px] font-bold">{order.id}</span>
                <span className="text-[13px] font-bold text-orange-deep">{formatPrice(order.total)}</span>
              </div>
              <OrderTimeline order={order} className="mt-4" />
            </motion.div>
          ))
        )}
      </div>
    );
  } else {
    body = (
      <div className="relative px-6 pt-16 text-center">
        <Confetti />
        <motion.span
          initial={reduce ? false : { scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-orange text-white shadow-[0_20px_40px_-14px_rgba(254,103,0,0.9)]"
        >
          <Check className="h-12 w-12" strokeWidth={3} />
        </motion.span>
        <h2 className="mt-6 flex items-center justify-center gap-2 text-[26px]">Rahmat! <Heart className="h-6 w-6 fill-orange text-orange" /></h2>
        <p className="mt-2 text-[14px] leading-relaxed text-cocoa">
          Buyurtmangiz qabul qilindi. Operatorimiz tez orada qo&apos;ng&apos;iroq qilib tasdiqlaydi.
        </p>
        <div className="mx-auto mt-6 max-w-xs rounded-2xl border border-dashed border-ink/20 bg-white p-4 text-left text-[13px]">
          <div className="flex justify-between"><span className="text-cocoa">Buyurtma</span><span className="font-bold">{screen.orderId}</span></div>
          <div className="mt-1.5 flex justify-between"><span className="text-cocoa">Jami</span><span className="font-bold">{screen.total}</span></div>
        </div>
        {app && <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-cocoa"><Mail className="h-3.5 w-3.5" /> Chek bot chatiga yuborildi</p>}
      </div>
    );
  }

  const titles: Record<Screen['name'], string> = { home: '', list: '', cart: 'Savat', checkout: 'Rasmiylashtirish', done: '', orders: 'Buyurtmalarim' };
  const title = screen.name === 'list' ? screen.title : titles[screen.name];

  return (
    <div className="mx-auto min-h-dvh max-w-[520px] bg-cream pb-28">
      {/* In a browser there is no Telegram chrome, so show our own back bar. */}
      {(title || (!app && stack.length > 1)) && (
        <div className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-cream/90 px-3 backdrop-blur">
          {!app && stack.length > 1 && (
            <button type="button" onClick={back} aria-label="Orqaga" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-[19px]">{title}</h1>
        </div>
      )}

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${screen.name}-${stack.length}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {body}
        </motion.div>
      </AnimatePresence>

      {/* Floating cart bubble on the browse screens (Telegram users also get the MainButton). */}
      {!native && main && !sheet && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[520px] bg-gradient-to-t from-cream via-cream to-transparent px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-6">
          <motion.button
            type="button"
            key={main.text}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={main.onClick}
            disabled={main.progress}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange text-[15px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(254,103,0,0.9)] disabled:opacity-70"
          >
            {screen.name === 'home' || screen.name === 'list' ? <ShoppingBag className="h-5 w-5" /> : null}
            {main.text}
          </motion.button>
        </div>
      )}

      <AnimatePresence>{sheet && <ProductSheet key={sheet.slug} product={sheet} onClose={closeSheet} />}</AnimatePresence>
    </div>
  );
}
