import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { format, parseISO, isWithinInterval, addDays, differenceInMinutes, startOfDay, endOfDay, isAfter } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import LicenseExpirationBanner from "@/components/LicenseExpirationBanner";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import FreePlanBanner from "@/components/FreePlanBanner";
import { ClipboardList } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTour } from "@/components/TourProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectSummary {
  id: string;
  project_name: string;
  status: string;
  due_date: string | null;
  estimated_value: number | null;
}

interface ScheduleSummary {
  id: string;
  client_name: string;
  project_address: string;
  job_type: string;
  assigned_to?: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

interface LoadCalculationSummary {
  id: string;
  project_id?: string;
  project_name?: string;
  calculator_type?: string;
  primary_result?: string;
  created_at: string;
}

const DashboardHome = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshSubscription } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    nextAppointment: null as ScheduleSummary | null,
    activeProjects: 0,
    atRiskProjects: 0,
    upcomingDeadlines: [] as ProjectSummary[],
    unbilledAmount: 0,
    loadCalculations: [] as LoadCalculationSummary[],
    pipeline: [] as { label: string; value: number }[],
    scheduleSummary: [] as { day: string; events: number }[],
    teamUtilization: [] as { name: string; hours: number; percent: number }[],
    recentActivity: [] as { title: string; client: string; when: string }[],
  });
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const { startTour } = useTour();

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Payment successful! Your subscription is now active.");
      if (user) {
        refreshSubscription();
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, refreshSubscription, setSearchParams, user]);

  useEffect(() => {
    const welcomeFlag = location.state?.onboardingWelcome || sessionStorage.getItem("onboardingWelcome");
    if (welcomeFlag) {
      setShowWelcomeBanner(true);
      sessionStorage.removeItem("onboardingWelcome");
    }

    const tourFlag = sessionStorage.getItem("onboardingQuickTour");
    if (tourFlag) {
      startTour();
      sessionStorage.removeItem("onboardingQuickTour");
    }
  }, [location.state, startTour]);

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      setLoading(true);
      const todayStart = startOfDay(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();

      const [schedulesRes, projectsRes, invoicesRes, calculationsRes] = await Promise.all([
        supabase
          .from("schedules")
          .select("id, client_name, project_address, job_type, assigned_to, start_time, end_time, notes")
          .order("start_time", { ascending: true }),
        supabase
          .from("projects")
          .select("id, project_name, status, due_date, estimated_value"),
        supabase
          .from("invoices")
          .select("id, total, status"),
        supabase
          .from("load_calculations")
          .select("id, project_id, project_name, calculator_type, primary_result, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const schedules = schedulesRes.data || [];
      const projects = projectsRes.data || [];
      const invoices = invoicesRes.data || [];
      const calculations = calculationsRes.data || [];

      const todayAppointments = schedules.filter((schedule) => {
        const start = parseISO(schedule.start_time);
        return isWithinInterval(start, { start: parseISO(todayStart), end: parseISO(todayEnd) });
      });

      const upcomingAppointments = schedules
        .filter((schedule) => isAfter(parseISO(schedule.start_time), new Date()))
        .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());

      const nextAppointment = upcomingAppointments[0] || null;

      const upcomingDeadlines = projects
        .filter((project) => project.due_date)
        .filter((project) => {
          const due = parseISO(project.due_date!);
          return isWithinInterval(due, { start: new Date(), end: addDays(new Date(), 7) });
        })
        .slice(0, 5) as ProjectSummary[];

      const atRiskProjects = projects.filter((project) => {
        if (!project.due_date) return false;
        const due = parseISO(project.due_date);
        const days = differenceInMinutes(due, new Date()) / 1440;
        return days >= 0 && days <= 14;
      }).length;

      const pipeline = [
        { label: "Inquiry", value: projects.filter((project) => project.status === "inquiry").length },
        { label: "Active", value: projects.filter((project) => project.status === "active").length },
        { label: "Under Review", value: projects.filter((project) => project.status === "under_review").length },
        { label: "Permit Submitted", value: projects.filter((project) => project.status === "permit_submitted").length },
        { label: "Construction Admin", value: projects.filter((project) => project.status === "construction_admin").length },
      ];

      const scheduleSummary = Array.from({ length: 7 }).map((_, idx) => {
        const day = addDays(startOfDay(new Date()), idx);
        const count = schedules.filter((schedule) =>
          isWithinInterval(parseISO(schedule.start_time), { start: day, end: endOfDay(day) })
        ).length;
        return { day: format(day, "EEE"), events: count };
      });

      const teamUtilization = Object.entries(
        schedules.reduce<Record<string, number>>((acc, schedule) => {
          if (!schedule.assigned_to) return acc;
          const start = parseISO(schedule.start_time);
          const end = parseISO(schedule.end_time);
          const hours = Math.max(0, differenceInMinutes(end, start) / 60);
          acc[schedule.assigned_to] = (acc[schedule.assigned_to] || 0) + hours;
          return acc;
        }, {})
      ).map(([name, hours]) => ({ name, hours, percent: Math.min(100, Math.round((hours / 40) * 100)) }));

      const recentActivity = upcomingAppointments.slice(0, 5).map((schedule) => ({
        title: schedule.job_type.replace(/_/g, " "),
        client: schedule.client_name,
        when: format(parseISO(schedule.start_time), "MMM d, h:mm a"),
      }));

      const unbilledAmount = invoices
        .filter((invoice) => invoice.status !== "paid")
        .reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0);

      setStats({
        todayAppointments: todayAppointments.length,
        nextAppointment,
        activeProjects: projects.length,
        atRiskProjects,
        upcomingDeadlines,
        unbilledAmount,
        loadCalculations: calculations,
        pipeline,
        scheduleSummary,
        teamUtilization,
        recentActivity,
      });
      setLoading(false);
    };

    loadDashboard();
  }, [user]);

  const greeting = user?.user_metadata?.full_name
    ? `Welcome back, ${user.user_metadata.full_name.split(" ")[0]}`
    : "Welcome back";

  const nextAppointmentLabel = useMemo(() => {
    if (!stats.nextAppointment) return "No upcoming appointments";
    return `${stats.nextAppointment.job_type.replace(/_/g, " ")} · ${format(parseISO(stats.nextAppointment.start_time), "h:mm a")}`;
  }, [stats.nextAppointment]);

  const briefingText = useMemo(() => {
    const bullets = [];
    bullets.push(`You have ${stats.todayAppointments} client meetings today — briefs attached.`);
    if (stats.upcomingDeadlines.length > 0) {
      const nextDeadline = stats.upcomingDeadlines[0];
      const days = Math.max(
        1,
        Math.round(differenceInMinutes(parseISO(nextDeadline.due_date || new Date().toISOString()), new Date()) / 1440)
      );
      bullets.push(`Project ${nextDeadline.project_name} has a permit deadline in ${days} days.`);
    } else {
      bullets.push("No permit deadlines in the next 7 days.");
    }
    bullets.push(`${stats.loadCalculations.length} load calculations ready to add to permit reports.`);
    bullets.push(
      stats.teamUtilization.length > 0
        ? `${stats.teamUtilization[0].name} is booked ${stats.teamUtilization[0].percent}% this week.`
        : "Team utilization will appear once schedules are added."
    );
    return bullets;
  }, [stats]);

  return (
    <DashboardLayout title={greeting}>
      {showWelcomeBanner && (
        <div className="mb-[var(--card-gap)] rounded-3xl border border-amber-400/20 bg-amber-500/10 px-6 py-4 text-amber-100 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Welcome aboard!</p>
              <p className="text-sm text-amber-100/80">Your workspace setup is complete and ready for use.</p>
            </div>
            <button type="button" className="text-amber-100 hover:text-white" onClick={() => setShowWelcomeBanner(false)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <LicenseExpirationBanner />
      <FreePlanBanner />
      <div className="mb-[var(--card-gap)]">
        <SubscriptionBadge />
      </div>

      <div className="grid gap-4 lg:grid-cols-4 mb-[var(--card-gap)]">
        <DashboardCard title="Today's Appointments">
          <div className="space-y-2">
            <p className="text-4xl font-semibold text-body-text">{loading ? "—" : stats.todayAppointments}</p>
            <p className="text-sm text-muted-foreground">Next: {loading ? "Loading…" : nextAppointmentLabel}</p>
          </div>
        </DashboardCard>

        <DashboardCard title="Active Projects">
          <div className="space-y-2">
            <p className="text-4xl font-semibold text-body-text">{loading ? "—" : stats.activeProjects}</p>
            <p className="text-sm text-muted-foreground">{stats.atRiskProjects} projects at risk</p>
          </div>
        </DashboardCard>

        <DashboardCard title="Unbilled Revenue">
          <div className="space-y-2">
            <p className="text-4xl font-semibold text-body-text">{loading ? "—" : `$${stats.unbilledAmount.toLocaleString()}`}</p>
            <p className="text-sm text-muted-foreground">Pending invoices and hours</p>
          </div>
        </DashboardCard>

        <DashboardCard title="Deadlines in 7 days">
          <div className="space-y-2">
            <p className="text-4xl font-semibold text-body-text">{loading ? "—" : stats.upcomingDeadlines.length}</p>
            <p className="text-sm text-muted-foreground">Projects due soon</p>
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr] mb-[var(--card-gap)]">
        <DashboardCard title="AI Daily Briefing">
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading briefing…</p>
            ) : (
              <ul className="space-y-3 text-sm text-body-text">
                {briefingText.map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Quick Actions">
          <div className="space-y-3">
            {[
              { label: "New Calculation", path: "/dashboard/calculator" },
              { label: "Schedule Client", path: "/dashboard/scheduling" },
              { label: "New Project", path: "/dashboard/projects" },
              { label: "Generate Report", path: "/dashboard/reports" },
            ].map((action) => (
              <Button key={action.path} variant="outline" className="w-full text-left" onClick={() => navigate(action.path)}>
                {action.label}
              </Button>
            ))}
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 mb-[var(--card-gap)]">
        <DashboardCard title="Load Calculator Summary">
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading calculations…</p>
            ) : stats.loadCalculations.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="w-8 h-8 text-steel" />}
                title="No calculations yet"
                description="Run a load calculation to capture engineering results and save them to your project files."
              />
            ) : (
              <div className="space-y-3">
                {stats.loadCalculations.map((calc) => (
                  <div key={calc.id} className="rounded-3xl border border-card-border bg-background p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{calc.calculator_type || "Load Calculation"}</p>
                        <p className="text-sm text-muted-foreground">{calc.project_name || "Unassigned project"}</p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-800">{format(parseISO(calc.created_at), "MMM d")}</Badge>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">Result: {calc.primary_result || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Project Pipeline">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading pipeline…</p>
          ) : (
            <div className="space-y-3">
              {stats.pipeline.map((item) => (
                <div key={item.label} className="rounded-3xl border border-card-border bg-background p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold text-body-text">{item.value}</p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-800">{item.value}</Badge>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3 mb-[var(--card-gap)]">
        <DashboardCard title="Upcoming Calendar">
          <div className="space-y-3">
            {stats.scheduleSummary.map((item) => (
              <div key={item.day} className="rounded-3xl border border-card-border bg-background px-4 py-3 flex items-center justify-between">
                <span className="font-medium">{item.day}</span>
                <span className="text-sm text-muted-foreground">{item.events} events</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Team Utilization">
          <div className="space-y-4">
            {stats.teamUtilization.length === 0 ? (
              <p className="text-sm text-muted-foreground">No team schedules assigned yet.</p>
            ) : (
              stats.teamUtilization.map((engineer) => (
                <div key={engineer.name}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>{engineer.name}</span>
                    <span>{engineer.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-section-alt overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${engineer.percent}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Client Activity">
          <div className="space-y-3">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity found.</p>
            ) : (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="rounded-3xl border border-card-border bg-background p-4">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.client}</p>
                  <p className="text-xs text-muted-foreground mt-2">{activity.when}</p>
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
