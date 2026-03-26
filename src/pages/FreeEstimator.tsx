import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, ArrowRight } from "lucide-react";

const PROJECT_TYPES = ["Structural", "Civil", "Mechanical", "Geotechnical", "Environmental"] as const;
const REGIONS = ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "Pacific Northwest", "Mountain West"] as const;
const MATERIAL_GRADES = ["Standard", "Premium", "Industrial"] as const;
const URGENCY_LEVELS = ["Standard", "Expedited", "Rush"] as const;

type ProjectType = typeof PROJECT_TYPES[number];
type Region = typeof REGIONS[number];
type MaterialGrade = typeof MATERIAL_GRADES[number];
type Urgency = typeof URGENCY_LEVELS[number];

/* ── Rate tables ── */
const BASE_RATES: Record<ProjectType, { matPerSqft: number; laborPerSqft: number; permitPct: number; overheadPct: number }> = {
  Structural:    { matPerSqft: 22, laborPerSqft: 18, permitPct: 0.04, overheadPct: 0.12 },
  Civil:         { matPerSqft: 16, laborPerSqft: 14, permitPct: 0.05, overheadPct: 0.10 },
  Mechanical:    { matPerSqft: 28, laborPerSqft: 24, permitPct: 0.03, overheadPct: 0.14 },
  Geotechnical:  { matPerSqft: 20, laborPerSqft: 22, permitPct: 0.06, overheadPct: 0.11 },
  Environmental: { matPerSqft: 18, laborPerSqft: 20, permitPct: 0.07, overheadPct: 0.13 },
};

const REGION_MULT: Record<Region, number> = {
  Northeast: 1.18, Southeast: 0.92, Midwest: 0.95, Southwest: 0.98,
  "West Coast": 1.25, "Pacific Northwest": 1.15, "Mountain West": 1.02,
};

const GRADE_MULT: Record<MaterialGrade, number> = { Standard: 1, Premium: 1.35, Industrial: 1.55 };
const URGENCY_MULT: Record<Urgency, number> = { Standard: 1, Expedited: 1.2, Rush: 1.45 };

function compute(type: ProjectType, sqft: number, region: Region, grade: MaterialGrade, urgency: Urgency) {
  const r = BASE_RATES[type];
  const rm = REGION_MULT[region];
  const gm = GRADE_MULT[grade];
  const um = URGENCY_MULT[urgency];

  const materialBase = r.matPerSqft * sqft * rm * gm;
  const laborBase = r.laborPerSqft * sqft * rm * um;
  const subtotal = materialBase + laborBase;
  const permit = subtotal * r.permitPct;
  const overhead = subtotal * r.overheadPct;
  const total = subtotal + permit + overhead;

  const variance = 0.12;
  return {
    materials: { min: Math.round(materialBase * (1 - variance)), max: Math.round(materialBase * (1 + variance)) },
    labor: { min: Math.round(laborBase * (1 - variance)), max: Math.round(laborBase * (1 + variance)) },
    permit: { min: Math.round(permit * (1 - variance)), max: Math.round(permit * (1 + variance)) },
    overhead: { min: Math.round(overhead * (1 - variance)), max: Math.round(overhead * (1 + variance)) },
    total: { min: Math.round(total * (1 - variance)), max: Math.round(total * (1 + variance)) },
  };
}

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const FreeEstimator = () => {
  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [sqft, setSqft] = useState("");
  const [region, setRegion] = useState<Region | "">("");
  const [grade, setGrade] = useState<MaterialGrade | "">("");
  const [urgency, setUrgency] = useState<Urgency | "">("");
  const [results, setResults] = useState<ReturnType<typeof compute> | null>(null);

  const canCalc = projectType && sqft && Number(sqft) > 0 && region && grade && urgency;

  const handleCalc = () => {
    if (!canCalc) return;
    setResults(compute(projectType as ProjectType, Number(sqft), region as Region, grade as MaterialGrade, urgency as Urgency));
  };

  const selectClass = "w-full h-10 px-3 rounded-lg border border-card-border bg-background text-body-text text-[15px] focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 h-[var(--nav-height)] bg-background border-b border-card-border z-[1000] flex items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-navy rounded flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-[13px]">⚙</span>
            </div>
            <span className="font-display font-bold text-lg text-body-text">
              Simpli<span className="text-gold">Engineering</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="gold" size="default" asChild>
              <Link to="/register">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-[calc(var(--nav-height)+48px)] pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[13px] font-medium mb-4">
              <Calculator className="w-4 h-4" /> Free Tool — No Login Required
            </div>
            <h1 className="font-display font-bold text-[32px] md:text-[40px] text-body-text leading-tight">
              Engineering Project Cost Estimator
            </h1>
            <p className="text-description text-[16px] mt-3 max-w-xl mx-auto">
              Get an instant itemized cost breakdown for your next engineering project. Enter your project parameters below.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border border-card-border rounded-xl p-8">
            <div className="flex flex-col gap-[20px]">
              <div>
                <label className="text-[14px] font-medium text-body-text mb-1.5 block">Project Type</label>
                <select value={projectType} onChange={(e) => setProjectType(e.target.value as ProjectType)} className={selectClass}>
                  <option value="">Select project type</option>
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[14px] font-medium text-body-text mb-1.5 block">Estimated Square Footage / Project Scale</label>
                <Input type="number" min={1} placeholder="e.g. 5000" value={sqft} onChange={(e) => setSqft(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[20px]">
                <div>
                  <label className="text-[14px] font-medium text-body-text mb-1.5 block">US Region</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value as Region)} className={selectClass}>
                    <option value="">Select region</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-medium text-body-text mb-1.5 block">Material Grade</label>
                  <select value={grade} onChange={(e) => setGrade(e.target.value as MaterialGrade)} className={selectClass}>
                    <option value="">Select grade</option>
                    {MATERIAL_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-medium text-body-text mb-1.5 block">Timeline Urgency</label>
                  <select value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)} className={selectClass}>
                    <option value="">Select urgency</option>
                    {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <Button variant="gold" size="lg" className="w-full mt-2" onClick={handleCalc} disabled={!canCalc}>
                <Calculator className="w-5 h-5 mr-2" /> Calculate Estimate
              </Button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="mt-[16px]">
              <div className="bg-card border border-card-border rounded-xl p-8">
                <h2 className="font-display font-bold text-[20px] text-body-text mb-[12px]">Itemized Cost Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-[15px]">
                    <thead>
                      <tr className="border-b border-card-border">
                        <th className="text-left py-3 font-medium text-description">Category</th>
                        <th className="text-right py-3 font-medium text-description">Low Estimate</th>
                        <th className="text-right py-3 font-medium text-description">High Estimate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        ["Estimated Material Costs", results.materials],
                        ["Labor Costs", results.labor],
                        ["Permit & Compliance Fees", results.permit],
                        ["Engineering Overhead", results.overhead],
                      ] as [string, { min: number; max: number }][]).map(([label, val]) => (
                        <tr key={label} className="border-b border-card-border">
                          <td className="py-3 text-body-text">{label}</td>
                          <td className="py-3 text-right text-body-text">{fmt(val.min)}</td>
                          <td className="py-3 text-right text-body-text">{fmt(val.max)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="py-4 text-body-text">Total Project Range</td>
                        <td className="py-4 text-right text-gold">{fmt(results.total.min)}</td>
                        <td className="py-4 text-right text-gold">{fmt(results.total.max)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-[16px] bg-navy rounded-xl p-8 text-center">
                <h3 className="font-display font-bold text-[22px] text-primary-foreground mb-2">
                  Save &amp; Export This Estimate as a PDF Proposal
                </h3>
                <p className="text-steel text-[15px] mb-6 max-w-md mx-auto">
                  Create your free Simpli Engineering account to save estimates, generate branded PDF proposals, and manage your entire engineering practice.
                </p>
                <Button variant="gold" size="lg" asChild>
                  <Link to="/register?source=cost-estimator">
                    Create Free Account <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FreeEstimator;
