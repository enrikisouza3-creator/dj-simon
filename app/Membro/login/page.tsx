"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });

    if (authErr) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }

    router.push("/membro/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020408",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        padding: "0 24px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 36,
            color: "#00f5ff",
            letterSpacing: 6,
            textShadow: "0 0 20px rgba(0,245,255,0.5)",
          }}>DJ SIMON</div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: "rgba(0,245,255,0.5)",
            letterSpacing: 4,
            marginTop: 4,
          }}>ÁREA DO ALUNO</div>
        </div>

        {/* Card */}
        <div style={{
          background: "#060d14",
          border: "1px solid rgba(0,245,255,0.15)",
          borderRadius: 12,
          padding: 32,
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: "rgba(0,245,255,0.7)",
            letterSpacing: 3,
            marginBottom: 24,
          }}>// ENTRAR</div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" as const }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "rgba(0,245,255,0.04)",
                  border: "1px solid rgba(0,245,255,0.2)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" as const }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "rgba(0,245,255,0.04)",
                  border: "1px solid rgba(0,245,255,0.2)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 6,
                padding: "10px 14px",
                fontSize: 13,
                color: "#ef4444",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                background: loading ? "rgba(0,245,255,0.1)" : "#00f5ff",
                color: loading ? "#00f5ff" : "#000",
                border: "none",
                borderRadius: 6,
                padding: "12px 0",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Space Mono', monospace",
                transition: "all 0.2s",
              }}
            >
              {loading ? "ENTRANDO..." : "ACESSAR"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          Não tem acesso? <a href="/#planos" style={{ color: "rgba(0,245,255,0.6)", textDecoration: "none" }}>Adquira um plano</a>
        </p>
      </div>
    </div>
  );
}
