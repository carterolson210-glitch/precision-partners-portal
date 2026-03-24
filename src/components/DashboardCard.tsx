interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard = ({ title, children, className = "" }: DashboardCardProps) => {
  return (
    <div className={`bg-card border border-card-border rounded-xl p-[var(--card-padding)] min-h-[120px] ${className}`}>
      <h2 className="dashboard-heading mb-[var(--card-title-gap)]">{title}</h2>
      {children}
    </div>
  );
};

export default DashboardCard;
