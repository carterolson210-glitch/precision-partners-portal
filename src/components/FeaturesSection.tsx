import { motion } from "framer-motion";
import {
  Calculator, Calendar, FolderOpen, FileText, DollarSign,
  BarChart3, Users, BookOpen, ClipboardList, Wrench,
} from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Project Estimator",
    description: "Build detailed cost estimates with real inputs for materials, labor, equipment, permits, and contingency. Export itemized proposals as PDF.",
  },
  {
    icon: Wrench,
    title: "Structural Load Calculator",
    description: "Calculate dead, live, wind, seismic, and snow loads per ASCE 7. Output code-referenced calculation sheets ready for permit submission.",
  },
  {
    icon: Calendar,
    title: "Client Scheduling",
    description: "Configure your availability, sync with Google Calendar or Outlook, and let clients book consultations directly. Automated reminders included.",
  },
  {
    icon: ClipboardList,
    title: "Project Management",
    description: "Kanban boards and Gantt charts for real project tracking. Assign tasks, set dependencies, and monitor milestones across your team.",
  },
  {
    icon: FolderOpen,
    title: "Document Vault & E-Signature",
    description: "Upload, organize, and share project files. Send contracts for digital signature and receive executed copies automatically.",
  },
  {
    icon: DollarSign,
    title: "Invoicing & Payments",
    description: "Create professional invoices, accept payments via Stripe, and track revenue with automated payment reminders.",
  },
  {
    icon: FileText,
    title: "Proposal Builder",
    description: "Build branded proposals with structured templates covering scope, methodology, timeline, and fees. Export as polished PDF documents.",
  },
  {
    icon: BookOpen,
    title: "Code Reference Library",
    description: "Search ACI, AISC, ASCE, IBC, OSHA, and ASTM standards by keyword or code number. Plain English summaries with official references.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Project-linked messaging, document sharing with read receipts, task assignment, and a full activity log for your team.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Live business metrics from your actual platform activity — revenue, utilization, retention, and project performance at a glance.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="section-padding bg-background">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">
          <span className="gold-underline">Everything Your Firm Needs</span>
        </h2>
        <p className="description-text text-center max-w-2xl mx-auto mb-12 text-[18px]">
          Ten purpose-built tools designed for how engineering professionals actually work — 
          from first client contact through project closeout.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--card-gap)]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-card border border-card-border rounded-xl p-[var(--card-padding)] transition-shadow hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-[18px] font-semibold text-body-text mb-2 font-body">
                {feature.title}
              </h3>
              <p className="description-text text-[15px]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
