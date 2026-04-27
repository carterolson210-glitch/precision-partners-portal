import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedRememberMe && savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      // Save or clear credentials based on remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
        localStorage.removeItem("rememberMe");
      }
      navigate("/dashboard");
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      // Clear saved credentials when remember me is unchecked
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
      localStorage.removeItem("rememberMe");
    }
  };

  return (
    <div className="min-h-screen bg-section-alt flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-display font-bold text-[16px]">⚙</span>
          </div>
          <h1 className="font-display font-bold text-[28px] text-body-text">Welcome Back</h1>
          <p className="caption-text mt-2">Sign in to your engineering platform</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-8">
          <form className="flex flex-col gap-[var(--form-field-gap)]" onSubmit={handleEmailLogin}>
            <div>
              <label className="text-[14px] font-medium text-body-text mb-1.5 block">Email Address</label>
              <Input type="email" placeholder="you@yourfirm.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-[14px] font-medium text-body-text mb-1.5 block">Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-caption"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-[14px] text-description cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={rememberMe}
                  onChange={(e) => handleRememberMeChange(e.target.checked)}
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-[14px] text-gold hover:underline">Forgot password?</Link>
            </div>
            <Button variant="default" size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-[14px] text-description mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-gold font-medium hover:underline">Start free trial</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
