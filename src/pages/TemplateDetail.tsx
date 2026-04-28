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
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { User } from "@supabase/supabase-js";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublicKey ?? "");

interface CheckoutFormProps {
  clientSecret: string;
  user: User | null;
  onCompleted: () => void;
}

const CheckoutForm = ({ clientSecret, user, onCompleted }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) {
      setPaymentError("Stripe is still loading. Please wait a moment.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("Card input is not available.");
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user?.email ?? undefined,
          },
        },
      });

      if (result.error) {
        setPaymentError(result.error.message || "Payment failed. Please try another card.");
      } else if (result.paymentIntent?.status === "succeeded") {
        toast.success("Payment completed successfully.");
        onCompleted();
      } else {
        setPaymentError("Payment was not completed. Please try again.");
      }
    } catch (error: any) {
      setPaymentError(error?.message || "Unable to complete payment.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-card-border bg-card p-4">
        <label className="block text-sm font-medium text-body-text mb-2">Card details</label>
        <div className="rounded-xl border border-border p-4 bg-background">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#111827",
                  "::placeholder": {
                    color: "#9CA3AF",
                  },
                },
                invalid: {
                  color: "#EF4444",
                },
              },
            }}
          />
        </div>
      </div>

      {paymentError && <p className="text-sm text-destructive">{paymentError}</p>}

      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={processing}>
        {processing ? "Submitting…" : "Pay now"}
      </Button>
    </form>
  );
};

const TemplateDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
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

    if (!stripePublicKey) {
      setPaymentError("Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY.");
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      const { data, error } = await supabase.functions.invoke("create-template-payment-intent", {
        body: {
          templateSlug: template.slug,
          templateName: template.name,
          amountCents: template.price * 100,
        },
      });

      if (error) throw error;
      if (!data?.clientSecret) {
        throw new Error("Unable to initialize payment.");
      }

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setPaymentError(err.message || "Failed to create payment intent.");
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

                {paymentSuccess ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                      <Check className="mx-auto mb-3 h-7 w-7 text-green-600" />
                      <h2 className="text-lg font-semibold text-body-text">Payment successful</h2>
                      <p className="text-caption text-[13px] mt-2 text-description">
                        Your template is ready to download. Access it from your dashboard.
                      </p>
                    </div>
                    <Link to="/dashboard/downloads">
                      <Button variant="secondary" size="lg" className="w-full">
                        View Downloads
                      </Button>
                    </Link>
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise}>
                    <div className="space-y-4">
                      <CheckoutForm clientSecret={clientSecret} user={user} onCompleted={() => setPaymentSuccess(true)} />
                      <Button variant="outline" size="lg" className="w-full" onClick={() => setClientSecret(null)}>
                        Cancel
                      </Button>
                    </div>
                  </Elements>
                ) : (
                  <>
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
                    {paymentError && <p className="mt-4 text-sm text-destructive">{paymentError}</p>}
                  </>
                )}
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
