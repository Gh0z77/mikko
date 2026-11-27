// Client-safe order status vocabulary (used by the bot, admin panel, Mini App and site).

export const ORDER_STATUSES = ['new', 'confirmed', 'packing', 'shipping', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const statusInfo: Record<OrderStatus, { label: string; emoji: string; tone: string }> = {
  new: { label: 'Yangi', emoji: '🆕', tone: 'bg-orange text-white' },
  confirmed: { label: 'Tasdiqlandi', emoji: '✅', tone: 'bg-[#2E9E5B] text-white' },
  packing: { label: "Yig'ilmoqda", emoji: '📦', tone: 'bg-[#E0A100] text-white' },
  shipping: { label: "Yo'lda", emoji: '🚚', tone: 'bg-[#2A8BD8] text-white' },
  delivered: { label: 'Yetkazildi', emoji: '🏁', tone: 'bg-ink text-white' },
  cancelled: { label: 'Bekor qilindi', emoji: '❌', tone: 'bg-[#C0392B] text-white' },
};

/** The happy path shown as a timeline to customers. */
export const TIMELINE: OrderStatus[] = ['new', 'confirmed', 'packing', 'shipping', 'delivered'];

export const isStatus = (value: unknown): value is OrderStatus =>
  typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value);

export interface OrderItem {
  slug: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
}

export interface OrderRecord {
  id: string;
  token: string;
  createdAt: number;
  status: OrderStatus;
  source: 'site' | 'bot' | 'miniapp';
  name: string;
  phone: string;
  tgId: number | null;
  tgUsername: string | null;
  delivery: 'courier' | 'pickup';
  region: string | null;
  address: string | null;
  lat: number | null;
  lon: number | null;
  branchId: string | null;
  payment: 'cash' | 'card';
  comment: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  history: { status: OrderStatus; at: number; by?: string }[];
}

/** Customer-facing view: no internal fields. */
export type PublicOrder = Omit<OrderRecord, 'token' | 'tgId' | 'tgUsername'>;

export function toPublic(order: OrderRecord): PublicOrder {
  const { token: _token, tgId: _tgId, tgUsername: _tgUsername, ...rest } = order;
  return rest;
}
