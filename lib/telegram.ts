import { createHmac, timingSafeEqual } from 'node:crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

// Telegram HTML mode rejects the whole message on a stray "<" or "&".
export function esc(value: unknown, max = 300): string {
  return String(value ?? '')
    .slice(0, max)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Calls the Bot API and returns `result` (null on failure). Pass `file` to upload a local file
 * as multipart under that field name (reference it as "attach://<field>" inside media JSON).
 */
export async function tgCall<T = unknown>(
  method: string,
  body: Record<string, unknown>,
  file?: { field: string; data: Uint8Array<ArrayBuffer>; name: string },
): Promise<T | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  let init: RequestInit;
  if (file) {
    const form = new FormData();
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
    form.append(file.field, new Blob([file.data]), file.name);
    init = { method: 'POST', body: form };
  } else {
    init = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
  }
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, init);
    const data = (await response.json()) as { ok: boolean; result?: T; description?: string };
    if (!data.ok) {
      // Re-rendering an unchanged screen is harmless; don't spam the log with it.
      if (!data.description?.includes('message is not modified')) {
        console.error(`[telegram] ${method} failed`, response.status, data.description);
      }
      return null;
    }
    return (data.result ?? (true as T)) as T;
  } catch (error) {
    console.error(`[telegram] ${method} network error`, error);
    return null;
  }
}

export async function tg(method: string, body: Record<string, unknown>): Promise<boolean> {
  return (await tgCall(method, body)) !== null;
}

/**
 * Validates Mini App initData (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
 * and returns the Telegram user, or null when the signature is wrong or older than maxAgeSec.
 */
export function verifyInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 24 * 60 * 60,
  now = Date.now(),
): TelegramUser | null {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash || !/^[0-9a-f]{64}$/.test(hash)) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = createHmac('sha256', secret).update(dataCheckString).digest();
  if (!timingSafeEqual(expected, Buffer.from(hash, 'hex'))) return null;

  const authDate = Number(params.get('auth_date'));
  if (!authDate || now / 1000 - authDate > maxAgeSec) return null;

  try {
    const user = JSON.parse(params.get('user') ?? 'null') as TelegramUser | null;
    return user && typeof user.id === 'number' ? user : null;
  } catch {
    return null;
  }
}
