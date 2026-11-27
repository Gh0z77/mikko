import { randomBytes } from 'node:crypto';
import { products } from './products';
import { shippingFor } from './nav';
import { formatPrice } from './format';
import { branches, mapsLink } from './branches';
import { getOrder, listStaff, rememberStaffMessage, saveOrder, setOrderStatus, staffMessages } from './db';
import { esc, tg, tgCall, type TelegramUser } from './telegram';
import { statusInfo, TIMELINE, type OrderRecord, type OrderStatus } from './orderStatus';

export interface OrderInput {
  name?: string;
  phone?: string;
  region?: string;
  address?: string;
  comment?: string;
  delivery?: 'courier' | 'pickup';
  payment?: 'cash' | 'card';
  branchId?: string;
  lat?: number;
  lon?: number;
  items: { slug: string; size: string; color: string; qty: number }[];
  /** Telegram user to keep posted (bot chat or verified Mini App user). */
  customer?: TelegramUser | null;
  source: 'site' | 'bot' | 'miniapp';
}

export type OrderResult =
  | { ok: true; id: string; token: string; total: string }
  | { ok: false; error: 'missing_contact' | 'empty_cart' | 'save_failed' };

const sourceLabel = { site: 'Sayt', bot: 'Telegram bot', miniapp: 'Telegram Mini App' } as const;

function orderNumber() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.random().toString(36).toUpperCase().slice(2, 4);
  return `MK-${stamp}${random}`;
}

const validCoord = (value: unknown, max: number) =>
  typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= max ? value : null;

// ---------- Message builders ----------

export function staffText(order: OrderRecord): string {
  const branch = branches.find((b) => b.id === order.branchId);
  const info = statusInfo[order.status];
  const lines = [
    `🧸 <b>Buyurtma ${order.id}</b> · ${sourceLabel[order.source]}`,
    `Holat: <b>${info.emoji} ${info.label}</b>`,
    '',
    `👤 ${esc(order.name, 80)}`,
    `📞 ${esc(order.phone, 20)}`,
    order.tgId
      ? `💬 <a href="tg://user?id=${order.tgId}">${order.tgUsername ? '@' + esc(order.tgUsername, 40) : 'Telegram profil'}</a>`
      : null,
    order.delivery === 'pickup'
      ? `🏬 Olib ketadi: ${esc(branch?.name ?? 'filial')}`
      : `🚚 ${esc(order.region)}, ${esc(order.address)}`,
    order.lat !== null && order.lon !== null ? `🗺 <a href="${mapsLink(order.lat, order.lon)}">Xaritada ochish</a>` : null,
    `💳 ${order.payment === 'card' ? 'Karta' : 'Naqd'} (yetkazishda)`,
    order.comment ? `📝 ${esc(order.comment, 500)}` : null,
    '',
    ...order.items.map(
      (item) => `• ${esc(item.name)} — ${esc(item.size, 10)}, ${esc(item.color, 30)} × ${item.qty} = ${formatPrice(item.price * item.qty)}`,
    ),
    '',
    `Yetkazish: ${order.shipping === 0 ? 'bepul' : formatPrice(order.shipping)}`,
    `<b>Jami: ${formatPrice(order.total)}</b>`,
  ];
  const last = order.history.at(-1);
  if (last?.by && order.status !== 'new') lines.push('', `<i>${info.emoji} ${esc(last.by, 40)} tomonidan</i>`);
  return lines.filter((line) => line !== null).join('\n');
}

export function staffKeyboard(order: OrderRecord) {
  const b = (status: OrderStatus) => ({
    text: `${statusInfo[status].emoji} ${statusInfo[status].label}`,
    callback_data: `st:${order.id}:${status}`,
  });
  const next: Record<OrderStatus, OrderStatus[][]> = {
    new: [['confirmed', 'cancelled']],
    confirmed: [['packing', 'shipping'], ['cancelled']],
    packing: [['shipping'], ['cancelled']],
    shipping: [['delivered']],
    delivered: [],
    cancelled: [],
  };
  return { inline_keyboard: next[order.status].map((row) => row.map(b)) };
}

/** Timeline the customer sees in chat (mirrored on the site and in the Mini App). */
export function timelineText(order: OrderRecord): string {
  if (order.status === 'cancelled') return '❌ Buyurtma bekor qilindi';
  const reached = TIMELINE.indexOf(order.status);
  return TIMELINE.map((status, i) => {
    const mark = i < reached ? '✅' : i === reached ? '👉' : '▫️';
    return `${mark} ${statusInfo[status].label}${i === reached ? ' — <b>hozir</b>' : ''}`;
  }).join('\n');
}

const customerHeadline: Record<OrderStatus, string> = {
  new: '✅ <b>Buyurtmangiz qabul qilindi!</b>',
  confirmed: '🎉 <b>Buyurtmangiz tasdiqlandi!</b>',
  packing: "📦 <b>Buyurtmangiz yig'ilmoqda</b>",
  shipping: "🚚 <b>Buyurtmangiz yo'lda!</b>",
  delivered: '🏁 <b>Buyurtma yetkazildi. Xaridingiz uchun rahmat!</b> 🧡',
  cancelled: '😔 <b>Buyurtma bekor qilindi</b>',
};

export function customerText(order: OrderRecord): string {
  return [
    customerHeadline[order.status],
    `Raqam: <b>${order.id}</b> · Jami: <b>${formatPrice(order.total)}</b>`,
    '',
    timelineText(order),
  ].join('\n');
}

// ---------- Recipients ----------

async function staffChats(): Promise<number[]> {
  const ids = new Set((await listStaff()).map((s) => s.chatId));
  const owner = Number(process.env.TELEGRAM_CHAT_ID);
  if (owner) ids.add(owner);
  return [...ids];
}

async function notifyStaffNew(order: OrderRecord) {
  await Promise.all(
    (await staffChats()).map(async (chatId) => {
      const sent = await tgCall<{ message_id: number }>('sendMessage', {
        chat_id: chatId,
        parse_mode: 'HTML',
        text: staffText(order),
        reply_markup: staffKeyboard(order),
        disable_web_page_preview: true,
      });
      if (sent?.message_id) await rememberStaffMessage(order.id, chatId, sent.message_id);
    }),
  );
}

/** Changes the status everywhere: DB, every staff copy of the order, and the customer's chat. */
export async function applyStatus(id: string, status: OrderStatus, by?: string): Promise<OrderRecord | null> {
  const before = await getOrder(id);
  if (!before) return null;
  if (before.status === status) return before;
  const order = await setOrderStatus(id, status, by);
  if (!order) return null;

  await Promise.all([
    ...(await staffMessages(id)).map((m) =>
      tg('editMessageText', {
        chat_id: m.chat_id,
        message_id: m.message_id,
        parse_mode: 'HTML',
        text: staffText(order),
        reply_markup: staffKeyboard(order),
        disable_web_page_preview: true,
      }),
    ),
    order.tgId
      ? tg('sendMessage', {
          chat_id: order.tgId,
          parse_mode: 'HTML',
          text: customerText(order),
          reply_markup: { inline_keyboard: [[{ text: '📦 Buyurtmalarim', callback_data: 'orders' }]] },
        })
      : Promise.resolve(true),
  ]);
  return order;
}

// ---------- Placing ----------

/** Validates, prices from our catalog (never from the client), stores, then tells staff and the customer. */
export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  const phoneDigits = String(input.phone ?? '').replace(/\D/g, '');
  if (!input.name || phoneDigits.length < 12) return { ok: false, error: 'missing_contact' };

  const items = (Array.isArray(input.items) ? input.items : [])
    .slice(0, 50)
    .map((item) => {
      const product = products.find((p) => p.slug === item?.slug);
      if (!product) return null;
      const qty = Math.min(Math.max(Math.floor(Number(item?.qty) || 0), 1), 20);
      return {
        slug: product.slug,
        name: product.name,
        size: String(item.size ?? '').slice(0, 10),
        color: String(item.color ?? '').slice(0, 30),
        qty,
        price: product.price,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  if (items.length === 0) return { ok: false, error: 'empty_cart' };

  const delivery = input.delivery === 'pickup' ? 'pickup' : 'courier';
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = shippingFor(subtotal, delivery, input.region);
  const branch = branches.find((b) => b.id === input.branchId);
  const now = Date.now();

  const order: OrderRecord = {
    id: orderNumber(),
    token: randomBytes(12).toString('hex'),
    createdAt: now,
    status: 'new',
    source: input.source,
    name: String(input.name).slice(0, 80),
    phone: String(input.phone).slice(0, 20),
    tgId: input.customer?.id ?? null,
    tgUsername: input.customer?.username ?? null,
    delivery,
    region: input.region ? String(input.region).slice(0, 60) : null,
    address: input.address ? String(input.address).slice(0, 300) : null,
    lat: validCoord(input.lat, 90),
    lon: validCoord(input.lon, 180),
    branchId: branch?.id ?? null,
    payment: input.payment === 'card' ? 'card' : 'cash',
    comment: input.comment ? String(input.comment).slice(0, 500) : null,
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    history: [{ status: 'new', at: now }],
  };

  try {
    await saveOrder(order);
  } catch (error) {
    console.error('[order] save failed', error);
    return { ok: false, error: 'save_failed' };
  }

  // Notifications are best effort: the order is already safe in the database / admin panel.
  await Promise.all([
    notifyStaffNew(order),
    order.tgId
      ? tg('sendMessage', {
          chat_id: order.tgId,
          parse_mode: 'HTML',
          text: [
            customerText(order),
            '',
            ...order.items.map((item) => `• ${esc(item.name)} — ${esc(item.size)} × ${item.qty}`),
            '',
            "Operatorimiz tez orada qo'ng'iroq qilib tasdiqlaydi. Holat o'zgarsa — shu yerga yozamiz. 🧡",
          ].join('\n'),
          reply_markup: {
            inline_keyboard: [[{ text: '📦 Buyurtmalarim', callback_data: 'orders' }, { text: '🛍 Yana xarid', callback_data: 'm' }]],
          },
        })
      : Promise.resolve(true),
  ]);

  return { ok: true, id: order.id, token: order.token, total: formatPrice(order.total) };
}
