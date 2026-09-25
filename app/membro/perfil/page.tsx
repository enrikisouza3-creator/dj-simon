"use client";
import { useState } from "react";
import { useMemberAuth } from "@/components/membro/MemberAuthProvider";
import withMemberAuth from "@/components/membro/withMemberAuth";
import { supabase } from "@/lib/supabase";

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
const PLAN_DESC: Record<string, string> = {
  pack: "Acesso ao pack de músicas e plugins",
  curso: "Acesso ao curso completo com todos os módulos",
  ambos: "Acesso completo: pack + curso",
};

function PerfilContent() {
  const { member } = useMemberAuth();
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!member) return null;

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      setPassMsg({ type: "err", text: "A senha precisa ter pelo menos 6 caracteres." });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: "err", text: "As senhas não coincidem." });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) {
      setPassMsg({ type: "err", text: "Erro ao atualizar senha. Tente novamente." });
    } else {
      setPassMsg({ type: "ok", text: "Senha atualizada com sucesso!" });
      setNewPass("");
      setConfirmPass("");
    }
    setSaving(false);
  };

  const planColor = PLAN_COLOR[member.plan] || "#00f5ff";
  const memberSince = new Date(member.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div style={{ padding: "40px 40px", maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: "rgba(0,245,255,0.5)",
          letterSpacing: 4,
          marginBottom: 8,
        }}>
          // PERFIL
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 36,
          color: "#fff",
          letterSpacing: 2,
          margin: 0,
        }}>
          Minha conta
        </h1>
      </div>

      {/* Avatar + info */}
      <div style={{
        background: "#060d14",
        border: "1px solid rgba(0,245,255,0.1)",
        borderRadius: 12,
        padding: "24px 28px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(0,245,255,0.1)",
          border: "1px solid rgba(0,245,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          color: "#00f5ff",
          fontFamily: "'Bebas Neue', cursive",
          letterSpacing: 1,
          flexShrink: 0,
        }}>
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            {member.name}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
            {member.email}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            Membro desde {memberSince}
          </div>
        </div>
      </div>

      {/* Plan */}
      <div style={{
        background: "#060d14",
        border: `1px solid ${planColor}30`,
        borderRadius: 12,
        padding: "20px 28px",
        marginBottom: 20,
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: 3,
          marginBottom: 12,
        }}>
          PLANO ATIVO
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{
            background: planColor + "22",
            color: planColor,
            border: `1px solid ${planColor}55`,
            borderRadius: 4,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: 2,
            textTransform: "uppercase" as const,
          }}>
            {PLAN_LABEL[member.plan] || member.plan}
          </span>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: member.active ? "#22c55e" : "#ef4444",
            display: "inline-block",
          }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {member.active ? "Ativo" : "Inativo"}
          </span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          {PLAN_DESC[member.plan] || ""}
        </div>
        <div style={{ marginTop: 16 }}>
          <a href="/#planos" style={{
            fontSize: 12,
            color: planColor,
            textDecoration: "none",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: 1,
          }}>
            FAZER UPGRADE →
          </a>
        </div>
      </div>

      {/* Change password */}
      <div style={{
        background: "#060d14",
        border: "1px solid rgba(0,245,255,0.08)",
        borderRadius: 12,
        padding: "24px 28px",
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: 3,
          marginBottom: 20,
        }}>
          ALTERAR SENHA
        </div>

        <form onSubmit={handleChangePass} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{
              display: "block",
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 6,
              letterSpacing: 1,
              textTransform: "uppercase" as const,
            }}>
              Nova senha
            </label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{
                width: "100%",
                background: "rgba(0,245,255,0.04)",
                border: "1px solid rgba(0,245,255,0.15)",
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
            <label style={{
              display: "block",
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 6,
              letterSpacing: 1,
              textTransform: "uppercase" as const,
            }}>
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(0,245,255,0.04)",
                border: "1px solid rgba(0,245,255,0.15)",
                borderRadius: 6,
                padding: "10px 14px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          {passMsg && (
            <div style={{
              background: passMsg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${passMsg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              borderRadius: 6,
              padding: "10px 14px",
              fontSize: 13,
              color: passMsg.type === "ok" ? "#22c55e" : "#ef4444",
            }}>
              {passMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              alignSelf: "flex-start",
              background: saving ? "rgba(0,245,255,0.1)" : "#00f5ff",
              color: saving ? "#00f5ff" : "#000",
              border: "none",
              borderRadius: 6,
              padding: "10px 24px",
              fontSize: 11,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: 1,
            }}
          >
            {saving ? "SALVANDO..." : "SALVAR SENHA"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default withMemberAuth(PerfilContent);
