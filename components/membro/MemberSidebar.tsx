"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemberAuth } from "./MemberAuthProvider";

const NAV = [
  { href: "/membro/dashboard", icon: "⚡", label: "Dashboard" },
  { href: "/membro/curso",     icon: "▶", label: "Curso" },
  { href: "/membro/downloads", icon: "↓", label: "Downloads" },
  { href: "/membro/perfil",    icon: "◎", label: "Perfil" },
];

const PLAN_LABEL: Record<string, string> = {
  pack: "Pack",
  curso: "Curso",
  ambos: "Pack + Curso",
};
const PLAN_COLOR: Record<string, string> = {
  pack: "#f59e0b",
  curso: "#3b82f6",
  ambos: "#8b5cf6",
};

export default function MemberSidebar() {
  const pathname = usePathname();
  const { member, logout } = useMemberAuth();

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "#060d14",
      borderRight: "1px solid rgba(0,245,255,0.1)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(0,245,255,0.08)" }}>
        <Link href="/membro/dashboard" style={{ textDecoration: "none" }}>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 22,
            color: "#00f5ff",
            letterSpacing: 3,
          }}>DJ SIMON</div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            color: "rgba(0,245,255,0.5)",
            letterSpacing: 2,
          }}>ÁREA DO ALUNO</div>
        </Link>
      </div>

      {/* Member info */}
      {member && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,245,255,0.08)" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
            logado como
          </div>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, marginBottom: 6 }}>
            {member.name}
          </div>
          <span style={{
            background: (PLAN_COLOR[member.plan] || "#fff") + "22",
            color: PLAN_COLOR[member.plan] || "#fff",
            border: `1px solid ${PLAN_COLOR[member.plan] || "#fff"}55`,
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 10,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: 1,
            textTransform: "uppercase" as const,
          }}>
            {PLAN_LABEL[member.plan] || member.plan}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 0" }}>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 20px",
                color: active ? "#00f5ff" : "rgba(255,255,255,0.5)",
                background: active ? "rgba(0,245,255,0.06)" : "transparent",
                borderLeft: active ? "2px solid #00f5ff" : "2px solid transparent",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "0 20px" }}>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "8px 0",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6,
            color: "rgba(255,255,255,0.4)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: 1,
          }}
        >
          SAIR
        </button>
      </div>
    </aside>
  );
}
