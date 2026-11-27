// Runs once per server instance start. On production Vercel it makes sure the Telegram bot points
// at this deployment, so the bot keeps working even if the build-time setup step was skipped.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.VERCEL_ENV !== 'production') return;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const { httpsSiteUrl, webhookSecret } = await import('./lib/site');
  const site = httpsSiteUrl();
  const secret = webhookSecret();
  if (!token || !site || !secret) return;

  const api = (method: string, body: object = {}) =>
    fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    }).then((r) => r.json() as Promise<{ ok: boolean; result?: { url?: string } }>);

  try {
    const target = `${site}/api/bot`;
    const info = await api('getWebhookInfo');
    if (info.result?.url === target) return;
    await api('setWebhook', { url: target, secret_token: secret, allowed_updates: ['message', 'callback_query'] });
    await api('setChatMenuButton', { menu_button: { type: 'web_app', text: "Do'kon", web_app: { url: `${site}/app` } } });
    console.log(`[bot] webhook → ${target}`);
  } catch (error) {
    console.error('[bot] webhook check failed', error);
  }
}
