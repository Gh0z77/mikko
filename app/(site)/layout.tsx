import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { PageTransition } from '@/components/layout/PageTransition';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { CookieBanner } from '@/components/layout/CookieBanner';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream"
      >
        Asosiy kontentga o&apos;tish
      </a>
      <Header />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <BottomNav />
      <ScrollProgress />
      <CartDrawer />
      <CookieBanner />
    </>
  );
}
