import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, newSession, pinMatches } from '@/lib/adminAuth';
import { clearFailures, lockedOut, recordFailure } from '@/lib/attempts';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const key = `admin:${ip}`;
  if (await lockedOut(key)) {
    return NextResponse.json({ ok: false, error: 'locked' }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { pin?: unknown };
  if (!pinMatches(body.pin)) {
    await recordFailure(key);
    return NextResponse.json({ ok: false, error: 'wrong_pin' }, { status: 401 });
  }
  await clearFailures(key);

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
