import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TEMPLATES } from "@/pages/Templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, ShoppingCart, FileText, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const TemplateDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const template = TEMPLATES.find((t) => t.slug === slug);

  if (!template) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 text-center">
          <h1 className="text-[28px] font-bold text-body-text font-display">Template not found</h1>
          <Link to="/templates" className="text-gold mt-4 inline-block">← Back to templates</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please log in or create an account to purchase templates.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-template-payment", {
        body: {
          templateSlug: template.slug,
          templateName: template.name,
          priceId: template.priceId,
          amountCents: template.price * 100,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create payment session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-[900px] mx-auto px-4 lg:px-6">
          <Link to="/templates" className="inline-flex items-center gap-2 text-caption hover:text-body-text text-[14px] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Templates
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left: Info */}
            <div className="md:col-span-3">
              <Badge variant="secondary" className="mb-3">{template.category}</Badge>
              <h1 className="text-[32px] font-bold text-body-text font-display mb-4">{template.name}</h1>
              <p className="text-description text-[15px] mb-6 leading-relaxed">{template.description}</p>

              <h2 className="text-[16px] font-semibold text-body-text mb-3">What's Included</h2>
              <ul className="space-y-2.5 mb-8">
                {template.included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-description">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <h2 className="text-[16px] font-semibold text-body-text mb-3">File Formats</h2>
              <div className="flex gap-3">
                {template.formats.map((f) => (
                  <div key={f} className="flex items-center gap-2 bg-section-alt border border-card-border rounded-lg px-4 py-2.5">
                    <FileText className="w-4 h-4 text-navy" />
                    <span className="text-[14px] font-medium text-body-text">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Purchase card */}
            <div className="md:col-span-2">
              <div className="bg-card border border-card-border rounded-xl p-6 sticky top-28">
                <div className="w-full h-[160px] bg-navy/5 rounded-lg flex items-center justify-center mb-5">
                  <template.icon className="w-16 h-16 text-navy/30" />
                </div>
                <div className="text-center mb-5">
                  <span className="text-[36px] font-bold text-body-text font-display">${template.price}</span>
                  <span className="text-caption text-[14px] ml-1">one-time</span>
                </div>
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={loading}
                >
                  {loading ? "Processing…" : (
                    <><ShoppingCart className="w-4 h-4 mr-2" /> Purchase Template</>
                  )}
                </Button>
                {!user && (
                  <p className="text-center text-caption text-[12px] mt-3">
                    <Link to="/login" className="text-gold hover:underline">Log in</Link> or{" "}
                    <Link to="/register" className="text-gold hover:underline">create an account</Link> to purchase
                  </p>
                )}
                <div className="flex items-center justify-center gap-1.5 mt-4 text-caption text-[12px]">
                  <Lock className="w-3 h-3" /> Secure payment via Stripe
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TemplateDetail;
