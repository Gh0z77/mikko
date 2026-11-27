import clsx from 'clsx';

// Shimmering placeholders shown while pages, product batches or photos are on their way.

export function Skel({ className }: { className?: string }) {
  return <span aria-hidden="true" className={clsx('skeleton block rounded-xl', className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col">
      <Skel className="aspect-[4/4.55] w-full rounded-[24px]" />
      <Skel className="mt-3 h-3 w-1/3" />
      <Skel className="mt-2 h-4 w-4/5" />
      <Skel className="mt-2 h-4 w-1/2" />
    </div>
  );
}

export function GridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={clsx('grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4', className)}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="container-page py-8 md:py-12" role="status" aria-label="Yuklanmoqda">
      <Skel className="h-3 w-40" />
      <Skel className="mt-4 h-10 w-72 md:h-12" />
      <Skel className="mt-3 h-4 w-full max-w-lg" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-3 lg:block">
          <Skel className="h-48 w-full rounded-[24px]" />
          <Skel className="h-32 w-full rounded-[24px]" />
        </div>
        <GridSkeleton count={8} />
      </div>
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="container-page pt-6 md:pt-8" role="status" aria-label="Yuklanmoqda">
      <Skel className="h-3 w-56" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <Skel className="aspect-square w-full rounded-[32px]" />
        <div>
          <Skel className="h-3 w-24" />
          <Skel className="mt-4 h-10 w-4/5" />
          <Skel className="mt-4 h-8 w-40" />
          <Skel className="mt-6 h-20 w-full" />
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skel key={i} className="h-11 w-14" />
            ))}
          </div>
          <Skel className="mt-6 h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
