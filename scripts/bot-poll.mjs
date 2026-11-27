// Local / VPS mode: pulls updates from Telegram (no https needed) and handles them in this process.
// Run:  npm run bot      (compiles lib/bot.ts to .bot/ first)
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { handleUpdate } = require('../.bot/lib/bot.js');
const { TELEGRAM_BOT_TOKEN: token } = process.env;

if (!token) {
  console.error('Need TELEGRAM_BOT_TOKEN in .env.local');
  process.exit(1);
}

const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  }).then((r) => r.json());

// If the bot is already connected to the deployed site, polling here would steal it from production.
const hook = await api('getWebhookInfo');
if (hook.result?.url && !process.argv.includes('--force')) {
  console.error(`⚠️  Bot hozir saytga ulangan: ${hook.result.url}`);
  console.error("   Lokal ishga tushirsangiz, sayt boti to'xtaydi. Baribir kerak bo'lsa: npm run bot -- --force");
  process.exit(1);
}
await api('deleteWebhook', { drop_pending_updates: false }); // getUpdates only works without a webhook
const me = await api('getMe');
console.log(`🤖 @${me.result?.username} ishlayapti  (to'xtatish: Ctrl+C)`);

// Different chats run in parallel; updates inside one chat stay in order.
const queues = new Map();
function enqueue(chatId, update) {
  const prev = queues.get(chatId) ?? Promise.resolve();
  const next = prev
    .then(() => handleUpdate(update))
    .catch((error) => console.error('  ✗', error))
    .finally(() => {
      if (queues.get(chatId) === next) queues.delete(chatId);
    });
  queues.set(chatId, next);
}

let offset = 0;
for (;;) {
  try {
    const res = await api('getUpdates', { offset, timeout: 25, allowed_updates: ['message', 'callback_query'] });
    for (const update of res.result ?? []) {
      offset = update.update_id + 1;
      const msg = update.message ?? update.callback_query?.message;
      const who = update.message?.from ?? update.callback_query?.from;
      const what =
        update.message?.text ??
        (update.message?.contact ? '[kontakt]' : update.message?.location ? '[joylashuv]' : update.callback_query?.data ?? '');
      console.log(`← ${msg?.chat?.id} (${who?.first_name ?? '?'}): ${what}`);
      enqueue(msg?.chat?.id ?? 0, update);
    }
  } catch (error) {
    console.error('  ✗', error.message, '— 3 soniyadan keyin qayta urinaman');
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
