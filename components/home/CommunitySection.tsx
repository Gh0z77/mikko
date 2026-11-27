import { Send } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/BrandIcons';
import { CountUp } from '@/components/ui/CountUp';
import { MascotSign } from '@/components/ui/MascotSign';
import {
  instagramFollowers,
  instagramHandle,
  instagramPosts,
  instagramUrl,
  telegramHandle,
  telegramUrl,
} from '@/lib/nav';

export function CommunitySection() {
  return (
    <section className="container-page" aria-labelledby="community-title">
      <div className="relative overflow-hidden rounded-[36px] bg-orange px-6 py-12 md:rounded-5xl md:px-14 md:py-16">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute inset-3 rounded-[28px] border-2 border-dashed border-white/25 md:inset-4 md:rounded-[40px]" />

        <div className="relative grid items-center gap-8 md:grid-cols-[1.25fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white">
              <InstagramIcon className="h-3.5 w-3.5" />
              {instagramHandle}
            </span>
            <h2
              id="community-title"
              className="mt-4 max-w-md text-[30px] leading-[1.08] text-white sm:text-[38px] md:text-[42px]"
            >
              {instagramFollowers} ota-ona allaqachon biz bilan
            </h2>
            <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-white/85">
              Har kuni yangi kelgan kiyimlar, aksiyalar va mijozlarimizning fikrlari —
              hammasi Instagram va Telegram&apos;da. Bizning oilaga qo&apos;shiling!
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[52px] items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-cream transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram&apos;da kuzatish
              </a>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[52px] items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-ink transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                {telegramHandle}
              </a>
            </div>

            <dl className="mt-7 flex gap-8 text-white">
              {[
                { value: instagramFollowers, label: 'obunachi' },
                { value: instagramPosts, label: "post va yangi model" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-[26px] leading-none tabular-nums">
                    <CountUp value={stat.value} />
                  </dt>
                  <dd className="mt-1 text-[11.5px] text-white/75">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden justify-self-end md:block">
            <MascotSign text="171 000+" variant="king" height={250} alt="Mikko ayiqchasi" className="animate-float-slow drop-shadow-[0_24px_40px_rgba(0,0,0,0.18)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
