import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
import Scheduling from "./pages/Scheduling";
import Projects from "./pages/Projects";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-description">Loading…</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/free-estimator" element={<FreeEstimator />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:slug" element={<TemplateDetail />} />

            {/* Dashboard (protected) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
            <Route path="/dashboard/estimator" element={<ProtectedRoute><Estimator /></ProtectedRoute>} />
            <Route path="/dashboard/calculator" element={<ProtectedRoute><LoadCalculator /></ProtectedRoute>} />
            <Route path="/dashboard/scheduling" element={<ProtectedRoute><Scheduling /></ProtectedRoute>} />
            <Route path="/dashboard/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/dashboard/invoicing" element={<ProtectedRoute><Invoicing /></ProtectedRoute>} />
            <Route path="/dashboard/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
            <Route path="/dashboard/codes" element={<ProtectedRoute><CodeLibrary /></ProtectedRoute>} />
            <Route path="/dashboard/team" element={<ProtectedRoute><TeamWorkspace /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/dashboard/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
            <Route path="/dashboard/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
