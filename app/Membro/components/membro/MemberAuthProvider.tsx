"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase, Member } from "@/lib/supabase";

type AuthCtx = {
  member: Member | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ member: null, loading: true, logout: async () => {} });

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("members")
          .select("*")
          .eq("auth_id", session.user.id)
          .single();
        setMember(data || null);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data } = await supabase
          .from("members")
          .select("*")
          .eq("auth_id", session.user.id)
          .single();
        setMember(data || null);
      } else if (event === "SIGNED_OUT") {
        setMember(null);
        router.push("/membro/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return <Ctx.Provider value={{ member, loading, logout }}>{children}</Ctx.Provider>;
}

export const useMemberAuth = () => useContext(Ctx);
