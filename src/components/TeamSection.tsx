import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const engineers = [
  { name: "Dr. Michael Chen", spec: "Structural Engineering", years: 18, pe: true, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80" },
  { name: "Sarah Patel, PE", spec: "Civil Infrastructure", years: 14, pe: true, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80" },
  { name: "James Rivera", spec: "Geotechnical Analysis", years: 12, pe: true, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
  { name: "Dr. Emily Brooks", spec: "Environmental Engineering", years: 16, pe: true, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80" },
];

const TeamSection = () => {
  return (
    <section id="team" className="section-padding section-alt">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">
          <span className="gold-underline">Our Engineering Team</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--card-gap)]">
          {engineers.map((eng, index) => (
            <motion.div
              key={eng.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-card-border rounded-xl overflow-hidden"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={eng.image}
                  alt={eng.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-[var(--card-padding)]">
                <h3 className="text-[18px] font-semibold text-body-text font-body">{eng.name}</h3>
                <p className="caption-text mb-2">{eng.spec}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[14px] text-description">{eng.years} years exp.</span>
                  {eng.pe && (
                    <Badge className="bg-gold/10 text-gold border-gold/30 text-[11px]">PE Licensed</Badge>
                  )}
                </div>
                <Button variant="gold" size="sm" className="w-full">Book a Call</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
