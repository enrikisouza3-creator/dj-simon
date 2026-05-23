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
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("auth_id", authId)
    .single();

  if (error) {
    // PGRST116 = nenhuma linha encontrada (auth_id não existe na tabela members)
    if (error.code === "PGRST116") {
      console.error(
        "[MemberAuth] Usuário autenticado no Supabase Auth mas NÃO encontrado na tabela 'members'.\n" +
        "auth_id buscado:", authId, "\n" +
        "Verifique se o campo auth_id foi salvo corretamente ao cadastrar o membro no AdminPanel."
      );
    } else {
      console.error("[MemberAuth] Erro ao buscar membro:", error.message, "| Código:", error.code);
    }
    return null;
  }

  if (data && !data.active) {
    console.warn("[MemberAuth] Membro encontrado mas está INATIVO:", data.email);
  }

  return data ?? null;
}

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[MemberAuth] Erro ao obter sessão:", sessionError.message);
          setAuthError("Erro ao verificar sessão. Tente novamente.");
          setLoading(false);
          return;
        }

        if (session?.user) {
          const found = await fetchMemberByAuthId(session.user.id);
          if (!found) {
            // Tem sessão no Auth mas não tem registro na tabela members
            // Desloga para não ficar em loop
            await supabase.auth.signOut();
            setAuthError(
              "Conta não encontrada na plataforma. Entre em contato com o suporte."
            );
          } else if (!found.active) {
            await supabase.auth.signOut();
            setAuthError("Sua conta está inativa. Entre em contato com o suporte.");
          } else {
            setMember(found);
          }
        }
      } catch (e: any) {
        console.error("[MemberAuth] Erro inesperado:", e);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const found = await fetchMemberByAuthId(session.user.id);
        if (!found) {
          await supabase.auth.signOut();
          setAuthError("Conta não encontrada na plataforma. Entre em contato com o suporte.");
          setMember(null);
        } else if (!found.active) {
          await supabase.auth.signOut();
          setAuthError("Sua conta está inativa. Entre em contato com o suporte.");
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

    return () => subscription.unsubscribe();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return <Ctx.Provider value={{ member, loading, authError, logout }}>{children}</Ctx.Provider>;
}

export const useMemberAuth = () => useContext(Ctx);
