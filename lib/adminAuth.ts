import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'mikko_admin';
const WEEK = 7 * 24 * 60 * 60 * 1000;

function sign(value: string) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET is not set');
  return createHmac('sha256', secret).update(value).digest('hex');
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function pinMatches(pin: unknown): boolean {
  const expected = process.env.ADMIN_PIN;
  return Boolean(expected) && typeof pin === 'string' && safeEqual(pin, expected!);
}

export function newSession(): string {
  const issued = String(Date.now());
  return `${issued}.${sign(`admin:${issued}`)}`;
}

export function validSession(value: string | undefined): boolean {
  if (!value || !process.env.ADMIN_SECRET) return false;
  const [issued, sig] = value.split('.');
  if (!issued || !sig || Date.now() - Number(issued) > WEEK) return false;
  return safeEqual(sig, sign(`admin:${issued}`));
}

export async function isAdmin(): Promise<boolean> {
  return validSession((await cookies()).get(ADMIN_COOKIE)?.value);
}
