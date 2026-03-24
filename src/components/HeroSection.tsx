import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background Placeholder with gradient */}
      <div className="absolute inset-0 bg-navy">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-navy/75" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-navy/60 backdrop-blur-sm rounded-xl p-8 md:p-12 max-w-4xl mx-auto"
        >
          <h1 className="font-display font-bold text-[36px] md:text-[56px] text-primary-foreground leading-[1.1] mb-6">
            Building the Future With{" "}
            <span className="text-gold">Precision Engineering</span>
          </h1>
          <p className="text-body-text-light text-[18px] md:text-[20px] max-w-2xl mx-auto mb-8 leading-relaxed">
            Industry-leading structural, civil, and mechanical engineering solutions
            for commercial, industrial, and government projects worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" className="text-[16px]">
              Schedule a Consultation
            </Button>
            <Button variant="hero-outline" size="lg" className="text-[16px]">
              View Our Projects
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Trust Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-section-alt/90 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4">
          <p className="caption-text text-center mb-4">Trusted by leading organizations</p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap opacity-50">
            {["AECOM", "Bechtel", "Jacobs", "WSP", "Turner", "Skanska"].map((name) => (
              <span key={name} className="font-display font-bold text-body-text text-[14px] md:text-[16px] tracking-wider uppercase">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
