import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TemplatesGrid from "@/components/TemplatesGrid";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TemplatesGrid />
      <FeaturesSection />
      <PricingSection />
      <RecentProjects />
      <Footer />
    </div>
  );
};

export default Index;
