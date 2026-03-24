import { Shield, Server, Lock, FileCheck } from "lucide-react";

const items = [
  {
    icon: Shield,
    title: "AES-256 Encryption at Rest",
    description: "All client data, documents, and communications are encrypted using industry-standard AES-256 encryption.",
  },
  {
    icon: Lock,
    title: "TLS 1.3 In Transit",
    description: "Every data transmission between your browser and our servers is protected with the latest TLS 1.3 protocol.",
  },
  {
    icon: Server,
    title: "99.9% Uptime SLA",
    description: "Enterprise-tier plans include a guaranteed 99.9% uptime service level agreement backed by credits.",
  },
  {
    icon: FileCheck,
    title: "SOC 2 Compliant Infrastructure",
    description: "Our infrastructure is built on SOC 2 Type II certified cloud providers with regular security audits.",
  },
];

const SecuritySection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4">
        <h2 className="section-heading">
          <span className="gold-underline">Security & Compliance</span>
        </h2>
        <p className="description-text text-center max-w-2xl mx-auto mb-12 text-[18px]">
          Your client data deserves enterprise-grade protection. Here's how we safeguard it.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--card-gap)]">
          {items.map((item) => (
            <div key={item.title} className="bg-section-alt border border-card-border rounded-xl p-[var(--card-padding)] text-center">
              <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="card-title mb-2 font-body">{item.title}</h3>
              <p className="caption-text text-[14px]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
