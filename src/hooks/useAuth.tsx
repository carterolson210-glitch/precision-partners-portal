import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTierByProductId, getTierLevel, type TierKey } from "@/config/subscriptions";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  subscription: {
    subscribed: boolean;
    tierKey: TierKey | null;
    tierLevel: number;
    subscriptionEnd: string | null;
    status: string | null;
    trialEnd: string | null;
    loading: boolean;
  };
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  subscription: {
    subscribed: false,
    tierKey: null,
    tierLevel: 0,
    subscriptionEnd: null,
    status: null,
    trialEnd: null,
    loading: true,
  },
  refreshSubscription: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subState, setSubState] = useState({
    subscribed: false,
    tierKey: null as TierKey | null,
    tierLevel: 0,
    subscriptionEnd: null as string | null,
    status: null as string | null,
    trialEnd: null as string | null,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("Subscription check error:", error);
        setSubState((s) => ({ ...s, loading: false }));
        return;
      }
      const tierKey = data.product_id ? getTierByProductId(data.product_id) : null;
      setSubState({
        subscribed: data.subscribed ?? false,
        tierKey,
        tierLevel: getTierLevel(tierKey),
        subscriptionEnd: data.subscription_end ?? null,
        status: data.status ?? null,
        trialEnd: data.trial_end ?? null,
        loading: false,
      });
    } catch {
      setSubState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check subscription when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
      // Re-check every 60 seconds
      const interval = setInterval(checkSubscription, 60000);
      return () => clearInterval(interval);
    } else {
      setSubState({
        subscribed: false,
        tierKey: null,
        tierLevel: 0,
        subscriptionEnd: null,
        status: null,
        trialEnd: null,
        loading: false,
      });
    }
  }, [user, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear remembered credentials on logout
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("rememberedPassword");
    localStorage.removeItem("rememberMe");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
        subscription: subState,
        refreshSubscription: checkSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
