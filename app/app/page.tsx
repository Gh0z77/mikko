import type { Metadata, Viewport } from 'next';
import { MiniApp } from '@/components/miniapp/MiniApp';

export const metadata: Metadata = {
  title: "MIKKO — do'kon ilovasi",
  description: "MIKKO bolalar kiyim do'koni — Telegram ilovasi.",
  robots: { index: false },
};

export const viewport: Viewport = {
  themeColor: '#FFF8F3',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function MiniAppPage() {
  return <MiniApp />;
}
