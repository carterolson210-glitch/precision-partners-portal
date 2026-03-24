import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, BookOpen } from "lucide-react";

const resources = [
  { icon: FileText, title: "Structural Assessment Checklist", description: "Complete guide for evaluating structural integrity." },
  { icon: Download, title: "Infrastructure Budget Guide", description: "How to budget your next infrastructure project." },
  { icon: BookOpen, title: "Compliance Reference Guide", description: "Engineering compliance regulations simplified." },
];

const LeadCaptureSection = () => {
  const [showForm, setShowForm] = useState<string | null>(null);

  return (
    <section id="contact" className="section-padding bg-background">
      <div className="container mx-auto px-4">
        {/* Resources */}
        <h2 className="section-heading">
          <span className="gold-underline">Free Engineering Resources</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--card-gap)] mb-16">
          {resources.map((res) => (
            <motion.div
              key={res.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-card-border rounded-xl p-[var(--card-padding)] text-center"
            >
              <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <res.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="card-title mb-2 font-body">{res.title}</h3>
              <p className="caption-text mb-4">{res.description}</p>
              <Button variant="gold-outline" size="sm" onClick={() => setShowForm(res.title)}>
                Download Free
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Download Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-foreground/50 z-[1001] flex items-center justify-center p-4" onClick={() => setShowForm(null)}>
            <div className="bg-card rounded-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-[20px] font-semibold text-body-text mb-1 font-body">Download: {showForm}</h3>
              <p className="caption-text mb-6">Fill in your details to receive the resource.</p>
              <form className="flex flex-col gap-[var(--form-field-gap)]" onSubmit={(e) => { e.preventDefault(); setShowForm(null); }}>
                <Input placeholder="Full Name" required />
                <Input placeholder="Company Name" required />
                <Input type="email" placeholder="Business Email" required />
                <Input placeholder="Project Type" required />
                <Button variant="gold" type="submit" className="w-full">Get Free Download</Button>
              </form>
            </div>
          </div>
        )}

        {/* RFP Form */}
        <div className="max-w-2xl mx-auto">
          <h2 className="section-heading">
            <span className="gold-underline">Request for Proposal</span>
          </h2>
          <form className="bg-card border border-card-border rounded-xl p-8 flex flex-col gap-[var(--form-field-gap)]" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--form-field-gap)]">
              <Input placeholder="Project Name" required />
              <Input placeholder="Project Type" required />
            </div>
            <textarea
              className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-card-border bg-background text-body-text text-[16px] resize-y focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Scope Description"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--form-field-gap)]">
              <Input placeholder="Location" required />
              <Input type="date" placeholder="Estimated Start Date" required />
            </div>
            <Input placeholder="Budget Range (e.g. $500K - $2M)" />
            <div className="border-2 border-dashed border-card-border rounded-lg p-6 text-center">
              <p className="caption-text">Drag & drop files or click to upload</p>
              <p className="caption-text text-[12px] mt-1">PDF, DWG, DXF up to 50MB</p>
            </div>
            <Button variant="gold" size="lg" type="submit" className="w-full">Submit Proposal Request</Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LeadCaptureSection;
