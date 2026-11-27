'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

// Garment hotspots, as % of the rack photo.
const spots = [
  { x: 15, y: 42, label: 'Xudi', href: '/boys' },
  { x: 33, y: 40, label: "Ko'ylak", href: '/boys' },
  { x: 49, y: 46, label: 'Futbolka', href: '/catalog' },
  { x: 65, y: 42, label: 'Kurtka', href: '/boys' },
  { x: 80, y: 52, label: 'Kargo shim', href: '/catalog' },
  { x: 93, y: 50, label: 'Jinsi', href: '/catalog' },
];

/** Topographic contour lines, generated once (like the reference's map texture). */
function Contours() {
  const paths = useMemo(() => {
    const out: string[] = [];
    const centers = [
      { cx: 260, cy: 220, seed: 1.3 },
      { cx: 980, cy: 520, seed: 2.7 },
    ];
    for (const { cx, cy, seed } of centers) {
      for (let r = 40; r <= 520; r += 38) {
        const points = Array.from({ length: 48 }, (_, i) => {
          const t = (i / 48) * Math.PI * 2;
          const wobble = 1 + 0.12 * Math.sin(t * 3 + seed + r / 90) + 0.07 * Math.sin(t * 5 - seed * 2 + r / 60);
          return [cx + Math.cos(t) * r * 1.35 * wobble, cy + Math.sin(t) * r * wobble];
        });
        out.push(`M${points.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L')} Z`);
      }
    }
    return out;
  }, []);

  return (
    <svg aria-hidden="true" viewBox="0 0 1280 760" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <g fill="none" stroke="currentColor" strokeWidth="1" className="animate-drift text-ink/[0.07]">
        {paths.map((d, i) => (
          <path key={i} d={d} strokeLinejoin="round" />
        ))}
      </g>
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" fill="currentColor" />
    </svg>
  );
}

export function HeroRack() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // Scroll parallax + a gentle follow-the-cursor drift on the rack.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const rackY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60]);
  const mx = useMotionValue(0);
  const rackX = useSpring(useTransform(mx, [-1, 1], reduce ? [0, 0] : [-14, 14]), { stiffness: 60, damping: 18 });

  const words = ['Har', 'bir', 'bola', '—', "o'ziga", 'xos.'];

  return (
    <section
      ref={ref}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        mx.set((event.clientX / window.innerWidth) * 2 - 1);
      }}
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      <Contours />

      <motion.div style={{ y: textY }} className="container-page relative pt-10 md:pt-16">
        <div className="grid gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr_auto]">
          <motion.p
            initial={reduce ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease }}
            className="pt-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-cocoa"
          >
            Yangi kolleksiya
          </motion.p>

          <div>
            <h1 id="hero-title" className="max-w-3xl text-[46px] font-semibold leading-[0.98] tracking-[-0.035em] sm:text-[64px] lg:text-[86px]">
              <span className="sr-only">Har bir bola — o&apos;ziga xos.</span>
              <span aria-hidden="true">
                {words.map((word, i) => (
                  <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                    <motion.span
                      className={`inline-block ${i >= 4 ? 'text-orange' : ''}`}
                      initial={reduce ? false : { y: '105%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.07 }}
                    >
                      {word}
                      {i < words.length - 1 ? ' ' : ''}
                    </motion.span>
                  </span>
                ))}
              </span>
            </h1>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.7 }}
                className="max-w-md text-[16px] leading-relaxed text-cocoa md:text-[17px]"
              >
                Zamonaviy, qulay va sifatli bolalar kiyimlari — chaqaloqlikdan maktab yoshigacha.
                Buxoro va Toshkentdagi do&apos;konlarimizda hamda Telegram&apos;da.
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.85 }}
                className="flex items-center gap-6"
              >
                <Link href="/catalog" className="group relative inline-flex items-center gap-2 pb-2 text-[17px] font-semibold">
                  Kolleksiyani ko&apos;rish
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  <span className="absolute inset-x-0 bottom-0 h-px bg-ink/25" />
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange transition-all duration-500 ease-silk group-hover:w-full" />
                </Link>
                <Link
                  href="/stores"
                  className="hidden items-center gap-1.5 rounded-full border border-ink/12 bg-white/70 px-4 py-2 text-[13px] font-semibold backdrop-blur transition-colors hover:border-orange hover:text-orange-deep sm:inline-flex"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Buxoro · Toshkent
                </Link>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.5 }}
            className="hidden lg:block"
          >
            <Sparkle className="h-6 w-6 animate-[spin_12s_linear_infinite] text-ink" />
          </motion.div>
        </div>
      </motion.div>

      {/* The rack: drops in, then floats with scroll and cursor. */}
      <motion.div style={{ y: rackY, x: rackX }} className="relative mx-auto mt-10 max-w-[1500px] md:mt-14">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -70, rotate: -1.2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.35 }}
          className="relative"
        >
          <Image
            src="/images/hero-rack-v2.webp"
            alt="MIKKO kolleksiyasi: xudi, ko'ylak, futbolka, kurtka, shim va jinsi ilgichda"
            width={1774}
            height={887}
            priority
            sizes="100vw"
            className="h-auto w-full drop-shadow-[0_30px_30px_rgba(38,32,28,0.12)]"
          />

          {spots.map((spot, i) => (
            <motion.div
              key={spot.label}
              initial={reduce ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 1.2 + i * 0.08 }}
              className="absolute hidden -translate-x-1/2 -translate-y-1/2 md:block"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <Link href={spot.href} aria-label={spot.label} className="group relative grid h-9 w-9 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />
                <span className="relative grid h-5 w-5 place-items-center rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
                  <span className="h-2 w-2 rounded-full bg-orange transition-transform group-hover:scale-150" />
                </span>
                <motion.span
                  initial={false}
                  animate={active === i ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 6, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-white shadow-lift"
                >
                  {spot.label} · ko&apos;rish →
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
