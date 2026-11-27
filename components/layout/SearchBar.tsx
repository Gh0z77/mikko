'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';
import { searchProducts } from '@/lib/products';
import { formatPrice } from '@/lib/format';

interface SearchBarProps {
  className?: string;
  onNavigate?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export function SearchBar({
  className,
  onNavigate,
  autoFocus,
  placeholder = 'Mahsulot yoki kategoriya qidirish',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  const results = useMemo(() => (query.trim().length > 1 ? searchProducts(query).slice(0, 5) : []), [query]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(path);
  };

  return (
    <div ref={wrapper} className={clsx('relative', className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (!query.trim()) return;
          go(`/catalog?q=${encodeURIComponent(query.trim())}`);
        }}
      >
        <div className="flex h-11 items-center gap-2 rounded-full border border-ink/12 bg-white/70 px-4 transition-colors duration-300 focus-within:border-ink/30 focus-within:bg-white">
          <Search className="h-4 w-4 shrink-0 text-cocoa" />
          <input
            type="search"
            value={query}
            autoFocus={autoFocus}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setOpen(false);
            }}
            placeholder={placeholder}
            aria-label="Qidiruv"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-cocoa/60 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Qidiruvni tozalash"
              onClick={() => setQuery('')}
              className="grid h-6 w-6 place-items-center rounded-full text-cocoa transition-colors hover:bg-ink/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      {open && query.trim().length > 1 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-3xl border border-ink/8 bg-shell p-2 shadow-lift">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-cocoa">
              «{query}» bo&apos;yicha hech narsa topilmadi.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {results.map((product) => (
                <li key={product.slug}>
                  <button
                    type="button"
                    onClick={() => go(`/product/${product.slug}`)}
                    className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-cream"
                  >
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-cream">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="44px"
                        className="object-contain p-1"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{product.name}</span>
                      <span className="text-xs text-cocoa">{formatPrice(product.price)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => go(`/catalog?q=${encodeURIComponent(query.trim())}`)}
            className="mt-1 w-full rounded-2xl bg-cream px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-orange-soft"
          >
            Barcha natijalarni ko&apos;rish
          </button>
        </div>
      )}
    </div>
  );
}
