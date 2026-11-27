import Image from 'next/image';
import clsx from 'clsx';

// Store's own logo (cut from the official artwork), split so the bear can move on its own.
// Both crops are 110px tall: bear 152px wide, wordmark 388px wide.

export function BearMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/mikko-bear.png"
      alt=""
      width={152}
      height={110}
      className={className}
    />
  );
}

export function Logo({
  className,
  animate = false,
  priority = false,
}: {
  className?: string;
  animate?: boolean;
  priority?: boolean;
}) {
  return (
    <span className={clsx('group/logo inline-flex h-[1em] select-none items-end', className)}>
      <Image
        src="/images/mikko-bear.png"
        alt=""
        width={152}
        height={110}
        priority={priority}
        className={clsx(
          'h-full w-auto origin-[50%_80%] group-hover/logo:animate-wiggle',
          animate && 'animate-bear-in',
        )}
      />
      <Image
        src="/images/mikko-text.png"
        alt="mikko"
        width={388}
        height={110}
        priority={priority}
        className={clsx('h-full w-auto', animate && 'animate-word-in')}
      />
    </span>
  );
}
