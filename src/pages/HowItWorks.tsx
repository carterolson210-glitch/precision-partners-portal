import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorksSection from "@/components/HowItWorksSection";

const HowItWorks = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[var(--nav-height)]">
        <section className="section-padding bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display font-bold text-[32px] md:text-[48px] text-body-text mb-4">
              How Clearline Engineering Works
            </h1>
            <p className="description-text text-[18px] max-w-2xl mx-auto">
              Learn how our platform helps engineering firms launch faster, manage work efficiently, and deliver a better client experience.
            </p>
          </div>
        </section>
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
