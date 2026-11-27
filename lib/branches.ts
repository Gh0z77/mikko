// Store branches (from instagram.com/mikko_uz bio). Fill Tashkent and exact pins when the owner confirms.

export interface Branch {
  id: string;
  city: 'Buxoro' | 'Toshkent';
  name: string;
  address: string | null;
  landmark: string | null;
  phone: string | null;
  hours: string;
  /** null = location not confirmed yet (no pin is drawn). */
  coords: { lat: number; lon: number } | null;
  /** true when the pin is only near the right spot. */
  approx?: boolean;
}

export const branches: Branch[] = [
  {
    id: 'buxoro-5',
    city: 'Buxoro',
    name: 'MIKKO Buxoro — 5-kichik nohiya',
    address: 'Buxoro shahri, 5-kichik nohiya',
    landmark: "Avtomobil yo'llari kolleji to'g'risida",
    phone: '+998 91 639 92 98',
    hours: 'Har kuni 09:00 — 21:00',
    coords: { lat: 39.7505, lon: 64.4335 },
    approx: true,
  },
  {
    id: 'buxoro-gorgaz',
    city: 'Buxoro',
    name: 'MIKKO Buxoro — Gorgaz',
    address: "Buxoro shahri, Mustaqillik ko'chasi",
    landmark: "Gorgaz (Shahar gaz), Kodak povoroti to'g'risida",
    phone: '+998 90 639 92 98',
    hours: 'Har kuni 09:00 — 21:00',
    coords: { lat: 39.763, lon: 64.4307 },
  },
  {
    id: 'toshkent',
    city: 'Toshkent',
    name: 'MIKKO Toshkent',
    address: null,
    landmark: null,
    phone: null,
    hours: 'Tez orada',
    coords: null,
  },
];

export const branchCities = ['Buxoro', 'Toshkent'] as const;

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function mapsLink(lat: number, lon: number) {
  return `https://maps.google.com/?q=${lat},${lon}`;
}

export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function nearestBranch(point: { lat: number; lon: number }) {
  return branches
    .filter((b) => b.coords)
    .map((b) => ({ branch: b, km: distanceKm(point, b.coords!) }))
    .sort((x, y) => x.km - y.km)[0];
}
