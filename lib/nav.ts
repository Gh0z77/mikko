export const mainNav = [
  { href: '/catalog', label: 'Katalog' },
  { href: '/boys', label: "O'g'il bolalar" },
  { href: '/girls', label: 'Qizlar' },
  { href: '/baby', label: 'Chaqaloqlar' },
  { href: '/shoes', label: 'Oyoq kiyimlar' },
  { href: '/accessories', label: 'Aksessuarlar' },
];

export const secondaryNav = [
  { href: '/sale', label: 'Aksiyalar' },
  { href: '/about', label: 'MIKKO haqida' },
  { href: '/stores', label: "Do'konlar" },
];

export const supportNav = [
  { href: '/stores', label: "Do'kon manzillari" },
  { href: '/about#yetkazish', label: 'Yetkazib berish' },
  { href: '/about#qaytarish', label: 'Qaytarish shartlari' },
];

// Real store contacts (from instagram.com/mikko_uz). Hours and delivery fees: confirm with the owner.
export const storePhone = '+998 91 639 92 98';
export const storePhoneHref = 'tel:+998916399298';
export const storeCity = 'Buxoro';
export const storeAddress = "Buxoro shahar, 5-kichik nohiya";
export const storeLandmark = "Avtomobil yo'llari kolleji to'g'risida";
export const storeHours = 'Har kuni 09:00 — 21:00';
export const storeMapUrl =
  'https://maps.google.com/?q=Buxoro+5-kichik+nohiya+Avtomobil+yo%27llari+kolleji';
export const telegramHandle = '@mikko_kids';
export const telegramUrl = 'https://t.me/mikko_kids';
export const shopBotUrl = 'https://t.me/mikko_kids_bot';
export const instagramHandle = '@mikko_uz';
export const instagramUrl = 'https://instagram.com/mikko_uz';
export const instagramFollowers = '171 000+';
export const instagramPosts = '2 500+';
export const freeShippingThreshold = 500000;
export const deliveryFeeCity = 25000;
export const deliveryFeeRegion = 35000;

export const CITY_REGION = 'Buxoro shahri';
/** Cities where we have a branch: courier there costs the city fee. */
export const CITY_REGIONS = ['Buxoro shahri', 'Toshkent shahri'];

export function shippingFor(subtotal: number, delivery?: 'courier' | 'pickup', region?: string | null) {
  if (delivery === 'pickup' || subtotal >= freeShippingThreshold) return 0;
  return region && CITY_REGIONS.includes(region) ? deliveryFeeCity : deliveryFeeRegion;
}
