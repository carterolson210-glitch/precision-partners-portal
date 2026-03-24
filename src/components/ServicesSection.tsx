import { motion } from "framer-motion";
import { Building2, HardHat, ClipboardList, Leaf, Mountain, Wrench } from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "Structural Engineering",
    description: "Advanced structural analysis and design for commercial buildings, bridges, and industrial facilities ensuring safety and compliance.",
  },
  {
    icon: HardHat,
    title: "Civil Infrastructure",
    description: "Comprehensive civil engineering solutions for roads, utilities, drainage systems, and urban development projects.",
  },
  {
    icon: ClipboardList,
    title: "Project Management",
    description: "End-to-end project oversight with budget management, scheduling, and quality assurance from concept to completion.",
  },
  {
    icon: Leaf,
    title: "Environmental Compliance",
    description: "Environmental impact assessments, remediation planning, and regulatory compliance for sustainable project delivery.",
  },
  {
    icon: Mountain,
    title: "Geotechnical Analysis",
    description: "Soil investigation, foundation design, and ground stability assessments for complex site conditions.",
  },
  {
    icon: Wrench,
    title: "Mechanical Systems",
    description: "HVAC, plumbing, and mechanical system design for optimal building performance and energy efficiency.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding bg-background">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">
          <span className="gold-underline">Our Engineering Services</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--card-gap)]">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-card border border-card-border rounded-xl p-[var(--card-padding)] cursor-pointer transition-shadow hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-[20px] font-semibold text-body-text mb-2 font-body">
                {service.title}
              </h3>
              <p className="description-text text-[16px] mb-4">
                {service.description}
              </p>
              <a href="#" className="text-gold font-medium text-[15px] hover:underline inline-flex items-center gap-1">
                Learn More →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
