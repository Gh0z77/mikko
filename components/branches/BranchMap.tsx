'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { animate } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import type { Branch } from '@/lib/branches';

// Small dependency-free slippy map (OpenStreetMap tiles) with our own animated pins.
// shortcut: public OSM tile server — fine for a shop's traffic; switch to a keyed provider (MapTiler etc.) if usage grows.

const TILE = 256;
const tileUrl = (z: number, x: number, y: number) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

function project(lat: number, lon: number, z: number) {
  const scale = TILE * 2 ** z;
  const sin = Math.sin((lat * Math.PI) / 180);
  return { x: ((lon + 180) / 360) * scale, y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale };
}
function unproject(x: number, y: number, z: number) {
  const scale = TILE * 2 ** z;
  const lon = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  return { lat: (180 / Math.PI) * Math.atan(Math.sinh(n)), lon };
}

export function BranchMap({
  branches,
  selected,
  onSelect,
  className,
}: {
  branches: Branch[];
  selected: string | null;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const pinned = branches.filter((b) => b.coords);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 420 });
  const start = pinned.length
    ? {
        lat: pinned.reduce((s, b) => s + b.coords!.lat, 0) / pinned.length,
        lon: pinned.reduce((s, b) => s + b.coords!.lon, 0) / pinned.length,
      }
    : { lat: 41.3, lon: 64.5 };
  const [view, setView] = useState({ ...start, z: 14 });
  const drag = useRef<{ x: number; y: number; lat: number; lon: number } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const viewRef = useRef(view);
  viewRef.current = view;

  /** Smoothly pans to a point (the "fly to branch" effect). */
  const flyTo = useCallback((lat: number, lon: number, z: number) => {
    const from = viewRef.current;
    animate(0, 1, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (t) => setView({ lat: from.lat + (lat - from.lat) * t, lon: from.lon + (lon - from.lon) * t, z }),
    });
  }, []);

  useEffect(() => {
    const branch = pinned.find((b) => b.id === selected);
    if (branch?.coords) flyTo(branch.coords.lat, branch.coords.lon, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const z = Math.round(view.z);
  const center = project(view.lat, view.lon, z);
  const origin = { x: center.x - size.w / 2, y: center.y - size.h / 2 };
  const tiles: { x: number; y: number; left: number; top: number }[] = [];
  const max = 2 ** z;
  for (let tx = Math.floor(origin.x / TILE); tx <= Math.floor((origin.x + size.w) / TILE); tx++) {
    for (let ty = Math.floor(origin.y / TILE); ty <= Math.floor((origin.y + size.h) / TILE); ty++) {
      if (ty < 0 || ty >= max) continue;
      tiles.push({ x: ((tx % max) + max) % max, y: ty, left: tx * TILE - origin.x, top: ty * TILE - origin.y });
    }
  }

  return (
    <div
      ref={box}
      className={clsx('relative touch-none select-none overflow-hidden bg-[#EDE6DD]', className)}
      onPointerDown={(event) => {
        (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
        drag.current = { x: event.clientX, y: event.clientY, lat: view.lat, lon: view.lon };
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const startPx = project(drag.current.lat, drag.current.lon, z);
        const next = unproject(startPx.x - (event.clientX - drag.current.x), startPx.y - (event.clientY - drag.current.y), z);
        setView((v) => ({ ...v, ...next }));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      role="application"
      aria-label="Filiallar xaritasi"
    >
      {tiles.map((t) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${z}-${t.x}-${t.y}-${t.left}`}
          src={tileUrl(z, t.x, t.y)}
          alt=""
          draggable={false}
          className="pointer-events-none absolute h-[256px] w-[256px] max-w-none [filter:sepia(0.25)_saturate(0.85)_brightness(1.03)]"
          style={{ left: t.left, top: t.top }}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange/[0.06] to-transparent mix-blend-multiply" />

      {pinned.map((b) => {
        const p = project(b.coords!.lat, b.coords!.lon, z);
        const active = b.id === selected;
        return (
          <button
            key={b.id}
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onSelect(b.id)}
            className="group absolute -translate-x-1/2 -translate-y-full"
            style={{ left: p.x - origin.x, top: p.y - origin.y }}
            aria-label={b.name}
          >
            <span
              className={clsx(
                'absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[11.5px] font-semibold text-white shadow-lift transition-all',
                active ? 'opacity-100' : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
              )}
            >
              {b.name.replace('MIKKO ', '')}
              {b.approx ? ' · taxminiy' : ''}
            </span>
            <span className="relative block">
              <span className={clsx('absolute left-1/2 top-[22px] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange/40', active ? 'animate-ping' : 'hidden')} />
              <span
                className={clsx(
                  'relative grid h-11 w-11 place-items-center rounded-full border-[3px] bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.45)] transition-transform duration-300',
                  active ? 'scale-110 border-orange' : 'border-white group-hover:scale-110',
                )}
              >
                <Image src="/images/mikko-bear.png" alt="" width={152} height={110} className="h-5 w-auto" />
              </span>
              <span className="mx-auto block h-3 w-[3px] rounded-b bg-orange" />
            </span>
          </button>
        );
      })}

      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft">
        <button type="button" aria-label="Kattalashtirish" onPointerDown={(e) => e.stopPropagation()} onClick={() => setView((v) => ({ ...v, z: Math.min(18, v.z + 1) }))} className="grid h-10 w-10 place-items-center hover:bg-cream">
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Kichiklashtirish" onPointerDown={(e) => e.stopPropagation()} onClick={() => setView((v) => ({ ...v, z: Math.max(5, v.z - 1) }))} className="grid h-10 w-10 place-items-center border-t border-ink/8 hover:bg-cream">
          <Minus className="h-4 w-4" />
        </button>
      </div>
      <p className="absolute bottom-1 right-2 text-[9.5px] text-ink/50">© OpenStreetMap contributors</p>
    </div>
  );
}
