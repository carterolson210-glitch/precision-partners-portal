import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface CodeReference {
  id: string;
  category: string;
  title: string;
  code: string;
  synopsis: string;
  scope: string;
  applications: string[];
  tags: string[];
}

const categories = ["ACI", "AISC", "ASCE", "IBC", "OSHA", "ASTM"];

const codeReferences: CodeReference[] = [
  {
    id: "aci-318",
    category: "ACI",
    title: "Building Code Requirements for Structural Concrete",
    code: "ACI 318-22",
    synopsis: "Defines minimum requirements for the design and construction of reinforced concrete structures, including strength design, serviceability, and detailing.",
    scope: "Reinforced concrete design, material requirements, strength design, shear, development length, and serviceability provisions.",
    applications: ["Concrete beams", "Columns", "Slabs", "Shear walls"],
    tags: ["Concrete", "Reinforcement", "Serviceability", "Shear"],
  },
  {
    id: "aci-301",
    category: "ACI",
    title: "Specifications for Structural Concrete",
    code: "ACI 301-20",
    synopsis: "Specifies material, workmanship, quality control, and acceptance criteria for cast-in-place structural concrete.",
    scope: "Concrete production, batching, placement, finishing, curing, testing, and inspection.",
    applications: ["Specifications", "Quality control", "Concrete delivery", "Field testing"],
    tags: ["QA/QC", "Curing", "Testing", "Workmanship"],
  },
  {
    id: "aisc-360",
    category: "AISC",
    title: "Specification for Structural Steel Buildings",
    code: "AISC 360-22",
    synopsis: "Provides design requirements for structural steel buildings using both ASD and LRFD methods.",
    scope: "Steel member design, connections, stability, serviceability, and allowable stress criteria.",
    applications: ["Steel framing", "Connections", "Columns", "Beams"],
    tags: ["Steel", "LRFD", "ASD", "Connections"],
  },
  {
    id: "aisc-341",
    category: "AISC",
    title: "Seismic Provisions for Structural Steel Buildings",
    code: "AISC 341-16",
    synopsis: "Governs seismic design and detailing for steel buildings in regions subject to seismic forces.",
    scope: "Ductile behavior, connection details, seismic force-resisting systems, and qualification requirements.",
    applications: ["Seismic frames", "Moment connections", "Braced frames"],
    tags: ["Seismic", "Ductility", "Connections", "SDC"],
  },
  {
    id: "asce-7",
    category: "ASCE",
    title: "Minimum Design Loads and Associated Criteria",
    code: "ASCE 7-22",
    synopsis: "Establishes minimum load requirements for wind, seismic, snow, rain, and other environmental loads.",
    scope: "Load determination, load combinations, seismic criteria, wind pressures, and snow loads.",
    applications: ["Wind design", "Seismic analysis", "Snow load evaluation"],
    tags: ["Wind", "Seismic", "Snow", "Load Combinations"],
  },
  {
    id: "asce-24",
    category: "ASCE",
    title: "Flood Resistant Design and Construction",
    code: "ASCE 24-14",
    synopsis: "Provides criteria for flood-resistant design and construction in flood hazard areas.",
    scope: "Floodplain management, elevation requirements, foundation protection, and utilities in flood zones.",
    applications: ["Flood zones", "Coastal construction", "Resilient foundation design"],
    tags: ["Flood", "Resilience", "Elevation", "Utilities"],
  },
  {
    id: "ibc-2021",
    category: "IBC",
    title: "International Building Code",
    code: "IBC 2021",
    synopsis: "Comprehensive building code covering structural design, fire safety, means of egress, accessibility, and materials.",
    scope: "Occupancy classification, fire resistance, egress, structural requirements, and accessibility standards.",
    applications: ["Building permits", "Occupancy classification", "Fire safety planning"],
    tags: ["Egress", "Fire Safety", "Accessibility", "Structural"],
  },
  {
    id: "ibc-chap16",
    category: "IBC",
    title: "Structural Design Requirements",
    code: "IBC Chapter 16",
    synopsis: "Establishes general structural design criteria and references load standards such as ASCE 7.",
    scope: "Design forces, material-specific requirements, strength and stability provisions.",
    applications: ["Design documentation", "Code compliance", "Load pathways"],
    tags: ["Loads", "Stability", "Materials", "Design"],
  },
  {
    id: "osha-1926",
    category: "OSHA",
    title: "Safety and Health Regulations for Construction",
    code: "OSHA 1926",
    synopsis: "Sets safety requirements for construction sites including fall protection, scaffolding, and hazard communication.",
    scope: "Site safety, training, PPE, equipment safety, and hazard controls.",
    applications: ["Fall protection", "Scaffold safety", "Excavation", "Hazard communication"],
    tags: ["Safety", "Construction", "PPE", "Training"],
  },
  {
    id: "osha-1910",
    category: "OSHA",
    title: "Occupational Safety and Health Standards",
    code: "OSHA 1910",
    synopsis: "General industry safety standards covering machinery, electrical systems, hazardous materials, and ergonomics.",
    scope: "Machine guarding, electrical safety, fire prevention, and hazardous substance controls.",
    applications: ["General industry safety", "Electrical", "Hazardous materials"],
    tags: ["General Industry", "Machinery", "Electrical", "HazMat"],
  },
  {
    id: "astm-a615",
    category: "ASTM",
    title: "Deformed and Plain Carbon-Steel Bars for Concrete Reinforcement",
    code: "ASTM A615/A615M",
    synopsis: "Specifies requirements for carbon-steel bars used as reinforcement in concrete.",
    scope: "Material chemistry, mechanical properties, dimensions, and testing requirements.",
    applications: ["Rebar selection", "Concrete reinforcement", "Material procurement"],
    tags: ["Rebar", "Concrete", "Materials", "Testing"],
  },
  {
    id: "astm-a36",
    category: "ASTM",
    title: "Standard Specification for Carbon Structural Steel",
    code: "ASTM A36/A36M",
    synopsis: "Defines the chemical and mechanical properties for carbon structural steel shapes, plates, and bars.",
    scope: "Tensile strength, yield strength, deformation, and product delivery requirements.",
    applications: ["Structural steel", "Plates", "Welded connections"],
    tags: ["Steel", "Fabrication", "Material Properties", "Shapes"],
  },
];

const CodeLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredReferences = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return codeReferences.filter((reference) => {
      const matchesCategory = selectedCategory === "All" || reference.category === selectedCategory;
      const matchesSearch =
        !query ||
        reference.title.toLowerCase().includes(query) ||
        reference.code.toLowerCase().includes(query) ||
        reference.synopsis.toLowerCase().includes(query) ||
        reference.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        reference.scope.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <DashboardLayout title="Code Reference Library">
      <DashboardCard title="Engineering Codes & Standards">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
          <Input
            placeholder="Search by keyword, code number, or discipline..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("All")}
            >
              All Codes
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category} className="bg-background border border-card-border text-body-text">
              {category}
            </Badge>
          ))}
        </div>

        {filteredReferences.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-background p-10 text-center text-sm text-muted-foreground">
            No references found. Try a broader search or select a different code category.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {filteredReferences.map((reference) => (
              <Card key={reference.id} className="border-card-border bg-background">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        {reference.category}
                      </p>
                      <CardTitle>{reference.title}</CardTitle>
                    </div>
                    <Badge className="bg-slate-100 text-slate-800">{reference.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-body-text">{reference.synopsis}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Scope</p>
                      <p className="text-sm text-body-text">{reference.scope}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Applications</p>
                      <ul className="mt-2 space-y-1 text-sm text-body-text list-disc list-inside">
                        {reference.applications.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {reference.tags.map((tag) => (
                      <Badge key={tag} className="bg-background border border-card-border text-body-text">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DashboardCard>
    </DashboardLayout>
  );
};

export default CodeLibrary;
