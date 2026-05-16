import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const referrerId = searchParams.get("ref");

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
    const { data: signUpData, error } = await supabase.auth.signUp({
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
          ...(referrerId ? { referrer_id: referrerId } : {}),
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      // Create referral record if user came via referral link
      if (typeof window !== "undefined") {
        window.localStorage.setItem("newUserSignup", "true");
      }

      if (referrerId && signUpData?.user?.id) {
        await supabase.from("referrals").insert({
          referrer_id: referrerId,
          referred_id: signUpData.user.id,
          referred_email: email,
        } as any);
      }
      toast.success("Check your email for a verification link to complete your registration.");
      navigate("/login");
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
