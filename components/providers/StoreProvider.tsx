'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { products } from '@/lib/products';
import { track } from '@/lib/interests';
import type { CartLine } from '@/lib/types';

const CART_KEY = 'mikko:cart:v1';
const FAVORITES_KEY = 'mikko:favorites:v1';

interface StoreValue {
  hydrated: boolean;
  cart: CartLine[];
  favorites: string[];
  cartCount: number;
  subtotal: number;
  addToCart: (input: { slug: string; size: string; color: string; qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  notify: (message: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lineKey(slug: string, size: string, color: string) {
  return `${slug}::${size}::${color}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setCart(readJSON<CartLine[]>(CART_KEY, []));
    setFavorites(readJSON<string[]>(FAVORITES_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const addToCart = useCallback<StoreValue['addToCart']>(
    ({ slug, size, color, qty = 1 }) => {
      const key = lineKey(slug, size, color);
      setCart((prev) => {
        const existing = prev.find((line) => line.key === key);
        if (existing) {
          return prev.map((line) =>
            line.key === key ? { ...line, qty: Math.min(line.qty + qty, 20) } : line,
          );
        }
        return [...prev, { key, slug, size, color, qty }];
      });
      const product = products.find((item) => item.slug === slug);
      notify(`${product?.name ?? 'Mahsulot'} savatga qo'shildi`);
      track({ type: 'cart', slug });
    },
    [notify],
  );

  const setQty = useCallback((key: string, qty: number) => {
    setCart((prev) =>
      prev.flatMap((line) => {
        if (line.key !== key) return [line];
        if (qty <= 0) return [];
        return [{ ...line, qty: Math.min(qty, 20) }];
      }),
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => prev.filter((line) => line.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback(
    (slug: string) => {
      setFavorites((prev) => {
        if (prev.includes(slug)) {
          notify('Sevimlilardan olib tashlandi');
          return prev.filter((item) => item !== slug);
        }
        notify('Sevimlilarga qo\'shildi');
        track({ type: 'fav', slug });
        return [...prev, slug];
      });
    },
    [notify],
  );

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.qty, 0), [cart]);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const product = products.find((item) => item.slug === line.slug);
        return sum + (product ? product.price * line.qty : 0);
      }, 0),
    [cart],
  );

  const value = useMemo<StoreValue>(
    () => ({
      hydrated,
      cart,
      favorites,
      cartCount,
      subtotal,
      addToCart,
      setQty,
      removeLine,
      clearCart,
      toggleFavorite,
      isFavorite,
      cartOpen,
      setCartOpen,
      notify,
    }),
    [
      hydrated,
      cart,
      favorites,
      cartCount,
      subtotal,
      addToCart,
      setQty,
      removeLine,
      clearCart,
      toggleFavorite,
      isFavorite,
      cartOpen,
      notify,
    ],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 md:bottom-auto md:top-24 md:justify-end md:px-8"
        aria-live="polite"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : 8, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream shadow-lift"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-orange text-white">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
