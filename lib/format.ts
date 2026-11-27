export const CURRENCY = "so'm";

const nbsp = '\u00A0';

export function formatPrice(value: number): string {
  const grouped = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, nbsp);
  return `${grouped}${nbsp}${CURRENCY}`;
}

export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, nbsp);
}

export function discountPercent(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function productCountLabel(count: number): string {
  return `${count} ta mahsulot`;
}
