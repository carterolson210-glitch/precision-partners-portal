import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building,
  Layers,
  Terminal,
  Zap,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

const roleOptions = [
  {
    key: "structural",
    label: "Structural Engineer",
    icon: Building,
    description: "Design load-bearing structures and optimize frames.",
    tools: ["Beam analysis", "Load paths", "Code checks"],
  },
  {
    key: "civil",
    label: "Civil Engineer",
    icon: Layers,
    description: "Model site work, grading, and infrastructure plans.",
    tools: ["Site layouts", "Stormwater", "Earthwork"],
  },
  {
    key: "mechanical",
    label: "Mechanical Engineer",
    icon: Terminal,
    description: "Configure HVAC, piping, and mechanical systems.",
    tools: ["System sizing", "Flow diagrams", "Schedule tracking"],
  },
  {
    key: "electrical",
    label: "Electrical Engineer",
    icon: Zap,
    description: "Plan power, lighting, and controls for projects.",
    tools: ["Circuit layouts", "Load balancing", "Panel schedules"],
  },
  {
    key: "project_manager",
    label: "Project Manager",
    icon: Calendar,
    description: "Coordinate schedules, budgets, and team delivery.",
    tools: ["Task boards", "Milestones", "Team status"],
  },
  {
    key: "admin",
    label: "Admin / Office Staff",
    icon: Users,
    description: "Manage users, workflows, and office operations.",
    tools: ["Permissions", "Billing", "Client intake"],
  },
] as const;

type RoleKey = (typeof roleOptions)[number]["key"];

type Invitee = {
  email: string;
  role: RoleKey;
};

const onboardingSteps = [
  "Welcome",
  "Role Selection",
  "Preferences",
  "Calendar",
  "Invite Team",
  "Tutorial",
  "Done",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<RoleKey | "">("");
  const [unitSystem, setUnitSystem] = useState<"Imperial" | "Metric">("Imperial");
  const [defaultMaterial, setDefaultMaterial] = useState("Steel");
  const [decimalPrecision, setDecimalPrecision] = useState<2 | 3 | 4>(2);
  const [connectGoogle, setConnectGoogle] = useState(false);
  const [connectOutlook, setConnectOutlook] = useState(false);
  const [invitees, setInvitees] = useState<Invitee[]>([{ email: "", role: "structural" }]);
  const [tutorialChoice, setTutorialChoice] = useState<"yes" | "skip" | "">("");

  const displayName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Engineer";
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("onboardingComplete") === "true") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const currentStep = step + 1;
  const progress = ((currentStep - 1) / (onboardingSteps.length - 1)) * 100;

  const selectedRoleConfig = roleOptions.find((option) => option.key === selectedRole);

  const canContinue = () => {
    if (step === 1) return selectedRole !== "";
    if (step === 2) return Boolean(unitSystem && defaultMaterial && decimalPrecision);
    if (step === 5) return tutorialChoice !== "";
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !selectedRole) return;
    if (step === 2 && (!unitSystem || !defaultMaterial || !decimalPrecision)) return;
    if (step === 5 && !tutorialChoice) return;
    if (step === onboardingSteps.length - 1) {
      finishOnboarding();
      return;
    }
    setStep((current) => Math.min(current + 1, onboardingSteps.length - 1));
  };

  const handleBack = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSkip = () => {
    if (step === 3 || step === 4 || step === 5) {
      if (step === 5) {
        setTutorialChoice("skip");
      }
      setStep((current) => Math.min(current + 1, onboardingSteps.length - 1));
    }
  };

  const addInvitee = () => {
    if (invitees.length >= 5) return;
    setInvitees((prev) => [...prev, { email: "", role: "structural" }]);
  };

  const updateInvitee = (index: number, updates: Partial<Invitee>) => {
    setInvitees((prev) => prev.map((invitee, idx) => (idx === index ? { ...invitee, ...updates } : invitee)));
  };

  const removeInvitee = (index: number) => {
    if (invitees.length <= 1) return;
    setInvitees((prev) => prev.filter((_, idx) => idx !== index));
  };

  const finishOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingComplete", "true");
      sessionStorage.setItem("onboardingWelcome", "true");
      if (tutorialChoice === "yes") {
        sessionStorage.setItem("onboardingQuickTour", "true");
      }
    }
    navigate("/dashboard", { replace: true });
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-amber-300 uppercase tracking-[0.3em] text-xs font-semibold">Welcome</p>
              <h2 className="text-4xl font-bold text-white">Let's set up your workspace</h2>
              <p className="mt-4 text-slate-300 text-base leading-7">
                Tailor Clearline Engineering to your role, unit preferences, calendar, and team workflows.
              </p>
            </div>
            <div className="relative mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-950/80 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/10 via-transparent to-sky-500/0 pointer-events-none" />
              <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-amber-300 font-semibold">
                    <SlidersHorizontal className="w-5 h-5" />
                    Configure your first dashboard setup
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Company workspace</p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">Precision Partner Labs</h3>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500 flex items-center justify-center text-amber-300 text-lg font-semibold">
                        P
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {[
                        "Role-based dashboard defaults",
                        "Unit and calculation settings",
                        "Calendar and team onboarding",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3 text-slate-300">
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-300" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6">
                  <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
                    <div className="h-full w-full rounded-3xl border border-slate-700 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.08),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.4))] relative overflow-hidden">
                      <div className="absolute top-6 left-8 h-0.5 w-20 bg-amber-300/70" />
                      <div className="absolute top-20 left-14 h-0.5 w-12 bg-amber-300/60" />
                      <div className="absolute top-32 left-10 h-0.5 w-28 bg-slate-500/30" />
                      <div className="absolute right-8 top-12 h-24 w-24 rounded-full border border-amber-300/30" />
                      <div className="absolute bottom-12 right-16 h-20 w-20 rounded-full border border-slate-500/40" />
                      <div className="absolute inset-x-10 bottom-14 h-12 rounded-3xl border border-slate-500/20" />
                      <div className="absolute left-10 top-24 h-10 w-10 rounded-full bg-amber-300/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button size="lg" onClick={handleNext} className="w-full max-w-[260px]">
                Start Setup
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-amber-300 uppercase tracking-[0.3em] text-xs font-semibold">Step 2</p>
              <h2 className="text-3xl font-bold text-white">Choose your role</h2>
              <p className="mt-3 text-slate-400">
                Select the role that best describes your day-to-day work. We'll pre-configure the tools and dashboard content for you.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {roleOptions.map((role) => {
                const selected = selectedRole === role.key;
                const Icon = role.icon;
                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => setSelectedRole(role.key)}
                    className={`group rounded-3xl border p-6 text-left transition-all ${
                      selected
                        ? "border-amber-400 bg-slate-900 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]"
                        : "border-slate-700 bg-slate-950/90 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300">
                        <Icon className="w-6 h-6" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{role.label}</h3>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-6">{role.description}</p>
                    {selected && (
                      <div className="mt-5 text-amber-300 text-sm font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4" /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedRoleConfig && (
              <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6">
                <h3 className="text-white text-lg font-semibold mb-3">Dashboard tools for {selectedRoleConfig.label}</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedRoleConfig.tools.map((tool) => (
                    <div key={tool} className="rounded-2xl bg-slate-900/90 p-4 text-slate-300 border border-slate-800">
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-amber-300 uppercase tracking-[0.3em] text-xs font-semibold">Step 3</p>
              <h2 className="text-3xl font-bold text-white">Set your unit preferences</h2>
              <p className="mt-3 text-slate-400">
                Choose the units and calculation defaults that match your engineering workflow.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Unit system</p>
                <div className="mt-4 space-y-3">
                  {(["Imperial", "Metric"] as const).map((system) => (
                    <button
                      type="button"
                      key={system}
                      onClick={() => setUnitSystem(system)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                        unitSystem === system
                          ? "border-amber-400 bg-amber-500/10 text-white"
                          : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      <div className="font-semibold">{system}</div>
                      <div className="text-slate-400 text-sm mt-1">
                        {system === "Imperial" ? "Inches, feet, and pounds" : "Millimeters, meters, and kilograms"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6">
                <Label htmlFor="defaultMaterial" className="text-slate-400">Default material</Label>
                <Select value={defaultMaterial} onValueChange={(value) => setDefaultMaterial(value)}>
                  <SelectTrigger className="mt-3">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Steel">Steel</SelectItem>
                    <SelectItem value="Concrete">Concrete</SelectItem>
                    <SelectItem value="Timber">Timber</SelectItem>
                    <SelectItem value="Aluminum">Aluminum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Decimal precision</p>
                <div className="mt-4 space-y-3">
                  {[2, 3, 4].map((precision) => (
                    <button
                      type="button"
                      key={precision}
                      onClick={() => setDecimalPrecision(precision as 2 | 3 | 4)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                        decimalPrecision === precision
                          ? "border-amber-400 bg-amber-500/10 text-white"
                          : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      <div className="font-semibold">{precision} decimals</div>
                      <div className="text-slate-400 text-sm">Clean results for reports and specifications</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-amber-300 uppercase tracking-[0.3em] text-xs font-semibold">Step 4</p>
              <h2 className="text-3xl font-bold text-white">Connect your calendar</h2>
              <p className="mt-3 text-slate-400">
                Integrate your Google or Outlook calendar to sync appointments and client meetings.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setConnectGoogle((value) => !value)}
                className={`rounded-3xl border p-6 text-left transition ${
                  connectGoogle
                    ? "border-amber-400 bg-amber-500/10"
                    : "border-slate-700 bg-slate-950/90 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Globe className="w-6 h-6 text-amber-300" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Google Calendar</h3>
                    <p className="text-slate-400 text-sm mt-1">Sync meetings, site visits, and client appointments.</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setConnectOutlook((value) => !value)}
                className={`rounded-3xl border p-6 text-left transition ${
                  connectOutlook
                    ? "border-amber-400 bg-amber-500/10"
                    : "border-slate-700 bg-slate-950/90 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Copy className="w-6 h-6 text-amber-300" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Outlook Calendar</h3>
                    <p className="text-slate-400 text-sm mt-1">Keep your project schedule aligned across the office.</p>
                  </div>
                </div>
              </button>
            </div>
            <div className="text-right">
              <button type="button" className="text-slate-400 hover:text-white" onClick={handleSkip}>
                Skip for now
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-amber-300 uppercase tracking-[0.3em] text-xs font-semibold">Step 5</p>
              <h2 className="text-3xl font-bold text-white">Invite your team</h2>
              <p className="mt-3 text-slate-400">
                Add teammates now so the office can collaborate from day one. You can invite up to 5 people.
              </p>
            </div>
            <div className="space-y-4">
              {invitees.map((invitee, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-[1.6fr_1fr_0.4fr] items-end rounded-3xl border border-slate-700 bg-slate-950/90 p-5">
                  <div>
                    <Label htmlFor={`invite-email-${index}`} className="text-slate-400">Email address</Label>
                    <Input
                      id={`invite-email-${index}`}
                      value={invitee.email}
                      onChange={(e) => updateInvitee(index, { email: e.target.value })}
                      placeholder="colleague@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`invite-role-${index}`} className="text-slate-400">Role</Label>
                    <Select
                      value={invitee.role}
                      onValueChange={(value) => updateInvitee(index, { role: value as RoleKey })}
                    >
                      <SelectTrigger className="mt-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.key} value={role.key}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-end md:justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={invitees.length <= 1}
                      onClick={() => removeInvitee(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" onClick={addInvitee} disabled={invitees.length >= 5}>
                Add Teammate
              </Button>
              <button type="button" className="text-slate-400 hover:text-white" onClick={handleSkip}>
                Skip for now
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-amber-300 uppercase tracking-[0.3em] text-xs font-semibold">Step 6</p>
              <h2 className="text-3xl font-bold text-white">Take a 2-minute tour?</h2>
              <p className="mt-3 text-slate-400">
                Learn the most important areas of your new workspace with a quick guided walkthrough.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setTutorialChoice("yes")}
                className={`rounded-3xl border p-6 text-left transition ${
                  tutorialChoice === "yes"
                    ? "border-amber-400 bg-amber-500/10"
                    : "border-slate-700 bg-slate-950/90 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center gap-3 mb-4 text-amber-300">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">Yes, show me around</span>
                </div>
                <p className="text-slate-400">We’ll highlight the key dashboard features and your workflow shortcuts.</p>
              </button>
              <button
                type="button"
                onClick={() => setTutorialChoice("skip")}
                className={`rounded-3xl border p-6 text-left transition ${
                  tutorialChoice === "skip"
                    ? "border-amber-400 bg-amber-500/10"
                    : "border-slate-700 bg-slate-950/90 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center gap-3 mb-4 text-slate-300">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-semibold">Skip the tour</span>
                </div>
                <p className="text-slate-400">I’d rather explore the workspace on my own.</p>
              </button>
            </div>
            <div className="text-right">
              <button type="button" className="text-slate-400 hover:text-white" onClick={handleSkip}>
                Skip tour
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 text-center">
            <div className="max-w-3xl mx-auto">
              <p className="text-amber-300 uppercase tracking-[0.3em] text-xs font-semibold">Complete</p>
              <h2 className="text-4xl font-bold text-white">Welcome, {displayName}</h2>
              <p className="mt-4 text-slate-400">
                Your {selectedRoleConfig?.label ?? "engineering"} workspace is ready. Everything is set to help you start faster.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-8">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl bg-slate-900/95 p-6 border border-slate-800">
                  <p className="text-slate-400 uppercase tracking-[0.2em] text-xs">Role</p>
                  <p className="mt-3 text-white font-semibold">{selectedRoleConfig?.label ?? "Engineer"}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/95 p-6 border border-slate-800">
                  <p className="text-slate-400 uppercase tracking-[0.2em] text-xs">Units</p>
                  <p className="mt-3 text-white font-semibold">{unitSystem}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/95 p-6 border border-slate-800">
                  <p className="text-slate-400 uppercase tracking-[0.2em] text-xs">Precision</p>
                  <p className="mt-3 text-white font-semibold">{decimalPrecision} decimals</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/95 p-6 border border-slate-800">
                <p className="text-slate-400 uppercase tracking-[0.2em] text-xs">Calendar sync</p>
                <p className="mt-3 text-white font-semibold">{connectGoogle || connectOutlook ? "Connected" : "Not connected"}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/95 p-6 border border-slate-800">
                <p className="text-slate-400 uppercase tracking-[0.2em] text-xs">Tutorial</p>
                <p className="mt-3 text-white font-semibold">{tutorialChoice === "yes" ? "Yes" : "Skipped"}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={finishOnboarding} className="w-full sm:w-auto">
                Launch Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="ghost" size="lg" onClick={finishOnboarding} className="w-full sm:w-auto">
                Finish Setup
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 lg:px-6">
        <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Step {currentStep} of {onboardingSteps.length}</p>
              <h1 className="text-2xl font-semibold text-white">{onboardingSteps[step]}</h1>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 md:w-72">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>{selectedRoleConfig ? selectedRoleConfig.label : "Configuring your workspace"}</span>
            <span>{unitSystem} · {decimalPrecision} decimals</span>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          className="flex-1"
        >
          {renderStepContent()}
        </motion.div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-4">
            {step !== 0 && step !== onboardingSteps.length - 1 && (step === 3 || step === 4 || step === 5) ? (
              <button type="button" className="text-slate-400 hover:text-white" onClick={handleSkip}>
                Skip step
              </button>
            ) : null}
            <Button onClick={handleNext} disabled={!canContinue()}>
              {step === onboardingSteps.length - 1 ? "Finish" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
