import Image from 'next/image';
import Link from 'next/link';
import { buttonClass } from '@/components/ui/buttonClass';
import { Reveal } from '@/components/ui/Reveal';

const looks = [
  { image: '/images/model-girl.webp', tint: '#FFEDED', label: 'Qizlar uchun', className: '' },
  {
    image: '/images/model-boy-hoodie.webp',
    tint: '#E7F2FF',
    label: "O'g'il bolalar",
    className: 'mt-6 md:mt-10',
  },
  { image: '/images/model-baby.webp', tint: '#FFF0DE', label: 'Chaqaloqlar', className: 'mt-12 md:mt-20' },
];

export function EditorialStrip() {
  return (
    <section className="container-page mt-16 md:mt-24" aria-labelledby="lookbook-title">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14">
        <Reveal>
          <span className="text-[11px] font-bold tracking-[0.14em] text-orange-deep">
            LOOKBOOK · 2026
          </span>
          <h2 id="lookbook-title" className="mt-3 text-[32px] leading-[1.05] sm:text-[40px] md:text-[46px]">
            Kuz-qish
            <br />
            <span className="italic">to&apos;plami</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-cocoa">
            Yumshoq trikotaj, momiq yoqali parkalar va issiq etiklar. Har bir detal bola
            harakatiga moslashadi — yugurishga ham, o&apos;tirishga ham qulay.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <p className="text-[24px] font-semibold leading-none tabular-nums">48+</p>
              <p className="mt-1 text-[11.5px] text-cocoa">yangi model</p>
            </div>
            <div className="h-9 w-px bg-ink/10" aria-hidden="true" />
            <div>
              <p className="text-[24px] font-semibold leading-none">100%</p>
              <p className="mt-1 text-[11.5px] text-cocoa">paxta mato</p>
            </div>
            <div className="h-9 w-px bg-ink/10" aria-hidden="true" />
            <div>
              <p className="text-[24px] font-semibold leading-none">14 kun</p>
              <p className="mt-1 text-[11.5px] text-cocoa">almashtirish</p>
            </div>
          </div>

          <Link href="/catalog?sort=new" className={buttonClass('outline', 'md', 'mt-8')}>
            To&apos;plamni ko&apos;rish
          </Link>
        </Reveal>

        <div className="grid grid-cols-3 gap-2.5 md:gap-4">
          {looks.map((look, index) => (
            <Reveal key={look.image} delay={index * 0.08} y={20} className={look.className}>
              <div
                className="group relative overflow-hidden rounded-[22px] md:rounded-[28px]"
                style={{ backgroundColor: look.tint }}
              >
                <div className="relative aspect-[3/4.4]">
                  <Image
                    src={look.image}
                    alt={look.label}
                    fill
                    sizes="(min-width: 1024px) 18vw, 30vw"
                    className="object-contain object-bottom p-1.5 transition-transform duration-700 ease-silk group-hover:scale-[1.05]"
                  />
                </div>
                <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/85 py-1.5 text-center text-[10px] font-semibold text-ink backdrop-blur md:text-[11.5px]">
                  {look.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
