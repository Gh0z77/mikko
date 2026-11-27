const words = [
  'Yangi kolleksiya',
  'Buxoro',
  'Toshkent',
  'Qulay matolar',
  'Har hafta yangi modellar',
  'Bolalar uchun',
  'Har kuni yetkazish',
];

export function Marquee() {
  const row = [...words, ...words];
  return (
    <div
      className="relative overflow-hidden border-y border-ink/8 bg-orange-soft/60 py-3"
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
        {[...row, ...row].map((word, index) => (
          <span key={`${word}-${index}`} className="flex items-center gap-8">
            <span className="text-[12px] font-semibold tracking-[0.02em] text-ink/70">{word}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-orange" />
          </span>
        ))}
      </div>
    </div>
  );
}
