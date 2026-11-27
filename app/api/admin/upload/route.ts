import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { uploadImage } from '@/lib/upload';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const file = (await request.formData().catch(() => null))?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: 'Rasm topilmadi' }, { status: 400 });
  const result = await uploadImage(file);
  if ('error' in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, url: result.url });
}
