'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { sizeGuide } from '@/lib/products';

export function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Yopish"
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-auto rounded-t-4xl bg-shell p-6 shadow-lift sm:rounded-4xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="size-guide-title" className="text-2xl">
                  O&apos;lcham jadvali
                </h3>
                <p className="mt-1 text-sm text-cocoa">
                  Bolaning bo&apos;yi bo&apos;yicha tanlang — kiyim biroz keng tikilgan.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Yopish"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/[0.06] transition-colors hover:bg-ink/[0.12]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream text-xs font-semibold text-cocoa">
                  <tr>
                    <th className="px-4 py-3">O&apos;lcham</th>
                    <th className="px-4 py-3">Yosh</th>
                    <th className="px-4 py-3">Bo&apos;y</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.map((row) => (
                    <tr key={row.size} className="border-t border-ink/8">
                      <td className="px-4 py-2.5 font-semibold tabular-nums">{row.size}</td>
                      <td className="px-4 py-2.5 text-cocoa">{row.age}</td>
                      <td className="px-4 py-2.5 text-cocoa">{row.height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-cocoa/80">
              Agar o&apos;lcham orasida qolsangiz, kattaroq variantni tanlang. Savol bo&apos;lsa
              Telegram orqali yozing — javob beramiz.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
