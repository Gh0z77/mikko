import { categories } from '@/lib/products';
import { products } from '@/lib/products';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { CategoryCard } from './CategoryCard';

function countFor(slug: string) {
  if (slug === 'sale') return products.filter((product) => product.oldPrice).length;
  return products.filter((product) => product.category === slug).length;
}

export function CategorySection() {
  const bySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));
  const classes: Record<string, string> = {
    boys: 'col-span-2 md:col-span-3',
    girls: 'col-span-2 md:col-span-3',
    baby: 'col-span-1 md:col-span-2',
    shoes: 'col-span-1 md:col-span-2',
    accessories: 'col-span-2 md:col-span-2',
    sale: 'col-span-2 md:col-span-6',
  };

  return (
    <section className="container-page mt-14 md:mt-20" aria-labelledby="categories-title">
      <Reveal>
        <SectionHeading
          title="Kimga kiyim qidiramiz?"
          description="Kategoriyani tanlang — o'lcham, rang va uslub bo'yicha oson tanlaysiz."
          href="/catalog"
          linkLabel="Butun katalog"
        />
      </Reveal>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
        {(['boys', 'girls', 'baby', 'shoes', 'accessories', 'sale'] as const).map((slug, index) => {
          const category = bySlug[slug];
          if (!category) return null;
          return (
            <Reveal
              key={slug}
              delay={index * 0.05}
              className={classes[slug]}
              y={18}
            >
              <CategoryCard
                category={category}
                count={countFor(slug)}
                variant={slug === 'sale' ? 'wide' : 'tall'}
                ratio={slug === 'boys' || slug === 'girls' ? 'aspect-[4/2.75]' : 'aspect-[4/3.3]'}
              />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
