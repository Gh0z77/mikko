'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Bot, MousePointerClick, Send, Shirt, ShoppingBag, Smartphone } from 'lucide-react';
import { PhoneDemo } from './PhoneDemo';
import { buttonClass } from '@/components/ui/buttonClass';
import { shopBotUrl } from '@/lib/nav';

const steps = [
  { icon: Bot, title: 'Botni oching', text: '@mikko_kids_bot — bitta bosish bilan' },
  { icon: Shirt, title: 'Kiyim tanlang', text: "Rasmlar, o'lchamlar va narxlar shu yerning o'zida" },
  { icon: ShoppingBag, title: 'Buyurtma bering', text: "Telefon raqam bitta tugma bilan — operator qo'ng'iroq qiladi" },
];

/** "Now in Telegram" block with a self-playing Mini App preview in a phone frame. */
export function TelegramShowcase() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const phoneY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [30, -30]);
  const phoneRotate = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [0, 0, 0] : [6, 0, -4]);

  return (
    <section ref={ref} className="container-page mt-16 md:mt-24" aria-labelledby="tg-title">
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#2AABEE] via-[#229ED9] to-[#1C8ADB] px-6 py-10 text-white md:rounded-[44px] md:px-12 md:py-14">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-1/3 h-80 w-80 rounded-full bg-white/10" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-bold">
              <Send className="h-3.5 w-3.5" />
              Yangi!
            </span>
            <h2 id="tg-title" className="mt-4 max-w-md text-[34px] leading-[1.05] text-white md:text-[46px]">
              Endi MIKKO Telegram&apos;da ham
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/85">
              Saytga kirmasdan, to&apos;g&apos;ridan-to&apos;g&apos;ri Telegram ichida kiyim tanlang va
              buyurtma bering. Xuddi ilovadek — tez va qulay.
            </p>

            <ol className="mt-7 space-y-3">
              {steps.map((step, i) => (
                <motion.li
                  key={step.title}
                  initial={reduce ? false : { opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 rounded-2xl bg-white/12 p-3 backdrop-blur-sm"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#1C8ADB]">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold">{step.title}</span>
                    <span className="block text-[12.5px] text-white/80">{step.text}</span>
                  </span>
                </motion.li>
              ))}
            </ol>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href={shopBotUrl} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-bold text-[#1C8ADB] shadow-[0_16px_30px_-14px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.02]">
                <Send className="h-4 w-4" />
                @mikko_kids_bot
              </a>
              <Link href="/app" target="_blank" className={buttonClass('outlineLight', 'lg')}>
                <Smartphone className="h-4 w-4" />
                Ilovani sinab ko&apos;rish
              </Link>
            </div>
          </div>

          {/* Self-playing preview of the Mini App. */}
          <motion.div style={{ y: phoneY, rotate: phoneRotate }} className="relative mx-auto hidden lg:block">
            <PhoneDemo />
            <Link
              href="/app"
              target="_blank"
              className="absolute -left-36 top-48 flex rotate-[-6deg] items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-[12px] font-bold text-ink shadow-lift transition-transform hover:rotate-0 hover:scale-105"
            >
              <MousePointerClick className="h-4 w-4 text-orange" />
              O&apos;zingiz sinab ko&apos;ring
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
