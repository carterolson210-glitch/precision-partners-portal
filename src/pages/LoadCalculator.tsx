import { useState, useEffect } from "react";
import { Download, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import ElectricalLoadCalculator from "@/components/ElectricalLoadCalculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface SavedCalculation {
  id: string;
  inputs: any;
  total_amps: number;
  total_kw: number;
  created_at: string;
}

const LoadCalculator = () => {
  const { user } = useAuth();
  const [showCalculator, setShowCalculator] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSavedCalculations();
    }
  }, [user]);

  const loadSavedCalculations = async () => {
    try {
      const { data, error } = await supabase
        .from("load_calculations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedCalculations(data || []);
    } catch (error) {
      console.error("Error loading calculations:", error);
      toast.error("Failed to load saved calculations");
    } finally {
      setLoading(false);
    }
  };

  const handleNewCalculation = () => {
    setShowCalculator(true);
  };

  const handleCalculationSaved = () => {
    setShowCalculator(false);
    loadSavedCalculations(); // Refresh the list
    toast.success("Calculation saved successfully!");
  };

  const handleDownload = (calculation: SavedCalculation) => {
    // Create a simple text report
    const report = `
Electrical Load Calculation Report
Generated: ${new Date().toLocaleString()}

Building Information:
- Square Footage: ${calculation.inputs.squareFootage}
- Number of Floors: ${calculation.inputs.numberOfFloors}
- HVAC Units: ${calculation.inputs.hvacUnits}
- Lighting Circuits: ${calculation.inputs.lightingCircuits}
- Receptacle Outlets: ${calculation.inputs.outlets}
- Major Appliances: ${calculation.inputs.appliances}

Service Requirements:
- Total Amperage: ${calculation.total_amps.toFixed(1)} A
- Total Kilowatts: ${calculation.total_kw.toFixed(1)} kW
- Recommended Service: ${Math.ceil(calculation.total_amps / 100) * 100}A / ${Math.ceil(calculation.total_kw / 10) * 10}kW

Note: This calculation is based on NEC 220 requirements and should be verified by a licensed electrical engineer.
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `electrical-load-calculation-${calculation.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Electrical Load Calculator">
      <DashboardCard title="Load Calculations">
        {showCalculator ? (
          <ElectricalLoadCalculator />
        ) : (
          <EmptyState
            icon={<Zap className="w-8 h-8 text-steel" />}
            title="Calculate Electrical Service Requirements"
            description="Input building specifications to calculate total electrical load requirements per NEC 220. Get accurate amperage and kilowatt calculations for proper service sizing."
            actionLabel="New Calculation"
            onAction={handleNewCalculation}
          />
        )}
      </DashboardCard>

      <div className="mt-[var(--card-gap)]">
        <DashboardCard title="Saved Calculations">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-description">Loading calculations...</div>
            </div>
          ) : savedCalculations.length === 0 ? (
            <EmptyState
              icon={<Zap className="w-8 h-8 text-steel" />}
              title="No calculations saved"
              description="Your completed electrical load calculations will appear here, ready for review, download, or attachment to permit applications."
            />
          ) : (
            <div className="space-y-4">
              {savedCalculations.map((calculation) => (
                <Card key={calculation.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {calculation.inputs.squareFootage} sq ft Building
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(calculation.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(calculation)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Square Footage</p>
                        <p className="text-lg font-semibold">{calculation.inputs.squareFootage}</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Amps</p>
                        <p className="text-lg font-semibold">{calculation.total_amps.toFixed(1)} A</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total kW</p>
                        <p className="text-lg font-semibold">{calculation.total_kw.toFixed(1)} kW</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default LoadCalculator;
