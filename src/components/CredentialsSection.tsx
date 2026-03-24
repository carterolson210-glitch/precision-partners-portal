import { motion } from "framer-motion";
import { Shield, Award, CheckCircle, Users } from "lucide-react";

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "$2B+", label: "In Projects Managed" },
  { value: "98%", label: "On-Time Delivery Rate" },
  { value: "35+", label: "Years Combined Experience" },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    company: "Westfield Development Corp",
    type: "Commercial",
    rating: 5,
    quote: "PrecisionEng delivered our 40-story tower project ahead of schedule and under budget. Their structural engineering expertise is unmatched in the industry.",
  },
  {
    name: "James Rodriguez",
    company: "Metro Transit Authority",
    type: "Infrastructure",
    rating: 5,
    quote: "The team's innovative approach to our transit hub design saved the city $12M while improving passenger throughput by 30%. Outstanding partnership.",
  },
  {
    name: "Dr. Karen Foster",
    company: "U.S. Army Corps of Engineers",
    type: "Government",
    rating: 5,
    quote: "Their attention to compliance and environmental standards made them the ideal partner for our federal research facility. We continue to rely on their expertise.",
  },
];

const CredentialsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4">
        {/* Credentials Bar */}
        <div className="bg-section-alt rounded-xl p-8 mb-16">
          <p className="caption-text text-center mb-6">Certifications & Affiliations</p>
          <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
            {[
              { icon: Shield, label: "PE Licensed" },
              { icon: Award, label: "ISO 9001" },
              { icon: CheckCircle, label: "OSHA Certified" },
              { icon: Users, label: "ASCE Member" },
            ].map((cred) => (
              <div key={cred.label} className="flex items-center gap-2">
                <cred.icon className="w-5 h-5 text-gold" />
                <span className="text-body-text font-medium text-[14px]">{cred.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--card-gap)] mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="stat-number">{stat.value}</div>
              <p className="text-body-text font-medium text-[16px] mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <h2 className="section-heading">
          <span className="gold-underline">Client Testimonials</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--card-gap)]">
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-card-border rounded-xl p-[var(--card-padding)] border-l-4 border-l-gold"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-gold text-[16px]">★</span>
                ))}
              </div>
              <p className="text-description text-[18px] italic mb-6 leading-relaxed">"{t.quote}"</p>
              <div>
                <p className="text-body-text font-semibold text-[16px]">{t.name}</p>
                <p className="caption-text">{t.company}</p>
                <p className="caption-text">{t.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CredentialsSection;
