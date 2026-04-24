import { useMemo, useState } from "react";

export interface LoadCalculation {
  id: string;
  name: string;
  span: number;
  load: number;
  tributaryWidth: number;
  occupancyType: string;
  location: string;
  maxMoment: number;
  reaction: number;
  createdAt: string;
}

interface LoadCalculatorFormProps {
  onSave: (calculation: LoadCalculation) => void;
  onCancel: () => void;
}

const occupancyOptions = ["Office", "Residential", "Retail", "Industrial", "Assembly"];
const locationOptions = ["Coastal", "Inland", "Mountain", "Urban", "Suburban"];

const formatNumber = (value: number) => value.toFixed(2);

export default function LoadCalculatorForm({ onSave, onCancel }: LoadCalculatorFormProps) {
  const [span, setSpan] = useState(20);
  const [load, setLoad] = useState(20);
  const [tributaryWidth, setTributaryWidth] = useState(12);
  const [occupancyType, setOccupancyType] = useState(occupancyOptions[0]);
  const [location, setLocation] = useState(locationOptions[0]);

  const maxMoment = useMemo(() => (load * Math.pow(span, 2)) / 8, [load, span]);
  const reaction = useMemo(() => (load * span) / 2, [load, span]);

  const handleSave = () => {
    onSave({
      id: `${Date.now()}`,
      name: `${occupancyType} Load ${new Date().toLocaleDateString()}`,
      span,
      load,
      tributaryWidth,
      occupancyType,
      location,
      maxMoment,
      reaction,
      createdAt: new Date().toLocaleString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-card-border bg-card p-5">
          <h3 className="text-lg font-semibold text-body-text">Load Input</h3>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-description">Span (ft)</label>
            <input
              type="number"
              min={1}
              value={span}
              onChange={(event) => setSpan(Number(event.target.value))}
              className="w-full rounded-lg border border-border px-3 py-2 bg-background text-body-text"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-description">Uniform Load (psf)</label>
            <input
              type="number"
              min={0}
              value={load}
              onChange={(event) => setLoad(Number(event.target.value))}
              className="w-full rounded-lg border border-border px-3 py-2 bg-background text-body-text"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-description">Tributary Width (ft)</label>
            <input
              type="number"
              min={1}
              value={tributaryWidth}
              onChange={(event) => setTributaryWidth(Number(event.target.value))}
              className="w-full rounded-lg border border-border px-3 py-2 bg-background text-body-text"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-card-border bg-card p-5">
          <h3 className="text-lg font-semibold text-body-text">Design Details</h3>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-description">Occupancy Type</label>
            <select
              value={occupancyType}
              onChange={(event) => setOccupancyType(event.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-background text-body-text"
            >
              {occupancyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-description">Location</label>
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-background text-body-text"
            >
              {locationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="rounded-xl border border-border bg-section-alt p-4">
            <p className="text-sm text-description">Calculated design loads are based on a simple beam model and can be adjusted with your project parameters.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-card-border bg-card p-5">
        <h3 className="text-lg font-semibold text-body-text mb-4">Results</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-section-alt p-4 text-sm">
            <p className="text-description">Max Moment</p>
            <p className="mt-2 text-2xl font-semibold text-body-text">{formatNumber(maxMoment)} kft</p>
          </div>
          <div className="rounded-2xl bg-section-alt p-4 text-sm">
            <p className="text-description">Reaction</p>
            <p className="mt-2 text-2xl font-semibold text-body-text">{formatNumber(reaction)} kips</p>
          </div>
          <div className="rounded-2xl bg-section-alt p-4 text-sm">
            <p className="text-description">Tributary Width</p>
            <p className="mt-2 text-2xl font-semibold text-body-text">{formatNumber(tributaryWidth)} ft</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-description hover:bg-section-alt transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-navy px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-navy/90 transition-colors"
        >
          Save Calculation
        </button>
      </div>
    </div>
  );
}
