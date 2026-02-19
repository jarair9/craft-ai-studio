import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TemplatesGrid from "@/components/TemplatesGrid";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TemplatesGrid />
      <RecentProjects />
      <Footer />
    </div>
  );
};

export default Index;
