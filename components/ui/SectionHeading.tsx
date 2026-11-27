'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface SectionHeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

// Words rise out of a mask one by one, then a hand-drawn squiggle underlines the title.
export function SectionHeading({
  title,
  description,
  eyebrow,
  href,
  linkLabel = "Barchasini ko'rish",
  className,
}: SectionHeadingProps) {
  const reduce = useReducedMotion();
  const words = title.split(' ');
  const view = { once: true, amount: 0.6 } as const;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-2xl">
          {eyebrow && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={view}
              transition={{ duration: 0.5, ease }}
              className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-deep"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange" />
              {eyebrow}
            </motion.p>
          )}
          {/* The h2 owns the in-view trigger: masked words start clipped, so they can't observe themselves. */}
          <motion.h2
            initial={reduce ? false : 'hidden'}
            whileInView="show"
            viewport={view}
            className="relative text-[30px] leading-[1.08] sm:text-[38px] md:text-[46px]"
          >
            <span className="sr-only">{title}</span>
            <span aria-hidden="true">
              {words.map((word, i) => (
                <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <motion.span
                    className="inline-block"
                    variants={{
                      hidden: { y: '110%', rotate: 6 },
                      show: { y: 0, rotate: 0, transition: { duration: 0.7, ease, delay: i * 0.08 } },
                    }}
                  >
                    {word}
                    {i < words.length - 1 ? ' ' : ''}
                  </motion.span>
                </span>
              ))}
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              className="absolute -bottom-2 left-0 h-3 w-[min(220px,60%)] text-orange"
            >
              <motion.path
                d="M2 8 C 30 2, 50 12, 80 6 S 130 2, 160 7 S 190 9, 198 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                variants={{
                  hidden: { pathLength: 0 },
                  show: {
                    pathLength: 1,
                    transition: { duration: 0.9, ease, delay: words.length * 0.08 + 0.2 },
                  },
                }}
              />
            </svg>
          </motion.h2>
          {description && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={view}
              transition={{ duration: 0.6, ease, delay: 0.25 }}
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-cocoa"
            >
              {description}
            </motion.p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="group hidden items-center gap-2 rounded-full border border-ink/12 px-5 py-2.5 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-orange hover:bg-orange hover:text-white hover:shadow-[0_14px_28px_-12px_rgba(254,103,0,0.7)] md:inline-flex"
          >
            {linkLabel}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:rotate-45" />
          </Link>
        )}
      </div>
    </div>
  );
}
