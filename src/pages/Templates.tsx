import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Mountain, Wrench, Users } from "lucide-react";

export const TEMPLATES = [
  {
    slug: "structural-assessment-report",
    name: "Structural Assessment Report",
    description: "Professional structural assessment report template with sections for building condition evaluation, load analysis summary, structural deficiency identification, and repair recommendations.",
    formats: ["DOCX", "PDF"],
    price: 49,
    priceId: "price_1THESWJtN2Ze3hKS41llYfOd",
    icon: Building2,
    category: "Structural",
    included: [
      "Building condition evaluation sections",
      "Load analysis summary tables",
      "Structural deficiency identification checklist",
      "Repair recommendation framework",
      "Photo documentation placeholders",
      "Executive summary template",
    ],
  },
  {
    slug: "civil-project-proposal",
    name: "Civil Project Proposal",
    description: "Comprehensive civil project proposal template covering scope of work, cost estimates, project timeline, regulatory compliance, and deliverables.",
    formats: ["DOCX", "PDF"],
    price: 59,
    priceId: "price_1THESsJtN2Ze3hKSXc7pC7jQ",
    icon: FileText,
    category: "Civil",
    included: [
      "Scope of work breakdown",
      "Detailed cost estimation tables",
      "Project timeline with milestones",
      "Regulatory compliance checklist",
      "Deliverables schedule",
      "Terms and conditions template",
    ],
  },
  {
    slug: "geotechnical-site-investigation",
    name: "Geotechnical Site Investigation Report",
    description: "Detailed geotechnical site investigation report template with sections for soil boring logs, lab test results, foundation recommendations, and site classification.",
    formats: ["DOCX", "PDF"],
    price: 69,
    priceId: "price_1THETHJtN2Ze3hKSBgBmnrAy",
    icon: Mountain,
    category: "Geotechnical",
    included: [
      "Soil boring log templates",
      "Laboratory test result tables",
      "Foundation recommendation sections",
      "Site classification framework",
      "Groundwater analysis sections",
      "Appendix formatting guides",
    ],
  },
  {
    slug: "mechanical-systems-design-brief",
    name: "Mechanical Systems Design Brief",
    description: "Mechanical systems design brief template covering HVAC specifications, plumbing layout, fire protection requirements, and equipment schedules.",
    formats: ["DOCX", "PDF"],
    price: 54,
    priceId: "price_1THETgJtN2Ze3hKSFRSGMqdj",
    icon: Wrench,
    category: "Mechanical",
    included: [
      "HVAC system specifications",
      "Plumbing layout documentation",
      "Fire protection requirements",
      "Equipment schedules and specs",
      "Energy compliance sections",
      "Maintenance plan template",
    ],
  },
  {
    slug: "client-onboarding-packet",
    name: "Client Onboarding Packet",
    description: "Complete client onboarding packet template with project intake forms, scope agreement, communication plan, timeline checklist, and NDA templates.",
    formats: ["DOCX", "PDF"],
    price: 39,
    priceId: "price_1THEUuJtN2Ze3hKSrGoZmDUu",
    icon: Users,
    category: "Business",
    included: [
      "Project intake questionnaire",
      "Scope agreement template",
      "Communication plan framework",
      "Timeline and milestone checklist",
      "NDA and confidentiality template",
      "Welcome packet cover letter",
    ],
  },
];

const Templates = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-gold text-gold">
              Template Marketplace
            </Badge>
            <h1 className="text-[40px] font-bold text-body-text font-display mb-4">
              Premium Engineering Templates
            </h1>
            <p className="text-description text-[16px] max-w-[600px] mx-auto">
              Purchase individual professional templates without needing a subscription.
              Instant delivery after payment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((t) => (
              <Link
                key={t.slug}
                to={`/templates/${t.slug}`}
                className="group bg-card border border-card-border rounded-xl p-6 hover:shadow-lg hover:border-gold/40 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-navy/5 flex items-center justify-center mb-4">
                  <t.icon className="w-6 h-6 text-navy" />
                </div>
                <Badge variant="secondary" className="mb-3 text-[11px]">
                  {t.category}
                </Badge>
                <h3 className="text-[18px] font-bold text-body-text font-display mb-2 group-hover:text-navy transition-colors">
                  {t.name}
                </h3>
                <p className="text-description text-[14px] mb-4 line-clamp-2">
                  {t.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[22px] font-bold text-body-text font-display">
                    ${t.price}
                  </span>
                  <span className="text-caption text-[12px]">
                    {t.formats.join(" + ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
