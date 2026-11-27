import path from 'node:path';
import type { OrderRecord, OrderStatus } from './orderStatus';

/*
 * Storage with two interchangeable backends:
 *  - Supabase Postgres over its REST API (used when SUPABASE_URL + SUPABASE_SECRET_KEY are set,
 *    e.g. on Vercel) — survives serverless restarts. Tables: supabase/schema.sql.
 *  - SQLite file (node:sqlite) for local development and the local polling bot.
 */

export interface StaffMember {
  chatId: number;
  name: string | null;
  username: string | null;
  addedAt: number;
}

/** Next.js data-cache hint for reads that may be cached (invalidated with revalidateTag). */
export interface CacheHint {
  tags: string[];
  revalidate: number;
}

interface Store {
  kvGet<T>(key: string, cache?: CacheHint): Promise<T | null>;
  kvSet(key: string, value: unknown, ttlSec?: number): Promise<void>;
  saveOrder(order: OrderRecord): Promise<void>;
  getOrder(id: string): Promise<OrderRecord | null>;
  listOrders(limit: number): Promise<OrderRecord[]>;
  ordersForTelegram(tgId: number, limit: number): Promise<OrderRecord[]>;
  listStaff(): Promise<StaffMember[]>;
  isStaff(chatId: number): Promise<boolean>;
  addStaff(member: StaffMember): Promise<void>;
  removeStaff(chatId: number): Promise<void>;
  rememberStaffMessage(orderId: string, chatId: number, messageId: number): Promise<void>;
  staffMessages(orderId: string): Promise<{ chat_id: number; message_id: number }[]>;
  bumpInterest(tgId: number, key: string, by: number): Promise<void>;
  topInterests(tgId: number, limit: number): Promise<{ key: string; score: number }[]>;
}

const parse = <T>(value: unknown): T | null => (typeof value === 'string' ? (JSON.parse(value) as T) : null);

// ---------------- Supabase (PostgREST over fetch, no SDK needed) ----------------

function supabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

function supabaseStore(cfg: { url: string; key: string }): Store {
  const rest = async (path: string, init: RequestInit = {}, prefer?: string, hint?: CacheHint): Promise<unknown> => {
    const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: cfg.key,
        ...(cfg.key.startsWith('sb_') ? {} : { Authorization: `Bearer ${cfg.key}` }), // legacy JWT keys need it
        'Content-Type': 'application/json',
        ...(prefer ? { Prefer: prefer } : {}),
      },
      ...(hint ? ({ next: hint } as RequestInit) : { cache: 'no-store' }),
    });
    if (!response.ok) throw new Error(`supabase ${init.method ?? 'GET'} ${path.split('?')[0]}: ${response.status} ${await response.text()}`);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };
  const upsert = (table: string, row: unknown, conflict: string) =>
    rest(`${table}?on_conflict=${conflict}`, { method: 'POST', body: JSON.stringify(row) }, 'resolution=merge-duplicates,return=minimal');
  const enc = encodeURIComponent;
  const dataOf = <T>(rows: unknown) => ((rows as { data: T }[] | null) ?? []).map((r) => r.data);

  return {
    kvGet: async <T>(key: string, hint?: CacheHint) => {
      const rows = (await rest(`kv?k=eq.${enc(key)}&select=v,expires_at`, {}, undefined, hint)) as { v: T; expires_at: number | null }[];
      const row = rows[0];
      return row && (!row.expires_at || row.expires_at > Date.now()) ? row.v : null;
    },
    kvSet: async (key, value, ttlSec) => {
      await upsert('kv', { k: key, v: value, expires_at: ttlSec ? Date.now() + ttlSec * 1000 : null }, 'k');
    },
    saveOrder: async (o) => {
      await upsert('orders', { id: o.id, created_at: o.createdAt, status: o.status, tg_id: o.tgId, data: o }, 'id');
    },
    getOrder: async (id) => dataOf<OrderRecord>(await rest(`orders?id=eq.${enc(id)}&select=data`))[0] ?? null,
    listOrders: async (limit) => dataOf<OrderRecord>(await rest(`orders?select=data&order=created_at.desc&limit=${limit}`)),
    ordersForTelegram: async (tgId, limit) =>
      dataOf<OrderRecord>(await rest(`orders?tg_id=eq.${tgId}&select=data&order=created_at.desc&limit=${limit}`)),
    listStaff: async () => dataOf<StaffMember>(await rest('staff?select=data&order=added_at.asc')),
    isStaff: async (chatId) => ((await rest(`staff?chat_id=eq.${chatId}&select=chat_id`)) as unknown[]).length > 0,
    addStaff: async (m) => {
      await upsert('staff', { chat_id: m.chatId, added_at: m.addedAt, data: m }, 'chat_id');
    },
    removeStaff: async (chatId) => {
      await rest(`staff?chat_id=eq.${chatId}`, { method: 'DELETE' }, 'return=minimal');
    },
    rememberStaffMessage: async (orderId, chatId, messageId) => {
      await upsert('staff_messages', { order_id: orderId, chat_id: chatId, message_id: messageId }, 'order_id,chat_id');
    },
    staffMessages: async (orderId) =>
      ((await rest(`staff_messages?order_id=eq.${enc(orderId)}&select=chat_id,message_id`)) as { chat_id: number; message_id: number }[]) ?? [],
    bumpInterest: async (tgId, key, by) => {
      await rest('rpc/bump_interest', { method: 'POST', body: JSON.stringify({ p_tg_id: tgId, p_key: key, p_by: by }) });
    },
    topInterests: async (tgId, limit) =>
      ((await rest(`interests?tg_id=eq.${tgId}&select=key,score&order=score.desc&limit=${limit}`)) as { key: string; score: number }[]) ?? [],
  };
}

// ---------------- SQLite (local) ----------------

async function sqliteStore(): Promise<Store> {
  // Loaded lazily so serverless builds that use Supabase never touch node:sqlite.
  const { DatabaseSync } = await import('node:sqlite');
  const { mkdirSync } = await import('node:fs');
  const onVercel = Boolean(process.env.VERCEL);
  if (onVercel) console.error('[db] No Supabase configured on Vercel — using a temporary SQLite in /tmp. Data WILL be lost. Set SUPABASE_URL + SUPABASE_SECRET_KEY.');
  const file = process.env.MIKKO_DB ?? (onVercel ? '/tmp/mikko.db' : path.join(process.cwd(), '.data', 'mikko.db'));
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });
  const d = new DatabaseSync(file);
  d.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 4000;
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, status TEXT NOT NULL, tg_id INTEGER, data TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS orders_created ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS orders_tg ON orders(tg_id);
    CREATE TABLE IF NOT EXISTS staff (chat_id INTEGER PRIMARY KEY, name TEXT, username TEXT, added_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS staff_messages (order_id TEXT NOT NULL, chat_id INTEGER NOT NULL, message_id INTEGER NOT NULL, PRIMARY KEY (order_id, chat_id));
    CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS interests (tg_id INTEGER NOT NULL, key TEXT NOT NULL, score REAL NOT NULL, PRIMARY KEY (tg_id, key));
  `);
  const orders = (rows: unknown[]) => (rows as { data: string }[]).map((r) => JSON.parse(r.data) as OrderRecord);

  return {
    kvGet: async (key) => parse((d.prepare('SELECT v FROM kv WHERE k = ?').get(key) as { v: string } | undefined)?.v),
    kvSet: async (key, value) => {
      d.prepare('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v').run(key, JSON.stringify(value));
    },
    saveOrder: async (o) => {
      d.prepare(
        'INSERT INTO orders (id, created_at, status, tg_id, data) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET status = excluded.status, data = excluded.data',
      ).run(o.id, o.createdAt, o.status, o.tgId, JSON.stringify(o));
    },
    getOrder: async (id) => parse((d.prepare('SELECT data FROM orders WHERE id = ?').get(id) as { data: string } | undefined)?.data),
    listOrders: async (limit) => orders(d.prepare('SELECT data FROM orders ORDER BY created_at DESC LIMIT ?').all(limit)),
    ordersForTelegram: async (tgId, limit) =>
      orders(d.prepare('SELECT data FROM orders WHERE tg_id = ? ORDER BY created_at DESC LIMIT ?').all(tgId, limit)),
    listStaff: async () =>
      (d.prepare('SELECT chat_id, name, username, added_at FROM staff ORDER BY added_at').all() as {
        chat_id: number;
        name: string | null;
        username: string | null;
        added_at: number;
      }[]).map((r) => ({ chatId: Number(r.chat_id), name: r.name, username: r.username, addedAt: Number(r.added_at) })),
    isStaff: async (chatId) => Boolean(d.prepare('SELECT 1 FROM staff WHERE chat_id = ?').get(chatId)),
    addStaff: async (m) => {
      d.prepare(
        'INSERT INTO staff (chat_id, name, username, added_at) VALUES (?, ?, ?, ?) ON CONFLICT(chat_id) DO UPDATE SET name = excluded.name, username = excluded.username',
      ).run(m.chatId, m.name, m.username, m.addedAt);
    },
    removeStaff: async (chatId) => {
      d.prepare('DELETE FROM staff WHERE chat_id = ?').run(chatId);
    },
    rememberStaffMessage: async (orderId, chatId, messageId) => {
      d.prepare(
        'INSERT INTO staff_messages (order_id, chat_id, message_id) VALUES (?, ?, ?) ON CONFLICT DO UPDATE SET message_id = excluded.message_id',
      ).run(orderId, chatId, messageId);
    },
    staffMessages: async (orderId) =>
      d.prepare('SELECT chat_id, message_id FROM staff_messages WHERE order_id = ?').all(orderId) as { chat_id: number; message_id: number }[],
    bumpInterest: async (tgId, key, by) => {
      d.prepare('INSERT INTO interests (tg_id, key, score) VALUES (?, ?, ?) ON CONFLICT(tg_id, key) DO UPDATE SET score = score + excluded.score').run(
        tgId,
        key,
        by,
      );
    },
    topInterests: async (tgId, limit) =>
      d.prepare('SELECT key, score FROM interests WHERE tg_id = ? ORDER BY score DESC LIMIT ?').all(tgId, limit) as {
        key: string;
        score: number;
      }[],
  };
}

// ---------------- Selection + public API ----------------

const g = globalThis as unknown as { __mikkoStore?: Promise<Store> };
function store(): Promise<Store> {
  if (!g.__mikkoStore) {
    const cfg = supabaseConfig();
    g.__mikkoStore = cfg ? Promise.resolve(supabaseStore(cfg)) : sqliteStore();
  }
  return g.__mikkoStore;
}

export const storageKind = () => (supabaseConfig() ? 'supabase' : 'sqlite');

export const kvGet = async <T>(key: string, cache?: CacheHint) => (await store()).kvGet<T>(key, cache);
export const kvSet = async (key: string, value: unknown, ttlSec?: number) => (await store()).kvSet(key, value, ttlSec);
export const saveOrder = async (order: OrderRecord) => (await store()).saveOrder(order);
export const getOrder = async (id: string) => (await store()).getOrder(id);
export const ordersForTelegram = async (tgId: number, limit = 10) => (await store()).ordersForTelegram(tgId, limit);
export const listStaff = async () => (await store()).listStaff();
export const isStaff = async (chatId: number) => (await store()).isStaff(chatId);
export const addStaff = async (chatId: number, name: string | null, username: string | null) =>
  (await store()).addStaff({ chatId, name, username, addedAt: Date.now() });
export const removeStaff = async (chatId: number) => (await store()).removeStaff(chatId);
export const rememberStaffMessage = async (orderId: string, chatId: number, messageId: number) =>
  (await store()).rememberStaffMessage(orderId, chatId, messageId);
export const staffMessages = async (orderId: string) => (await store()).staffMessages(orderId);
export const bumpInterest = async (tgId: number, key: string, by = 1) => (await store()).bumpInterest(tgId, key, by);
export const topInterests = async (tgId: number, limit = 5) => (await store()).topInterests(tgId, limit);

export async function listOrders(opts: { status?: OrderStatus; limit?: number } = {}): Promise<OrderRecord[]> {
  const all = await (await store()).listOrders(opts.limit ?? 200);
  return opts.status ? all.filter((o) => o.status === opts.status) : all;
}

export async function setOrderStatus(id: string, status: OrderStatus, by?: string): Promise<OrderRecord | null> {
  const order = await getOrder(id);
  if (!order || order.status === status) return order;
  order.status = status;
  order.history.push({ status, at: Date.now(), by });
  await saveOrder(order);
  return order;
}
