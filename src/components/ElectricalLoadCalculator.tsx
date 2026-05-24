import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import StructuralDrawingExtractor from "@/components/StructuralDrawingExtractor";

interface ElectricalLoadInputs {
  squareFootage: number;
  numberOfFloors: number;
  hvacUnits: number;
  lightingCircuits: number;
  outlets: number;
  appliances: number;
}

interface LoadBreakdown {
  category: string;
  description: string;
  amps: number;
  kw: number;
}

export default function ElectricalLoadCalculator({
  projectId,
  onSave,
}: {
  projectId?: string;
  onSave?: () => void;
}) {
  const { user } = useAuth();
  const [inputs, setInputs] = useState<ElectricalLoadInputs>({
    squareFootage: 2000,
    numberOfFloors: 1,
    hvacUnits: 2,
    lightingCircuits: 10,
    outlets: 20,
    appliances: 5,
  });
  const [structuralInputs, setStructuralInputs] = useState({
    slabThickness: "6 in",
    unitWeight: "150 pcf",
    superimposedDeadLoad: "10 psf",
    occupancyType: "Office",
    memberSizes: "W12x40 beams, 8x8 columns",
  });
  const [loading, setLoading] = useState(false);

  const handleDrawingExtraction = (values: {
    slabThickness: string;
    unitWeight: string;
    superimposedDeadLoad: string;
    occupancyType: string;
    memberSizes: string;
  }) => {
    setStructuralInputs(values);
  };

  const deadLoadEstimate = useMemo(() => {
    const parseNumber = (value: string) => {
      const match = value.match(/[\d.]+/);
      return match ? Number(match[0]) : 0;
    };

    const thicknessIn = parseNumber(structuralInputs.slabThickness);
    const unitWeight = parseNumber(structuralInputs.unitWeight);
    const superLoad = parseNumber(structuralInputs.superimposedDeadLoad);
    if (!thicknessIn || !unitWeight) return null;

    const slabDepthFeet = structuralInputs.slabThickness.toLowerCase().includes("mm")
      ? thicknessIn * 0.00328084
      : thicknessIn / 12;

    return slabDepthFeet * unitWeight + superLoad;
  }, [structuralInputs]);

  // Calculate loads based on NEC requirements
  const loadBreakdown = useMemo((): LoadBreakdown[] => {
    const sqFt = inputs.squareFootage;
    const floors = inputs.numberOfFloors;

    return [
      {
        category: "General Lighting",
        description: `${sqFt} sq ft @ 3 VA/sq ft`,
        amps: (sqFt * 3) / 120, // 3 VA per sq ft at 120V
        kw: (sqFt * 3) / 1000,
      },
      {
        category: "Small Appliance Circuits",
        description: `${floors} floor(s) @ 1500 VA each`,
        amps: (floors * 1500) / 120,
        kw: (floors * 1500) / 1000,
      },
      {
        category: "Laundry Circuits",
        description: `${floors} floor(s) @ 1500 VA each`,
        amps: (floors * 1500) / 120,
        kw: (floors * 1500) / 1000,
      },
      {
        category: "Range",
        description: `${inputs.appliances} appliance(s) @ 8000 VA each`,
        amps: (inputs.appliances * 8000) / 240,
        kw: (inputs.appliances * 8000) / 1000,
      },
      {
        category: "Dryer",
        description: `${inputs.appliances} appliance(s) @ 5500 VA each`,
        amps: (inputs.appliances * 5500) / 240,
        kw: (inputs.appliances * 5500) / 1000,
      },
      {
        category: "Water Heater",
        description: `${inputs.appliances} appliance(s) @ 4500 VA each`,
        amps: (inputs.appliances * 4500) / 240,
        kw: (inputs.appliances * 4500) / 1000,
      },
      {
        category: "HVAC",
        description: `${inputs.hvacUnits} unit(s) @ 5000 VA each`,
        amps: (inputs.hvacUnits * 5000) / 240,
        kw: (inputs.hvacUnits * 5000) / 1000,
      },
      {
        category: "Receptacle Loads",
        description: `${inputs.outlets} outlet(s) @ 180 VA each`,
        amps: (inputs.outlets * 180) / 120,
        kw: (inputs.outlets * 180) / 1000,
      },
    ];
  }, [inputs]);

  const totals = useMemo(() => {
    const totalAmps = loadBreakdown.reduce((sum, item) => sum + item.amps, 0);
    const totalKw = loadBreakdown.reduce((sum, item) => sum + item.kw, 0);
    return { totalAmps, totalKw };
  }, [loadBreakdown]);

  const handleInputChange = (field: keyof ElectricalLoadInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEstimate = async () => {
    if (!user) {
      toast.error("You must be logged in to save calculations");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        user_id: user.id,
        inputs: {
          ...inputs,
          structural: structuralInputs,
          source: {
            type: "drawing-extraction",
            extractedAt: new Date().toISOString(),
          },
        },
        total_amps: totals.totalAmps,
        total_kw: totals.totalKw,
      };

      if (projectId) {
        payload.project_id = projectId;
      }

      const { error } = await supabase.from("load_calculations").insert(payload);

      if (error) throw error;

      toast.success("Load calculation saved successfully!");
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving calculation:", error);
      toast.error("Failed to save calculation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StructuralDrawingExtractor onExtracted={handleDrawingExtraction} />
      <Card>
        <CardHeader>
          <CardTitle>Structural Load Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border p-4 bg-muted">
            <p className="text-sm text-muted-foreground">Slab Thickness</p>
            <p className="mt-2 text-lg font-semibold">{structuralInputs.slabThickness || "Not set"}</p>
          </div>
          <div className="rounded-2xl border border-border p-4 bg-muted">
            <p className="text-sm text-muted-foreground">Unit Weight</p>
            <p className="mt-2 text-lg font-semibold">{structuralInputs.unitWeight || "Not set"}</p>
          </div>
          <div className="rounded-2xl border border-border p-4 bg-muted">
            <p className="text-sm text-muted-foreground">Superimposed Dead Load</p>
            <p className="mt-2 text-lg font-semibold">{structuralInputs.superimposedDeadLoad || "Not set"}</p>
          </div>
          <div className="rounded-2xl border border-border p-4 bg-muted">
            <p className="text-sm text-muted-foreground">Occupancy Type</p>
            <p className="mt-2 text-lg font-semibold">{structuralInputs.occupancyType || "Not set"}</p>
          </div>
          <div className="sm:col-span-2 rounded-2xl border border-border p-4 bg-muted">
            <p className="text-sm text-muted-foreground">Member Sizes</p>
            <p className="mt-2 text-lg font-semibold">{structuralInputs.memberSizes || "Not set"}</p>
          </div>
          <div className="sm:col-span-2 rounded-2xl border border-border p-4 bg-muted">
            <p className="text-sm text-muted-foreground">Estimated Composite Dead Load</p>
            <p className="mt-2 text-lg font-semibold">{deadLoadEstimate !== null ? `${deadLoadEstimate.toFixed(1)} psf` : "Requires slab info"}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Building Information</CardTitle>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="squareFootage">Square Footage</Label>
                <Input
                  id="squareFootage"
                  type="number"
                  min="1"
                  value={inputs.squareFootage}
                  onChange={(e) => handleInputChange("squareFootage", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfFloors">Number of Floors</Label>
                <Input
                  id="numberOfFloors"
                  type="number"
                  min="1"
                  value={inputs.numberOfFloors}
                  onChange={(e) => handleInputChange("numberOfFloors", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hvacUnits">HVAC Units</Label>
                <Input
                  id="hvacUnits"
                  type="number"
                  min="0"
                  value={inputs.hvacUnits}
                  onChange={(e) => handleInputChange("hvacUnits", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lightingCircuits">Lighting Circuits</Label>
                <Input
                  id="lightingCircuits"
                  type="number"
                  min="0"
                  value={inputs.lightingCircuits}
                  onChange={(e) => handleInputChange("lightingCircuits", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="outlets">Receptacle Outlets</Label>
                <Input
                  id="outlets"
                  type="number"
                  min="0"
                  value={inputs.outlets}
                  onChange={(e) => handleInputChange("outlets", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appliances">Major Appliances</Label>
                <Input
                  id="appliances"
                  type="number"
                  min="0"
                  value={inputs.appliances}
                  onChange={(e) => handleInputChange("appliances", Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Service Size Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Amperage</p>
                <p className="text-2xl font-bold text-primary">{totals.totalAmps.toFixed(1)} A</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Kilowatts</p>
                <p className="text-2xl font-bold text-primary">{totals.totalKw.toFixed(1)} kW</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Recommended Service: {Math.ceil(totals.totalAmps / 100) * 100}A / {Math.ceil(totals.totalKw / 10) * 10}kW
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Load Breakdown (NEC 220 Requirements)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amps</TableHead>
                <TableHead className="text-right">kW</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadBreakdown.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.amps.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{item.kw.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 font-bold">
                <TableCell>Total</TableCell>
                <TableCell>All calculated loads</TableCell>
                <TableCell className="text-right">{totals.totalAmps.toFixed(1)}</TableCell>
                <TableCell className="text-right">{totals.totalKw.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveEstimate}
          disabled={loading || !user}
          size="lg"
        >
          {loading ? "Saving..." : "Save Estimate"}
        </Button>
      </div>
    </div>
  );
}