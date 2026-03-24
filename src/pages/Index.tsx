import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SecuritySection from "@/components/SecuritySection";
import ProductTourSection from "@/components/ProductTourSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <ProductTourSection />

      {/* Final CTA */}
      <section className="section-padding bg-navy text-center">
        <div className="container mx-auto px-4">
          <div className="bg-navy/60 backdrop-blur-sm rounded-xl p-8 md:p-12 max-w-3xl mx-auto">
            <h2 className="font-display font-bold text-[28px] md:text-[40px] text-primary-foreground mb-4">
              Ready to Streamline Your Engineering Practice?
            </h2>
            <p className="text-steel text-[18px] mb-8 max-w-xl mx-auto">
              Join engineering firms already using the platform to manage their entire business. Start your 14-day free trial today.
            </p>
            <Button variant="gold" size="lg" className="text-[16px]" asChild>
              <Link to="/register">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
