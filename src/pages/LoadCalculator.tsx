import { useState } from "react";
import { Download, Wrench } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import LoadCalculatorForm, { LoadCalculation } from "@/components/LoadCalculatorForm";

const LoadCalculator = () => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [history, setHistory] = useState<LoadCalculation[]>([]);

  const handleNewCalculation = () => {
    setShowCalculator(true);
  };

  const handleSaveCalculation = (calculation: LoadCalculation) => {
    setHistory((current) => [calculation, ...current]);
    setShowCalculator(false);
  };

  const handleCancel = () => {
    setShowCalculator(false);
  };

  return (
    <DashboardLayout title="Structural Load Calculator">
      <DashboardCard title="Load Calculations">
        {showCalculator ? (
          <LoadCalculatorForm onSave={handleSaveCalculation} onCancel={handleCancel} />
        ) : (
          <EmptyState
            icon={<Wrench className="w-8 h-8 text-steel" />}
            title="Run Your First Calculation"
            description="Input beam span, uniform load, tributary width, occupancy type, and location to generate a design moment and reaction estimate."
            actionLabel="New Calculation"
            onAction={handleNewCalculation}
          />
        )}
      </DashboardCard>

      <div className="mt-[var(--card-gap)]">
        <DashboardCard title="Calculation History">
          {history.length === 0 ? (
            <EmptyState
              icon={<Wrench className="w-8 h-8 text-steel" />}
              title="No calculations saved"
              description="Your completed load calculations will appear here, ready for review, download, or attachment to permit applications."
            />
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="rounded-3xl border border-card-border bg-card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-description">{item.createdAt}</p>
                      <h3 className="text-lg font-semibold text-body-text">{item.name}</h3>
                      <p className="text-sm text-description">{item.occupancyType} · {item.location}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg border border-border px-4 py-2 text-sm text-description hover:bg-section-alt transition-colors">
                        Review
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-navy/90 transition-colors">
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm text-description">
                    <div className="rounded-2xl bg-section-alt p-3">
                      <p>Span</p>
                      <p className="mt-1 font-semibold text-body-text">{item.span} ft</p>
                    </div>
                    <div className="rounded-2xl bg-section-alt p-3">
                      <p>Uniform Load</p>
                      <p className="mt-1 font-semibold text-body-text">{item.load} psf</p>
                    </div>
                    <div className="rounded-2xl bg-section-alt p-3">
                      <p>Max Moment</p>
                      <p className="mt-1 font-semibold text-body-text">{item.maxMoment.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default LoadCalculator;
