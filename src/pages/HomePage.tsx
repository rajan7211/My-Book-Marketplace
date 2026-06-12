import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { NewReleases } from "@/components/home/NewReleases";
import { Bestsellers } from "@/components/home/Bestsellers";
import { PromoBanners, CreatedForYou } from "@/components/home/PromoBanners";
import { CategoryRow } from "@/components/home/CategoryRow";
import { Publishers } from "@/components/home/Publishers";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar />
      <main>
        <Hero />
        <NewReleases />
        <Bestsellers />
        <PromoBanners />
        <CategoryRow title="Macrobiotic Library" tag="macrobiotic" />
        <CategoryRow title="Palestine the Story" tag="palestine" viewAll />
        <CreatedForYou />
        <CategoryRow title="Biography & Autography" tag="biography-autography" />
        <Publishers />
      </main>
      <Footer />
    </div>
  );
}



