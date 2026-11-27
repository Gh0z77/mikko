import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { products, searchProducts } from './products';
import { discountPercent, formatPrice } from './format';
import { freeShippingThreshold, instagramUrl, shippingFor, storePhone } from './nav';
import { branches } from './branches';
import { esc, tg, tgCall } from './telegram';
import { httpsSiteUrl } from './site';
import { applyStatus, customerText, placeOrder, staffKeyboard, staffText } from './order';
import { reverseGeocode } from './geocode';
import {
  addStaff,
  bumpInterest,
  getOrder,
  isStaff,
  kvGet,
  kvSet,
  listOrders,
  ordersForTelegram,
  rememberStaffMessage,
  removeStaff,
  topInterests,
} from './db';
import { isStatus, statusInfo } from './orderStatus';
import type { Product } from './types';

// ---------- Telegram types (only what we read) ----------

interface Chat {
  id: number;
  type: string;
}
interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}
interface Message {
  message_id: number;
  chat: Chat;
  from?: User;
  text?: string;
  photo?: unknown[];
  contact?: { phone_number: string };
  location?: { latitude: number; longitude: number };
}
export interface Update {
  message?: Message;
  callback_query?: { id: string; from: User; data?: string; message?: Message };
}

// ---------- Session (persisted in SQLite so restarts don't lose carts) ----------

interface Line {
  p: number; // index in `products`
  size: string;
  qty: number;
}
interface Session {
  cart: Line[];
  step?: 'address' | 'phone';
  kind?: 'bux' | 'tash' | 'reg';
  region?: string;
  delivery?: 'courier' | 'pickup';
  payment?: 'cash' | 'card';
  address?: string;
  lat?: number;
  lon?: number;
  branchId?: string;
  phone?: string;
  fy?: string[]; // "for you" product slugs, frozen while browsing
}

async function loadSession(chatId: number): Promise<Session> {
  const s = (await kvGet<Session>(`session:${chatId}`)) ?? { cart: [] };
  s.cart = (s.cart ?? []).filter((line) => products[line.p]);
  return s;
}
const saveSession = (chatId: number, s: Session) => kvSet(`session:${chatId}`, s, 60 * 60 * 24 * 30);

// ---------- Catalog ----------

type Cat = 'new' | 'sale' | 'boys' | 'girls' | 'baby' | 'shoes' | 'accessories' | 'fy';

const catTitles: Record<Cat, string> = {
  new: '🆕 Yangi kelganlar',
  sale: '🔥 Aksiyalar',
  boys: "👦 O'g'il bolalar",
  girls: '👧 Qizlar',
  baby: '👶 Chaqaloqlar',
  shoes: '👟 Oyoq kiyimlar',
  accessories: '🧸 Aksessuarlar',
  fy: '🎯 Siz uchun',
};
const isCat = (value: string): value is Cat => value in catTitles;

function listFor(cat: Cat, s: Session): Product[] {
  if (cat === 'fy') return (s.fy ?? []).map((slug) => products.find((p) => p.slug === slug)).filter((p): p is Product => Boolean(p));
  if (cat === 'new') return [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);
  if (cat === 'sale') return products.filter((p) => p.oldPrice);
  return products.filter((p) => p.category === cat);
}

/** Ranks the catalog by what this person looked at and added (categories + products). */
async function forYou(chatId: number): Promise<string[]> {
  const scores = new Map((await topInterests(chatId, 20)).map((row) => [row.key, row.score]));
  if (!scores.size) return [];
  return products
    .map((p) => ({ p, score: (scores.get(`cat:${p.category}`) ?? 0) + 2 * (scores.get(`p:${p.slug}`) ?? 0) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((row) => row.p.slug);
}

const httpsSite = httpsSiteUrl;
const cartCount = (s: Session) => s.cart.reduce((sum, line) => sum + line.qty, 0);
const cartTotal = (s: Session) => s.cart.reduce((sum, line) => sum + products[line.p].price * line.qty, 0);
const tgImage = (image: string) => image.replace('/images/', '/images/tg/').replace(/\.webp$/, '.jpg');
const fullName = (user?: User) => [user?.first_name, user?.last_name].filter(Boolean).join(' ');

// ---------- Rendering ----------

type Btn = { text: string; callback_data?: string; url?: string; web_app?: { url: string } };
const cb = (text: string, data: string): Btn => ({ text, callback_data: data });

interface View {
  photo?: string;
  text: string;
  keyboard?: { inline_keyboard: unknown[][] };
}
interface Ctx {
  chatId: number;
  messageId?: number;
  isPhoto?: boolean;
}

async function photoRef(publicPath: string) {
  const https = httpsSite();
  if (https) return { ref: `${https}${publicPath}` };
  const cached = await kvGet<string>(`file:${publicPath}`);
  if (cached) return { ref: cached };
  const data = new Uint8Array(await readFile(path.join(process.cwd(), 'public', publicPath)));
  return { ref: 'attach://photo', file: { field: 'photo', data, name: path.basename(publicPath) } };
}

async function rememberFileId(publicPath: string, message: { photo?: { file_id: string }[] } | null) {
  const id = message?.photo?.at(-1)?.file_id;
  if (id) await kvSet(`file:${publicPath}`, id);
}

/** Edits the current message in place when possible (smooth carousel), otherwise sends a new one. */
async function render(ctx: Ctx, view: View) {
  const base = { chat_id: ctx.chatId, parse_mode: 'HTML', reply_markup: view.keyboard };

  if (ctx.messageId && view.photo && ctx.isPhoto) {
    const { ref, file } = await photoRef(view.photo);
    const media = { type: 'photo', media: ref, caption: view.text, parse_mode: 'HTML' };
    const result = await tgCall<{ photo?: { file_id: string }[] }>(
      'editMessageMedia',
      { chat_id: ctx.chatId, message_id: ctx.messageId, media, reply_markup: view.keyboard },
      file,
    );
    if (file) await rememberFileId(view.photo, result);
    if (result) return;
  } else if (ctx.messageId && !view.photo && !ctx.isPhoto) {
    if (await tgCall('editMessageText', { ...base, message_id: ctx.messageId, text: view.text, disable_web_page_preview: true })) return;
  }

  // Delete the old screen without waiting — Telegram handles it in parallel with the new one.
  if (ctx.messageId) void tg('deleteMessage', { chat_id: ctx.chatId, message_id: ctx.messageId });

  if (view.photo) {
    const { ref, file } = await photoRef(view.photo);
    const sent = await tgCall<{ photo?: { file_id: string }[] }>('sendPhoto', { ...base, photo: ref, caption: view.text }, file);
    if (file) await rememberFileId(view.photo, sent);
  } else {
    await tg('sendMessage', { ...base, text: view.text, disable_web_page_preview: true });
  }
}

// ---------- Customer views ----------

async function mainMenu(chatId: number, s: Session): Promise<View['keyboard']> {
  const https = httpsSite();
  const rows: Btn[][] = [];
  if (https) rows.push([{ text: "🛍 Do'konni ochish", web_app: { url: `${https}/app` } }]);
  rows.push([cb(catTitles.new, 'c:new:0'), cb(catTitles.sale, 'c:sale:0')]);
  if ((await topInterests(chatId, 1)).length) rows.push([cb('🎯 Siz uchun tanladik', 'c:fy:0')]);
  rows.push([cb("👕 Katalog — barcha bo'limlar", 'cats')]);
  const count = cartCount(s);
  if (count) rows.push([cb(`🛒 Savat · ${count} ta · ${formatPrice(cartTotal(s))}`, 'cart')]);
  rows.push([cb('📦 Buyurtmalarim', 'orders')]);
  rows.push([cb('📍 Filiallar', 'addr'), cb("📞 Bog'lanish", 'contact')]);
  return { inline_keyboard: rows };
}

async function welcomeView(chatId: number, s: Session, name: string): Promise<View> {
  return {
    photo: '/images/tg/welcome.jpg',
    text: [
      `Assalomu alaykum${name ? `, <b>${esc(name, 40)}</b>` : ''}! 🧸`,
      '',
      "<b>MIKKO</b> — bolalar kiyim do'koniga xush kelibsiz! Buxoro va Toshkentda.",
      "Kiyimlarni shu yerda ko'ring, o'lchamni tanlang va bir necha bosishda buyurtma bering. 🧡",
      '',
      '👇 Qayerdan boshlaymiz?',
    ].join('\n'),
    keyboard: await mainMenu(chatId, s),
  };
}

function categoriesView(s: Session): View {
  const cats: Cat[] = ['boys', 'girls', 'baby', 'shoes', 'accessories', 'new', 'sale'];
  const buttons = cats.map((cat) => cb(`${catTitles[cat]} (${listFor(cat, s).length})`, `c:${cat}:0`));
  const rows: Btn[][] = [];
  for (let i = 0; i < buttons.length; i += 2) rows.push(buttons.slice(i, i + 2));
  rows.push([cb('⬅️ Bosh menyu', 'm')]);
  return { text: "👕 <b>Katalog</b>\n\nBo'limni tanlang:", keyboard: { inline_keyboard: rows } };
}

function productView(s: Session, list: Product[], index: number, key: string): View {
  const n = list.length;
  const i = ((index % n) + n) % n;
  const product = list[i];
  const p = products.indexOf(product);
  const discount = discountPercent(product.price, product.oldPrice);
  const price = [
    `💰 <b>${formatPrice(product.price)}</b>`,
    product.oldPrice ? `<s>${formatPrice(product.oldPrice)}</s>` : '',
    discount ? `🔻 -${discount}%` : '',
  ]
    .filter(Boolean)
    .join('  ');

  const text = [
    key === 'fy' ? '🎯 <i>Siz uchun tanladik</i>\n' : '',
    `${product.badge === 'new' ? '🆕 ' : product.badge === 'hit' ? '⭐️ ' : ''}<b>${esc(product.name)}</b>`,
    '',
    price,
    '',
    esc(product.description, 400),
    '',
    `🧵 ${esc(product.material, 120)}`,
    '',
    "📏 <i>O'lchamni bosing — savatga qo'shiladi</i>",
  ].join('\n');

  const sizeButtons = product.sizes.map((size) => cb(size, `a:${p}:${size}:${key}:${i}`));
  const rows: Btn[][] = [];
  for (let j = 0; j < sizeButtons.length; j += 5) rows.push(sizeButtons.slice(j, j + 5));
  if (n > 1) rows.push([cb('◀️', `c:${key}:${i - 1}`), cb(`${i + 1} / ${n}`, 'noop'), cb('▶️', `c:${key}:${i + 1}`)]);
  const https = httpsSite();
  if (https) rows.push([{ text: '📱 Ilovada ochish', web_app: { url: `${https}/app?p=${product.slug}` } }]);
  const count = cartCount(s);
  rows.push([cb(count ? `🛒 Savat (${count})` : '🛒 Savat', 'cart'), cb(key === 'v' ? '⬅️ Menyu' : "⬅️ Bo'limlar", key === 'v' ? 'm' : 'cats')]);
  return { photo: tgImage(product.images[0]), text, keyboard: { inline_keyboard: rows } };
}

function cartView(s: Session): View {
  if (!s.cart.length) {
    return {
      text: "🛒 <b>Savatingiz bo'sh</b>\n\nKatalogdan yoqqan kiyimni tanlang — o'lchamni bossangiz, shu yerga tushadi.",
      keyboard: { inline_keyboard: [[cb('👕 Katalog', 'cats')], [cb('⬅️ Bosh menyu', 'm')]] },
    };
  }
  const subtotal = cartTotal(s);
  const left = freeShippingThreshold - subtotal;
  const rows: Btn[][] = s.cart.map((line, i) => [cb('➖', `q:-:${i}`), cb(`${i + 1}. ${line.qty} dona`, 'noop'), cb('➕', `q:+:${i}`), cb('🗑', `q:x:${i}`)]);
  rows.push([cb('✅ Buyurtma berish', 'co')]);
  rows.push([cb('🧹 Tozalash', 'clr'), cb('👕 Katalog', 'cats')]);
  return {
    text: [
      '🛒 <b>Savatingiz</b>',
      '',
      ...s.cart.map((line, i) => {
        const product = products[line.p];
        return `${i + 1}. <b>${esc(product.name)}</b>\n    📏 ${esc(line.size)} · ${line.qty} dona · ${formatPrice(product.price * line.qty)}`;
      }),
      '',
      `Jami: <b>${formatPrice(subtotal)}</b>`,
      left > 0 ? `🚚 Yana ${formatPrice(left)} lik xarid qilsangiz — yetkazib berish bepul!` : '🎉 Yetkazib berish bepul!',
    ].join('\n'),
    keyboard: { inline_keyboard: rows },
  };
}

function summaryView(s: Session, name: string): View {
  const subtotal = cartTotal(s);
  const shipping = shippingFor(subtotal, s.delivery, s.region);
  const branch = branches.find((b) => b.id === s.branchId);
  return {
    text: [
      '🧾 <b>Buyurtmani tekshiring</b>',
      '',
      ...s.cart.map((line) => `• ${esc(products[line.p].name)} — ${esc(line.size)} × ${line.qty} = ${formatPrice(products[line.p].price * line.qty)}`),
      '',
      `👤 ${esc(name, 60)} · ${esc(s.phone)}`,
      s.delivery === 'pickup' ? `🏬 Olib ketish: ${esc(branch?.name ?? '')}` : `🚚 ${esc(s.region)}, ${esc(s.address)}`,
      `💳 To'lov: ${s.payment === 'card' ? 'karta' : 'naqd'} (yetkazishda)`,
      '',
      `Yetkazish: ${shipping === 0 ? 'bepul' : formatPrice(shipping)}`,
      `<b>Jami: ${formatPrice(subtotal + shipping)}</b>`,
    ].join('\n'),
    keyboard: { inline_keyboard: [[cb('✅ Tasdiqlash', 'ok')], [cb('✏️ Savatga qaytish', 'cart')]] },
  };
}

async function ordersView(chatId: number): Promise<View> {
  const orders = await ordersForTelegram(chatId, 5);
  if (!orders.length) {
    return {
      text: "📦 <b>Buyurtmalarim</b>\n\nHozircha buyurtmalar yo'q. Birinchisini qilamizmi? 🙂",
      keyboard: { inline_keyboard: [[cb('👕 Katalog', 'cats')], [cb('⬅️ Bosh menyu', 'm')]] },
    };
  }
  return {
    text: [
      '📦 <b>Buyurtmalarim</b>',
      ...orders.map((order) => customerText(order).replace(/^.*\n/, `<b>${order.id}</b> · ${new Date(order.createdAt).toLocaleDateString('uz-UZ')}\n`)),
    ].join('\n\n'),
    keyboard: { inline_keyboard: [[cb('🔄 Yangilash', 'orders')], [cb('⬅️ Bosh menyu', 'm')]] },
  };
}

function branchesView(): View {
  const lines = branches.map((b) =>
    [
      `🏬 <b>${esc(b.name)}</b>`,
      b.address ? `📍 ${esc(b.address)}${b.landmark ? ` (${esc(b.landmark)})` : ''}` : "📍 Manzil tez orada e'lon qilinadi",
      b.phone ? `📞 ${esc(b.phone)}` : null,
      `🕘 ${esc(b.hours)}`,
    ]
      .filter(Boolean)
      .join('\n'),
  );
  const pins = branches.filter((b) => b.coords).map((b) => [cb(`🗺 ${b.name.replace('MIKKO ', '')}`, `br:${b.id}`)]);
  return { text: ['📍 <b>Filiallarimiz</b>', ...lines].join('\n\n'), keyboard: { inline_keyboard: [...pins, [cb('⬅️ Bosh menyu', 'm')]] } };
}

const contactText = [
  "📞 <b>Biz bilan bog'lanish</b>",
  '',
  ...branches.filter((b) => b.phone).map((b) => `${esc(b.name.replace('MIKKO ', ''))}: ${esc(b.phone)}`),
  `Instagram: <a href="${instagramUrl}">@mikko_uz</a>`,
  '',
  "Savolingiz bo'lsa, shu yerga yozib qoldiring yoki qo'ng'iroq qiling. 🧡",
].join('\n');

const backToMenu = { inline_keyboard: [[cb('⬅️ Bosh menyu', 'm')]] };

const paymentKeyboard = (s: Session) => ({
  inline_keyboard: [
    [cb('💵 Naqd', 'pay:cash'), cb('💳 Karta', 'pay:card')],
    ...(s.delivery === 'courier' ? [[cb("✏️ Manzilni o'zgartirish", `d:${s.kind ?? 'bux'}`)]] : []),
  ],
});

// ---------- Checkout helpers ----------

async function askAddress(chatId: number, s: Session) {
  s.step = 'address';
  await tg('sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text: "📍 <b>Manzilni yuboring</b>\n\nPastdagi tugma joylashuvingizni avtomatik aniqlaydi — yoki manzilni yozing:\n<i>mahalla, ko'cha, uy, xonadon</i>",
    reply_markup: { keyboard: [[{ text: '📍 Joylashuvimni yuborish', request_location: true }]], resize_keyboard: true, one_time_keyboard: true },
  });
}

async function askPayment(chatId: number, s: Session, note?: string) {
  s.step = undefined;
  await tg('sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text: `${note ? `${note}\n\n` : ''}💳 <b>To'lov usuli</b>\nTo'lov kiyimni olganingizda amalga oshiriladi.`,
    reply_markup: paymentKeyboard(s),
  });
}

async function askPhone(chatId: number, s: Session) {
  s.step = 'phone';
  await tg('sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text: '📱 <b>Telefon raqamingizni yuboring</b>\n\nPastdagi tugmani bosing yoki raqamni yozing: <i>+998 90 123 45 67</i>',
    reply_markup: { keyboard: [[{ text: '📱 Raqamni yuborish', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
  });
}

function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 9) digits = `998${digits}`;
  if (digits.length !== 12 || !digits.startsWith('998')) return null;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
}

// ---------- Staff ----------

const isStaffChat = async (chatId: number) => String(chatId) === process.env.TELEGRAM_CHAT_ID || (await isStaff(chatId));

async function staffMenu(): Promise<View> {
  const active = (await listOrders({ limit: 100 })).filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  return {
    text: [
      '👩‍💼 <b>Xodimlar paneli</b>',
      '',
      `Faol buyurtmalar: <b>${active.length}</b>`,
      `Yangi: <b>${active.filter((o) => o.status === 'new').length}</b>`,
      '',
      'Yangi buyurtma tushsa — shu yerga darhol xabar keladi. 🔔',
    ].join('\n'),
    keyboard: {
      inline_keyboard: [
        ...active.slice(0, 12).map((o) => [cb(`${statusInfo[o.status].emoji} ${o.id} · ${o.name.slice(0, 14)} · ${formatPrice(o.total)}`, `so:${o.id}`)]),
        [cb('🔄 Yangilash', 'so:list')],
      ],
    },
  };
}

// ---------- Update handling ----------

export async function handleUpdate(update: Update) {
  const chatId = update.callback_query?.message?.chat.id ?? update.message?.chat.id;
  if (!chatId) return;
  const s = await loadSession(chatId);
  try {
    if (update.callback_query) await handleCallback(update.callback_query, s);
    else if (update.message) await handleMessage(update.message, s);
  } finally {
    await saveSession(chatId, s);
  }
}

async function handleMessage(message: Message, s: Session) {
  if (message.chat.type !== 'private') return; // group chatter (incl. a staff group)
  const chatId = message.chat.id;
  const text = (message.text ?? '').trim();
  const command = text.startsWith('/') ? text.split(/[\s@]/)[0].toLowerCase() : '';
  const arg = command ? (text.split(/\s+/)[1] ?? '') : '';
  const name = fullName(message.from);

  // Staff onboarding: /xodim <code> (code from the admin panel / STAFF_PIN).
  if (command === '/xodim') {
    if (await isStaffChat(chatId)) return render({ chatId }, await staffMenu());
    if (!process.env.STAFF_PIN || arg !== process.env.STAFF_PIN) {
      return tg('sendMessage', { chat_id: chatId, text: "🔒 Kod noto'g'ri. Kodni do'kon rahbaridan oling: /xodim KOD" });
    }
    await addStaff(chatId, name || null, message.from?.username ?? null);
    await tg('sendMessage', { chat_id: chatId, text: `✅ Xush kelibsiz, ${name || 'hamkasb'}! Endi yangi buyurtmalar shu yerga keladi.` });
    return render({ chatId }, await staffMenu());
  }
  if (command === '/chiqish' && (await isStaff(chatId))) {
    await removeStaff(chatId);
    return tg('sendMessage', { chat_id: chatId, text: "👋 Xodimlar ro'yxatidan chiqdingiz." });
  }

  if (command === '/start') {
    s.step = undefined;
    await tg('sendMessage', { chat_id: chatId, text: '👋', reply_markup: { remove_keyboard: true } });
    return render({ chatId }, await welcomeView(chatId, s, message.from?.first_name ?? ''));
  }
  if (command === '/katalog') return render({ chatId }, categoriesView(s));
  if (command === '/savat') return render({ chatId }, cartView(s));
  if (command === '/buyurtmalarim') return render({ chatId }, await ordersView(chatId));
  if (command === '/manzil') return render({ chatId }, branchesView());
  if (command === '/aloqa') return render({ chatId }, { text: contactText, keyboard: backToMenu });
  if (command === '/id') return tg('sendMessage', { chat_id: chatId, parse_mode: 'HTML', text: `Chat ID: <code>${chatId}</code>` });

  if (s.step === 'address' && message.location) {
    const { latitude: lat, longitude: lon } = message.location;
    s.lat = lat;
    s.lon = lon;
    const place = await reverseGeocode(lat, lon);
    s.address = place?.address ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    if (s.kind === 'reg' && place) s.region = place.region;
    await tg('sendMessage', { chat_id: chatId, text: '👌', reply_markup: { remove_keyboard: true } });
    return askPayment(chatId, s, `📍 <b>Manzil aniqlandi:</b>\n${esc(s.address)}\n<i>Kuryer aynan shu nuqtaga keladi.</i>`);
  }
  if (s.step === 'address' && text && !command) {
    s.address = text.slice(0, 300);
    s.lat = undefined;
    s.lon = undefined;
    await tg('sendMessage', { chat_id: chatId, text: '👌', reply_markup: { remove_keyboard: true } });
    return askPayment(chatId, s);
  }

  if (s.step === 'phone' && (message.contact || text)) {
    const phone = normalizePhone(message.contact?.phone_number ?? text);
    if (!phone) return tg('sendMessage', { chat_id: chatId, text: "Raqam noto'g'ri ko'rinadi 🙈 Masalan: +998 90 123 45 67" });
    s.phone = phone;
    s.step = undefined;
    await tg('sendMessage', { chat_id: chatId, text: '👌 Rahmat!', reply_markup: { remove_keyboard: true } });
    return render({ chatId }, summaryView(s, name));
  }

  // Free text = search.
  if (text && !command) {
    const found = searchProducts(text).slice(0, 8);
    if (found.length) {
      return render(
        { chatId },
        {
          text: `🔎 «${esc(text, 40)}» bo'yicha ${found.length} ta topildi:`,
          keyboard: { inline_keyboard: [...found.map((p) => [cb(`${p.name} — ${formatPrice(p.price)}`, `v:${products.indexOf(p)}`)]), [cb('⬅️ Bosh menyu', 'm')]] },
        },
      );
    }
  }

  return render({ chatId }, { text: 'Kechirasiz, tushunmadim 🙂 Kiyim nomini yozing (masalan: <i>sviter</i>) yoki menyudan tanlang 👇', keyboard: await mainMenu(chatId, s) });
}

async function handleCallback(query: NonNullable<Update['callback_query']>, s: Session) {
  const data = query.data ?? '';
  const message = query.message;
  if (!message) return tg('answerCallbackQuery', { callback_query_id: query.id });
  const chatId = message.chat.id;
  const ctx: Ctx = { chatId, messageId: message.message_id, isPhoto: Boolean(message.photo) };
  // Answer at once so the button spinner stops immediately; the work continues after.
  let answered = false;
  const answer = (text?: string) => {
    if (answered) return Promise.resolve(true);
    answered = true;
    return tg('answerCallbackQuery', { callback_query_id: query.id, text });
  };
  const quick = () => void answer();

  // ----- staff -----
  if (data.startsWith('st:')) {
    if (!(await isStaffChat(chatId))) return answer('Ruxsat yo‘q');
    const [, id, status] = data.split(':');
    if (!isStatus(status)) return answer();
    void answer(`${statusInfo[status].emoji} ${statusInfo[status].label}`);
    await rememberStaffMessage(id, chatId, message.message_id);
    await applyStatus(id, status, fullName(query.from) || 'Xodim');
    return;
  }
  if (data === 'so:list') {
    if (!(await isStaffChat(chatId))) return answer();
    quick();
    return render(ctx, await staffMenu());
  }
  if (data.startsWith('so:')) {
    if (!(await isStaffChat(chatId))) return answer();
    quick();
    const order = await getOrder(data.slice(3));
    if (!order) return;
    const sent = await tgCall<{ message_id: number }>('sendMessage', {
      chat_id: chatId,
      parse_mode: 'HTML',
      text: staffText(order),
      reply_markup: staffKeyboard(order),
      disable_web_page_preview: true,
    });
    if (sent?.message_id) await rememberStaffMessage(order.id, chatId, sent.message_id);
    return;
  }
  if (data.startsWith('oa:') || data.startsWith('or:')) return answer('Bu eski xabar — admin paneldan foydalaning');

  // ----- customer -----
  const name = fullName(query.from);
  if (data === 'noop') return answer();
  if (data === 'm') {
    quick();
    return render(ctx, await welcomeView(chatId, s, query.from.first_name ?? ''));
  }
  if (data === 'cats') {
    quick();
    return render(ctx, categoriesView(s));
  }
  if (data === 'orders') {
    quick();
    return render(ctx, await ordersView(chatId));
  }
  if (data === 'addr') {
    quick();
    return render(ctx, branchesView());
  }
  if (data === 'contact') {
    quick();
    return render(ctx, { text: contactText, keyboard: backToMenu });
  }
  if (data.startsWith('br:')) {
    const branch = branches.find((b) => b.id === data.slice(3));
    quick();
    if (!branch?.coords) return;
    return tg('sendVenue', {
      chat_id: chatId,
      latitude: branch.coords.lat,
      longitude: branch.coords.lon,
      title: branch.name,
      address: [branch.address, branch.landmark].filter(Boolean).join(', '),
    });
  }

  if (data.startsWith('c:')) {
    const [, cat, index] = data.split(':');
    if (!isCat(cat)) return answer();
    quick();
    if (cat === 'fy' && (index === '0' || !s.fy?.length)) s.fy = await forYou(chatId);
    const list = listFor(cat, s);
    if (!list.length) return render(ctx, { text: "Hozircha bu yerda hech narsa yo'q 🙂", keyboard: backToMenu });
    if (cat !== 'fy' && cat !== 'new' && cat !== 'sale' && index === '0') await bumpInterest(chatId, `cat:${cat}`);
    return render(ctx, productView(s, list, Number(index) || 0, cat));
  }
  if (data.startsWith('v:')) {
    const product = products[Number(data.slice(2))];
    if (!product) return answer();
    quick();
    await bumpInterest(chatId, `p:${product.slug}`);
    return render(ctx, productView(s, [product], 0, 'v'));
  }
  if (data.startsWith('a:')) {
    const [, pi, size, key, i] = data.split(':');
    const product = products[Number(pi)];
    if (!product || !product.sizes.includes(size)) return answer();
    const existing = s.cart.find((line) => line.p === Number(pi) && line.size === size);
    if (existing) existing.qty = Math.min(existing.qty + 1, 20);
    else s.cart.push({ p: Number(pi), size, qty: 1 });
    void answer(`✅ Savatga qo'shildi: ${product.name}, ${size}`);
    await Promise.all([bumpInterest(chatId, `p:${product.slug}`, 2), bumpInterest(chatId, `cat:${product.category}`)]);
    const list = isCat(key) ? listFor(key, s) : [product];
    const view = productView(s, list.length ? list : [product], Number(i) || 0, key);
    return tg('editMessageReplyMarkup', { chat_id: chatId, message_id: message.message_id, reply_markup: view.keyboard });
  }

  if (data === 'cart') {
    quick();
    return render(ctx, cartView(s));
  }
  if (data.startsWith('q:')) {
    const [, op, idx] = data.split(':');
    const line = s.cart[Number(idx)];
    if (line) {
      if (op === '+') line.qty = Math.min(line.qty + 1, 20);
      if (op === '-') line.qty -= 1;
      if (op === 'x' || line.qty <= 0) s.cart.splice(Number(idx), 1);
    }
    quick();
    return render(ctx, cartView(s));
  }
  if (data === 'clr') {
    s.cart = [];
    void answer('Savat tozalandi');
    return render(ctx, cartView(s));
  }

  // ----- checkout -----
  if (data === 'co') {
    if (!s.cart.length) return answer("Savat bo'sh");
    quick();
    return render(ctx, {
      text: '🚚 <b>Qanday yetkazamiz?</b>',
      keyboard: {
        inline_keyboard: [
          [cb('🚚 Buxoro shahri', 'd:bux'), cb('🚚 Toshkent shahri', 'd:tash')],
          [cb('📦 Boshqa viloyat', 'd:reg')],
          [cb("🏬 Filialdan o'zim olib ketaman", 'd:pickup')],
          [cb('⬅️ Savatga qaytish', 'cart')],
        ],
      },
    });
  }
  if (data === 'd:pickup') {
    quick();
    const open = branches.filter((b) => b.address);
    return render(ctx, {
      text: '🏬 <b>Qaysi filialdan olib ketasiz?</b>',
      keyboard: { inline_keyboard: [...open.map((b) => [cb(b.name.replace('MIKKO ', ''), `pb:${b.id}`)]), [cb('⬅️ Orqaga', 'co')]] },
    });
  }
  if (data.startsWith('pb:')) {
    const branch = branches.find((b) => b.id === data.slice(3));
    if (!branch) return answer();
    quick();
    s.delivery = 'pickup';
    s.branchId = branch.id;
    s.region = `${branch.city} shahri`;
    void tg('deleteMessage', { chat_id: chatId, message_id: message.message_id });
    return askPayment(chatId, s, `🏬 <b>${esc(branch.name)}</b>\n${esc(branch.address)}${branch.landmark ? ` (${esc(branch.landmark)})` : ''}`);
  }
  if (data.startsWith('d:')) {
    const kind = data.slice(2);
    if (kind !== 'bux' && kind !== 'tash' && kind !== 'reg') return answer();
    quick();
    s.delivery = 'courier';
    s.kind = kind;
    s.branchId = undefined;
    s.region = kind === 'tash' ? 'Toshkent shahri' : kind === 'reg' ? 'Viloyat' : 'Buxoro shahri';
    void tg('deleteMessage', { chat_id: chatId, message_id: message.message_id });
    return askAddress(chatId, s);
  }
  if (data.startsWith('pay:')) {
    s.payment = data === 'pay:card' ? 'card' : 'cash';
    quick();
    void tg('deleteMessage', { chat_id: chatId, message_id: message.message_id });
    return askPhone(chatId, s);
  }
  if (data === 'ok') {
    if (!s.cart.length || !s.phone) return answer('Avval savatni to‘ldiring');
    void answer('Yuborilmoqda...');
    const result = await placeOrder({
      name: name || 'Telegram mijoz',
      phone: s.phone,
      region: s.region,
      address: s.address,
      lat: s.lat,
      lon: s.lon,
      branchId: s.branchId,
      delivery: s.delivery,
      payment: s.payment,
      items: s.cart.map((line) => ({
        slug: products[line.p].slug,
        size: line.size,
        color: products[line.p].colors[0]?.name ?? 'Standart',
        qty: line.qty,
      })),
      customer: { id: chatId, first_name: query.from.first_name, username: query.from.username },
      source: 'bot',
    });
    if (!result.ok) {
      return render(ctx, {
        text: `😔 Kechirasiz, buyurtmani hozir yubora olmadik.\n\nIltimos, qo'ng'iroq qiling: <b>${esc(storePhone)}</b>`,
        keyboard: { inline_keyboard: [[cb('🔁 Qayta urinish', 'ok')], [cb('⬅️ Bosh menyu', 'm')]] },
      });
    }
    s.cart = [];
    s.step = undefined;
    void tg('deleteMessage', { chat_id: chatId, message_id: message.message_id });
    await tg('sendMessage', { chat_id: chatId, text: '🎉' }); // a lone emoji animates full-size
    return;
  }

  return answer();
}
