'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, ImagePlus, Loader2, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { categoryLabels } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import type { CategorySlug, ColorOption, Product } from '@/lib/types';

type Item = Product & { hidden?: boolean };

const SIZE_PRESETS: Record<CategorySlug, string[]> = {
  baby: ['56', '62', '68', '74', '80', '86', '92', '98'],
  boys: ['92', '98', '104', '110', '116', '122', '128', '134', '140'],
  girls: ['92', '98', '104', '110', '116', '122', '128', '134', '140'],
  shoes: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'],
  accessories: ['Standart', 'S', 'M', 'L'],
};

const PALETTE: ColorOption[] = [
  { name: 'Krem', hex: '#F2E3CE' },
  { name: 'Bej', hex: '#D9C2A7' },
  { name: 'Jigarrang', hex: '#7A5138' },
  { name: "Ko'k", hex: '#3E6FB0' },
  { name: 'Qizil', hex: '#C0392B' },
  { name: 'Oranje', hex: '#FF7A00' },
  { name: 'Pushti', hex: '#F4B6C2' },
  { name: 'Yashil', hex: '#6E8B5B' },
  { name: 'Kulrang', hex: '#9E9E9E' },
  { name: 'Qora', hex: '#222222' },
  { name: 'Oq', hex: '#FFFFFF' },
];

interface Draft {
  slug?: string;
  name: string;
  category: CategorySlug;
  price: string;
  oldPrice: string;
  badge: '' | 'new' | 'hit';
  images: string[];
  sizes: string[];
  colors: ColorOption[];
  description: string;
  material: string;
  details: string;
  hidden: boolean;
}

const emptyDraft = (): Draft => ({
  name: '',
  category: 'boys',
  price: '',
  oldPrice: '',
  badge: 'new',
  images: [],
  sizes: [],
  colors: [],
  description: '',
  material: '',
  details: '',
  hidden: false,
});

const toDraft = (p: Item): Draft => ({
  slug: p.slug,
  name: p.name,
  category: p.category,
  price: String(p.price),
  oldPrice: p.oldPrice ? String(p.oldPrice) : '',
  badge: p.badge ?? '',
  images: p.images,
  sizes: p.sizes,
  colors: p.colors,
  description: p.description,
  material: p.material === '—' ? '' : p.material,
  details: p.details.join('\n'),
  hidden: Boolean(p.hidden),
});

const toPayload = (d: Draft) => ({
  slug: d.slug,
  name: d.name,
  category: d.category,
  price: Number(d.price.replace(/\D/g, '')),
  oldPrice: d.oldPrice ? Number(d.oldPrice.replace(/\D/g, '')) : undefined,
  badge: d.badge || undefined,
  images: d.images,
  sizes: d.sizes,
  colors: d.colors,
  description: d.description,
  material: d.material,
  details: d.details.split('\n'),
  hidden: d.hidden,
});

const field = 'h-11 w-full rounded-xl border border-ink/12 bg-white px-3.5 text-[14px] outline-none focus:border-orange';

export function ProductsManager() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<CategorySlug | 'all'>('all');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/products', { cache: 'no-store' });
    if (response.status === 401) return window.location.reload();
    setItems(((await response.json()) as { products: Item[] }).products);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((p) => (cat === 'all' || p.category === cat) && (!q || p.name.toLowerCase().includes(q)));
  }, [items, query, cat]);

  async function save(next: Draft) {
    setSaving(true);
    setError('');
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toPayload(next)),
    });
    const data = (await response.json()) as { ok: boolean; error?: string };
    setSaving(false);
    if (!data.ok) return setError(data.error ?? 'Saqlab bo‘lmadi');
    setDraft(null);
    load();
  }

  async function upload(files: FileList | null) {
    if (!files?.length || !draft) return;
    setError('');
    const picked = [...files].slice(0, 6 - draft.images.length);
    setUploading(picked.length);
    const urls: string[] = [];
    for (const file of picked) {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = (await response.json()) as { ok: boolean; url?: string; error?: string };
      if (data.ok && data.url) urls.push(data.url);
      else setError(data.error ?? 'Rasm yuklanmadi');
      setUploading((n) => n - 1);
    }
    setDraft((d) => (d ? { ...d, images: [...d.images, ...urls] } : d));
  }

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const toggle = <T,>(arr: T[], value: T, same: (a: T, b: T) => boolean = Object.is) =>
    arr.some((x) => same(x, value)) ? arr.filter((x) => !same(x, value)) : [...arr, value];

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'boys', 'girls', 'baby', 'shoes', 'accessories'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={clsx('rounded-full px-3.5 py-2 text-[13px] font-semibold', cat === c ? 'bg-ink text-white' : 'bg-white text-ink/75')}
          >
            {c === 'all' ? 'Hammasi' : categoryLabels[c]}
          </button>
        ))}
        <label className="ml-auto flex h-10 w-full items-center gap-2 rounded-full bg-white px-4 sm:w-60">
          <Search className="h-4 w-4 text-cocoa" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mahsulot qidirish" className="w-full bg-transparent text-[13px] outline-none" />
        </label>
        <button
          type="button"
          onClick={() => {
            setError('');
            setDraft(emptyDraft());
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-orange px-4 text-[13px] font-bold text-white hover:bg-orange-deep"
        >
          <Plus className="h-4 w-4" /> Yangi mahsulot
        </button>
      </div>

      {items === null ? (
        <div className="mt-4 h-60 animate-pulse rounded-3xl bg-white" />
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {visible.map((p) => (
            <li key={p.slug} className={clsx('overflow-hidden rounded-3xl bg-white', p.hidden && 'opacity-55')}>
              <div className="relative aspect-square bg-cream">
                {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="220px" className="object-contain p-2" />}
                {p.hidden && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">
                    <EyeOff className="h-3 w-3" /> Yashirin
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-[13px] font-semibold">{p.name}</p>
                <p className="text-[12px] text-cocoa">{categoryLabels[p.category]}</p>
                <p className="mt-1 text-[13px] font-bold text-orange-deep">{formatPrice(p.price)}</p>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setDraft(toDraft(p));
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-cream py-2 text-[12px] font-semibold hover:bg-orange-soft"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Tahrirlash
                  </button>
                  <button
                    type="button"
                    onClick={() => save({ ...toDraft(p), hidden: !p.hidden })}
                    aria-label={p.hidden ? "Saytda ko'rsatish" : 'Yashirish'}
                    title={p.hidden ? "Saytda ko'rsatish" : 'Yashirish'}
                    className="grid w-9 place-items-center rounded-xl bg-cream hover:bg-orange-soft"
                  >
                    {p.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {draft && (
          <>
            <motion.button
              type="button"
              aria-label="Yopish"
              onClick={() => setDraft(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/30"
            />
            <motion.form
              onSubmit={(e) => {
                e.preventDefault();
                save(draft);
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-ink/8 px-6 py-4">
                <h2 className="text-[20px]">{draft.slug ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h2>
                <button type="button" onClick={() => setDraft(null)} className="rounded-full p-2 hover:bg-cream" aria-label="Yopish">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <div>
                  <p className="text-[13px] font-bold">Rasmlar <span className="font-normal text-cocoa">(birinchisi asosiy)</span></p>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {draft.images.map((url, i) => (
                      <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-cream">
                        <Image src={url} alt="" fill sizes="120px" className="object-contain p-1" />
                        {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-orange px-1.5 py-0.5 text-[9px] font-bold text-white">Asosiy</span>}
                        <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                          {i > 0 && (
                            <button
                              type="button"
                              title="Asosiy qilish"
                              onClick={() => update('images', [url, ...draft.images.filter((u) => u !== url)])}
                              className="grid h-7 w-7 place-items-center rounded-full bg-white shadow"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="O'chirish"
                            onClick={() => update('images', draft.images.filter((u) => u !== url))}
                            className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-white text-[#C0392B] shadow"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {draft.images.length < 6 && (
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-ink/15 text-cocoa hover:border-orange hover:text-orange-deep"
                      >
                        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    hidden
                    onChange={(e) => {
                      upload(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </div>

                <label className="block">
                  <span className="text-[13px] font-bold">Nomi</span>
                  <input value={draft.name} onChange={(e) => update('name', e.target.value)} className={clsx(field, 'mt-1.5')} placeholder="Masalan: Ayiqcha naqshli xudi" />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[13px] font-bold">Kategoriya</span>
                    <select
                      value={draft.category}
                      onChange={(e) => update('category', e.target.value as CategorySlug)}
                      className={clsx(field, 'mt-1.5')}
                    >
                      {(Object.keys(categoryLabels) as CategorySlug[]).map((c) => (
                        <option key={c} value={c}>
                          {categoryLabels[c]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div>
                    <span className="text-[13px] font-bold">Belgi</span>
                    <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl bg-cream p-1">
                      {([
                        ['', "Yo'q"],
                        ['new', 'Yangi'],
                        ['hit', 'Xit'],
                      ] as const).map(([value, label]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => update('badge', value)}
                          className={clsx('h-9 rounded-lg text-[12.5px] font-semibold', draft.badge === value ? 'bg-white shadow-sm' : 'text-cocoa')}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[13px] font-bold">Narx (so&apos;m)</span>
                    <input value={draft.price} onChange={(e) => update('price', e.target.value)} inputMode="numeric" className={clsx(field, 'mt-1.5')} placeholder="249000" />
                  </label>
                  <label className="block">
                    <span className="text-[13px] font-bold">Eski narx <span className="font-normal text-cocoa">(chegirma)</span></span>
                    <input value={draft.oldPrice} onChange={(e) => update('oldPrice', e.target.value)} inputMode="numeric" className={clsx(field, 'mt-1.5')} placeholder="299000" />
                  </label>
                </div>

                <div>
                  <span className="text-[13px] font-bold">O&apos;lchamlar</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {SIZE_PRESETS[draft.category].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => update('sizes', toggle(draft.sizes, size))}
                        className={clsx(
                          'h-9 min-w-[44px] rounded-xl border px-2.5 text-[13px] font-semibold',
                          draft.sizes.includes(size) ? 'border-orange bg-orange text-white' : 'border-ink/12',
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[13px] font-bold">Ranglar</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PALETTE.map((color) => {
                      const on = draft.colors.some((c) => c.name === color.name);
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => update('colors', toggle(draft.colors, color, (a, b) => a.name === b.name))}
                          className={clsx('flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-[12px] font-semibold', on ? 'border-ink bg-cream' : 'border-ink/12')}
                        >
                          <span className="h-5 w-5 rounded-full ring-1 ring-ink/15" style={{ backgroundColor: color.hex }} />
                          {color.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="text-[13px] font-bold">Tavsif</span>
                  <textarea value={draft.description} onChange={(e) => update('description', e.target.value)} rows={3} className={clsx(field, 'mt-1.5 h-auto py-2.5')} />
                </label>
                <label className="block">
                  <span className="text-[13px] font-bold">Material</span>
                  <input value={draft.material} onChange={(e) => update('material', e.target.value)} className={clsx(field, 'mt-1.5')} placeholder="100% paxta" />
                </label>
                <label className="block">
                  <span className="text-[13px] font-bold">Afzalliklari <span className="font-normal text-cocoa">(har biri yangi qatorda)</span></span>
                  <textarea value={draft.details} onChange={(e) => update('details', e.target.value)} rows={3} className={clsx(field, 'mt-1.5 h-auto py-2.5')} />
                </label>
                <label className="flex items-center gap-2.5 text-[13px] font-semibold">
                  <input type="checkbox" checked={draft.hidden} onChange={(e) => update('hidden', e.target.checked)} className="h-4 w-4 accent-orange" />
                  Saytda yashirish (sotuvda yo&apos;q)
                </label>
              </div>

              <div className="border-t border-ink/8 px-6 py-4">
                {error && <p className="mb-3 rounded-xl bg-[#FDECEA] px-3.5 py-2.5 text-[13px] font-semibold text-[#C0392B]">{error}</p>}
                <button
                  type="submit"
                  disabled={saving || uploading > 0}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange text-[15px] font-bold text-white disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {draft.slug ? 'Saqlash' : "Mahsulotni qo'shish"}
                </button>
                <p className="mt-2 text-center text-[11.5px] text-cocoa">Saqlangach sayt, Telegram bot va Mini App'da darhol ko&apos;rinadi.</p>
              </div>
            </motion.form>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
