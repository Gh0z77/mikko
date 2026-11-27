'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Phone, Send, X } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/BrandIcons';
import { SearchBar } from './SearchBar';
import { mainNav, secondaryNav, storePhone, storePhoneHref, instagramUrl, telegramUrl } from '@/lib/nav';
import { Logo } from '@/components/ui/Logo';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  focusSearch?: boolean;
}

export function MobileNavigation({ open, onClose, focusSearch }: MobileMenuProps) {
  const pathname = usePathname();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] xl:hidden">
          <motion.button
            type="button"
            aria-label="Menyuni yopish"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menyu"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="relative flex h-full w-[92%] max-w-sm flex-col bg-cream shadow-lift"
          >
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <Link href="/" onClick={onClose} aria-label="MIKKO bosh sahifa">
                <Logo className="text-[30px]" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Yopish"
                className="grid h-10 w-10 place-items-center rounded-full bg-ink/[0.06]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-2">
              <SearchBar autoFocus={focusSearch} onNavigate={onClose} />
            </div>

            <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-6">
              <ul>
                {mainNav.map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + index * 0.04, duration: 0.35 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-[26px] leading-tight transition-colors hover:bg-white/60"
                    >
                      {item.label}
                      <ArrowRight className="h-4 w-4 text-cocoa/50" />
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="my-4 border-t-2 border-dashed border-ink/10" />

              <ul className="space-y-1 px-4">
                {secondaryNav.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block py-2 text-sm font-medium text-cocoa transition-colors hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-ink/10 bg-white/50 p-5">
              <a href={storePhoneHref} className="flex items-center gap-2 text-sm font-semibold">
                <Phone className="h-4 w-4 text-orange" />
                {storePhone}
              </a>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="grid h-10 w-10 place-items-center rounded-full bg-ink/[0.06] transition-colors hover:bg-orange hover:text-white"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                  className="grid h-10 w-10 place-items-center rounded-full bg-ink/[0.06] transition-colors hover:bg-orange hover:text-white"
                >
                  <Send className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
