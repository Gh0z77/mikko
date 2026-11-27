export type CategorySlug = 'boys' | 'girls' | 'baby' | 'shoes' | 'accessories';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  oldPrice?: number;
  images: string[];
  sizes: string[];
  colors: ColorOption[];
  description: string;
  details: string[];
  material: string;
  badge?: 'new' | 'hit';
  rating: number;
  reviews: number;
  createdAt: number;
}

export interface Category {
  slug: CategorySlug | 'sale';
  title: string;
  short: string;
  description: string;
  image: string;
  tint: string;
  href: string;
}

export interface CartLine {
  key: string;
  slug: string;
  size: string;
  color: string;
  qty: number;
}
