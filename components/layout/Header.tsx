'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { SearchBar } from './SearchBar';
import { MobileNavigation } from './MobileNavigation';
import { mainNav, storePhone, storePhoneHref } from '@/lib/nav';
import { Logo } from '@/components/ui/Logo';

export function Header() {
  const { cartCount, favorites, setCartOpen, hydrated } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusSearch, setFocusSearch] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="bg-ink text-cream">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[11.5px] tracking-[-0.01em]">
          <p className="truncate text-cream/80">
            <span className="sm:hidden">500 000 so&apos;mdan bepul yetkazish</span>
            <span className="hidden sm:inline">Buxoro va Toshkent bo&apos;ylab 500 000 so&apos;mdan ortiq xaridga bepul yetkazib berish</span>
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <Link href="/sale" className="font-semibold text-orange-soft transition-colors hover:text-white">
              Aksiyalar
            </Link>
            <a href={storePhoneHref} className="hidden text-cream/80 transition-colors hover:text-white sm:block">
              {storePhone}
            </a>
          </div>
        </div>
      </div>

      <header
        className={clsx(
          'sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-500',
          scrolled
            ? 'border-b border-ink/[0.07] bg-cream/85 shadow-[0_24px_40px_-40px_rgba(46,31,23,0.55)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div
          className={clsx(
            'container-page flex items-center gap-2 transition-[height] duration-500 ease-silk sm:gap-4',
            scrolled ? 'h-[64px] md:h-[70px]' : 'h-[68px] md:h-[84px]',
          )}
        >
          <button
            type="button"
            onClick={() => {
              setFocusSearch(false);
              setMenuOpen(true);
            }}
            aria-label="Menyuni ochish"
            className="-ml-2 grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/[0.06] lg:hidden"
          >
            <Menu className="h-[22px] w-[22px]" />
          </button>

          <Link href="/" aria-label="MIKKO — bosh sahifa" className="shrink-0">
            <Logo
              animate
              priority
              className={clsx(
                'transition-all duration-500 ease-silk',
                scrolled ? 'text-[26px] md:text-[30px]' : 'text-[30px] md:text-[34px]',
              )}
            />
          </Link>

          <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Asosiy menyu">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'relative whitespace-nowrap rounded-full px-3 py-2 text-[13.5px] font-medium transition-colors duration-300 xl:px-3.5 xl:text-sm',
                  isActive(item.href)
                    ? 'text-orange-deep'
                    : 'text-ink/80 hover:bg-ink/[0.055] hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <SearchBar className="hidden w-56 xl:block 2xl:w-64" placeholder="Qidirish..." />

            <button
              type="button"
              onClick={() => {
                setFocusSearch(true);
                setMenuOpen(true);
              }}
              aria-label="Qidiruv"
              className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/[0.06] xl:hidden"
            >
              <Search className="h-[21px] w-[21px]" />
            </button>

            <Link
              href="/favorites"
              aria-label={`Sevimlilar${hydrated && favorites.length ? `, ${favorites.length} ta` : ''}`}
              className="relative hidden h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/[0.06] sm:grid"
            >
              <Heart className="h-[21px] w-[21px]" strokeWidth={1.8} />
              {hydrated && favorites.length > 0 && (
                <span
                  key={favorites.length}
                  className="absolute right-1 top-1 grid h-[17px] min-w-[17px] animate-pop place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-cream"
                >
                  {favorites.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Savat${hydrated && cartCount ? `, ${cartCount} ta mahsulot` : ''}`}
              className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/[0.06]"
            >
              <ShoppingBag className="h-[21px] w-[21px]" strokeWidth={1.8} />
              {hydrated && cartCount > 0 && (
                <span
                  key={cartCount}
                  className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] animate-pop place-items-center rounded-full bg-orange px-1 text-[10px] font-bold text-white"
                >
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      <MobileNavigation
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        focusSearch={focusSearch}
      />
    </>
  );
}
