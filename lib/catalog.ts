import { seedProducts, setCatalog } from './products';
import { kvGet, kvSet } from './db';
import type { CategorySlug, Product } from './types';

// Staff edits live in one kv entry: { [slug]: product }. Seed items with the same slug are replaced.
// shortcut: whole map is read-modify-written; two admins saving the same second could lose one edit — move to a table if many staff edit at once.
const KEY = 'catalog:overrides';
export const CATALOG_TAG = 'catalog';

export type CatalogItem = Product & { hidden?: boolean };

const CATEGORIES: CategorySlug[] = ['boys', 'girls', 'baby', 'shoes', 'accessories'];

function merge(overrides: Record<string, CatalogItem>): CatalogItem[] {
  const seedSlugs = new Set(seedProducts.map((p) => p.slug));
  const fresh = Object.values(overrides)
    .filter((p) => !seedSlugs.has(p.slug))
    .sort((a, b) => b.createdAt - a.createdAt);
  return [...fresh, ...seedProducts.map((p) => overrides[p.slug] ?? p)];
}

/** Loads the live catalog (cached by Next, invalidated on save) and updates the shared `products` array. */
export async function refreshCatalog(): Promise<Product[]> {
  let overrides: Record<string, CatalogItem> = {};
  try {
    overrides = (await kvGet<Record<string, CatalogItem>>(KEY, { tags: [CATALOG_TAG], revalidate: 300 })) ?? {};
  } catch (error) {
    console.error('[catalog] load failed, showing built-in catalog', error); // never break the shop on a DB hiccup
  }
  const visible = merge(overrides).filter((p) => !p.hidden);
  setCatalog(visible);
  return visible;
}

/** Everything incl. hidden items, read fresh — for the admin panel. */
export async function adminCatalog(): Promise<CatalogItem[]> {
  return merge((await kvGet<Record<string, CatalogItem>>(KEY)) ?? {});
}

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[ʻʼ'`‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'mahsulot';

const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const list = (v: unknown, max: number, each: number) =>
  (Array.isArray(v) ? v : []).map((x) => text(x, each)).filter(Boolean).slice(0, max);

/** Validates staff input (trust boundary) and stores it. Returns the saved item or an error message. */
export async function saveCatalogItem(input: Record<string, unknown>): Promise<{ item: CatalogItem } | { error: string }> {
  const name = text(input.name, 80);
  const price = Math.round(Number(input.price));
  const oldPrice = input.oldPrice ? Math.round(Number(input.oldPrice)) : undefined;
  const category = input.category as CategorySlug;
  const images = list(input.images, 6, 500).filter((u) => u.startsWith('/') || u.startsWith('https://'));
  const sizes = list(input.sizes, 20, 10);
  const colors = (Array.isArray(input.colors) ? input.colors : [])
    .map((c) => ({ name: text((c as { name?: unknown })?.name, 30), hex: text((c as { hex?: unknown })?.hex, 9) }))
    .filter((c) => c.name && /^#[0-9a-fA-F]{6}$/.test(c.hex))
    .slice(0, 8);

  if (name.length < 3) return { error: 'Nomi kamida 3 harf bo‘lsin' };
  if (!CATEGORIES.includes(category)) return { error: 'Kategoriyani tanlang' };
  if (!Number.isFinite(price) || price < 1000 || price > 100_000_000) return { error: "Narxni to'g'ri kiriting" };
  if (oldPrice !== undefined && (!Number.isFinite(oldPrice) || oldPrice <= price)) return { error: 'Eski narx yangi narxdan katta bo‘lishi kerak' };
  if (!images.length) return { error: 'Kamida bitta rasm yuklang' };
  if (!sizes.length) return { error: "Kamida bitta o'lcham tanlang" };

  const overrides = (await kvGet<Record<string, CatalogItem>>(KEY)) ?? {};
  const all = merge(overrides);
  const requested = text(input.slug, 60);
  const existing = all.find((p) => p.slug === requested);
  let slug = existing?.slug ?? slugify(name);
  if (!existing) for (let n = 2; all.some((p) => p.slug === slug); n++) slug = `${slugify(name)}-${n}`;

  const badge = input.badge === 'new' || input.badge === 'hit' ? input.badge : undefined;
  const item: CatalogItem = {
    slug,
    name,
    category,
    price,
    ...(oldPrice ? { oldPrice } : {}),
    images,
    sizes,
    colors: colors.length ? colors : [{ name: 'Standart', hex: '#E9DCCB' }],
    description: text(input.description, 600) || name,
    details: list(input.details, 8, 160),
    material: text(input.material, 160) || '—',
    ...(badge ? { badge } : {}),
    rating: existing?.rating ?? 5,
    reviews: existing?.reviews ?? 0,
    createdAt: existing?.createdAt ?? Date.now(),
    hidden: Boolean(input.hidden),
  };

  overrides[slug] = item;
  await kvSet(KEY, overrides);
  return { item };
}
