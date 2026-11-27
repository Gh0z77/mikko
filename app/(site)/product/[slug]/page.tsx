import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PurchasePanel } from '@/components/product/PurchasePanel';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { categoryLabels, getProduct, getRelated, products } from '@/lib/products';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Mahsulot topilmadi' };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(product, 4);

  return (
    <div className="container-page pt-5 md:pt-7">
      <nav aria-label="Yo'l ko'rsatkich" className="flex items-center gap-1 text-[11.5px] text-cocoa">
        <Link href="/" className="hover:text-ink">
          Bosh sahifa
        </Link>
        <ChevronRight className="h-3 w-3 text-ink/25" />
        <Link href="/catalog" className="hover:text-ink">
          Katalog
        </Link>
        <ChevronRight className="h-3 w-3 text-ink/25" />
        <Link href={`/${product.category}`} className="hover:text-ink">
          {categoryLabels[product.category]}
        </Link>
        <ChevronRight className="h-3 w-3 text-ink/25" />
        <span className="truncate text-ink/70">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 md:gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        <ProductGallery product={product} />
        <PurchasePanel product={product} />
      </div>

      {related.length > 0 && (
        <section className="mt-16 md:mt-24" aria-labelledby="related-title">
          <div id="related-title">
            <SectionHeading
              title="Bu bilan yaxshi ketadi"
              description="Xuddi shu uslubdagi boshqa mahsulotlar."
              href={`/${product.category}`}
              linkLabel="Bo'limga o'tish"
            />
          </div>
          <div className="mt-7">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
