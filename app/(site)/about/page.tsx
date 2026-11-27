import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeartHandshake, Leaf, PackageCheck, RotateCcw, Ruler, Truck } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { buttonClass } from '@/components/ui/buttonClass';
import { formatPrice } from '@/lib/format';
import {
  deliveryFeeCity,
  deliveryFeeRegion,
  freeShippingThreshold,
  instagramFollowers,
  instagramPosts,
} from '@/lib/nav';

export const metadata: Metadata = {
  title: 'MIKKO haqida',
  description:
    "MIKKO — Buxoro va Toshkentdagi bolalar kiyim do'koni. Biz haqimizda, yetkazib berish va qaytarish shartlari.",
};

const values = [
  {
    icon: Leaf,
    title: 'Sinchiklab tanlangan kiyimlar',
    text: "Har bir modelni o'zimiz tanlaymiz: matosi yumshoq, tikuvi pishiq, bolaga qulay bo'lsagina vitrinaga chiqadi.",
  },
  {
    icon: HeartHandshake,
    title: "Har kungi qulaylik",
    text: "Kiyim o'yin paytida ham, uyquda ham xalaqit bermaydi: yumshoq tikuvlar, elastik belbog'lar.",
  },
  {
    icon: PackageCheck,
    title: 'Halol narx',
    text: "Hamyonbop narxlar va doimiy aksiyalar — sifatli kiyim har bir oilaga yetib borsin.",
  },
];

const delivery = [
  {
    title: 'Buxoro shahri',
    time: '1 kun',
    price: formatPrice(deliveryFeeCity),
    note: "Kuryer uyga yetkazadi, to'lov yetkazishda",
  },
  {
    title: 'Viloyatlar',
    time: '2–4 ish kuni',
    price: formatPrice(deliveryFeeRegion),
    note: 'Pochta yoki kuryer xizmati orqali',
  },
  {
    title: `${formatPrice(freeShippingThreshold)} dan yuqori`,
    time: "O'zbekiston bo'ylab",
    price: 'Bepul',
    note: "Chegirmali buyurtmalarga ham amal qiladi",
  },
];

const returns = [
  "Mahsulotni olganingizdan keyin 14 kun ichida qaytarishingiz mumkin.",
  "Kiyim kiyilmagan, yorliqlari va original qadoqda saqlangan bo'lishi kerak.",
  "O'lcham mos kelmasa — bepul almashtirib beramiz (Buxoro ichida).",
  "Pul 3–5 ish kuni ichida karta yoki naqd orqali qaytariladi.",
];

export default function AboutPage() {
  return (
    <div className="container-page py-8 md:py-12">
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-deep">
            Biz haqimizda
          </p>
          <h1 className="mt-3 text-[38px] leading-[1.03] sm:text-[48px] md:text-[58px]">
            Bolalikning
            <br />
            eng yumshoq kiyimi
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-cocoa">
            MIKKO — Buxoro va Toshkentdagi bolalar kiyim do&apos;koni. Chaqaloqlikdan maktab yoshigacha
            bo&apos;lgan bolalar uchun kiyim, oyoq kiyim va aksessuarlarni bir joyga
            to&apos;pladik. Instagram&apos;da bizni {instagramFollowers} ota-ona kuzatadi — va
            har bir xarid biz uchun bitta baxtli bolaning tabassumi.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/catalog" className={buttonClass('primary', 'md')}>
              Kolleksiyani ko&apos;rish
            </Link>
            <Link href="/stores" className={buttonClass('outline', 'md')}>
              Do&apos;konlarimiz
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto w-full max-w-md">
          <div className="relative aspect-[4/4.4] overflow-hidden rounded-[28px] bg-pink-soft">
            <Image
              src="/images/model-girl.webp"
              alt="MIKKO kolleksiyasidan qizlar kiyimi"
              fill
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-contain object-bottom"
              priority
            />
          </div>
          <div className="absolute -bottom-5 -left-3 w-[46%] overflow-hidden rounded-[20px] border-4 border-cream bg-white sm:-left-5">
            <div className="relative aspect-square">
              <Image
                src="/images/model-baby.webp"
                alt="Chaqaloqlar uchun yumshoq to'plam"
                fill
                sizes="200px"
                className="object-contain"
              />
            </div>
          </div>
          <Image
            src="/images/decor-spark.webp"
            alt=""
            width={512}
            height={512}
            className="absolute -right-1 -top-4 h-12 w-12 animate-float"
          />
        </Reveal>
      </section>

      <section className="mt-14 border-y border-ink/8 py-6 md:mt-20">
        <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: instagramFollowers, label: 'Instagram obunachi' },
            { value: instagramPosts, label: "Post va yangi model" },
            { value: '1 kun', label: "Buxoro va Toshkent bo'ylab" },
            { value: 'Buxoro', label: "5-kichik nohiya" },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="font-display text-[28px] leading-none md:text-[34px]">{stat.value}</dt>
              <dd className="mt-1.5 text-[11.5px] text-cocoa">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14 md:mt-20" aria-labelledby="qadriyatlar">
        <h2 id="qadriyatlar" className="text-[28px] md:text-[38px]">
          Nega MIKKO?
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.08}>
              <div className="h-full rounded-[22px] border border-ink/8 bg-white/55 p-5">
                <value.icon className="h-5 w-5 text-orange-deep" />
                <h3 className="mt-4 text-[16px]">{value.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-cocoa">{value.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-14 grid items-center gap-8 md:mt-20 lg:grid-cols-2 lg:gap-14">
        <Reveal className="order-2 lg:order-1">
          <div className="relative aspect-[4/3.2] overflow-hidden rounded-[28px] bg-blue-soft">
            <Image
              src="/images/model-boy-winter.webp"
              alt="Qishki kolleksiya"
              fill
              sizes="(max-width: 1024px) 90vw, 560px"
              className="object-contain object-bottom"
            />
          </div>
        </Reveal>
        <Reveal delay={0.08} className="order-1 lg:order-2">
          <h2 className="text-[28px] md:text-[36px]">Kichik detallar — katta farq</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-cocoa">
            Kiyim tanlayotganda biz ota-ona ko&apos;zi bilan qaraymiz: yon tikuvlar tekis,
            yorliqlar yumshoq, tugmalar mustahkam — chunki bolalar hech qachon joyida
            o&apos;tirmaydi. Do&apos;konda bolangizga kiygizib ko&apos;rib, bemalol tanlang.
          </p>
          <ul className="mt-5 space-y-3">
            {[
              { icon: Ruler, text: "Chaqaloqlikdan maktab yoshigacha barcha o'lchamlar" },
              { icon: Leaf, text: 'Yumshoq, tanaga yoqimli matolar' },
              { icon: PackageCheck, text: "Har hafta yangi kolleksiya keladi" },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-[13.5px] text-cocoa">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-deep" />
                {item.text}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section id="yetkazish" className="mt-14 scroll-mt-28 md:mt-20" aria-labelledby="yetkazish-title">
        <div className="flex items-center gap-2.5">
          <Truck className="h-5 w-5 text-orange-deep" />
          <h2 id="yetkazish-title" className="text-[28px] md:text-[36px]">
            Yetkazib berish
          </h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {delivery.map((item) => (
            <div key={item.title} className="rounded-[22px] bg-white/55 p-5">
              <h3 className="text-[14px] font-semibold">{item.title}</h3>
              <p className="mt-1 text-[12px] text-cocoa">{item.time}</p>
              <p className="mt-3 text-[19px] font-semibold">{item.price}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-cocoa">{item.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12.5px] text-cocoa">
          Buyurtmalar har kuni 18:00 gacha qabul qilinadi. Undan keyingi buyurtmalar keyingi
          ish kunida yo&apos;lga chiqadi.
        </p>
      </section>

      <section id="qaytarish" className="mt-14 scroll-mt-28 md:mt-20" aria-labelledby="qaytarish-title">
        <div className="flex items-center gap-2.5">
          <RotateCcw className="h-5 w-5 text-orange-deep" />
          <h2 id="qaytarish-title" className="text-[28px] md:text-[36px]">
            Qaytarish va almashtirish
          </h2>
        </div>
        <div className="mt-5 rounded-[24px] border border-ink/8 bg-white/50 p-5 md:p-7">
          <ul className="grid gap-3 md:grid-cols-2">
            {returns.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-cocoa">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-14 md:mt-20">
        <div className="relative overflow-hidden rounded-[28px] bg-orange px-6 py-10 text-white md:px-12 md:py-14">
          <div
            className="pointer-events-none absolute inset-3 rounded-[20px] border border-dashed border-white/30"
            aria-hidden="true"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="max-w-md text-[26px] leading-tight md:text-[34px]">
                Yangi kolleksiya sizni kutmoqda
              </h2>
              <p className="mt-2 text-[13.5px] text-white/85">
                Har hafta yangi modellar — ularni birinchi bo&apos;lib ko&apos;ring.
              </p>
            </div>
            <Link href="/catalog" className={buttonClass('dark', 'lg')}>
              Xarid qilish
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
