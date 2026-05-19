"use client";
import { useEffect, useState } from "react";
import { useMemberAuth } from "@/components/membro/MemberAuthProvider";
import withMemberAuth from "@/components/membro/withMemberAuth";
import { supabase, Video, Progress } from "@/lib/supabase";
import Link from "next/link";

const PLAN_LABEL: Record<string, string> = {
  pack: "Pack",
  curso: "Curso",
  ambos: "Pack + Curso",
};

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div style={{
      background: "#060d14",
      border: "1px solid rgba(0,245,255,0.1)",
      borderRadius: 10,
      padding: "20px 24px",
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "'Space Mono', monospace" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: 1 }}>
        {label}
      </div>
    </div>
  );
}

function DashboardContent() {
  const { member } = useMemberAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member) return;
    const load = async () => {
      const planFilter = member.plan === "ambos"
        ? ["curso", "ambos"]
        : [member.plan, "ambos"];

      const { data: vids } = await supabase
        .from("videos")
        .select("*")
        .in("plan", planFilter)
        .order("ordem", { ascending: true });

      const { data: prog } = await supabase
        .from("progress")
        .select("*")
        .eq("member_id", member.id);

      setVideos(vids || []);
      setProgress(prog || []);
      setLoading(false);
    };
    load();
  }, [member]);

  if (!member) return null;

  const hasCurso = member.plan === "curso" || member.plan === "ambos";
  const hasPack = member.plan === "pack" || member.plan === "ambos";
  const concluded = progress.filter((p) => p.concluido).length;
  const totalVideos = videos.length;
  const pct = totalVideos > 0 ? Math.round((concluded / totalVideos) * 100) : 0;

  // Last watched
  const lastProg = [...progress].sort(
    (a, b) => new Date(b.assistido_em).getTime() - new Date(a.assistido_em).getTime()
  )[0];
  const lastVideo = lastProg ? videos.find((v) => v.id === lastProg.video_id) : null;

  return (
    <div style={{ padding: "40px 40px", maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: "rgba(0,245,255,0.5)",
          letterSpacing: 4,
          marginBottom: 8,
        }}>
          // DASHBOARD
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 40,
          color: "#fff",
          letterSpacing: 2,
          margin: 0,
        }}>
          Olá, {member.name.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 6 }}>
          Plano ativo:{" "}
          <span style={{ color: "#00f5ff" }}>{PLAN_LABEL[member.plan]}</span>
        </p>
      </div>

      {/* Stats */}
      {hasCurso && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}>
          <StatCard value={`${pct}%`} label="Progresso geral" color="#00f5ff" />
          <StatCard value={concluded} label="Aulas concluídas" color="#22c55e" />
          <StatCard value={totalVideos - concluded} label="Aulas restantes" color="#f59e0b" />
          <StatCard value={totalVideos} label="Total de aulas" color="rgba(255,255,255,0.5)" />
        </div>
      )}

      {/* Progress bar */}
      {hasCurso && totalVideos > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>
              PROGRESSO DO CURSO
            </span>
            <span style={{ fontSize: 12, color: "#00f5ff", fontFamily: "'Space Mono', monospace" }}>
              {pct}%
            </span>
          </div>
          <div style={{
            height: 4,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${pct}%`,
              background: "linear-gradient(90deg, #00f5ff, #0ea5e9)",
              borderRadius: 2,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      )}

      {/* Quick access */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: 3,
          marginBottom: 16,
        }}>
          ACESSO RÁPIDO
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}>
          {hasCurso && (
            <Link href="/membro/curso" style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(0,245,255,0.04)",
                border: "1px solid rgba(0,245,255,0.15)",
                borderRadius: 10,
                padding: "20px 22px",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>▶</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
                  {lastVideo ? "Continuar curso" : "Começar curso"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  {lastVideo ? lastVideo.title : "Acesse os módulos"}
                </div>
              </div>
            </Link>
          )}

          {hasPack && (
            <Link href="/membro/downloads" style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(245,158,11,0.04)",
                border: "1px solid rgba(245,158,11,0.15)",
                borderRadius: 10,
                padding: "20px 22px",
                cursor: "pointer",
              }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>↓</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
                  Baixar plugins
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  Pack e arquivos disponíveis
                </div>
              </div>
            </Link>
          )}

          <Link href="/membro/perfil" style={{ textDecoration: "none" }}>
            <div style={{
              background: "rgba(139,92,246,0.04)",
              border: "1px solid rgba(139,92,246,0.15)",
              borderRadius: 10,
              padding: "20px 22px",
              cursor: "pointer",
            }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>◎</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
                Meu perfil
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                Dados e plano ativo
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default withMemberAuth(DashboardContent);
