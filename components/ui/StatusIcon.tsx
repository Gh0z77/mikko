import { CircleCheck, CircleX, Flag, Package, Sparkles, Truck, type LucideIcon } from 'lucide-react';
import type { OrderStatus } from '@/lib/orderStatus';

// Web UI uses icons; the `emoji` in statusInfo is only for Telegram message text.
export const statusIcons: Record<OrderStatus, LucideIcon> = {
  new: Sparkles,
  confirmed: CircleCheck,
  packing: Package,
  shipping: Truck,
  delivered: Flag,
  cancelled: CircleX,
};

export function StatusIcon({ status, className = 'h-3.5 w-3.5' }: { status: OrderStatus; className?: string }) {
  const Icon = statusIcons[status];
  return <Icon className={className} aria-hidden="true" />;
}
