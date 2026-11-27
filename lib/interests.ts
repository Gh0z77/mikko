'use client';

import { products } from './products';
import type { Product } from './types';

// Interest profile kept in a first-party cookie, only after the visitor agrees.
// Shape: { c: {category: score}, p: {slug: score}, s: {size: score} }

export const CONSENT_COOKIE = 'mikko_consent';
const INTEREST_COOKIE = 'mikko_int';
const YEAR = 60 * 60 * 24 * 365;
export const INTERESTS_CHANGED = 'mikko:interests';

type Bucket = Record<string, number>;
interface Profile {
  c: Bucket;
  p: Bucket;
  s: Bucket;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const hit = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, maxAge = YEAR) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function getConsent(): 'all' | 'essential' | null {
  const value = readCookie(CONSENT_COOKIE);
  return value === 'all' || value === 'essential' ? value : null;
}

export function setConsent(value: 'all' | 'essential') {
  writeCookie(CONSENT_COOKIE, value);
  if (value === 'essential') writeCookie(INTEREST_COOKIE, '', 0); // forget anything stored
  window.dispatchEvent(new Event(INTERESTS_CHANGED));
}

function readProfile(): Profile {
  try {
    const parsed = JSON.parse(readCookie(INTEREST_COOKIE) ?? '') as Partial<Profile>;
    return { c: parsed.c ?? {}, p: parsed.p ?? {}, s: parsed.s ?? {} };
  } catch {
    return { c: {}, p: {}, s: {} };
  }
}

// Keep the cookie small (<4 KB): only the strongest entries survive.
const top = (bucket: Bucket, n: number) => Object.fromEntries(Object.entries(bucket).sort((a, b) => b[1] - a[1]).slice(0, n));

type Signal =
  | { type: 'view' | 'cart' | 'fav'; slug: string }
  | { type: 'category'; category: string }
  | { type: 'size'; sizes: string[] };

const weight = { view: 1, fav: 3, cart: 4 } as const;

export function track(signal: Signal) {
  if (getConsent() !== 'all') return;
  const profile = readProfile();
  if (signal.type === 'category') {
    profile.c[signal.category] = (profile.c[signal.category] ?? 0) + 1;
  } else if (signal.type === 'size') {
    signal.sizes.forEach((size) => (profile.s[size] = (profile.s[size] ?? 0) + 1));
  } else {
    const product = products.find((p) => p.slug === signal.slug);
    if (!product) return;
    profile.p[product.slug] = (profile.p[product.slug] ?? 0) + weight[signal.type];
    profile.c[product.category] = (profile.c[product.category] ?? 0) + weight[signal.type] / 2;
  }
  writeCookie(INTEREST_COOKIE, JSON.stringify({ c: top(profile.c, 6), p: top(profile.p, 14), s: top(profile.s, 6) }));
  window.dispatchEvent(new Event(INTERESTS_CHANGED));
}

export function interestScore(product: Product, profile = readProfile()): number {
  const sizeFit = product.sizes.reduce((sum, size) => sum + (profile.s[size] ?? 0), 0);
  return (profile.c[product.category] ?? 0) + (profile.p[product.slug] ?? 0) * 2 + Math.min(sizeFit, 4);
}

/** Products ranked for this visitor; empty when we know nothing yet. */
export function recommend(limit = 8): Product[] {
  const profile = readProfile();
  const total = Object.values(profile.c).reduce((a, b) => a + b, 0) + Object.values(profile.s).reduce((a, b) => a + b, 0);
  if (total < 2) return [];
  return products
    .map((product) => ({ product, score: interestScore(product, profile) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.product);
}

export function topCategory(): string | null {
  const entries = Object.entries(readProfile().c).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? null;
}
