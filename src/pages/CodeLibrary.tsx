import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { BookOpen } from "lucide-react";

const CodeLibrary = () => {
  return (
    <DashboardLayout title="Code Reference Library">
      <DashboardCard title="Engineering Codes & Standards">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by keyword, code number, or discipline..."
            className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-body-text text-[16px] focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {["ACI", "AISC", "ASCE", "IBC", "OSHA", "ASTM"].map((code) => (
            <button
              key={code}
              className="px-4 py-2 rounded-full text-[13px] font-medium bg-section-alt text-body-text border border-card-border hover:border-navy transition-colors"
            >
              {code}
            </button>
          ))}
        </div>

        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-steel" />}
          title="Code Library Coming Soon"
          description="This library will contain verified references to major engineering codes and standards including ACI, AISC, ASCE 7, IBC, OSHA, and ASTM. Each entry will include the official code reference, a plain English summary, and applicable use cases."
        />
      </DashboardCard>
    </DashboardLayout>
  );
};

export default CodeLibrary;
