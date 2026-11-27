# MIKKO — Vercel'ga joylash

Sayt, Telegram bot, Mini App, admin panel va buyurtmalar — hammasi bitta Vercel loyihasida ishlaydi.
Deploy tugashi bilan bot o'zi saytga ulanadi (webhook), alohida server kerak emas.

## 1. Kodni yuklash

**GitHub'siz (eng tez):** loyiha papkasida `npx vercel` → savollarga: *Set up and deploy?* **Y**, scope **Rustamjon's projects**, *Link to existing project?* **N**, nomi **mikko**, qolganiga Enter. Bu loyihani yaratadi va birinchi (preview) deploy qiladi.
Keyin 3–4-qadamlarni bajarib, production'ga chiqaring: `npx vercel --prod`.

**GitHub orqali:** push qiling va Vercel'da import qiling. `.env.local`, `.data/` yuklanmaydi (`.gitignore` / `.vercelignore`) — bu to'g'ri.

## 2. Vercel'da loyiha ochish

Vercel → **Add New → Project** → repozitoriyni tanlang. Framework avtomatik "Next.js" bo'ladi, hech narsani o'zgartirmang.

## 3. Ma'lumotlar bazasi — Supabase (majburiy)

1. Supabase → loyihangiz → **SQL Editor → New query** → [`supabase/schema.sql`](supabase/schema.sql) faylining ichini qo'yib **Run** bosing (bir marta).
2. **Project Settings → API Keys** → **Secret keys** bo'limidan `sb_secret_...` kalitni nusxalang.

Buyurtmalar, xodimlar, bot savatlari shu bazada saqlanadi. Jadvallar yopiq (RLS): ochiq "publishable" kalit bilan hech narsa o'qib bo'lmaydi.

> Supabase ulanmasa sayt ishlaydi, lekin buyurtmalar vaqtinchalik xotirada turadi va yo'qoladi.

## 4. Sozlamalar (Settings → Environment Variables)

| Nomi | Qiymati |
|---|---|
| `TELEGRAM_BOT_TOKEN` | @BotFather bergan token |
| `TELEGRAM_CHAT_ID` | Buyurtmalar keladigan chat (botga `/id` yozib bilib olasiz) |
| `STAFF_PIN` | Xodimlar kodi (6 xonali) |
| `ADMIN_PIN` | Admin panel kodi (6 xonali) |
| `ADMIN_SECRET` | Uzun tasodifiy satr (64 belgi) |
| `SUPABASE_URL` | `https://baknlcaotvjtaxfhzmdc.supabase.co` |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` (3-qadamdagi kalit — **publishable emas**) |

Birinchi beshtasini kompyuterdagi `.env.local` dan ko'chirsangiz bo'ladi. `NEXT_PUBLIC_SITE_URL` shart emas — Vercel domeni avtomatik aniqlanadi.

## 5. Deploy

**Deploy** tugmasini bosing. Build oxirida logda shunday qatorlar chiqadi:

```
[bot] ✓ setMyCommands
[bot] ✓ setWebhook
[bot] ✓ setChatMenuButton
[bot] Bot → https://<loyiha>.vercel.app/api/bot · Mini App → https://<loyiha>.vercel.app/app
```

Tamom: bot Vercel'da ishlayapti, botda pastki **"Do'kon"** tugmasi Mini App'ni ochadi. Keyingi har bir production deploy'da bot o'zi qayta ulanadi.

## Muhim

- **Deploy'dan keyin kompyuterda `npm run bot` ni ishlatmang** — u botni saytdan "tortib oladi". Skript buni o'zi tekshiradi va to'xtaydi.
- **O'z domeningiz** (masalan `mikko.uz`) ulansa: `NEXT_PUBLIC_SITE_URL=https://mikko.uz` qo'shib, qayta deploy qiling.
- **Bot nomi va tavsifi** (bir marta, ixtiyoriy): kompyuterda `.env.local` ga sayt manzilini yozib `npm run bot:setup`.
- **Xavfsizlik**: token yozishmada ochiq ko'ringan bo'lsa, ishga tushirishdan oldin @BotFather'da `/revoke` qilib yangisini oling va Vercel'dagi `TELEGRAM_BOT_TOKEN` ni almashtiring.
- **Admin panel**: `https://<domen>/admin`. Xodimlar botga `/xodim <STAFF_PIN>` yozib qo'shiladi.

## Yangi mahsulot qo'shish (xodimlar uchun)

1. `https://<domen>/admin` → kirish kodi (`ADMIN_PIN`).
2. **Mahsulotlar → Yangi mahsulot**: rasmlarni yuklang (birinchisi asosiy), nomi, kategoriya, narx (chegirma bo'lsa — eski narx), o'lchamlar, ranglar, tavsif.
3. **Mahsulotni qo'shish** — sayt, Telegram bot va Mini App'da darhol paydo bo'ladi.

Mavjud mahsulotni **Tahrirlash** (narx, o'lcham, rasm) yoki ko'z belgisi bilan **yashirish** (sotuvda yo'q) mumkin. Rasmlar Supabase Storage'dagi `products` bucket'ida saqlanadi (birinchi yuklashda o'zi yaratiladi).
