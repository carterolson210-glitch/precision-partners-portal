import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-navy/75" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-navy/60 backdrop-blur-sm rounded-xl p-8 md:p-12 max-w-4xl mx-auto"
        >
          <h1 className="font-display font-bold text-[32px] md:text-[56px] text-primary-foreground leading-[1.1] mb-6">
            The All-in-One Platform for{" "}
            <span className="text-gold">Engineering Professionals</span>
          </h1>
          <p className="text-body-text-light text-[18px] md:text-[20px] max-w-2xl mx-auto mb-8 leading-relaxed">
            Manage projects, clients, proposals, invoicing, scheduling, and compliance — 
            all from one powerful platform built specifically for engineering firms and independent consultants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" className="text-[16px]" asChild>
              <a href="/register">Start Free Trial</a>
            </Button>
            <Button variant="hero-outline" size="lg" className="text-[16px]" asChild>
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>
          <p className="text-steel text-[14px] mt-6">14-day free trial · No credit card required · Cancel anytime</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
