import { Headphones, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const items = [
  {
    icon: Truck,
    title: 'Tez yetkazib berish',
    text: 'Buxoro va Toshkentda 1 kunda',
  },
  {
    icon: ShieldCheck,
    title: 'Ishonchli sifat',
    text: 'Sertifikatlangan matolar',
  },
  {
    icon: Sparkles,
    title: 'Har hafta yangilik',
    text: 'Yangi modellar keladi',
  },
  {
    icon: Headphones,
    title: "Onlayn qo'llab-quvvatlash",
    text: 'Har kuni 9:00–21:00',
  },
];

export function TrustBar() {
  return (
    <section className="container-page" aria-label="Xizmat afzalliklari">
      <ul className="grid grid-cols-2 gap-y-6 rounded-[28px] border border-ink/8 bg-white/55 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:gap-0 lg:rounded-full lg:px-2 lg:py-3">
        {items.map((item, index) => (
          <li
            key={item.title}
            className={`group flex items-center gap-3 lg:justify-center lg:px-4 ${
              index > 0 ? 'lg:border-l lg:border-dashed lg:border-ink/12' : ''
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-soft text-orange-deep transition-all duration-500 ease-silk group-hover:-translate-y-1 group-hover:rotate-[-10deg] group-hover:bg-orange group-hover:text-white group-hover:shadow-[0_10px_20px_-8px_rgba(254,103,0,0.8)]">
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold leading-tight">
                {item.title}
              </span>
              <span className="block truncate text-[11.5px] text-cocoa">{item.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
