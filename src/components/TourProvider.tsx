import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

export type TourPlacement = "top" | "bottom" | "left" | "right";

export interface TourStep {
  selector: string;
  title: string;
  description: string;
  path?: string;
  placement?: TourPlacement;
}

interface TourState {
  active: boolean;
  stepIndex: number;
  completed: boolean;
}

interface TourContextValue {
  active: boolean;
  stepIndex: number;
  completed: boolean;
  steps: TourStep[];
  currentStep: TourStep | null;
  startTour: (startIndex?: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  cancelTour: () => void;
  finishTour: () => void;
  restartTour: () => void;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

const STORAGE_KEY = (tourId: string) => `tour:${tourId}:state`;

const loadTourState = (tourId: string): TourState => {
  if (typeof window === "undefined") {
    return { active: false, stepIndex: 0, completed: false };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY(tourId));
    if (!raw) return { active: false, stepIndex: 0, completed: false };
    const parsed = JSON.parse(raw) as TourState;
    return {
      active: parsed.active ?? false,
      stepIndex: typeof parsed.stepIndex === "number" ? parsed.stepIndex : 0,
      completed: parsed.completed ?? false,
    };
  } catch {
    return { active: false, stepIndex: 0, completed: false };
  }
};

const saveTourState = (tourId: string, state: TourState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY(tourId), JSON.stringify(state));
};

interface TourProviderProps {
  steps: TourStep[];
  tourId?: string;
  children: React.ReactNode;
}

export const TourProvider = ({ steps, tourId = "feature-tour", children }: TourProviderProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = useMemo(() => steps[stepIndex] || null, [steps, stepIndex]);

  useEffect(() => {
    const stored = loadTourState(tourId);
    setActive(stored.active && !stored.completed);
    setStepIndex(stored.stepIndex);
    setCompleted(stored.completed);
  }, [tourId]);

  useEffect(() => {
    saveTourState(tourId, { active, stepIndex, completed });
  }, [tourId, active, stepIndex, completed]);

  useEffect(() => {
    if (!active || !currentStep?.path) return;
    if (location.pathname !== currentStep.path) {
      navigate(currentStep.path, { replace: false });
    }
  }, [active, currentStep, location.pathname, navigate]);

  const refreshTarget = useCallback(() => {
    if (!active || !currentStep) {
      setTargetRect(null);
      return;
    }
    const node = document.querySelector(currentStep.selector);
    if (node instanceof HTMLElement) {
      const rect = node.getBoundingClientRect();
      setTargetRect(rect);

      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight && rect.left >= 0 && rect.right <= window.innerWidth;
      if (!isVisible) {
        node.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    } else {
      setTargetRect(null);
    }
  }, [active, currentStep]);

  useEffect(() => {
    if (!active) return;
    refreshTarget();
    const interval = window.setInterval(refreshTarget, 250);
    window.addEventListener("resize", refreshTarget);
    window.addEventListener("scroll", refreshTarget, true);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("resize", refreshTarget);
      window.removeEventListener("scroll", refreshTarget, true);
    };
  }, [active, refreshTarget]);

  const completeTourOnServer = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.auth.updateUser({ data: { feature_tour_complete: "true" } });
    } catch (error) {
      console.error("Unable to persist tour completion on profile:", error);
    }
  }, [user]);

  const startTour = (startIndex = 0) => {
    setStepIndex(Math.max(0, Math.min(startIndex, steps.length - 1)));
    setCompleted(false);
    setActive(true);
  };

  const nextStep = () => {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const prevStep = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const cancelTour = () => {
    setActive(false);
  };

  const finishTour = async () => {
    setCompleted(true);
    setActive(false);
    await completeTourOnServer();
  };

  const restartTour = () => {
    setCompleted(false);
    setStepIndex(0);
    setActive(true);
  };

  const tooltipStyles = useMemo(() => {
    if (!targetRect || !currentStep) {
      return {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: 380,
        zIndex: 2100,
        width: isMobile ? "calc(100% - 48px)" : "380px",
      } as const;
    }

    const offset = 18;
    let top = 0;
    let left = 0;
    let transform = "translate(-50%, 0)";
    const isMobile = window.innerWidth < 640;
    const tooltipWidth = isMobile ? window.innerWidth - 48 : 380;

    if (isMobile) {
      top = window.scrollY + window.innerHeight - 180;
      left = window.scrollX + window.innerWidth / 2;
      transform = "translate(-50%, 0)";
    } else {
      switch (currentStep.placement) {
        case "top":
          top = targetRect.top + window.scrollY - offset;
          left = targetRect.left + window.scrollX + targetRect.width / 2;
          transform = "translate(-50%, -100%)";
          break;
        case "left":
          top = targetRect.top + window.scrollY + targetRect.height / 2;
          left = targetRect.left + window.scrollX - offset;
          transform = "translate(-100%, -50%)";
          break;
        case "right":
          top = targetRect.top + window.scrollY + targetRect.height / 2;
          left = targetRect.right + window.scrollX + offset;
          transform = "translate(0, -50%)";
          break;
        case "bottom":
        default:
          top = targetRect.bottom + window.scrollY + offset;
          left = targetRect.left + window.scrollX + targetRect.width / 2;
          transform = "translate(-50%, 0)";
          break;
      }
    }

    if (!isMobile) {
      if (currentStep.placement === "left") {
        const minLeft = tooltipWidth + 24;
        const maxLeft = window.innerWidth - 24;
        left = Math.min(Math.max(left, minLeft), maxLeft);
      } else if (currentStep.placement === "right") {
        const minLeft = 24;
        const maxLeft = window.innerWidth - tooltipWidth - 24;
        left = Math.min(Math.max(left, minLeft), maxLeft);
      } else {
        const minLeft = tooltipWidth / 2 + 24;
        const maxLeft = window.innerWidth - tooltipWidth / 2 - 24;
        left = Math.min(Math.max(left, minLeft), maxLeft);
      }
    }

    const maxTop = window.innerHeight + window.scrollY - 24;
    top = Math.min(Math.max(top, 24), maxTop);

    return {
      position: "absolute",
      top: `${top}px`,
      left: `${left}px`,
      transform,
      maxWidth: tooltipWidth,
      zIndex: 2100,
      width: isMobile ? "calc(100% - 48px)" : `${tooltipWidth}px`,
    } as const;
  }, [currentStep, targetRect]);

  const highlightStyles = useMemo(() => {
    if (!targetRect) return undefined;
    return {
      position: "absolute",
      top: `${targetRect.top + window.scrollY - 12}px`,
      left: `${targetRect.left + window.scrollX - 12}px`,
      width: `${targetRect.width + 24}px`,
      height: `${targetRect.height + 24}px`,
      borderRadius: "18px",
      boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.45)",
      pointerEvents: "none",
      zIndex: 2050,
    } as const;
  }, [targetRect]);

  const contextValue = useMemo(
    () => ({
      active,
      stepIndex,
      completed,
      steps,
      currentStep,
      startTour,
      nextStep,
      prevStep,
      cancelTour,
      finishTour,
      restartTour,
    }),
    [active, stepIndex, completed, steps, currentStep],
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <>
          {active && (
            <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm">
              <div className="absolute inset-0 pointer-events-none" />
              {highlightStyles && <div style={highlightStyles} />}
              <div className="pointer-events-none absolute inset-0" />
            </div>
          )}

          {active && (
            <div className="fixed inset-0 z-[2100] p-4 sm:p-6">
              <div style={tooltipStyles} className="pointer-events-auto w-full max-w-[380px]">
                <div className="rounded-[28px] border border-slate-700 bg-slate-950/95 p-5 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Step {stepIndex + 1} of {steps.length}</p>
                      <h2 className="mt-2 text-lg font-semibold">{currentStep?.title}</h2>
                    </div>
                    <button type="button" className="text-slate-400 hover:text-white" onClick={cancelTour} aria-label="Close tour">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{currentStep?.description}</p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button variant="outline" size="sm" onClick={prevStep} disabled={stepIndex === 0}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    {stepIndex < steps.length - 1 ? (
                      <Button size="sm" onClick={nextStep}>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" onClick={finishTour}>Finish Tour</Button>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-slate-400 text-xs">
                    <span>Follow the highlighted feature to continue.</span>
                    <button type="button" className="underline" onClick={cancelTour}>Skip Tour</button>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {steps.map((_, index) => (
                      <span key={index} className={`h-2 w-2 rounded-full ${index === stepIndex ? "bg-primary" : "bg-white/20"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body,
      )}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
