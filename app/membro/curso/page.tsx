"use client";
import { useEffect, useState } from "react";
import { useMemberAuth } from "@/components/membro/MemberAuthProvider";
import withMemberAuth from "@/components/membro/withMemberAuth";
import { supabase, Video, Progress } from "@/lib/supabase";

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function CursoContent() {
  const { member } = useMemberAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member) return;

    const planFilter = member.plan === "ambos"
      ? ["curso", "ambos"]
      : [member.plan, "ambos"];

    const hasCurso = member.plan === "curso" || member.plan === "ambos";
    if (!hasCurso) { setLoading(false); return; }

    const load = async () => {
      const { data: vids } = await supabase
        .from("videos")
        .select("*")
        .in("plan", planFilter)
        .order("ordem", { ascending: true });

      const { data: prog } = await supabase
        .from("progress")
        .select("*")
        .eq("member_id", member.id);

      const v = vids || [];
      setVideos(v);
      setProgress(prog || []);
      setActiveVideo(v[0] || null);
      setLoading(false);
    };
    load();
  }, [member]);

  const markDone = async (videoId: string) => {
    if (!member) return;
    const existing = progress.find((p) => p.video_id === videoId);
    if (existing) {
      await supabase
        .from("progress")
        .update({ concluido: true, assistido_em: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("progress").insert({
        member_id: member.id,
        video_id: videoId,
        concluido: true,
        assistido_em: new Date().toISOString(),
      });
    }
    setProgress((prev) => {
      const filtered = prev.filter((p) => p.video_id !== videoId);
      return [...filtered, {
        id: existing?.id || videoId,
        member_id: member.id,
        video_id: videoId,
        concluido: true,
        assistido_em: new Date().toISOString(),
      }];
    });
  };

  const isDone = (videoId: string) =>
    progress.some((p) => p.video_id === videoId && p.concluido);

  if (!member) return null;

  const hasCurso = member.plan === "curso" || member.plan === "ambos";
  if (!hasCurso) {
    return (
      <div style={{ padding: 40 }}>
        <div style={{
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 10,
          padding: 32,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 16, color: "#fff", marginBottom: 8 }}>
            Acesso ao curso não incluído no seu plano
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
            Faça upgrade para o Combo e acesse o curso completo
          </div>
          <a href="/#planos" style={{
            display: "inline-block",
            background: "#00f5ff",
            color: "#000",
            padding: "10px 24px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: 1,
          }}>
            VER PLANOS
          </a>
        </div>
      </div>
    );
  }

  // Group by module
  const modules: Record<string, Video[]> = {};
  videos.forEach((v) => {
    const mod = v.modulo || "Módulo 1";
    if (!modules[mod]) modules[mod] = [];
    modules[mod].push(v);
  });

  const concluded = videos.filter((v) => isDone(v.id)).length;
  const pct = videos.length > 0 ? Math.round((concluded / videos.length) * 100) : 0;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar with modules */}
      <div style={{
        width: 300,
        borderRight: "1px solid rgba(0,245,255,0.08)",
        overflowY: "auto",
        flexShrink: 0,
        background: "#060d14",
      }}>
        <div style={{ padding: "24px 20px 16px" }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: "rgba(0,245,255,0.5)",
            letterSpacing: 3,
            marginBottom: 8,
          }}>
            // CURSO
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
            {concluded}/{videos.length} aulas concluídas
          </div>
          {/* Progress bar */}
          <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
            <div style={{
              height: "100%",
              width: `${pct}%`,
              background: "#00f5ff",
              borderRadius: 2,
            }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 20, fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>
            CARREGANDO...
          </div>
        ) : videos.length === 0 ? (
          <div style={{ padding: 20, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            Nenhum vídeo cadastrado ainda.
          </div>
        ) : (
          Object.entries(modules).map(([modName, modVideos]) => (
            <div key={modName}>
              <div style={{
                padding: "12px 20px 6px",
                fontSize: 10,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: 2,
                textTransform: "uppercase" as const,
                fontFamily: "'Space Mono', monospace",
              }}>
                {modName}
              </div>
              {modVideos.map((v) => {
                const done = isDone(v.id);
                const active = activeVideo?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setActiveVideo(v)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 20px",
                      cursor: "pointer",
                      background: active ? "rgba(0,245,255,0.06)" : "transparent",
                      borderLeft: active ? "2px solid #00f5ff" : "2px solid transparent",
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: done ? "none" : "1px solid rgba(255,255,255,0.2)",
                      background: done ? "#22c55e" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 10,
                    }}>
                      {done && "✓"}
                    </div>
                    <span style={{
                      fontSize: 13,
                      color: active ? "#fff" : "rgba(255,255,255,0.5)",
                      lineHeight: 1.4,
                    }}>
                      {v.title}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Video player */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
        {activeVideo ? (
          <>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: "rgba(0,245,255,0.5)",
              letterSpacing: 3,
              marginBottom: 12,
            }}>
              {activeVideo.modulo || "MÓDULO 1"}
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 28,
              color: "#fff",
              letterSpacing: 2,
              marginBottom: 24,
            }}>
              {activeVideo.title}
            </h2>

            {/* YouTube embed */}
            <div style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: 10,
              border: "1px solid rgba(0,245,255,0.1)",
              marginBottom: 24,
              background: "#000",
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.youtube_url)}?rel=0&modestbranding=1`}
                title={activeVideo.title}
                style={{
                  position: "absolute",
                  top: 0, left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allowFullScreen
              />
            </div>

            {/* Mark done button */}
            {!isDone(activeVideo.id) ? (
              <button
                onClick={() => markDone(activeVideo.id)}
                style={{
                  background: "#22c55e",
                  color: "#000",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 24px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: 1,
                }}
              >
                ✓ MARCAR COMO CONCLUÍDA
              </button>
            ) : (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 6,
                padding: "10px 20px",
                fontSize: 12,
                color: "#22c55e",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: 1,
              }}>
                ✓ AULA CONCLUÍDA
              </div>
            )}

            {/* Next video */}
            {(() => {
              const idx = videos.findIndex((v) => v.id === activeVideo.id);
              const next = videos[idx + 1];
              if (!next) return null;
              return (
                <div style={{ marginTop: 32 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8, letterSpacing: 1 }}>
                    PRÓXIMA AULA
                  </div>
                  <div
                    onClick={() => setActiveVideo(next)}
                    style={{
                      background: "#060d14",
                      border: "1px solid rgba(0,245,255,0.1)",
                      borderRadius: 8,
                      padding: "14px 18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ color: "#00f5ff", fontSize: 18 }}>▶</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{next.title}</span>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            Selecione uma aula para começar.
          </div>
        )}
      </div>
    </div>
  );
}

export default withMemberAuth(CursoContent);
