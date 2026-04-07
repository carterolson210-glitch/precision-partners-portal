import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_TIERS } from "@/config/subscriptions";
import { toast } from "sonner";

const tiers = [
  {
    key: "solo" as const,
    name: "Solo & Small Firms",
    monthly: SUBSCRIPTION_TIERS.solo.monthly_price,
    annual: SUBSCRIPTION_TIERS.solo.annual_price,
    description: "Essential tools for independent engineers and small practices getting started.",
    features: [
      "Client scheduling & calendar sync",
      "Personal project dashboard",
      "Document storage up to 5GB",
      "Invoicing for up to 10 active clients",
      "Basic analytics dashboard",
      "Email support",
    ],
    cta: "Start 14-Day Free Trial",
    trial: true,
    popular: false,
  },
  {
    key: "growing" as const,
    name: "Growing Firms",
    monthly: SUBSCRIPTION_TIERS.growing.monthly_price,
    annual: SUBSCRIPTION_TIERS.growing.annual_price,
    description: "Full-featured platform for firms scaling their practice with multiple engineers.",
    features: [
      "Everything in Solo & Small Firms",
      "Multi-engineer team accounts",
      "Unlimited client scheduling",
      "Document storage up to 50GB",
      "Full project milestone tracking",
      "Client portal white-labeling",
      "AI Engineering Copilot",
      "PE Stamp & Seal Manager",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    trial: true,
    popular: true,
  },
  {
    key: "enterprise" as const,
    name: "Enterprise",
    monthly: SUBSCRIPTION_TIERS.enterprise.monthly_price,
    annual: SUBSCRIPTION_TIERS.enterprise.annual_price,
    description: "Complete solution for large firms requiring custom integrations and dedicated support.",
    features: [
      "Everything in Growing Firms",
      "Unlimited team members",
      "Unlimited document storage",
      "API access for third-party integrations",
      "Custom domain for client portal",
      "Dedicated account manager",
      "99.9% uptime SLA",
      "Custom onboarding assistance",
    ],
    cta: "Contact Sales",
    trial: false,
    popular: false,
  },
];

const Pricing = () => {
  const [annual, setAnnual] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { user, subscription } = useAuth();
  const [searchParams] = useSearchParams();

  // Show toast for checkout results
  const checkoutStatus = searchParams.get("checkout");
  if (checkoutStatus === "cancelled") {
    toast.info("Checkout was cancelled. You can try again anytime.");
    searchParams.delete("checkout");
  }

  const handleCheckout = async (tierKey: "solo" | "growing" | "enterprise") => {
    if (!user) {
      toast.error("Please sign in first to subscribe.");
      return;
    }

    const tier = SUBSCRIPTION_TIERS[tierKey];
    const priceId = annual ? tier.annual_price_id : tier.monthly_price_id;

    setLoadingTier(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoadingTier(null);
    }
  };

  const isCurrentPlan = (tierKey: string) => {
    return subscription.subscribed && subscription.tierKey === tierKey;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-[var(--nav-height)]">
        <section className="section-padding bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="font-display font-bold text-[32px] md:text-[48px] text-body-text mb-4">
                Transparent <span className="text-gold">Pricing</span>
              </h1>
              <p className="description-text text-[18px] max-w-2xl mx-auto mb-8">
                Choose the plan that fits your firm. All plans include a 14-day free trial with no credit card required.
              </p>

              <div className="inline-flex items-center gap-3 bg-section-alt rounded-full p-1">
                <button
                  onClick={() => setAnnual(false)}
                  className={`px-6 py-2 rounded-full text-[14px] font-medium transition-all ${
                    !annual ? "bg-navy text-primary-foreground" : "text-body-text"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={`px-6 py-2 rounded-full text-[14px] font-medium transition-all ${
                    annual ? "bg-navy text-primary-foreground" : "text-body-text"
                  }`}
                >
                  Annual <span className="text-gold ml-1">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--card-gap)] max-w-5xl mx-auto">
              {tiers.map((tier, index) => {
                const current = isCurrentPlan(tier.key);
                return (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className={`bg-card rounded-xl p-8 relative ${
                      current
                        ? "border-2 border-green-500 shadow-lg"
                        : tier.popular
                        ? "border-2 border-navy shadow-lg"
                        : "border border-card-border"
                    }`}
                  >
                    {current && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white font-semibold px-4 py-1">
                        Your Plan
                      </Badge>
                    )}
                    {!current && tier.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-gold-text font-semibold px-4 py-1">
                        Most Popular
                      </Badge>
                    )}
                    <h3 className="text-[20px] font-semibold text-body-text mb-2 font-body">{tier.name}</h3>
                    <p className="caption-text mb-6 min-h-[48px]">{tier.description}</p>
                    <div className="mb-6">
                      <span className="text-[48px] font-bold text-body-text font-display">
                        ${annual ? tier.annual : tier.monthly}
                      </span>
                      <span className="text-description text-[16px]">/month</span>
                    </div>
                    {current ? (
                      <Button variant="outline" size="lg" className="w-full mb-8" disabled>
                        Current Plan
                      </Button>
                    ) : tier.trial ? (
                      <Button
                        variant={tier.popular ? "gold" : "outline"}
                        size="lg"
                        className="w-full mb-8"
                        onClick={() => handleCheckout(tier.key)}
                        disabled={loadingTier === tier.key}
                      >
                        {loadingTier === tier.key ? "Loading…" : tier.cta}
                      </Button>
                    ) : (
                      <Button variant="outline" size="lg" className="w-full mb-8" asChild>
                        <Link to="/register">{tier.cta}</Link>
                      </Button>
                    )}
                    {tier.trial && !current && (
                      <p className="caption-text text-[12px] text-center -mt-6 mb-6">No credit card required</p>
                    )}
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-[15px] text-body-text">
                          <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
