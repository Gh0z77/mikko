import { NextResponse } from 'next/server';
import { reverseGeocode } from '@/lib/geocode';
import { nearestBranch } from '@/lib/branches';

// Turns the visitor's GPS point into a readable address for the checkout form.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get('lat'));
  const lon = Number(url.searchParams.get('lon'));
  const place = await reverseGeocode(lat, lon);
  if (!place) return NextResponse.json({ ok: false }, { status: 422 });
  const nearest = nearestBranch({ lat, lon });
  return NextResponse.json({
    ok: true,
    ...place,
    nearest: nearest ? { id: nearest.branch.id, name: nearest.branch.name, km: Math.round(nearest.km * 10) / 10 } : null,
  });
}
