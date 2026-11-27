'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Renders long lists in batches: `step` items first, the next batch when the sentinel scrolls near.
 * Keeps big catalogs smooth (fewer DOM nodes, images and animations at once).
 */
export function useIncremental<T>(items: T[], step = 12) {
  const [limit, setLimit] = useState(step);
  const sentinel = useRef<HTMLDivElement>(null);

  // New list (filter/sort/search) → start from the first batch again.
  useEffect(() => setLimit(step), [items, step]);

  const hasMore = limit < items.length;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setLimit((n) => n + step);
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, step, limit]);

  return { visible: items.slice(0, limit), hasMore, sentinel };
}
