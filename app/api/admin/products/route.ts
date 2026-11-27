import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { adminCatalog, CATALOG_TAG, saveCatalogItem } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, products: await adminCatalog() });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Ma'lumot noto'g'ri" }, { status: 400 });
  const result = await saveCatalogItem(body);
  if ('error' in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  // Show the change on the site and in the bot right away.
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, product: result.item });
}
