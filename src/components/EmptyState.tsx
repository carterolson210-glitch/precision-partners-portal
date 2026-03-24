import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 bg-section-alt rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-[20px] font-semibold text-body-text mb-2 font-body">{title}</h3>
      <p className="description-text text-[15px] max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-navy text-primary-foreground px-6 py-3 rounded-lg font-medium text-[15px] hover:bg-navy/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
