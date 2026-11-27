import type { Metadata, Viewport } from 'next';
import { Fredoka, Manrope } from 'next/font/google';
import './globals.css';
import { siteUrl } from '@/lib/site';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { TelegramWebApp } from '@/components/providers/TelegramWebApp';

// Rounded face that matches the store's Instagram wordmark.
const display = Fredoka({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const sans = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "MIKKO — bolalar kiyimlari",
    template: '%s · MIKKO',
  },
  description:
    "MIKKO — Buxoro va Toshkentdagi bolalar kiyimlari do'koni. Zamonaviy, qulay va sifatli kiyimlar: o'g'il bolalar, qizlar, chaqaloqlar, oyoq kiyimlar va aksessuarlar.",
  keywords: ['bolalar kiyimlari', 'MIKKO', 'Buxoro',
    'Toshkent', "chaqaloq kiyimi", 'bolalar poyabzali'],
  openGraph: {
    title: 'MIKKO — har bir bola o‘ziga xos',
    description: "Zamonaviy, qulay va sifatli bolalar kiyimlari MIKKO'da!",
    type: 'website',
    locale: 'uz_UZ',
  },
};

export const viewport: Viewport = {
  themeColor: '#FE6700',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-cream">
        <StoreProvider>
          {children}
          <TelegramWebApp />
        </StoreProvider>
      </body>
    </html>
  );
}
