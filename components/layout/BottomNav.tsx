'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Heart, Home, ShoppingBag, LayoutGrid, MapPin } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';

export function BottomNav() {
  const pathname = usePathname();
  const { cartCount, favorites, setCartOpen, hydrated } = useStore();

  const items = [
    { href: '/', label: 'Asosiy', icon: Home, badge: 0 },
    { href: '/catalog', label: 'Katalog', icon: LayoutGrid, badge: 0 },
    { href: '/favorites', label: 'Sevimli', icon: Heart, badge: hydrated ? favorites.length : 0 },
    { href: '/stores', label: "Do'kon", icon: MapPin, badge: 0 },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream/92 pb-safe backdrop-blur-xl lg:hidden"
      aria-label="Mobil menyu"
    >
      <ul className="grid grid-cols-5">
        {items.slice(0, 3).map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'relative flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors',
                  active ? 'text-orange-deep' : 'text-cocoa',
                )}
              >
                <span className="relative">
                  <item.icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.3 : 1.9} />
                  {item.badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-bold text-cream">
                      {item.badge}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[10.5px] font-medium text-cocoa transition-colors"
          >
            <span className="relative">
              <ShoppingBag className="h-[21px] w-[21px]" strokeWidth={1.9} />
              {hydrated && cartCount > 0 && (
                <span
                  key={cartCount}
                  className="absolute -right-2 -top-1.5 grid h-4 min-w-4 animate-pop place-items-center rounded-full bg-orange px-1 text-[9px] font-bold text-white"
                >
                  {cartCount}
                </span>
              )}
            </span>
            Savat
          </button>
        </li>

        {items.slice(3).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors',
                  active ? 'text-orange-deep' : 'text-cocoa',
                )}
              >
                <item.icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.3 : 1.9} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
