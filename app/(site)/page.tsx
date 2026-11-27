import { HeroRack } from '@/components/home/HeroRack';
import { TrustBar } from '@/components/home/TrustBar';
import { Marquee } from '@/components/home/Marquee';
import { CategorySection } from '@/components/home/CategorySection';
import { ClothingRack } from '@/components/home/ClothingRack';
import { AgeFinder } from '@/components/home/AgeFinder';
import { TelegramShowcase } from '@/components/home/TelegramShowcase';
import { FaqSection } from '@/components/home/FaqSection';
import { BranchesSection } from '@/components/branches/BranchesSection';
import { ForYouSection } from '@/components/home/ForYouSection';
import { NewArrivals } from '@/components/home/NewArrivals';
import { EditorialStrip } from '@/components/home/EditorialStrip';

export default function HomePage() {
  return (
    <>
      <HeroRack />
      <div className="mt-6 md:mt-10">
        <TrustBar />
      </div>
      <div className="mt-10 md:mt-14">
        <Marquee />
      </div>
      <ForYouSection />
      <ClothingRack />
      <CategorySection />
      <AgeFinder />
      <NewArrivals />
      <TelegramShowcase />
      <EditorialStrip />
      <BranchesSection />
      <FaqSection />
    </>
  );
}
