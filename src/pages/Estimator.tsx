import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Download, Calculator } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";

interface MaterialLineItem {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

interface ProjectEstimate {
  id: string;
  project_name: string;
  client_name: string;
  location: string;
  project_type: string;
  labor_total: number;
  materials_total: number;
  overhead: number;
  profit: number;
  grand_total: number;
  line_items: MaterialLineItem[];
  created_at: string;
}

const projectTypes = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
];

const Estimator = () => {
  const { user } = useAuth();
  const [showEstimator, setShowEstimator] = useState(false);
  const [savedEstimates, setSavedEstimates] = useState<ProjectEstimate[]>([]);
  const [loading, setLoading] = useState(true);

  // Project Details
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [projectType, setProjectType] = useState("");

  // Labor Inputs
  const [numElectricians, setNumElectricians] = useState(1);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [numDays, setNumDays] = useState(10);
  const [hourlyRate, setHourlyRate] = useState(75);

  // Materials
  const [materials, setMaterials] = useState<MaterialLineItem[]>([
    { id: "1", description: "", quantity: 1, unitCost: 0, subtotal: 0 }
  ]);

  // Overhead & Profit
  const [overheadPercent, setOverheadPercent] = useState(15);
  const [profitPercent, setProfitPercent] = useState(20);

  // Calculations
  const laborTotal = useMemo(() => {
    return numElectricians * hoursPerDay * numDays * hourlyRate;
  }, [numElectricians, hoursPerDay, numDays, hourlyRate]);

  const materialsTotal = useMemo(() => {
    return materials.reduce((sum, item) => sum + item.subtotal, 0);
  }, [materials]);

  const overheadAmount = useMemo(() => {
    return (laborTotal + materialsTotal) * (overheadPercent / 100);
  }, [laborTotal, materialsTotal, overheadPercent]);

  const profitAmount = useMemo(() => {
    return (laborTotal + materialsTotal + overheadAmount) * (profitPercent / 100);
  }, [laborTotal, materialsTotal, overheadAmount, profitPercent]);

  const grandTotal = useMemo(() => {
    return laborTotal + materialsTotal + overheadAmount + profitAmount;
  }, [laborTotal, materialsTotal, overheadAmount, profitAmount]);

  useEffect(() => {
    if (user) {
      loadSavedEstimates();
    }
  }, [user]);

  const loadSavedEstimates = async () => {
    try {
      const { data, error } = await supabase
        .from("project_estimates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedEstimates(data || []);
    } catch (error) {
      console.error("Error loading estimates:", error);
      toast.error("Failed to load saved estimates");
    } finally {
      setLoading(false);
    }
  };

  const addMaterialItem = () => {
    const newItem: MaterialLineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitCost: 0,
      subtotal: 0,
    };
    setMaterials([...materials, newItem]);
  };

  const removeMaterialItem = (id: string) => {
    if (materials.length > 1) {
      setMaterials(materials.filter(item => item.id !== id));
    }
  };

  const updateMaterialItem = (id: string, field: keyof MaterialLineItem, value: string | number) => {
    setMaterials(materials.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitCost') {
          updated.subtotal = Number(updated.quantity) * Number(updated.unitCost);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSaveEstimate = async () => {
    if (!user) {
      toast.error("You must be logged in to save estimates");
      return;
    }

    if (!projectName.trim() || !clientName.trim()) {
      toast.error("Please enter project name and client name");
      return;
    }

    setLoading(true);
    try {
      const estimateData = {
        user_id: user.id,
        project_name: projectName,
        client_name: clientName,
        location: location || null,
        project_type: projectType,
        labor_total: laborTotal,
        materials_total: materialsTotal,
        overhead: overheadAmount,
        profit: profitAmount,
        grand_total: grandTotal,
        line_items: materials,
      };

      const { error } = await supabase.from("project_estimates").insert(estimateData);

      if (error) throw error;

      toast.success("Estimate saved successfully!");
      setShowEstimator(false);
      loadSavedEstimates();
      resetForm();
    } catch (error) {
      console.error("Error saving estimate:", error);
      toast.error("Failed to save estimate");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProjectName("");
    setClientName("");
    setLocation("");
    setProjectType("");
    setNumElectricians(1);
    setHoursPerDay(8);
    setNumDays(10);
    setHourlyRate(75);
    setMaterials([{ id: "1", description: "", quantity: 1, unitCost: 0, subtotal: 0 }]);
    setOverheadPercent(15);
    setProfitPercent(20);
  };

  const handleDownloadPDF = (estimate: ProjectEstimate) => {
    // Create a simple text report (in a real app, you'd use a PDF library)
    const report = `
Project Estimate Report
Generated: ${new Date().toLocaleString()}

Project Details:
- Project Name: ${estimate.project_name}
- Client: ${estimate.client_name}
- Location: ${estimate.location || 'Not specified'}
- Type: ${estimate.project_type}

Cost Breakdown:
- Labor Total: $${estimate.labor_total.toFixed(2)}
- Materials Total: $${estimate.materials_total.toFixed(2)}
- Overhead (${overheadPercent}%): $${estimate.overhead.toFixed(2)}
- Profit (${profitPercent}%): $${estimate.profit.toFixed(2)}
- Grand Total: $${estimate.grand_total.toFixed(2)}

Materials:
${estimate.line_items.map(item =>
  `- ${item.description}: ${item.quantity} x $${item.unitCost} = $${item.subtotal.toFixed(2)}`
).join('\n')}

Note: This is a preliminary estimate. Final costs may vary based on site conditions and material availability.
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-estimate-${estimate.project_name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Project Estimator">
      <DashboardCard title="Cost Estimation">
        {showEstimator ? (
          <div className="space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client name"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type</Label>
                    <Select value={projectType} onValueChange={setProjectType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Labor Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>Labor Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="numElectricians">Number of Electricians</Label>
                    <Input
                      id="numElectricians"
                      type="number"
                      min="1"
                      value={numElectricians}
                      onChange={(e) => setNumElectricians(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hoursPerDay">Hours per Day</Label>
                    <Input
                      id="hoursPerDay"
                      type="number"
                      min="1"
                      max="24"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numDays">Number of Days</Label>
                    <Input
                      id="numDays"
                      type="number"
                      min="1"
                      value={numDays}
                      onChange={(e) => setNumDays(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Labor Total</p>
                  <p className="text-2xl font-bold">${laborTotal.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Materials */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Materials</CardTitle>
                <Button onClick={addMaterialItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24">Quantity</TableHead>
                      <TableHead className="w-32">Unit Cost ($)</TableHead>
                      <TableHead className="w-32">Subtotal ($)</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => updateMaterialItem(item.id, 'description', e.target.value)}
                            placeholder="Enter description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateMaterialItem(item.id, 'quantity', Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => updateMaterialItem(item.id, 'unitCost', Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          ${item.subtotal.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMaterialItem(item.id)}
                            disabled={materials.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Materials Total</p>
                  <p className="text-2xl font-bold">${materialsTotal.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Overhead & Profit */}
            <Card>
              <CardHeader>
                <CardTitle>Overhead & Profit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="overheadPercent">Overhead (%)</Label>
                    <Input
                      id="overheadPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={overheadPercent}
                      onChange={(e) => setOverheadPercent(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profitPercent">Profit Margin (%)</Label>
                    <Input
                      id="profitPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={profitPercent}
                      onChange={(e) => setProfitPercent(Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Labor Total:</span>
                    <span>${laborTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Materials Total:</span>
                    <span>${materialsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overhead ({overheadPercent}%):</span>
                    <span>${overheadAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit ({profitPercent}%):</span>
                    <span>${profitAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Grand Total:</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setShowEstimator(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEstimate} disabled={loading}>
                {loading ? "Saving..." : "Save Estimate"}
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Calculator className="w-8 h-8 text-steel" />}
            title="Create Your First Estimate"
            description="Input real project parameters — type, location, materials, labor rates, equipment, and contingency — to generate an itemized cost breakdown exportable as a PDF proposal."
            actionLabel="New Estimate"
            onAction={() => setShowEstimator(true)}
          />
        )}
      </DashboardCard>

      <div className="mt-[var(--card-gap)]">
        <DashboardCard title="Saved Estimates">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-description">Loading estimates...</div>
            </div>
          ) : savedEstimates.length === 0 ? (
            <EmptyState
              icon={<Calculator className="w-8 h-8 text-steel" />}
              title="No saved estimates"
              description="Your completed estimates will appear here. Each estimate can be downloaded as a PDF or sent directly to a client."
            />
          ) : (
            <div className="space-y-4">
              {savedEstimates.map((estimate) => (
                <Card key={estimate.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{estimate.project_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {estimate.client_name} • {new Date(estimate.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(estimate)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Project Type</p>
                        <p className="text-lg font-semibold capitalize">{estimate.project_type}</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-lg font-semibold">${estimate.grand_total.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Materials</p>
                        <p className="text-lg font-semibold">{estimate.line_items.length} items</p>
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

export default Estimator;
