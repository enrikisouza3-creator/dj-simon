"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase, Member } from "@/lib/supabase";

type AuthCtx = {
  member: Member | null;
  loading: boolean;
  authError: string | null;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ member: null, loading: true, authError: null, logout: async () => {} });

async function fetchMemberByAuthId(authId: string): Promise<Member | null> {
  const start = performance.now();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("auth_id", authId)
    .single();

  const duration = performance.now() - start;
  console.log(`[MemberAuth] fetchMemberByAuthId: ${duration.toFixed(0)}ms`);

  if (error) {
    // PGRST116 = nenhuma linha encontrada
    if (error.code === "PGRST116") {
      console.error(
        "[MemberAuth] ⚠️ Usuário autenticado no Supabase Auth mas NÃO encontrado em members.\n" +
        "auth_id:", authId, "\n" +
        "↳ Verifique se foi criado registro em members ao fazer login"
      );
    } else {
      console.error("[MemberAuth] Erro na query:", error.code, error.message);
    }
    return null;
  }

  if (data && !data.active) {
    console.warn("[MemberAuth] ⚠️ Membro inativo:", data.email);
  }

  if (data?.expires_at && new Date(data.expires_at) < new Date()) {
    console.warn("[MemberAuth] ⏰ Plano expirado:", data.expires_at);
  }

  return data ?? null;
}

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const startTime = performance.now();

    // ✅ FIX: Aumentar timeout de 8s para 20s (mais realista para rede lenta/Supabase lento)
    const TIMEOUT_MS = 20000;
    const safetyTimeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          const elapsed = (performance.now() - startTime).toFixed(0);
          console.error(
            `[MemberAuth] ⏱️ Timeout de ${TIMEOUT_MS}ms na verificação de sessão (${elapsed}ms decorridos)\n` +
            "↳ Causas possíveis: Rede lenta, Supabase lento, múltiplas abas\n" +
            "↳ Liberando a tela mesmo assim..."
          );
        }
        return false;
      });
    }, TIMEOUT_MS);

    const init = async () => {
      try {
        const sessionStart = performance.now();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log(`[MemberAuth] getSession: ${(performance.now() - sessionStart).toFixed(0)}ms`);

        if (sessionError) {
          console.error("[MemberAuth] Erro ao obter sessão:", sessionError.message);
          setAuthError("Erro ao verificar sessão. Tente novamente.");
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log("[MemberAuth] ✅ Sessão encontrada para:", session.user.email);
          const found = await fetchMemberByAuthId(session.user.id);
          
          if (!found) {
            await supabase.auth.signOut();
            setAuthError("Conta não encontrada. Entre em contato com o suporte.");
          } else if (!found.active) {
            await supabase.auth.signOut();
            setAuthError("Sua conta está inativa. Entre em contato com o suporte.");
          } else if (found.expires_at && new Date(found.expires_at) < new Date()) {
            await supabase.auth.signOut();
            setAuthError("Seu acesso expirou. Renove para continuar.");
          } else {
            console.log("[MemberAuth] ✅ Membro carregado:", found.name);
            setMember(found);
          }
        } else {
          console.log("[MemberAuth] ℹ️ Nenhuma sessão ativa");
        }
      } catch (e: any) {
        console.error("[MemberAuth] Erro inesperado:", e.message);
        setAuthError("Erro inesperado. Tente novamente.");
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
        console.log(`[MemberAuth] Init completo em: ${(performance.now() - startTime).toFixed(0)}ms`);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[MemberAuth] onAuthStateChange: ${event}`);

      if (event === "SIGNED_IN" && session?.user) {
        const found = await fetchMemberByAuthId(session.user.id);
        if (!found) {
          await supabase.auth.signOut();
          setAuthError("Conta não encontrada. Entre em contato com o suporte.");
          setMember(null);
        } else if (!found.active) {
          await supabase.auth.signOut();
          setAuthError("Sua conta está inativa.");
          setMember(null);
        } else if (found.expires_at && new Date(found.expires_at) < new Date()) {
          await supabase.auth.signOut();
          setAuthError("Seu acesso expirou.");
          setMember(null);
        } else {
          setAuthError(null);
          setMember(found);
        }
      } else if (event === "SIGNED_OUT") {
        setMember(null);
        router.push("/membro/login");
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return <Ctx.Provider value={{ member, loading, authError, logout }}>{children}</Ctx.Provider>;
}

export const useMemberAuth = () => useContext(Ctx);
