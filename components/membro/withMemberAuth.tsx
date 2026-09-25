"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMemberAuth } from "./MemberAuthProvider";

export default function withMemberAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedPage(props: P) {
    const { member, loading } = useMemberAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !member) {
        router.push("/membro/login");
      }
    }, [loading, member, router]);

    if (loading) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Space Mono', monospace",
          color: "rgba(0,245,255,0.5)",
          fontSize: 12,
          letterSpacing: 3,
        }}>
          CARREGANDO...
        </div>
      );
    }

    if (!member) return null;

    return <Component {...props} />;
  };
}
