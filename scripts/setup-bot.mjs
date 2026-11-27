// Connects the Telegram bot to the deployed site.
//
//   npm run bot:setup                 manual: profile + commands + webhook (needs an https site URL)
//   node scripts/setup-bot.mjs --deploy   runs after `next build` on Vercel; only acts on production deploys
//
// It never fails a build: problems are printed as warnings.
import { createHash } from 'node:crypto';

const deployMode = process.argv.includes('--deploy');
const env = process.env;
const token = env.TELEGRAM_BOT_TOKEN;

if (deployMode && env.VERCEL_ENV !== 'production') {
  console.log(`[bot] ${env.VERCEL ? `Vercel ${env.VERCEL_ENV} build` : 'Local build'} — webhook not touched.`);
  process.exit(0);
}
if (!token) {
  console.warn('[bot] TELEGRAM_BOT_TOKEN is not set — skipping bot setup.');
  process.exit(0);
}

// Same rule as lib/site.ts → siteUrl(): a copied local http:// URL is ignored on Vercel.
const explicit = env.NEXT_PUBLIC_SITE_URL && (env.NEXT_PUBLIC_SITE_URL.startsWith('https://') || !env.VERCEL) ? env.NEXT_PUBLIC_SITE_URL : '';
const site = (explicit || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '')).replace(/\/$/, '');
// Same derivation as lib/site.ts → webhookSecret()
const secret = env.TELEGRAM_WEBHOOK_SECRET || createHash('sha256').update(`mikko-webhook:${token}`).digest('hex');

async function call(method, body) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    console.log(`[bot] ${data.ok ? '✓' : '✗'} ${method}${data.ok ? '' : ` — ${data.description}`}`);
    return data.ok;
  } catch (error) {
    console.warn(`[bot] ✗ ${method} — ${error.message}`);
    return false;
  }
}

if (!deployMode) {
  // Profile texts are rate-limited by Telegram, so only on manual runs.
  await call('setMyName', { name: "MIKKO — bolalar kiyim do'koni" });
  await call('setMyShortDescription', {
    short_description: "MIKKO — Buxoro va Toshkentdagi bolalar kiyim do'koni. Kiyim tanlang va shu yerda buyurtma bering!",
  });
  await call('setMyDescription', {
    description:
      "🧸 MIKKO — bolalar kiyim do'koni\n\n👕 Kiyimlarni rasm bilan ko'ring\n📏 O'lchamni tanlang\n🛒 Savatga qo'shing va buyurtma bering\n🚚 Buxoro va Toshkent bo'ylab tez yetkazib beramiz\n\n👇 Boshlash uchun «Start» ni bosing",
  });
}

await call('setMyCommands', {
  commands: [
    { command: 'start', description: 'Bosh menyu' },
    { command: 'katalog', description: 'Kiyimlar katalogi' },
    { command: 'savat', description: 'Savat' },
    { command: 'buyurtmalarim', description: 'Buyurtmalarim va holati' },
    { command: 'manzil', description: 'Filiallar' },
    { command: 'aloqa', description: "Bog'lanish" },
  ],
});

if (site.startsWith('https://')) {
  await call('setWebhook', {
    url: `${site}/api/bot`,
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
    max_connections: 40,
  });
  await call('setChatMenuButton', { menu_button: { type: 'web_app', text: "Do'kon", web_app: { url: `${site}/app` } } });
  console.log(`[bot] Bot → ${site}/api/bot · Mini App → ${site}/app`);
} else {
  console.log('[bot] Site is not on https yet — webhook not set. Locally use: npm run bot');
}
