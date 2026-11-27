import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Send } from 'lucide-react';
import { BranchesSection } from '@/components/branches/BranchesSection';
import { InstagramIcon } from '@/components/ui/BrandIcons';
import { buttonClass } from '@/components/ui/buttonClass';
import { instagramUrl, shopBotUrl, storeHours } from '@/lib/nav';

export const metadata: Metadata = {
  title: "Do'konlar",
  description: "MIKKO bolalar kiyim do'konlari: Buxoro va Toshkentdagi filiallar, xaritada joylashuv, ish vaqti va telefonlar.",
};

export default function StoresPage() {
  return (
    <div className="py-8 md:py-12">
      <div className="container-page max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-deep">Filiallar</p>
        <h1 className="mt-3 text-[36px] leading-[1.04] md:text-[48px]">Do&apos;konlarimiz</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-cocoa">
          Kiyimni jonli ko&apos;rib, bolangizga kiygizib ko&apos;rishni xohlaysizmi? Buxoro va Toshkentdagi
          do&apos;konlarimizga keling — maslahat va o&apos;lcham tanlash bepul.
        </p>
      </div>

      <div className="-mt-10 md:-mt-16">
        <BranchesSection heading={false} />
      </div>

      <div className="container-page mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] bg-ink p-6 text-cream">
          <h2 className="text-[20px] text-cream">Buyurtmani olib ketish</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-cream/75">
            Onlayn buyurtma bering va o&apos;zingizga qulay filialdan olib keting. Yetkazib berish narxi olinmaydi.
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-[12px] text-cream/70">
            <Clock className="h-3.5 w-3.5" /> {storeHours}
          </p>
          <Link href="/checkout" className={buttonClass('outlineLight', 'sm', 'mt-5')}>
            Buyurtma berish
          </Link>
        </div>

        <div className="rounded-[24px] border border-ink/8 bg-white/60 p-6">
          <h2 className="text-[20px]">Bog&apos;lanish</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-cocoa">
            Savollaringiz bormi? Telegram botimizga yozing yoki Instagram&apos;da kuzating.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={shopBotUrl} target="_blank" rel="noreferrer" className={buttonClass('soft', 'sm')}>
              <Send className="h-3.5 w-3.5" />
              @mikko_kids_bot
            </a>
            <a href={instagramUrl} target="_blank" rel="noreferrer" className={buttonClass('soft', 'sm')}>
              <InstagramIcon className="h-3.5 w-3.5" />
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
