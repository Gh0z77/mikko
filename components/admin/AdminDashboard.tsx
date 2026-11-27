'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Bot,
  CreditCard,
  Globe,
  LogOut,
  Map,
  MapPin,
  MessageCircle,
  NotebookPen,
  Phone,
  Search,
  Smartphone,
  Store,
  Trash2,
  Truck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { StatusIcon } from '@/components/ui/StatusIcon';
import { ProductsManager } from './ProductsManager';
import { formatPrice } from '@/lib/format';
import { products } from '@/lib/products';
import { branches, mapsLink, phoneHref } from '@/lib/branches';
import { ORDER_STATUSES, statusInfo, type OrderRecord, type OrderStatus } from '@/lib/orderStatus';

interface Staff {
  chatId: number;
  name: string | null;
  username: string | null;
  addedAt: number;
}

const nextActions: Record<OrderStatus, OrderStatus[]> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['packing', 'shipping', 'cancelled'],
  packing: ['shipping', 'cancelled'],
  shipping: ['delivered'],
  delivered: [],
  cancelled: [],
};
const sourceIcon = { site: Globe, bot: Bot, miniapp: Smartphone } as const;
const sourceLabel = { site: 'Sayt', bot: 'Telegram bot', miniapp: 'Mini App' } as const;

function timeAgo(at: number) {
  const min = Math.round((Date.now() - at) / 60000);
  if (min < 1) return 'hozirgina';
  if (min < 60) return `${min} daq oldin`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} soat oldin`;
  return new Date(at).toLocaleDateString('uz-UZ');
}

// Short two-tone chime via WebAudio so a new order is heard even in a background tab.
function chime() {
  try {
    const ctx = new AudioContext();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.15 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.45);
    });
  } catch {
    /* audio blocked until the first click — fine */
  }
}

export function AdminDashboard({ staffPin, botUsername }: { staffPin: string; botUsername: string }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'orders' | 'products' | 'staff'>('orders');
  const known = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/orders', { cache: 'no-store' });
    if (response.status === 401) return window.location.reload();
    const data = (await response.json()) as { orders: OrderRecord[]; staff: Staff[] };
    setOrders(data.orders);
    setStaff(data.staff);
    const ids = new Set(data.orders.map((o) => o.id));
    if (known.current) {
      const added = [...ids].filter((id) => !known.current!.has(id));
      if (added.length) {
        chime();
        setFresh((prev) => new Set([...prev, ...added]));
      }
    }
    known.current = ids;
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 6000);
    return () => clearInterval(timer);
  }, [load]);

  const newCount = orders.filter((o) => o.status === 'new').length;
  useEffect(() => {
    document.title = newCount ? `(${newCount}) Yangi buyurtma · MIKKO` : 'Admin · MIKKO';
  }, [newCount]);

  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const today = orders.filter((o) => o.createdAt >= startOfDay);
  const stats = [
    { label: 'Bugungi buyurtmalar', value: String(today.length), tone: 'bg-white' },
    { label: 'Bugungi tushum', value: formatPrice(today.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)), tone: 'bg-white' },
    { label: 'Kutilmoqda (yangi)', value: String(newCount), tone: newCount ? 'bg-orange text-white' : 'bg-white' },
    { label: "Yo'lda", value: String(orders.filter((o) => o.status === 'shipping').length), tone: 'bg-white' },
  ];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === 'all' || o.status === filter) &&
        (!q || [o.id, o.name, o.phone, o.address ?? ''].join(' ').toLowerCase().includes(q)),
    );
  }, [orders, filter, query]);

  const open = orders.find((o) => o.id === openId) ?? null;

  async function setStatus(id: string, status: OrderStatus) {
    setBusy(true);
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (response.ok) {
      const { order } = (await response.json()) as { order: OrderRecord };
      setOrders((prev) => prev.map((o) => (o.id === id ? order : o)));
    }
  }

  async function dropStaff(chatId: number) {
    await fetch(`/api/admin/staff/${chatId}`, { method: 'DELETE' });
    setStaff((prev) => prev.filter((s) => s.chatId !== chatId));
  }

  return (
    <div className="min-h-dvh bg-[#F6F1EC]">
      <header className="sticky top-0 z-30 border-b border-ink/8 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Image src="/images/mikko-logo.png" alt="mikko" width={540} height={110} className="h-7 w-auto" />
          <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">Xodimlar paneli</span>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2E9E5B]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E9E5B] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2E9E5B]" />
            </span>
            Jonli
          </span>
          <nav className="ml-auto flex gap-1 rounded-full bg-cream p-1">
            {([
              ['orders', 'Buyurtmalar'],
              ['products', 'Mahsulotlar'],
              ['staff', 'Xodimlar'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={clsx('rounded-full px-4 py-1.5 text-[13px] font-semibold', tab === key ? 'bg-ink text-white' : 'text-ink/70')}
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.reload();
            }}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream"
            aria-label="Chiqish"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === 'products' ? (
          <ProductsManager />
        ) : tab === 'staff' ? (
          <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl bg-white p-6">
              <h2 className="flex items-center gap-2 text-[20px]"><Users className="h-5 w-5 text-orange" /> Xodimlar ({staff.length})</h2>
              <ul className="mt-4 divide-y divide-ink/8">
                {staff.length === 0 && <li className="py-6 text-center text-[13px] text-cocoa">Hali xodim qo&apos;shilmagan.</li>}
                {staff.map((s) => (
                  <li key={s.chatId} className="flex items-center gap-3 py-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-orange-soft text-orange-deep"><UserRound className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{s.name ?? 'Xodim'}</span>
                      <span className="block text-[12px] text-cocoa">{s.username ? `@${s.username}` : `ID ${s.chatId}`} · {new Date(s.addedAt).toLocaleDateString('uz-UZ')}</span>
                    </span>
                    <button type="button" onClick={() => dropStaff(s.chatId)} className="rounded-full p-2 text-cocoa hover:bg-cream hover:text-[#C0392B]" aria-label="Olib tashlash">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-ink p-6 text-white">
              <h2 className="text-[20px] text-white">Yangi xodim qo&apos;shish</h2>
              <ol className="mt-4 space-y-3 text-[14px] text-white/85">
                <li>1. Xodim Telegram&apos;da <b>@{botUsername}</b> ni ochadi</li>
                <li>
                  2. Shu buyruqni yuboradi:
                  <code className="mt-2 block rounded-xl bg-white/10 px-4 py-3 font-mono text-[18px] tracking-wider text-orange">/xodim {staffPin}</code>
                </li>
                <li>3. Shundan keyin har bir yangi buyurtma unga mijozning to&apos;liq ma&apos;lumotlari va status tugmalari bilan keladi.</li>
              </ol>
              <p className="mt-5 text-[12px] text-white/50">Kodni faqat ishonchli xodimlarga bering. Chiqish uchun xodim /chiqish yuboradi.</p>
            </div>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((s) => (
                <motion.div key={s.label} layout className={clsx('rounded-3xl p-5 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.4)]', s.tone)}>
                  <p className="text-[12px] font-semibold opacity-70">{s.label}</p>
                  <p className="mt-1 font-display text-[28px] font-semibold tabular-nums">{s.value}</p>
                </motion.div>
              ))}
            </section>

            <section className="mt-5 flex flex-wrap items-center gap-2">
              {(['all', ...ORDER_STATUSES] as const).map((status) => {
                const count = status === 'all' ? orders.length : orders.filter((o) => o.status === status).length;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilter(status)}
                    className={clsx(
                      'rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors',
                      filter === status ? 'bg-ink text-white' : 'bg-white text-ink/75 hover:bg-white/70',
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {status !== 'all' && <StatusIcon status={status} />}
                      {status === 'all' ? 'Hammasi' : statusInfo[status].label}
                      <span className="opacity-60">{count}</span>
                    </span>
                  </button>
                );
              })}
              <label className="ml-auto flex h-10 w-full items-center gap-2 rounded-full bg-white px-4 sm:w-72">
                <Search className="h-4 w-4 text-cocoa" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ID, ism, telefon..." className="w-full bg-transparent text-[13px] outline-none" />
              </label>
            </section>

            <section className="mt-4 overflow-hidden rounded-3xl bg-white">
              {visible.length === 0 ? (
                <p className="py-16 text-center text-[14px] text-cocoa">Buyurtmalar yo&apos;q. Yangi buyurtma tushsa — shu yerda paydo bo&apos;ladi va signal chalinadi <Bell className="inline h-4 w-4 text-orange" /></p>
              ) : (
                <ul className="divide-y divide-ink/8">
                  <AnimatePresence initial={false}>
                    {visible.map((o) => (
                      <motion.li
                        key={o.id}
                        layout
                        initial={{ opacity: 0, y: -12, backgroundColor: '#FFE6D3' }}
                        animate={{ opacity: 1, y: 0, backgroundColor: fresh.has(o.id) ? '#FFF3EA' : '#FFFFFF' }}
                        className="cursor-pointer px-5 py-4 transition-colors hover:bg-cream"
                        onClick={() => {
                          setOpenId(o.id);
                          setFresh((prev) => {
                            const next = new Set(prev);
                            next.delete(o.id);
                            return next;
                          });
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className={clsx('rounded-full px-2.5 py-1 text-[11px] font-bold', statusInfo[o.status].tone)}>
                            <span className="inline-flex items-center gap-1"><StatusIcon status={o.status} /> {statusInfo[o.status].label}</span>
                          </span>
                          <span className="font-mono text-[13px] font-bold">{o.id}</span>
                          <span className="inline-flex items-center gap-1.5 text-[13px]">
                            {(() => {
                              const SourceIcon = sourceIcon[o.source];
                              return <SourceIcon className="h-3.5 w-3.5 text-cocoa" />;
                            })()}
                            {o.name}
                          </span>
                          <span className="text-[13px] text-cocoa">{o.phone}</span>
                          <span className="inline-flex items-center gap-1 text-[12px] text-cocoa">
                            {o.delivery === 'pickup' ? <Store className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
                            {o.delivery === 'pickup' ? 'Olib ketish' : o.region ?? ''}
                          </span>
                          <span className="ml-auto text-[14px] font-bold tabular-nums">{formatPrice(o.total)}</span>
                          <span className="w-24 text-right text-[12px] text-cocoa">{timeAgo(o.createdAt)}</span>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </section>
          </>
        )}
      </main>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Yopish"
              onClick={() => setOpenId(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/30"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[13px] text-cocoa">{open.id}</p>
                  <h2 className="text-[24px]">{open.name}</h2>
                  <span className={clsx('mt-2 inline-block rounded-full px-2.5 py-1 text-[12px] font-bold', statusInfo[open.status].tone)}>
                    <span className="inline-flex items-center gap-1"><StatusIcon status={open.status} /> {statusInfo[open.status].label}</span>
                  </span>
                </div>
                <button type="button" onClick={() => setOpenId(null)} className="rounded-full p-2 hover:bg-cream" aria-label="Yopish">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid gap-2">
                <a href={phoneHref(open.phone)} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-[14px] font-semibold hover:bg-orange-soft">
                  <Phone className="h-4 w-4 text-orange-deep" /> {open.phone}
                </a>
                {open.tgId && (
                  <a href={open.tgUsername ? `https://t.me/${open.tgUsername}` : `tg://user?id=${open.tgId}`} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-[14px] font-semibold hover:bg-orange-soft">
                    <MessageCircle className="h-4 w-4 text-[#229ED9]" /> {open.tgUsername ? `@${open.tgUsername}` : 'Telegram profil'}
                  </a>
                )}
                <div className="flex items-start gap-3 rounded-2xl bg-cream px-4 py-3 text-[14px]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-deep" />
                  <span>
                    {open.delivery === 'pickup'
                      ? `Olib ketadi: ${branches.find((b) => b.id === open.branchId)?.name ?? 'filial'}`
                      : `${open.region ?? ''}, ${open.address ?? ''}`}
                    {open.lat !== null && open.lon !== null && (
                      <a href={mapsLink(open.lat, open.lon)} target="_blank" rel="noreferrer" className="mt-1 block font-semibold text-orange-deep underline">
                        <span className="inline-flex items-center gap-1"><Map className="h-3.5 w-3.5" /> Xaritada ochish (aniq nuqta)</span>
                      </a>
                    )}
                  </span>
                </div>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[12.5px] text-cocoa">
                  <span className="inline-flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> {open.payment === 'card' ? 'Karta' : 'Naqd'}</span>
                  <span className="inline-flex items-center gap-1">
                    {(() => {
                      const SourceIcon = sourceIcon[open.source];
                      return <SourceIcon className="h-3.5 w-3.5" />;
                    })()}
                    {sourceLabel[open.source]}
                  </span>
                  <span>{new Date(open.createdAt).toLocaleString('uz-UZ')}</span>
                </p>
                {open.comment && (
                  <p className="flex items-start gap-2 rounded-2xl bg-orange-mist px-4 py-3 text-[13px]">
                    <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-orange-deep" /> {open.comment}
                  </p>
                )}
              </div>

              <ul className="mt-5 space-y-2">
                {open.items.map((item) => {
                  const product = products.find((p) => p.slug === item.slug);
                  return (
                    <li key={`${item.slug}-${item.size}`} className="flex items-center gap-3">
                      <span className="relative h-14 w-14 shrink-0 rounded-xl bg-cream">
                        {product && <Image src={product.images[0]} alt="" fill sizes="56px" className="object-contain p-1" />}
                      </span>
                      <span className="min-w-0 flex-1 text-[13px]">
                        <span className="block truncate font-semibold">{item.name}</span>
                        <span className="text-cocoa">{item.size} · {item.color} · {item.qty} dona</span>
                      </span>
                      <span className="text-[13px] font-bold tabular-nums">{formatPrice(item.price * item.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 space-y-1 border-t border-dashed border-ink/15 pt-3 text-[13px]">
                <p className="flex justify-between"><span className="text-cocoa">Yetkazish</span><span>{open.shipping ? formatPrice(open.shipping) : 'bepul'}</span></p>
                <p className="flex justify-between text-[16px] font-bold"><span>Jami</span><span>{formatPrice(open.total)}</span></p>
              </div>

              {nextActions[open.status].length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {nextActions[open.status].map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={busy}
                      onClick={() => setStatus(open.id, status)}
                      className={clsx('h-12 rounded-2xl text-[14px] font-bold transition-transform active:scale-95 disabled:opacity-60', statusInfo[status].tone)}
                    >
                      <span className="inline-flex items-center justify-center gap-1.5"><StatusIcon status={status} className="h-4 w-4" /> {statusInfo[status].label}</span>
                    </button>
                  ))}
                </div>
              )}
              {open.tgId && <p className="mt-2 text-[11.5px] text-cocoa">Status o&apos;zgarsa, mijozga Telegram&apos;da avtomatik xabar boradi.</p>}

              <h3 className="mt-6 text-[15px]">Tarix</h3>
              <ol className="mt-2 space-y-2 border-l-2 border-orange-soft pl-4">
                {open.history.map((h, i) => (
                  <li key={i} className="text-[12.5px]">
                    <span className="inline-flex items-center gap-1 font-semibold"><StatusIcon status={h.status} /> {statusInfo[h.status].label}</span>
                    <span className="text-cocoa"> · {new Date(h.at).toLocaleString('uz-UZ')}{h.by ? ` · ${h.by}` : ''}</span>
                  </li>
                ))}
              </ol>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
