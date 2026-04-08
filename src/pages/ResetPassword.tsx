import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event which fires when the user clicks the reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/dashboard", { replace: true });
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-section-alt flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card border border-card-border rounded-xl p-8">
            <p className="text-body-text text-[15px] mb-2">Verifying your reset link…</p>
            <p className="caption-text text-[14px]">If this takes too long, the link may have expired. Please request a new one.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-section-alt flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-display font-bold text-[16px]">⚙</span>
          </div>
          <h1 className="font-display font-bold text-[28px] text-body-text">Set New Password</h1>
          <p className="caption-text mt-2">Enter your new password below</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-8">
          <form className="flex flex-col gap-[var(--form-field-gap)]" onSubmit={handleSubmit}>
            <div>
              <label className="text-[14px] font-medium text-body-text mb-1.5 block">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-caption"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button variant="default" size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
