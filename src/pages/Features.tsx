import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturesSection from "@/components/FeaturesSection";

const Features = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[var(--nav-height)]">
        <section className="section-padding bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display font-bold text-[32px] md:text-[48px] text-body-text mb-4">
              Features Built for Modern Engineering Teams
            </h1>
            <p className="description-text text-[18px] max-w-2xl mx-auto">
              Explore the tools that help Clearline Engineering customers manage projects, proposals, scheduling, invoicing, and compliance from a single workspace.
            </p>
          </div>
        </section>
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
