import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/estimator" element={<Estimator />} />
          <Route path="/dashboard/calculator" element={<LoadCalculator />} />
          <Route path="/dashboard/scheduling" element={<Scheduling />} />
          <Route path="/dashboard/projects" element={<Projects />} />
          <Route path="/dashboard/documents" element={<Documents />} />
          <Route path="/dashboard/invoicing" element={<Invoicing />} />
          <Route path="/dashboard/proposals" element={<Proposals />} />
          <Route path="/dashboard/codes" element={<CodeLibrary />} />
          <Route path="/dashboard/team" element={<TeamWorkspace />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
