'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import { StatusIcon } from '@/components/ui/StatusIcon';
import { statusInfo, TIMELINE, type PublicOrder } from '@/lib/orderStatus';

/** Horizontal status track: done steps filled, the current one pulses. */
export function OrderTimeline({ order, className }: { order: PublicOrder; className?: string }) {
  if (order.status === 'cancelled') {
    return <p className={clsx('rounded-2xl bg-[#FDECEA] px-4 py-3 text-[14px] font-semibold text-[#C0392B]', className, 'flex items-center gap-2')}><CircleX className="h-4 w-4" /> Buyurtma bekor qilindi</p>;
  }
  const reached = TIMELINE.indexOf(order.status);
  return (
    <div className={className}>
      <div className="relative h-2 rounded-full bg-orange-soft">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FFB36B] to-orange"
          initial={{ width: 0 }}
          animate={{ width: `${(reached / (TIMELINE.length - 1)) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
      <ol className="mt-3 grid grid-cols-5 gap-1">
        {TIMELINE.map((status, i) => {
          const at = order.history.find((h) => h.status === status)?.at;
          return (
            <li key={status} className={clsx('text-center text-[11px] leading-tight', i <= reached ? 'text-ink' : 'text-cocoa/50')}>
              <span
                className={clsx(
                  'mx-auto mb-1 grid h-8 w-8 place-items-center rounded-full',
                  i < reached && 'bg-orange-soft',
                  i === reached && 'animate-pulse bg-orange text-white shadow-[0_8px_18px_-8px_rgba(254,103,0,0.9)]',
                  i > reached && 'bg-cream text-cocoa/50',
                )}
              >
                <StatusIcon status={status} className="h-4 w-4" />
              </span>
              <span className="font-semibold">{statusInfo[status].label}</span>
              {at && <span className="block text-[10px] text-cocoa">{new Date(at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
