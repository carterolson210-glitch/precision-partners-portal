import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { DollarSign } from "lucide-react";

const Invoicing = () => {
  return (
    <DashboardLayout title="Invoicing & Payments">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--card-gap)] mb-[var(--card-gap)]">
        {[
          { label: "Outstanding Balance", empty: "$0.00" },
          { label: "Paid This Month", empty: "$0.00" },
          { label: "Overdue Invoices", empty: "0" },
        ].map((stat) => (
          <DashboardCard key={stat.label} title={stat.label}>
            <p className="text-[28px] font-bold text-body-text font-display mt-2">{stat.empty}</p>
            <p className="caption-text text-[13px] mt-1">Data appears as you create invoices</p>
          </DashboardCard>
        ))}
      </div>

      <DashboardCard title="Invoices">
        <EmptyState
          icon={<DollarSign className="w-8 h-8 text-steel" />}
          title="No invoices created"
          description="Create professional invoices with line items, quantities, rates, tax, and payment terms. Clients pay via Stripe through the invoice link. Automated reminders go out at due date and 7 days overdue."
          actionLabel="Create Invoice"
          onAction={() => {}}
        />
      </DashboardCard>
    </DashboardLayout>
  );
};

export default Invoicing;
