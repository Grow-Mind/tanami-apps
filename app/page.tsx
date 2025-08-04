import { HeroSection } from "@/components/home/hero-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HarvestCalculator } from "@/components/home/harvest-calculator";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <WhyChooseUs />
      <HarvestCalculator />
    </div>
  );
}
