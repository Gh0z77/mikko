import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { removeStaff } from '@/lib/db';

export async function DELETE(_request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { chatId } = await params;
  await removeStaff(Number(chatId));
  return NextResponse.json({ ok: true });
}
