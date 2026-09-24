import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#020408",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      textAlign: "center",
      padding: "0 24px",
    }}>
      <div>
        <div style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 120,
          color: "#00f5ff",
          lineHeight: 1,
          textShadow: "0 0 40px rgba(0,245,255,0.3)",
          opacity: 0.15,
        }}>404</div>
        <div style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 32,
          color: "#fff",
          letterSpacing: 6,
          marginTop: -20,
          marginBottom: 8,
        }}>PÁGINA NÃO ENCONTRADA</div>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: "rgba(0,245,255,0.5)",
          letterSpacing: 3,
          marginBottom: 40,
        }}>// essa rota não existe</div>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #00f5ff, transparent)", marginBottom: 40 }} />
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{
            background: "#00f5ff",
            color: "#000",
            padding: "12px 28px",
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            textDecoration: "none",
            borderRadius: 6,
          }}>
            PÁGINA INICIAL
          </Link>
          <Link href="/membro/login" style={{
            background: "rgba(0,245,255,0.08)",
            color: "#00f5ff",
            border: "1px solid rgba(0,245,255,0.3)",
            padding: "12px 28px",
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            textDecoration: "none",
            borderRadius: 6,
          }}>
            ÁREA DO ALUNO
          </Link>
        </div>
      </div>
    </div>
  );
}
