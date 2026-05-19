"use client";
import { useEffect, useState } from "react";
import { useMemberAuth } from "@/components/membro/MemberAuthProvider";
import withMemberAuth from "@/components/membro/withMemberAuth";
import { supabase, Plugin } from "@/lib/supabase";

async function logDownload(memberId: string, pluginId: string) {
  await supabase.from("plugin_downloads").insert({
    member_id: memberId,
    plugin_id: pluginId,
    downloaded_at: new Date().toISOString(),
  }).then(() => {});
}

function DownloadsContent() {
  const { member } = useMemberAuth();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member) return;

    const hasPack = member.plan === "pack" || member.plan === "ambos";
    if (!hasPack) { setLoading(false); return; }

    const planFilter = member.plan === "ambos"
      ? ["pack", "curso", "ambos"]
      : ["pack", "ambos"];

    supabase
      .from("plugins")
      .select("*")
      .in("plan", planFilter)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPlugins(data || []);
        setLoading(false);
      });
  }, [member]);

  if (!member) return null;

  const hasPack = member.plan === "pack" || member.plan === "ambos";

  if (!hasPack) {
    return (
      <div style={{ padding: 40 }}>
        <div style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 10,
          padding: 32,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 16, color: "#fff", marginBottom: 8 }}>
            Downloads não incluídos no seu plano
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
            Faça upgrade para o Pack ou Combo para acessar todos os arquivos
          </div>
          <a href="/#planos" style={{
            display: "inline-block",
            background: "#f59e0b",
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

  return (
    <div style={{ padding: "40px 40px", maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: "rgba(0,245,255,0.5)",
          letterSpacing: 4,
          marginBottom: 8,
        }}>
          // DOWNLOADS
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 36,
          color: "#fff",
          letterSpacing: 2,
          margin: 0,
        }}>
          Seus arquivos
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 6 }}>
          {plugins.length} arquivo{plugins.length !== 1 ? "s" : ""} disponível{plugins.length !== 1 ? "is" : ""}
        </p>
      </div>

      {loading ? (
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: 2,
        }}>
          CARREGANDO...
        </div>
      ) : plugins.length === 0 ? (
        <div style={{
          background: "#060d14",
          border: "1px solid rgba(0,245,255,0.08)",
          borderRadius: 10,
          padding: 32,
          textAlign: "center",
          color: "rgba(255,255,255,0.3)",
          fontSize: 14,
        }}>
          Nenhum arquivo disponível ainda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              style={{
                background: "#060d14",
                border: "1px solid rgba(0,245,255,0.08)",
                borderRadius: 10,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  background: "rgba(0,245,255,0.06)",
                  border: "1px solid rgba(0,245,255,0.15)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  ↓
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
                    {plugin.name}
                  </div>
                  {plugin.description && (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                      {plugin.description}
                    </div>
                  )}
                  {plugin.versao && (
                    <div style={{
                      display: "inline-block",
                      marginTop: 6,
                      background: "rgba(0,245,255,0.08)",
                      border: "1px solid rgba(0,245,255,0.15)",
                      borderRadius: 4,
                      padding: "1px 7px",
                      fontSize: 10,
                      color: "rgba(0,245,255,0.7)",
                      fontFamily: "'Space Mono', monospace",
                    }}>
                      v{plugin.versao}
                    </div>
                  )}
                </div>
              </div>

              <a
                href={plugin.file_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logDownload(member.id, plugin.id)}
                style={{
                  flexShrink: 0,
                  background: "#00f5ff",
                  color: "#000",
                  border: "none",
                  borderRadius: 6,
                  padding: "9px 20px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: 1,
                  textDecoration: "none",
                  whiteSpace: "nowrap" as const,
                }}
              >
                BAIXAR
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withMemberAuth(DownloadsContent);
