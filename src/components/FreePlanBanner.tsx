import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const STORAGE_KEY = "free_plan_banner_dismissed";

const FreePlanBanner = () => {
  const { subscription, user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (subscription.loading || subscription.subscribed) {
      setVisible(false);
      return;
    }

    const dismissedFromProfile = user?.user_metadata?.free_plan_banner_dismissed === "true";
    const dismissedFromStorage = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true";
    setVisible(!dismissedFromProfile && !dismissedFromStorage);
  }, [subscription.loading, subscription.subscribed, user]);

  const persistDismiss = async () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }

    if (!user) return;

    try {
      await supabase.auth.updateUser({ data: { free_plan_banner_dismissed: "true" } });
    } catch (error) {
      console.error("Unable to persist free plan banner dismissal:", error);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="mb-[var(--card-gap)] rounded-3xl border border-gold/20 bg-gold/10 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Free Plan</p>
            <p className="text-sm text-body-text max-w-2xl">
              Keep using the core engineering workspace at no cost. If you want to explore paid upgrades later,
              they are available without interrupting your current workflow.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="gold-outline" onClick={() => setModalOpen(true)}>
              Continue for Free
            </Button>
            <Button variant="outline" asChild>
              <Link to="/pricing">View plans</Link>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Continue on the Free Plan</DialogTitle>
            <DialogDescription>
              Your account remains active on the free plan. Core tools like calculations, scheduling, projects,
              reporting, and document workflows are still available.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-card-border bg-background p-4">
              <p className="text-sm font-semibold text-body-text">Included now</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Electrical load calculations</li>
                <li>Project files and scheduling</li>
                <li>Document signing and report exports</li>
                <li>AI-assisted drawing extraction</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-card-border bg-background p-4">
              <p className="text-sm font-semibold text-body-text">Paid upgrades</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Advanced premium analytics</li>
                <li>Higher usage limits</li>
                <li>Dedicated support</li>
                <li>Multi-user team tools</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="secondary" onClick={persistDismiss}>
              Continue for Free
            </Button>
            <Button variant="gold-outline" asChild>
              <Link to="/pricing">View paid plans</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FreePlanBanner;
