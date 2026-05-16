import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardHome from "./pages/DashboardHome";
import Estimator from "./pages/Estimator";
import LoadCalculator from "./pages/LoadCalculator";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Security from "./pages/Security";
import Scheduling from "./pages/Scheduling";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Documents from "./pages/Documents";
import Invoicing from "./pages/Invoicing";
import Proposals from "./pages/Proposals";
import CodeLibrary from "./pages/CodeLibrary";
import TeamWorkspace from "./pages/TeamWorkspace";
import Analytics from "./pages/Analytics";
import FreeEstimator from "./pages/FreeEstimator";
import Referrals from "./pages/Referrals";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import Downloads from "./pages/Downloads";
import EngineeringCopilot from "./pages/EngineeringCopilot";
import PEStampManager from "./pages/PEStampManager";
import ReportBuilder from "./pages/ReportBuilder";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import SignDocument from "./pages/SignDocument";
import AuthCallback from "./pages/AuthCallback";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import { TourProvider } from "@/components/TourProvider";
import { featureTourSteps } from "@/lib/featureTour";


const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const onboardingComplete = typeof window !== "undefined" && localStorage.getItem("onboardingComplete") === "true";

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-description">Loading…</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!onboardingComplete && location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  if (onboardingComplete && location.pathname === "/onboarding") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TourProvider steps={featureTourSteps}>
            <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/free-estimator" element={<FreeEstimator />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/sign" element={<SignDocument />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:slug" element={<TemplateDetail />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/security" element={<Security />} />

            {/* Dashboard (protected) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
            <Route path="/dashboard/estimator" element={<ProtectedRoute><Estimator /></ProtectedRoute>} />
            <Route path="/dashboard/calculator" element={<ProtectedRoute><LoadCalculator /></ProtectedRoute>} />
            <Route path="/dashboard/scheduling" element={<ProtectedRoute><Scheduling /></ProtectedRoute>} />
            <Route path="/dashboard/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/dashboard/clients/:clientId" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
            <Route path="/dashboard/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/dashboard/projects/:projectId" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/dashboard/invoicing" element={<ProtectedRoute><Invoicing /></ProtectedRoute>} />
            <Route path="/dashboard/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
            <Route path="/dashboard/codes" element={<ProtectedRoute><CodeLibrary /></ProtectedRoute>} />
            <Route path="/dashboard/team" element={<ProtectedRoute><TeamWorkspace /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/dashboard/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
            <Route path="/dashboard/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
            <Route path="/dashboard/copilot" element={<ProtectedRoute><EngineeringCopilot /></ProtectedRoute>} />
            <Route path="/dashboard/reports" element={<ProtectedRoute><ReportBuilder /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard/pe-stamps" element={<ProtectedRoute><PEStampManager /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </TourProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
