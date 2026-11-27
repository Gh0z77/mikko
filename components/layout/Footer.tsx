import Link from 'next/link';
import { MapPin, Phone, Send } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/BrandIcons';
import { CommunitySection } from '@/components/home/CommunitySection';
import { Logo } from '@/components/ui/Logo';
import { branches, phoneHref } from '@/lib/branches';
import {
  instagramUrl,
  mainNav,
  secondaryNav,
  storePhone,
  storePhoneHref,
  supportNav,
  telegramUrl,
} from '@/lib/nav';

const payments = ['Naqd', 'Karta'];

export function Footer() {
  return (
    <div className="mt-20 md:mt-28">
      <CommunitySection />

      <footer className="mt-16 border-t-2 border-dashed border-ink/10 bg-[#FFF1E6] pb-24 pt-12 lg:pb-12">
        <div className="container-page">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Logo className="text-[34px]" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-cocoa">
                Buxoro va Toshkentdagi bolalar kiyim do&apos;koni. Zamonaviy, qulay va sifatli
                kiyimlar — chaqaloqlikdan maktab yoshigacha.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/70 transition-colors hover:bg-orange hover:text-white"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/70 transition-colors hover:bg-orange hover:text-white"
                >
                  <Send className="h-4 w-4" />
                </a>
                <a
                  href={storePhoneHref}
                  aria-label="Qo'ng'iroq qilish"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/70 transition-colors hover:bg-orange hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>

            <nav aria-label="Katalog">
              <h3 className="font-sans text-[13px] font-semibold text-cocoa">Katalog</h3>
              <ul className="mt-4 space-y-2.5">
                {mainNav.filter((item) => item.label !== 'Katalog').map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="link-underline text-sm text-ink/85">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Kompaniya">
              <h3 className="font-sans text-[13px] font-semibold text-cocoa">Kompaniya</h3>
              <ul className="mt-4 space-y-2.5">
                {secondaryNav.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="link-underline text-sm text-ink/85">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Yordam">
              <h3 className="font-sans text-[13px] font-semibold text-cocoa">Yordam</h3>
              <ul className="mt-4 space-y-2.5">
                {supportNav.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="link-underline text-sm text-ink/85">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2 text-sm text-ink/85">
                {branches.map((b) => (
                  <p key={b.id} className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
                    <span>
                      <span className="block font-semibold">{b.name.replace('MIKKO ', '')}</span>
                      <span className="block text-[12.5px] text-cocoa">{b.landmark ?? "Manzil tez orada"}</span>
                      {b.phone && (
                        <a href={phoneHref(b.phone)} className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] hover:text-orange-deep">
                          <Phone className="h-3 w-3" /> {b.phone}
                        </a>
                      )}
                    </span>
                  </p>
                ))}
              </div>
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-ink/10 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-cocoa/80">
              © {new Date().getFullYear()} MIKKO. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {payments.map((payment) => (
                <span
                  key={payment}
                  className="rounded-lg bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-cocoa"
                >
                  {payment}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
