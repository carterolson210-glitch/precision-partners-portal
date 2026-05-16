import type { TourStep } from "@/components/TourProvider";

export const featureTourSteps: TourStep[] = [
  {
    selector: "#tour-top-nav",
    title: "Top navigation bar",
    description: "This is your main nav. Access calculators, scheduling, projects, and settings from here.",
    placement: "bottom",
  },
  {
    selector: "#tour-load-calculator-link",
    title: "Load Calculator tab",
    description: "Run structural load calculations in real time. Results update as you type.",
    path: "/dashboard/calculator",
    placement: "right",
  },
  {
    selector: "#tour-formula-panel",
    title: "Formula Display panel",
    description: "See exactly which engineering formula is being applied — no black boxes.",
    path: "/dashboard/calculator",
    placement: "bottom",
  },
  {
    selector: "#tour-save-result-button",
    title: "Save Result button",
    description: "Save any calculation to a project for future reference or export.",
    path: "/dashboard/calculator",
    placement: "left",
  },
  {
    selector: "#tour-scheduling-link",
    title: "Scheduling icon",
    description: "Manage client appointments and project deadlines in one calendar.",
    path: "/dashboard/scheduling",
    placement: "right",
  },
  {
    selector: "#tour-self-booking",
    title: "Client self-booking",
    description: "Share a booking link so clients can schedule time directly on your calendar.",
    path: "/dashboard/scheduling",
    placement: "bottom",
  },
  {
    selector: "#tour-projects-link",
    title: "Projects hub",
    description: "Link calculations, documents, and meetings to each project and client.",
    path: "/dashboard/projects",
    placement: "right",
  },
  {
    selector: "#tour-settings-link",
    title: "Settings gear",
    description: "Configure units, defaults, team access, and integrations.",
    path: "/dashboard/settings",
    placement: "left",
  },
];
