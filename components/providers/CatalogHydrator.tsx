'use client';

import { useRef } from 'react';
import { setCatalog } from '@/lib/products';
import type { Product } from '@/lib/types';

/** Puts the server's live catalog into the client `products` array before any child renders. */
export function CatalogHydrator({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const applied = useRef<Product[] | null>(null);
  if (applied.current !== products) {
    setCatalog(products);
    applied.current = products;
  }
  return children;
}
