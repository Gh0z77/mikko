'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { getConsent, setConsent } from '@/lib/interests';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(getConsent() === null), 1500); // let the page breathe first
    return () => clearTimeout(timer);
  }, []);

  const choose = (value: 'all' | 'essential') => {
    setConsent(value);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie sozlamalari"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-24 left-3 right-3 z-[80] mx-auto max-w-md rounded-[26px] bg-white p-5 shadow-[0_30px_60px_-20px_rgba(38,32,28,0.45)] md:bottom-6 md:left-6 md:right-auto"
        >
          <div className="flex gap-4">
            <Image src="/images/mikko-bear.png" alt="" width={152} height={110} className="h-10 w-auto shrink-0" />
            <div>
              <p className="flex items-center gap-1.5 font-display text-[17px] font-semibold">
                Sizga mos kiyimlarni ko&apos;rsatamizmi? <Cookie className="h-4 w-4 text-orange-deep" />
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-cocoa">
                Cookie&apos;lar yordamida qaysi kiyimlar yoqqanini eslab qolamiz va keyingi safar aynan shularni
                birinchi ko&apos;rsatamiz. Ma&apos;lumotlar faqat shu qurilmada saqlanadi.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => choose('essential')} className="h-11 rounded-2xl border border-ink/12 text-[13px] font-semibold hover:bg-cream">
              Faqat zarurlari
            </button>
            <button type="button" onClick={() => choose('all')} className="h-11 rounded-2xl bg-orange text-[13px] font-bold text-white hover:bg-orange-deep">
              Roziman
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
