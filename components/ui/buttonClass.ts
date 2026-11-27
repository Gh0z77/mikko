import clsx from 'clsx';

type Variant = 'primary' | 'outline' | 'outlineLight' | 'dark' | 'ghost' | 'soft';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-[background-color,color,box-shadow,transform] duration-300 ease-silk active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45';

const variants: Record<Variant, string> = {
  primary:
    'bg-orange text-white shadow-[0_16px_32px_-16px_rgba(255,122,0,0.85)] hover:bg-orange-deep hover:shadow-[0_22px_40px_-18px_rgba(255,122,0,0.9)]',
  outline:
    'border-2 border-ink/15 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-cream',
  outlineLight:
    'border-2 border-cream/30 bg-transparent text-cream hover:border-cream hover:bg-cream hover:text-ink',
  dark: 'bg-ink text-cream hover:bg-[#3a322d]',
  ghost: 'bg-transparent text-ink hover:bg-ink/[0.06]',
  soft: 'bg-orange-soft text-ink hover:bg-orange/25',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-[15px]',
  lg: 'h-14 px-7 text-base md:h-[58px] md:px-9',
};

export function buttonClass(
  variant: Variant = 'primary',
  size: Size = 'md',
  className?: string,
) {
  return clsx(base, variants[variant], sizes[size], className);
}
