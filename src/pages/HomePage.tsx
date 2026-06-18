import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { NewReleases } from "@/components/home/NewReleases";
import { Bestsellers } from "@/components/home/Bestsellers";
import { PromoBanners, CreatedForYou } from "@/components/home/PromoBanners";
import { CategoryRow } from "@/components/home/CategoryRow";
import { Testimonials } from "@/components/home/Testimonials";
import { CTASection } from "@/components/home/CTASection";
import { Publishers } from "@/components/home/Publishers";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar />
      <main>
        <Hero />
        <FeatureStrip />
        {/* <CategoryTiles /> */}
        <NewReleases />
        <Bestsellers />
        <PromoBanners />
        <CategoryRow
          title="Macrobiotic Library"
          tag="macrobiotic"
          accent="emerald"
        />
        <CategoryRow
          title="Palestine the Story"
          tag="palestine"
          viewAll
          accent="amber"
        />
        <CreatedForYou />
        <CategoryRow
          title="Biography & Autography"
          tag="biography-autography"
          accent="rose"
        />
        <CTASection />
        <Publishers />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}






















