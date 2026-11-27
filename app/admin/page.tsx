import type { Metadata } from 'next';
import { isAdmin } from '@/lib/adminAuth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLogin } from '@/components/admin/AdminLogin';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin />;
  return <AdminDashboard staffPin={process.env.STAFF_PIN ?? '—'} botUsername="mikko_kids_bot" />;
}
