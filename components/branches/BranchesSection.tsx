'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { branches, mapsLink, phoneHref } from '@/lib/branches';
import { BranchMap } from './BranchMap';

export function BranchesSection({ heading = true }: { heading?: boolean }) {
  const [selected, setSelected] = useState<string | null>(branches.find((b) => b.coords)?.id ?? null);

  return (
    <section className="container-page mt-16 md:mt-24" aria-labelledby="branches-title">
      {heading && (
        <div id="branches-title">
          <SectionHeading
            eyebrow="Filiallar"
            title="Bizni toping"
            description="Buxoro va Toshkentdagi do'konlarimiz. Bolangizga kiygizib ko'rib, bemalol tanlang."
            href="/stores"
            linkLabel="Barcha filiallar"
          />
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <ul className="space-y-3">
          {branches.map((b, i) => {
            const active = selected === b.id;
            return (
              <motion.li
                key={b.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => b.coords && setSelected(b.id)}
                  onKeyDown={(e) => e.key === 'Enter' && b.coords && setSelected(b.id)}
                  className={clsx(
                    'w-full rounded-[24px] border p-5 text-left transition-all duration-300',
                    active ? 'border-orange bg-white shadow-[0_20px_40px_-24px_rgba(254,103,0,0.6)]' : 'border-ink/8 bg-white/60 hover:bg-white',
                    !b.coords && 'cursor-default',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[17px]">{b.name}</h3>
                    <span className={clsx('shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', b.address ? 'bg-[#E3F5EA] text-[#2E9E5B]' : 'bg-orange-soft text-orange-deep')}>
                      {b.address ? 'Ochiq' : 'Tez orada'}
                    </span>
                  </div>
                  <p className="mt-3 flex items-start gap-2 text-[13px] text-cocoa">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-deep" />
                    <span>
                      {b.address ?? "Manzil tez orada e'lon qilinadi"}
                      {b.landmark && <span className="block text-[12px] text-cocoa/75">{b.landmark}</span>}
                    </span>
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-[13px] text-cocoa">
                    <Clock className="h-4 w-4 text-orange-deep" /> {b.hours}
                  </p>
                  {(b.phone || b.coords) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {b.phone && (
                        <a href={phoneHref(b.phone)} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-[12px] font-semibold hover:bg-orange-soft">
                          <Phone className="h-3.5 w-3.5" /> {b.phone}
                        </a>
                      )}
                      {b.coords && (
                        <a
                          href={mapsLink(b.coords.lat, b.coords.lon)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-orange"
                        >
                          <Navigation className="h-3.5 w-3.5" /> Yo&apos;nalish
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>

        <BranchMap
          branches={branches}
          selected={selected}
          onSelect={setSelected}
          className="h-[380px] rounded-[28px] shadow-[0_30px_60px_-40px_rgba(38,32,28,0.5)] lg:h-auto lg:min-h-[460px]"
        />
      </div>
    </section>
  );
}
