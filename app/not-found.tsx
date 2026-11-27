import Link from 'next/link';
import { buttonClass } from '@/components/ui/buttonClass';
import SiteLayout from './(site)/layout';
import { MascotSign } from '@/components/ui/MascotSign';

export default function NotFound() {
  return (
    <SiteLayout>
    <div className="container-page py-14 md:py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-display text-[92px] leading-none text-orange md:text-[130px]">404</p>
        <h1 className="mt-2 text-[28px] md:text-[36px]">Bu sahifa topilmadi</h1>
        <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-cocoa">
          Balki havola eskirgan yoki mahsulot boshqa nomga o&apos;tgan. Katalogdan
          qidirib ko&apos;ring — sizga mos narsa albatta topiladi.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/catalog" className={buttonClass('primary', 'md')}>
            Katalogga o&apos;tish
          </Link>
          <Link href="/" className={buttonClass('outline', 'md')}>
            Bosh sahifa
          </Link>
        </div>
        <MascotSign text="404" variant="king" height={160} className="mx-auto mt-8" />
      </div>
    </div>
    </SiteLayout>
  );
}
