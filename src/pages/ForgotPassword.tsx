import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-section-alt flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-display font-bold text-[16px]">⚙</span>
          </div>
          <h1 className="font-display font-bold text-[28px] text-body-text">Reset Password</h1>
          <p className="caption-text mt-2">Enter your email to receive a password reset link</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-8">
          {sent ? (
            <div className="text-center">
              <p className="text-body-text text-[15px] mb-4">
                If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <p className="caption-text text-[14px] mb-6">Check your inbox and spam folder.</p>
              <Link to="/login" className="text-gold font-medium hover:underline text-[14px]">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form className="flex flex-col gap-[var(--form-field-gap)]" onSubmit={handleSubmit}>
              <div>
                <label className="text-[14px] font-medium text-body-text mb-1.5 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@yourfirm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button variant="default" size="lg" type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
              </Button>
              <p className="text-center text-[14px] text-description mt-2">
                <Link to="/login" className="text-gold font-medium hover:underline">Back to Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
