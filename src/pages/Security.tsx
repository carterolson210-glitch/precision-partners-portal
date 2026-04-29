import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SecuritySection from "@/components/SecuritySection";

const Security = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[var(--nav-height)]">
        <section className="section-padding bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display font-bold text-[32px] md:text-[48px] text-body-text mb-4">
              Security and Compliance
            </h1>
            <p className="description-text text-[18px] max-w-2xl mx-auto">
              See how Clearline Engineering protects your data with enterprise-grade encryption, uptime guarantees, and compliance controls.
            </p>
          </div>
        </section>
        <SecuritySection />
      </main>
      <Footer />
    </div>
  );
};

export default Security;
