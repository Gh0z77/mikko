'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatPrice } from '@/lib/format';
import { deliveryFeeCity, freeShippingThreshold } from '@/lib/nav';
import { branches } from '@/lib/branches';

const faq = [
  {
    q: 'Qanday buyurtma beraman?',
    a: "Uch yo'l bor: saytda savatga qo'shib rasmiylashtirasiz, Telegram'da @mikko_kids_bot orqali yoki do'konimizga kelib. Buyurtmadan so'ng operatorimiz qo'ng'iroq qilib tasdiqlaydi.",
  },
  {
    q: 'Yetkazib berish qancha turadi?',
    a: `Buxoro va Toshkent shaharlari bo'ylab 1 kunda — ${formatPrice(deliveryFeeCity)}. ${formatPrice(freeShippingThreshold)} dan ortiq xaridga yetkazib berish bepul. Viloyatlarga 2–4 ish kunida yetkazamiz.`,
  },
  {
    q: "O'lcham mos kelmasa nima qilaman?",
    a: "Yorlig'i saqlangan kiyimni 14 kun ichida almashtirib beramiz. O'lcham tanlashda ikkilansangiz — qo'ng'iroq qiling, bolaning bo'yiga qarab maslahat beramiz.",
  },
  {
    q: "To'lov qanday amalga oshiriladi?",
    a: "Kiyimni qo'lingizga olganingizda — naqd yoki karta orqali. Oldindan to'lov shart emas.",
  },
  {
    q: "Do'koningiz qayerda?",
    a: branches
      .map((b) => `${b.name}: ${b.address ? `${b.address}${b.landmark ? ` (${b.landmark})` : ''}${b.phone ? `, ${b.phone}` : ''}` : "manzil tez orada e'lon qilinadi"}`)
      .join('. '),
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="container-page mt-16 md:mt-24" aria-labelledby="faq-title">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div id="faq-title">
          <SectionHeading
            eyebrow="Savollar"
            title="Ko'p so'raladigan savollar"
            description="Javob topilmasa — qo'ng'iroq qiling yoki Telegram'da yozing, darhol yordam beramiz."
          />
        </div>
        <ul className="space-y-3">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} className={`rounded-[22px] border transition-colors duration-300 ${isOpen ? 'border-orange/40 bg-white shadow-soft' : 'border-ink/8 bg-white/60'}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold"
                >
                  {item.q}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isOpen ? 'bg-orange text-white' : 'bg-orange-soft text-orange-deep'}`}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-[14px] leading-relaxed text-cocoa">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
