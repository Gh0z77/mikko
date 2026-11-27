import { kvGet, kvSet } from './db';

export interface Place {
  address: string;
  region: string; // "Buxoro shahri" | "Toshkent shahri" | "<viloyat>"
  city: string | null;
}

interface NominatimResult {
  display_name?: string;
  address?: Record<string, string>;
}

/** Reverse-geocodes a point with OpenStreetMap Nominatim (cached; their policy allows ~1 req/s). */
export async function reverseGeocode(lat: number, lon: number): Promise<Place | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const key = `geo:${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = await kvGet<Place>(key);
  if (cached) return cached;

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.search = new URLSearchParams({ lat: String(lat), lon: String(lon), format: 'jsonv2', 'accept-language': 'uz', zoom: '18' }).toString();
    const response = await fetch(url, { headers: { 'User-Agent': 'mikko-shop/1.0' }, signal: AbortSignal.timeout(6000) });
    if (!response.ok) return null;
    const data = (await response.json()) as NominatimResult;
    const a = data.address ?? {};
    const city = a.city ?? a.town ?? a.village ?? null;
    const state = a.state ?? '';
    const where = `${city ?? ''} ${state}`.toLowerCase();
    const region = where.includes('toshkent') || where.includes('tashkent')
      ? 'Toshkent shahri'
      : where.includes('buxoro') || where.includes('bukhara')
        ? 'Buxoro shahri'
        : state || 'Viloyat';
    const street = [a.road, a.house_number].filter(Boolean).join(' ');
    const parts = [a.neighbourhood ?? a.suburb ?? a.quarter, street, city].filter(Boolean);
    const place: Place = { address: parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || `${lat}, ${lon}`, region, city };
    await kvSet(key, place, 60 * 60 * 24 * 90);
    return place;
  } catch {
    return null;
  }
}
