'use client';

export interface Located {
  lat: number;
  lon: number;
  address: string;
  region: string;
  nearest: { id: string; name: string; km: number } | null;
}

interface TgLocationManager {
  isInited: boolean;
  isLocationAvailable: boolean;
  init: (cb?: () => void) => void;
  getLocation: (cb: (data: { latitude: number; longitude: number } | null) => void) => void;
}

function gps(): Promise<{ lat: number; lon: number }> {
  // Inside Telegram (Bot API 8.0+) use its native permission sheet.
  const manager = (window.Telegram?.WebApp as unknown as { LocationManager?: TgLocationManager } | undefined)?.LocationManager;
  if (manager && window.Telegram?.WebApp?.initData) {
    return new Promise((resolve, reject) => {
      const ask = () =>
        manager.getLocation((data) => (data ? resolve({ lat: data.latitude, lon: data.longitude }) : reject(new Error('denied'))));
      if (manager.isInited) ask();
      else manager.init(ask);
    });
  }
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('unsupported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  });
}

/** Asks for the device location and turns it into a readable address (+ nearest branch). */
export async function locateMe(): Promise<Located> {
  const { lat, lon } = await gps();
  const response = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
  const data = (await response.json()) as Partial<Located> & { ok: boolean };
  return {
    lat,
    lon,
    address: data.ok && data.address ? data.address : `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    region: data.region ?? '',
    nearest: data.nearest ?? null,
  };
}

export const locateErrorText =
  "Joylashuvni aniqlab bo'lmadi. Brauzerga ruxsat bering yoki manzilni qo'lda yozing.";
