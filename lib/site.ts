import { createHash } from 'node:crypto';

/**
 * Public base URL of the site (no trailing slash).
 * On Vercel it falls back to the production domain Vercel exposes, so NEXT_PUBLIC_SITE_URL is optional there.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  // A copied local .env (http://localhost) must not win on Vercel.
  if (explicit && (explicit.startsWith('https://') || !process.env.VERCEL)) return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

export const httpsSiteUrl = () => (siteUrl().startsWith('https://') ? siteUrl() : null);

/**
 * Secret Telegram sends with every webhook call. Uses TELEGRAM_WEBHOOK_SECRET when set,
 * otherwise a value derived from the bot token (Telegram allows [A-Za-z0-9_-], up to 256 chars).
 */
export function webhookSecret(): string | null {
  if (process.env.TELEGRAM_WEBHOOK_SECRET) return process.env.TELEGRAM_WEBHOOK_SECRET;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return token ? createHash('sha256').update(`mikko-webhook:${token}`).digest('hex') : null;
}
