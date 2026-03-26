import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

const disciplines = [
  "Civil", "Structural", "Mechanical", "Geotechnical",
  "Environmental", "Electrical", "Other",
];

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source");

  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /\d/.test(password) },
    { label: "Special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const strength = checks.filter((c) => c.met).length;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: `${firstName} ${lastName}`,
          firm_name: firmName,
          discipline,
          team_size: teamSize,
          country,
          provider: "email",
          ...(source ? { source } : {}),
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for a verification link to complete your registration.");
      navigate("/login");
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result?.error) {
      toast.error(String(result.error));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-section-alt flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-display font-bold text-[16px]">⚙</span>
          </div>
          <h1 className="font-display font-bold text-[28px] text-body-text">Create Your Account</h1>
          <p className="caption-text mt-2">Start your 14-day free trial — no credit card required</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-8">
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={handleGoogleRegister}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-card-border rounded-lg text-[15px] font-medium text-body-text hover:bg-section-alt transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-card-border" />
            <span className="caption-text text-[13px]">or register with email</span>
            <div className="flex-1 h-px bg-card-border" />
          </div>

          <form className="flex flex-col gap-[var(--form-field-gap)]" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--form-field-gap)]">
              <div>
                <label className="text-[14px] font-medium text-body-text mb-1.5 block">First Name</label>
                <Input placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <label className="text-[14px] font-medium text-body-text mb-1.5 block">Last Name</label>
                <Input placeholder="Smith" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="text-[14px] font-medium text-body-text mb-1.5 block">Professional Email</label>
              <Input type="email" placeholder="you@yourfirm.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-[14px] font-medium text-body-text mb-1.5 block">Firm Name</label>
              <Input placeholder="Your firm name or 'Solo Practitioner'" value={firmName} onChange={(e) => setFirmName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--form-field-gap)]">
              <div>
                <label className="text-[14px] font-medium text-body-text mb-1.5 block">Engineering Discipline</label>
                <select value={discipline} onChange={(e) => setDiscipline(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-card-border bg-background text-body-text text-[16px] focus:outline-none focus:ring-2 focus:ring-gold">
                  <option value="">Select discipline</option>
                  {disciplines.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[14px] font-medium text-body-text mb-1.5 block">Team Size</label>
                <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-card-border bg-background text-body-text text-[16px] focus:outline-none focus:ring-2 focus:ring-gold">
                  <option value="">Select size</option>
                  <option value="1">Just me</option>
                  <option value="2-5">2-5</option>
                  <option value="6-20">6-20</option>
                  <option value="21-50">21-50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[14px] font-medium text-body-text mb-1.5 block">Country</label>
              <Input placeholder="United States" value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>
            <div>
              <label className="text-[14px] font-medium text-body-text mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-caption"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i <= strength
                            ? strength <= 2 ? "bg-destructive" : strength <= 3 ? "bg-gold" : "bg-green-500"
                            : "bg-card-border"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {checks.map((c) => (
                      <span key={c.label} className={`flex items-center gap-1.5 text-[12px] ${c.met ? "text-green-600" : "text-caption"}`}>
                        {c.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button variant="gold" size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-[14px] text-description mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-gold font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
