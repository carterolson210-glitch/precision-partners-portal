import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const categories = ["All Projects", "Commercial", "Industrial", "Government", "Infrastructure"];

const projects = [
  { name: "Riverside Tower Complex", category: "Commercial", industry: "Real Estate", value: "$45M", duration: "18 months", outcome: "Delivered 3 months ahead of schedule", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80" },
  { name: "Metro Transit Hub", category: "Infrastructure", industry: "Transportation", value: "$120M", duration: "36 months", outcome: "Reduced commute times by 25%", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80" },
  { name: "Federal Research Center", category: "Government", industry: "Defense", value: "$78M", duration: "24 months", outcome: "LEED Platinum certification achieved", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80" },
  { name: "Greenfield Manufacturing", category: "Industrial", industry: "Manufacturing", value: "$55M", duration: "20 months", outcome: "40% energy efficiency improvement", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80" },
  { name: "Harbor Bridge Expansion", category: "Infrastructure", industry: "Municipal", value: "$200M", duration: "42 months", outcome: "Traffic capacity doubled", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80" },
  { name: "Westside Office Park", category: "Commercial", industry: "Corporate", value: "$32M", duration: "14 months", outcome: "98% tenant occupancy within 6 months", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80" },
];

const PortfolioSection = () => {
  const [active, setActive] = useState("All Projects");
  const filtered = active === "All Projects" ? projects : projects.filter((p) => p.category === active);

  return (
    <section id="portfolio" className="section-padding section-alt">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">
          <span className="gold-underline">Project Portfolio</span>
        </h2>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all ${
                active === cat
                  ? "bg-navy text-primary-foreground"
                  : "bg-background text-body-text border border-card-border hover:border-navy"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--card-gap)]">
          <AnimatePresence mode="wait">
            {filtered.map((project) => (
              <motion.div
                key={project.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group relative bg-card border border-card-border rounded-xl overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-navy/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="gold">View Case Study</Button>
                  </div>
                </div>
                <div className="p-[var(--card-padding)]">
                  <h3 className="text-[18px] font-semibold text-body-text mb-1 font-body">{project.name}</h3>
                  <p className="caption-text mb-2">{project.industry}</p>
                  <div className="flex gap-4 text-[13px] text-description mb-2">
                    <span>{project.value}</span>
                    <span>•</span>
                    <span>{project.duration}</span>
                  </div>
                  <p className="text-[14px] text-description">{project.outcome}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
