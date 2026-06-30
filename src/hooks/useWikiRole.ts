import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type WikiRoleState = {
  loading: boolean;
  session: Session | null;
  isTrusted: boolean;
  isAdmin: boolean;
};

export function useWikiRole(): WikiRoleState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isTrusted, setIsTrusted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    const checkRoles = async (uid: string | undefined) => {
      if (!uid) {
        if (active) {
          setIsTrusted(false);
          setIsAdmin(false);
        }
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      if (!active) return;
      const roles = (data ?? []).map((r: { role: string }) => r.role);
      setIsAdmin(roles.includes("admin"));
      setIsTrusted(roles.includes("trusted") || roles.includes("admin"));
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, next) => {
      setSession(next);
      setTimeout(() => checkRoles(next?.user?.id), 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      checkRoles(data.session?.user?.id).finally(() => {
        if (active) setLoading(false);
      });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, session, isTrusted, isAdmin };
}
