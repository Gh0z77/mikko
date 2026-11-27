import Image from 'next/image';
import clsx from 'clsx';

// Sign interiors measured on the artwork (% of image box), so text lands inside the board.
const variants = {
  plain: { src: '/images/mascot-sign.webp', box: { left: 11, right: 13, top: 58, bottom: 10 }, scale: 0.15 },
  king: { src: '/images/mascot-king-sign.webp', box: { left: 17, right: 19, top: 68, bottom: 10 }, scale: 0.15 },
} as const;

/** Bear mascot holding a board with real text on it (the artwork's board is blank). */
export function MascotSign({
  text,
  variant = 'plain',
  height,
  className,
  alt = '',
}: {
  text: string;
  variant?: keyof typeof variants;
  height: number;
  className?: string;
  alt?: string;
}) {
  const v = variants[variant];
  return (
    <span className={clsx('relative inline-block', className)} style={{ height }}>
      <Image src={v.src} alt={alt} width={1400} height={933} className="h-full w-auto" />
      <span
        className="absolute flex items-center justify-center px-1 text-center font-display font-semibold leading-none tracking-tight text-[#B8560E]"
        style={{
          left: `${v.box.left}%`,
          right: `${v.box.right}%`,
          top: `${v.box.top}%`,
          bottom: `${v.box.bottom}%`,
          fontSize: Math.round(height * v.scale),
        }}
      >
        {text}
      </span>
    </span>
  );
}
