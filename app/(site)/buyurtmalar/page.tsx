'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { buttonClass } from '@/components/ui/buttonClass';
import { OrderTimeline } from '@/components/ui/OrderTimeline';
import { formatPrice } from '@/lib/format';
import { shopBotUrl } from '@/lib/nav';
import type { PublicOrder } from '@/lib/orderStatus';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<PublicOrder[] | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('mikko:orders') ?? '[]') as { id: string; token: string }[];
    const load = async () => {
      const results = await Promise.all(
        saved.map((o) =>
          fetch(`/api/orders/${encodeURIComponent(o.id)}?t=${encodeURIComponent(o.token)}`, { cache: 'no-store' })
            .then((r) => (r.ok ? (r.json() as Promise<{ order: PublicOrder }>) : null))
            .then((d) => d?.order ?? null)
            .catch(() => null),
        ),
      );
      setOrders(results.filter((o): o is PublicOrder => o !== null));
    };
    load();
    const timer = setInterval(load, 10000); // live status while the page is open
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-[34px] md:text-[44px]">Buyurtmalarim</h1>
      <p className="mt-2 text-[14px] text-cocoa">Holat o&apos;zgarishi bilan shu yerda yangilanadi.</p>

      {orders === null ? (
        <div className="mt-8 h-40 animate-pulse rounded-[28px] bg-white/60" />
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-[28px] bg-white/70 px-6 py-12 text-center">
          <p className="font-display text-[22px] font-semibold">Bu qurilmada buyurtmalar yo&apos;q</p>
          <p className="mt-2 text-[13.5px] text-cocoa">
            Telegram orqali buyurtma bergan bo&apos;lsangiz — holatini botdagi «Buyurtmalarim» bo&apos;limida ko&apos;ring.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/catalog" className={buttonClass('primary', 'md')}>Katalogga o&apos;tish</Link>
            <a href={shopBotUrl} target="_blank" rel="noreferrer" className={buttonClass('outline', 'md')}>@mikko_kids_bot</a>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order, i) => (
            <motion.li
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-[28px] bg-white p-5 shadow-soft md:p-7"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[15px] font-bold">{order.id}</p>
                <p className="text-[13px] text-cocoa">{new Date(order.createdAt).toLocaleString('uz-UZ')}</p>
              </div>
              <OrderTimeline order={order} className="mt-5" />
              <p className="mt-5 text-[13px] text-cocoa">
                {order.items.map((item) => `${item.name} (${item.size}) × ${item.qty}`).join(' · ')}
              </p>
              <p className="mt-2 text-[16px] font-bold">Jami: {formatPrice(order.total)}</p>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
