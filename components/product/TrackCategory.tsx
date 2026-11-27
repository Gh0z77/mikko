'use client';

import { useEffect } from 'react';
import { track } from '@/lib/interests';

export function TrackCategory({ category }: { category: string }) {
  useEffect(() => track({ type: 'category', category }), [category]);
  return null;
}
