import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Calculator, Wrench, Calendar, ClipboardList,
  FolderOpen, DollarSign, FileText, BookOpen, Users, BarChart3,
  Menu, X, ChevronDown, LogOut, Settings, Bell, Gift, Download, Bot, Stamp,
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Project Estimator", icon: Calculator, path: "/dashboard/estimator" },
  { label: "Load Calculator", icon: Wrench, path: "/dashboard/calculator" },
  { label: "Scheduling", icon: Calendar, path: "/dashboard/scheduling" },
  { label: "Projects", icon: ClipboardList, path: "/dashboard/projects" },
  { label: "Documents", icon: FolderOpen, path: "/dashboard/documents" },
  { label: "Invoicing", icon: DollarSign, path: "/dashboard/invoicing" },
  { label: "Proposals", icon: FileText, path: "/dashboard/proposals" },
  { label: "Code Library", icon: BookOpen, path: "/dashboard/codes" },
  { label: "Team", icon: Users, path: "/dashboard/team" },
  { label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { label: "Referrals", icon: Gift, path: "/dashboard/referrals" },
  { label: "Downloads", icon: Download, path: "/dashboard/downloads" },
  { label: "Engineering Copilot", icon: Bot, path: "/dashboard/copilot" },
  { label: "PE Stamp & Seal", icon: Stamp, path: "/dashboard/pe-stamps" },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-section-alt">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 h-[var(--nav-height)] bg-background border-b border-card-border z-[1000] flex items-center">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-body-text" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-navy rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-[11px]">⚙</span>
              </div>
              <span className="font-display font-bold text-[16px] text-body-text hidden sm:inline">
                Your<span className="text-gold">Platform</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-section-alt rounded-lg transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5 text-caption" />
            </button>
            <button className="p-2 hover:bg-section-alt rounded-lg transition-colors" aria-label="Settings">
              <Settings className="w-5 h-5 text-caption" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center">
                <span className="text-navy text-[13px] font-semibold">{userInitial}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-caption hidden sm:block" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/50 z-[1001] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-[var(--nav-height)] left-0 bottom-0 w-[260px] bg-background border-r border-card-border z-[1002] overflow-y-auto transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="lg:hidden flex justify-end p-3">
          <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="w-5 h-5 text-caption" />
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                  isActive
                    ? "bg-navy/5 text-navy border-l-2 border-gold"
                    : "text-description hover:bg-section-alt hover:text-body-text"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-gold" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-card-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-[14px] text-caption hover:text-destructive transition-colors w-full">
            <LogOut className="w-[18px] h-[18px]" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[260px] pt-[calc(var(--nav-height)+16px)] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6 pb-16">
          <h1 className="text-[32px] font-bold text-body-text font-display mb-6">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
