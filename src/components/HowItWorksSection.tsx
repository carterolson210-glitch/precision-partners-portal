import { motion } from "framer-motion";
import { UserPlus, Settings, Briefcase, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Create Your Account",
    description: "Sign up with your professional email. Choose solo practitioner or firm account. No credit card needed for the 14-day trial.",
  },
  {
    icon: Settings,
    step: "2",
    title: "Set Up Your Firm Profile",
    description: "Add your firm name, logo, engineering disciplines, and service offerings. Configure your calendar availability and team members.",
  },
  {
    icon: Briefcase,
    step: "3",
    title: "Activate Your Tools",
    description: "Enable the tools you need — project estimator, scheduling, invoicing, document vault, and more. Each tool is ready to use immediately.",
  },
  {
    icon: Rocket,
    step: "4",
    title: "Start Running Your Business",
    description: "Invite clients to your white-labeled portal, send proposals, manage projects, and track your firm's performance from one dashboard.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding section-alt">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">
          <span className="gold-underline">How It Works</span>
        </h2>
        <p className="description-text text-center max-w-2xl mx-auto mb-12 text-[18px]">
          Get your engineering practice running on the platform in under 30 minutes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <step.icon className="w-7 h-7 text-gold" />
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-gold text-gold-text rounded-full flex items-center justify-center text-[13px] font-bold">
                  {step.step}
                </span>
              </div>
              <h3 className="text-[18px] font-semibold text-body-text mb-2 font-body">{step.title}</h3>
              <p className="description-text text-[15px]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
