import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, newSession, pinMatches } from '@/lib/adminAuth';

// shortcut: per-process attempt counter; enough to slow down guessing a 6-digit code on one server.
const attempts = new Map<string, { count: number; until: number }>();

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const entry = attempts.get(ip);
  if (entry && entry.until > Date.now()) {
    return NextResponse.json({ ok: false, error: 'locked' }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { pin?: unknown };
  if (!pinMatches(body.pin)) {
    const count = (entry?.count ?? 0) + 1;
    attempts.set(ip, { count, until: count >= 5 ? Date.now() + 5 * 60_000 : 0 });
    return NextResponse.json({ ok: false, error: 'wrong_pin' }, { status: 401 });
  }
  attempts.delete(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, newSession(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
