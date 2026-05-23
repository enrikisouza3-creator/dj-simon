"use client";
import { useState, useEffect, useRef } from "react";
import { buildPixPayload, aplicarCupom, MP_LINKS, PLANOS, PlanoKey } from "@/lib/pagamento";
import { supabase } from "@/lib/supabase";

interface Props {
  plano: PlanoKey;
  onClose: () => void;
}

async function registrarVenda(plano: PlanoKey, valor: number, metodo: string) {
  try {
    const afiliadoSlug = typeof window !== "undefined" ? localStorage.getItem("ref_afiliado") : null;
    const comissao = afiliadoSlug ? parseFloat((valor * 0.05).toFixed(2)) : null;
    await supabase.from("vendas").insert({
      plano,
      valor,
      metodo,
      status: "pendente",
      afiliado_slug: afiliadoSlug ?? undefined,
      comissao: comissao ?? undefined,
    });
  } catch (e) {
    // Silencioso — não bloqueia o fluxo de pagamento
    console.warn("[Vendas] Não foi possível registrar a venda:", e);
  }
}

export default function PagamentoModal({ plano, onClose }: Props) {
  const info = PLANOS[plano];
  const [metodo, setMetodo] = useState<"pix" | "mp">("pix");
  const [cupom, setCupom] = useState("");
  const [cupomMsg, setCupomMsg] = useState<{ ok: boolean; txt: string } | null>(null);
  const [desconto, setDesconto] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const [timer, setTimer] = useState(30 * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pixPayload = buildPixPayload(info.preco - desconto);
  const total = info.preco - desconto;

  // Timer PIX + registra venda quando abre o PIX
  useEffect(() => {
    if (metodo !== "pix") return;
    setTimer(30 * 60);
    registrarVenda(plano, total, "pix");
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [metodo, desconto]);

  const timerFmt = `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`;
  const expirado = timer === 0;

  const handleCupom = () => {
    const res = aplicarCupom(cupom, info.preco);
    if (!res.valido) {
      setCupomMsg({ ok: false, txt: "❌ Cupom inválido ou expirado." });
      setDesconto(0);
    } else {
      setCupomMsg({ ok: true, txt: `✅ ${res.label} aplicado!` });
      setDesconto(res.desconto);
    }
  };

  const copiar = () => {
    if (expirado) return;
    navigator.clipboard?.writeText(pixPayload).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = pixPayload;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(pixPayload)}&size=220&margin=2&ecLevel=M`;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div style={{
        background: "#060d14",
        border: "1px solid rgba(0,245,255,0.2)",
        borderRadius: 16,
        width: "100%", maxWidth: 480,
        maxHeight: "90vh", overflowY: "auto",
        padding: 32,
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 0 60px rgba(0,245,255,0.1)",
      }}>
        {/* Barra de urgência no topo do modal */}
        <div style={{
          margin: "-32px -32px 20px -32px",
          background: "linear-gradient(90deg, #dc2626, #b91c1c)",
          padding: "8px 16px",
          borderRadius: "16px 16px 0 0",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1 }}>
            OFERTA POR TEMPO LIMITADO — GARANTA AGORA
          </span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(0,245,255,0.6)", letterSpacing: 3, marginBottom: 4 }}>
              // FINALIZAR COMPRA
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: "#fff", letterSpacing: 3 }}>
              {info.label.toUpperCase()}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer", padding: 4 }}>✕</button>
        </div>

        {/* Preço */}
        <div style={{ textAlign: "center", marginBottom: 24, padding: "16px", background: "rgba(0,245,255,0.05)", borderRadius: 8, border: "1px solid rgba(0,245,255,0.1)" }}>
          {desconto > 0 && (
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textDecoration: "line-through", marginBottom: 2 }}>
              R$ {info.preco.toFixed(2).replace(".", ",")}
            </div>
          )}
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 48, color: "#00f5ff", letterSpacing: 4, textShadow: "0 0 20px rgba(0,245,255,0.4)" }}>
            R$ {total.toFixed(2).replace(".", ",")}
          </div>
          {desconto > 0 && (
            <div style={{ fontSize: 12, color: "#4ade80", marginTop: 4 }}>
              você economizou R$ {desconto.toFixed(2).replace(".", ",")}
            </div>
          )}
        </div>

        {/* Cupom */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Cupom de desconto
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={cupom}
              onChange={e => setCupom(e.target.value.toUpperCase())}
              placeholder="ex: DJPAODURO10"
              style={{
                flex: 1, background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.15)",
                borderRadius: 6, padding: "9px 12px", color: "#fff", fontSize: 13,
                fontFamily: "'Space Mono', monospace", outline: "none",
              }}
            />
            <button
              onClick={handleCupom}
              style={{
                background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)",
                color: "#00f5ff", borderRadius: 6, padding: "9px 16px", fontSize: 12,
                fontFamily: "'Space Mono', monospace", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              APLICAR
            </button>
          </div>
          {cupomMsg && (
            <div style={{ marginTop: 8, fontSize: 12, color: cupomMsg.ok ? "#4ade80" : "#ef4444" }}>
              {cupomMsg.txt}
            </div>
          )}
        </div>

        {/* Método */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["pix", "mp"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetodo(m)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 6, fontSize: 13, cursor: "pointer",
                fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: 1,
                transition: "all 0.2s",
                background: metodo === m ? "#00f5ff" : "rgba(0,245,255,0.05)",
                color: metodo === m ? "#000" : "rgba(0,245,255,0.7)",
                border: metodo === m ? "none" : "1px solid rgba(0,245,255,0.2)",
              }}
            >
              {m === "pix" ? "⚡ PIX" : "💳 CARTÃO"}
            </button>
          ))}
        </div>

        {/* PIX */}
        {metodo === "pix" && (
          <div style={{ textAlign: "center" }}>
            {expirado ? (
              <div style={{ padding: 24, color: "#ef4444", fontSize: 14 }}>
                Código expirado. Feche e tente novamente.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <img src={qrUrl} alt="QR Code PIX" style={{ width: 220, height: 220, borderRadius: 12, border: "1px solid rgba(0,245,255,0.15)" }} />
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(0,245,255,0.5)", marginBottom: 12 }}>
                  expira em <span style={{ color: timer < 300 ? "#ef4444" : "#00f5ff" }}>{timerFmt}</span>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.1)", borderRadius: 8, padding: "10px 12px", marginBottom: 12, wordBreak: "break-all", fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", textAlign: "left" }}>
                  {pixPayload.slice(0, 40)}…
                </div>
                <button
                  onClick={copiar}
                  style={{
                    width: "100%", padding: "12px 0", borderRadius: 6, fontSize: 13,
                    fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: 2,
                    cursor: "pointer", transition: "all 0.2s",
                    background: copiado ? "#4ade80" : "#00f5ff",
                    color: "#000", border: "none",
                  }}
                >
                  {copiado ? "COPIADO ✓" : "COPIAR CÓDIGO PIX"}
                </button>
                <p style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                  Após o pagamento, envie o comprovante no WhatsApp para liberar seu acesso.
                </p>
              </>
            )}
          </div>
        )}

        {/* Mercado Pago */}
        {metodo === "mp" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20, lineHeight: 1.6 }}>
              Pague com cartão de crédito em até 12x ou débito pelo Mercado Pago com total segurança.
            </p>
            <a
              href={MP_LINKS[plano]}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrarVenda(plano, total, "mp")}
              style={{
                display: "block", width: "100%", padding: "14px 0", borderRadius: 6,
                background: "#00b1ea", color: "#fff", fontSize: 14, fontWeight: 700,
                textDecoration: "none", fontFamily: "'Space Mono', monospace",
                letterSpacing: 2, textAlign: "center",
              }}
            >
              PAGAR COM MERCADO PAGO →
            </a>
            <p style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              Você será redirecionado para o ambiente seguro do Mercado Pago.
            </p>
          </div>
        )}

        {/* Garantia */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <span style={{ fontSize: 16 }}>🛡️</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
            7 dias de garantia incondicional
          </span>
        </div>

        {/* Social proof */}
        <div style={{
          marginTop: 12, padding: "10px 14px",
          background: "rgba(0,245,255,0.04)", borderRadius: 8,
          border: "1px solid rgba(0,245,255,0.08)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ display: "flex" }}>
            {["🟢","🟢","🟢"].map((_, i) => (
              <div key={i} style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "linear-gradient(135deg, #00f5ff22, #0066ff22)",
                border: "1px solid rgba(0,245,255,0.3)",
                marginLeft: i > 0 ? -8 : 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10,
              }}>🎧</div>
            ))}
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>
            <span style={{ color: "#00f5ff" }}>+47 pessoas</span> compraram nas últimas 24h
          </span>
        </div>
      </div>
    </div>
  );
}
