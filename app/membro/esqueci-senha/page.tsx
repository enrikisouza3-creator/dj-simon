"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/membro/nova-senha`,
    });
    if (err) {
      setError("Erro ao enviar email. Verifique o endereço e tente novamente.");
    } else {
      setEnviado(true);
    }
    setLoading(false);
  };

  const S = {
    wrap: { minHeight: "100vh", background: "#020408", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "0 24px" } as const,
    card: { width: "100%", maxWidth: 400, background: "#060d14", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 12, padding: 32 } as const,
    label: { display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" as const },
    input: { width: "100%", background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" as const },
    btn: (disabled: boolean) => ({ marginTop: 8, width: "100%", background: disabled ? "rgba(0,245,255,0.1)" : "#00f5ff", color: disabled ? "#00f5ff" : "#000", border: "none", borderRadius: 6, padding: "12px 0", fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'Space Mono', monospace" } as const),
  };

  return (
    <div style={S.wrap}>
      <div>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: "#00f5ff", letterSpacing: 6, textShadow: "0 0 20px rgba(0,245,255,0.5)" }}>DJ SIMON</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(0,245,255,0.5)", letterSpacing: 4, marginTop: 4 }}>ÁREA DO ALUNO</div>
        </div>

        <div style={S.card}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(0,245,255,0.7)", letterSpacing: 3, marginBottom: 16 }}>// RECUPERAR SENHA</div>

          {enviado ? (
            <div>
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 6, padding: "14px", fontSize: 13, color: "#4ade80", lineHeight: 1.6, marginBottom: 20 }}>
                ✓ Email enviado! Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </div>
              <a href="/membro/login" style={{ display: "block", textAlign: "center", color: "rgba(0,245,255,0.6)", fontSize: 12, textDecoration: "none" }}>
                ← Voltar para o login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
                Informe seu email cadastrado e enviaremos um link para redefinir sua senha.
              </p>
              <div>
                <label style={S.label}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={S.input} placeholder="seu@email.com" />
              </div>
              {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#ef4444" }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} style={S.btn(loading)}>
                {loading ? "ENVIANDO..." : "ENVIAR LINK"}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          <a href="/membro/login" style={{ color: "rgba(0,245,255,0.6)", textDecoration: "none" }}>← Voltar para o login</a>
        </p>
      </div>
    </div>
  );
}
