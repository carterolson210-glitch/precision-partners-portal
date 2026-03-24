import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import CredentialsSection from "@/components/CredentialsSection";
import TeamSection from "@/components/TeamSection";
import LeadCaptureSection from "@/components/LeadCaptureSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <PortfolioSection />
      <CredentialsSection />
      <TeamSection />
      <LeadCaptureSection />
      <Footer />
    </div>
  );
};

export default Index;
