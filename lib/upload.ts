import path from 'node:path';
import { randomBytes } from 'node:crypto';

const BUCKET = 'products';
export const MAX_UPLOAD = 6 * 1024 * 1024;
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };

function supabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

const authHeaders = (key: string): Record<string, string> => ({
  apikey: key,
  ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }),
});

/** Stores a product photo and returns its public URL (Supabase Storage in production, public/uploads locally). */
export async function uploadImage(file: File): Promise<{ url: string } | { error: string }> {
  const ext = TYPES[file.type];
  if (!ext) return { error: 'Faqat JPG, PNG, WEBP yoki AVIF rasm' };
  if (file.size > MAX_UPLOAD) return { error: 'Rasm 6 MB dan oshmasin' };
  const name = `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const cfg = supabase();
  if (cfg) {
    const put = () =>
      fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${name}`, {
        method: 'POST',
        headers: { ...authHeaders(cfg.key), 'Content-Type': file.type, 'x-upsert': 'true', 'Cache-Control': 'max-age=31536000' },
        body: bytes,
      });
    let response = await put();
    if (response.status === 404 || response.status === 400) {
      // First upload: create the public bucket, then retry once.
      await fetch(`${cfg.url}/storage/v1/bucket`, {
        method: 'POST',
        headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
      });
      response = await put();
    }
    if (!response.ok) return { error: `Yuklab bo'lmadi (${response.status}) ${await response.text()}`.slice(0, 200) };
    return { url: `${cfg.url}/storage/v1/object/public/${BUCKET}/${name}` };
  }

  if (process.env.VERCEL) return { error: 'Rasm saqlash uchun SUPABASE_URL va SUPABASE_SECRET_KEY kerak' };
  const { mkdir, writeFile } = await import('node:fs/promises');
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return { url: `/uploads/${name}` };
}
