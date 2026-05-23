"use client";
import { useState, useEffect } from "react";

const SUPABASE_URL = "https://maljtjznorewdntctaub.supabase.co";

// ─── API helpers ─────────────────────────────────────────────────────────────
async function supaFetch(path, options = {}, serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || res.statusText);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function supaAuthCreate(email, password, serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro ao criar usuário");
  return data;
}

async function supaAuthDelete(userId, serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) throw new Error("Erro ao deletar usuário");
}

// ─── Design tokens (mesmo visual do site) ────────────────────────────────────
const C = {
  cyan: "#00f5ff",
  cyanDim: "rgba(0,245,255,0.15)",
  cyanGlow: "rgba(0,245,255,0.4)",
  dark: "#020408",
  dark2: "#060d14",
  dark3: "#0a1628",
  white: "#fff",
  muted: "rgba(255,255,255,0.5)",
  muted2: "rgba(255,255,255,0.25)",
  amber: "#f59e0b",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  red: "#ef4444",
};

const PLAN_LABEL = { pack: "Pack", curso: "Curso", ambos: "Pack + Curso" };
const PLAN_COLOR = { pack: C.amber, curso: C.blue, ambos: C.purple };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Badge({ plan }) {
  return (
    <span style={{
      background: PLAN_COLOR[plan] + "22",
      color: PLAN_COLOR[plan],
      border: `1px solid ${PLAN_COLOR[plan]}55`,
      borderRadius: 4,
      padding: "2px 10px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: "uppercase",
      fontFamily: "'Space Mono', monospace",
    }}>
      {PLAN_LABEL[plan]}
    </span>
  );
}

function StatusDot({ active }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: active ? C.green : C.red, marginRight: 6,
      boxShadow: active ? `0 0 6px ${C.green}` : `0 0 6px ${C.red}`,
    }} />
  );
}

function WaveBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 20 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} style={{
          display: "inline-block", width: 2,
          background: C.cyan, borderRadius: 2,
          animation: `wave 1.2s ease-in-out infinite`,
          animationDelay: `${(i * 0.1).toFixed(1)}s`,
          height: 8,
        }} />
      ))}
      <style>{`@keyframes wave { 0%,100%{height:4px;opacity:.4} 50%{height:16px;opacity:1} }`}</style>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: "100vh",
    background: C.dark,
    color: C.white,
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: C.dark2,
    borderBottom: `1px solid rgba(0,245,255,0.1)`,
    padding: "0 32px",
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 22,
    letterSpacing: 4,
    color: C.white,
  },
  accent: { color: C.cyan, textShadow: `0 0 20px ${C.cyan}` },
  tag: {
    fontSize: 10,
    background: `rgba(0,245,255,0.1)`,
    color: C.cyan,
    border: `1px solid rgba(0,245,255,0.3)`,
    borderRadius: 2,
    padding: "2px 10px",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "'Space Mono', monospace",
  },
  body: { display: "flex", flex: 1 },
  sidebar: {
    width: 220,
    background: C.dark2,
    borderRight: `1px solid rgba(0,245,255,0.08)`,
    padding: "24px 0",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "11px 24px", cursor: "pointer",
    borderLeft: active ? `2px solid ${C.cyan}` : "2px solid transparent",
    background: active ? `rgba(0,245,255,0.06)` : "transparent",
    color: active ? C.cyan : C.muted,
    fontSize: 12, fontWeight: active ? 700 : 400,
    letterSpacing: 2, textTransform: "uppercase",
    fontFamily: "'Space Mono', monospace",
    transition: "all .15s",
    textShadow: active ? `0 0 10px ${C.cyan}` : "none",
  }),
  main: { flex: 1, padding: 32, overflowY: "auto" },
  pageTitle: {
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 36, color: C.white, marginBottom: 4, letterSpacing: 3,
  },
  subtitle: { fontSize: 12, color: C.muted, marginBottom: 28, fontFamily: "'Space Mono', monospace" },
  card: {
    background: `linear-gradient(135deg, rgba(6,13,20,0.9) 0%, rgba(10,22,40,0.9) 100%)`,
    border: `1px solid rgba(0,245,255,0.15)`,
    borderRadius: 0,
    padding: 24,
    marginBottom: 20,
    transition: "border-color .2s",
  },
  cardTitle: {
    fontSize: 11, fontWeight: 700, color: C.muted,
    marginBottom: 16, letterSpacing: 2,
    textTransform: "uppercase", fontFamily: "'Space Mono', monospace",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: {
    fontSize: 10, color: C.muted, letterSpacing: 2,
    textTransform: "uppercase", marginBottom: 6, display: "block",
    fontFamily: "'Space Mono', monospace",
  },
  input: {
    width: "100%", background: "rgba(6,13,20,0.8)",
    border: `1px solid rgba(0,245,255,0.2)`,
    borderRadius: 0, padding: "10px 14px",
    color: C.white, fontSize: 14, outline: "none",
    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
  },
  select: {
    width: "100%", background: "rgba(6,13,20,0.8)",
    border: `1px solid rgba(0,245,255,0.2)`,
    borderRadius: 0, padding: "10px 14px",
    color: C.white, fontSize: 14, outline: "none",
    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
  },
  btn: (variant = "primary") => ({
    padding: "10px 24px", borderRadius: 0, border: "none",
    cursor: "pointer", fontSize: 12, fontWeight: 700,
    letterSpacing: 2, fontFamily: "'Bebas Neue', cursive",
    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
    background: variant === "primary" ? C.cyan
      : variant === "danger" ? "rgba(239,68,68,0.15)"
      : "rgba(0,245,255,0.1)",
    color: variant === "primary" ? "#000"
      : variant === "danger" ? C.red
      : C.cyan,
    boxShadow: variant === "primary" ? `0 0 20px rgba(0,245,255,0.3)` : "none",
    transition: "all .2s",
  }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", fontSize: 10, color: C.muted,
    letterSpacing: 2, textTransform: "uppercase",
    padding: "10px 16px", borderBottom: `1px solid rgba(0,245,255,0.1)`,
    fontFamily: "'Space Mono', monospace",
  },
  td: {
    padding: "14px 16px", fontSize: 13,
    borderBottom: `1px solid rgba(0,245,255,0.05)`, color: "rgba(255,255,255,0.8)",
  },
  alert: (type) => ({
    padding: "12px 16px", borderRadius: 0, marginBottom: 16, fontSize: 12,
    background: type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
    color: type === "error" ? C.red : C.green,
    border: `1px solid ${type === "error" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
    fontFamily: "'Space Mono', monospace",
  }),
};

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");

  const handle = async () => {
    if (!key.trim()) return setErr("Insira a service role key");
    if (!key.startsWith("eyJ")) return setErr("Key inválida — deve começar com eyJ");

    // Verifica se é realmente service_role decodificando o JWT
    try {
      const payload = JSON.parse(atob(key.split(".")[1]));
      if (payload.role !== "service_role") {
        return setErr(
          "Você inseriu a anon key, não a service_role key. " +
          "No Supabase vá em Settings → API → Project API keys → service_role (clique em Reveal para copiar)."
        );
      }
    } catch (_) {
      return setErr("Token inválido — verifique se copiou a chave completa sem espaços.");
    }

    // Testa a key fazendo uma chamada real ao Supabase
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1`, {
        headers: { apikey: key.trim(), Authorization: `Bearer ${key.trim()}` },
      });
      if (res.status === 401 || res.status === 403) {
        return setErr("Chave recusada pelo Supabase (401/403). Copie novamente a service_role key do painel.");
      }
      if (!res.ok && res.status !== 422) {
        return setErr(`Erro ao validar chave: status ${res.status}`);
      }
    } catch (_) {
      return setErr("Não foi possível conectar ao Supabase. Verifique sua conexão.");
    }

    onLogin(key.trim());
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #020408; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus { border-color: #00f5ff !important; box-shadow: 0 0 20px rgba(0,245,255,0.2) !important; outline: none; }
      `}</style>
      <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 420, ...S.card, padding: 40, border: `1px solid rgba(0,245,255,0.3)`, boxShadow: `0 0 40px rgba(0,245,255,0.1)` }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <WaveBar />
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: C.white, letterSpacing: 6, marginTop: 16 }}>
              DJ <span style={{ color: C.cyan, textShadow: `0 0 20px ${C.cyan}` }}>SIMON</span>
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: 4, marginTop: 4 }}>
              PAINEL ADMIN
            </div>
            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`, marginTop: 20 }} />
          </div>
          {err && <div style={S.alert("error")}>{err}</div>}
          <label style={S.label}>Service Role Key (Supabase)</label>
          <input
            style={{ ...S.input, marginBottom: 20 }}
            type="password" placeholder="eyJhb..."
            value={key} onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handle()}
          />
          <button style={{ ...S.btn("primary"), width: "100%", fontSize: 16, padding: "14px 24px" }} onClick={handle}>
            ENTRAR
          </button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.muted2, marginTop: 16, textAlign: "center" }}>
            Supabase → Settings → API → service_role
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardTab({ serviceKey }) {
  const [stats, setStats] = useState({
    total: 0, ativos: 0, pack: 0, curso: 0, ambos: 0,
    plugins: 0, videos: 0,
    downloadsHoje: 0, viewsHoje: 0,
    downloadsTotal: 0, viewsTotal: 0,
    membrosHoje: 0, membros7dias: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const hojeISO = hoje.toISOString();

        const sete = new Date();
        sete.setDate(sete.getDate() - 7);
        const seteISO = sete.toISOString();

        const [members, plugins, videos, downloads, views] = await Promise.all([
          supaFetch("/members", {}, serviceKey),
          supaFetch("/plugins", {}, serviceKey),
          supaFetch("/videos", {}, serviceKey),
          supaFetch("/plugin_downloads", {}, serviceKey).catch(() => []),
          supaFetch("/video_views", {}, serviceKey).catch(() => []),
        ]);

        setStats({
          total: members.length,
          ativos: members.filter(m => m.active).length,
          pack: members.filter(m => m.plan === "pack").length,
          curso: members.filter(m => m.plan === "curso").length,
          ambos: members.filter(m => m.plan === "ambos").length,
          plugins: plugins.length,
          videos: videos.length,
          downloadsTotal: downloads.length,
          viewsTotal: views.length,
          downloadsHoje: downloads.filter(d => new Date(d.downloaded_at) >= hoje).length,
          viewsHoje: views.filter(v => new Date(v.viewed_at) >= hoje).length,
          membrosHoje: members.filter(m => new Date(m.created_at) >= hoje).length,
          membros7dias: members.filter(m => new Date(m.created_at) >= new Date(seteISO)).length,
        });
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const StatCard = ({ num, label, color = C.cyan, sub = null }) => (
    <div style={{
      ...S.card, flex: 1, marginBottom: 0,
      borderTop: `2px solid ${color}`,
      boxShadow: `0 0 20px ${color}11`,
    }}>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, color, lineHeight: 1, textShadow: `0 0 20px ${color}88` }}>
        {loading ? "—" : num}
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginTop: 8 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.muted2, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;600;700&family=Space+Mono:wght@400;700&display=swap');`}</style>
      <div style={S.pageTitle}>Dashboard</div>
      <div style={S.subtitle}>// visão geral da plataforma</div>

      {/* Row 1 — Membros */}
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.cyan, letterSpacing: 3, marginBottom: 12, textTransform: "uppercase" }}>
        ▸ Membros
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <StatCard num={stats.total} label="Total de membros" color={C.cyan} />
        <StatCard num={stats.ativos} label="Membros ativos" color={C.green} />
        <StatCard num={stats.membrosHoje} label="Novos hoje" color={C.amber} />
        <StatCard num={stats.membros7dias} label="Últimos 7 dias" color={C.purple} />
      </div>

      {/* Row 2 — Planos */}
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.cyan, letterSpacing: 3, marginBottom: 12, textTransform: "uppercase" }}>
        ▸ Planos
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <StatCard num={stats.pack} label="Plano Pack" color={C.amber} />
        <StatCard num={stats.curso} label="Plano Curso" color={C.blue} />
        <StatCard num={stats.ambos} label="Pack + Curso" color={C.purple} />
      </div>

      {/* Row 3 — Atividade */}
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.cyan, letterSpacing: 3, marginBottom: 12, textTransform: "uppercase" }}>
        ▸ Atividade
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <StatCard num={stats.downloadsHoje} label="Downloads hoje" color={C.cyan} sub={`Total: ${stats.downloadsTotal}`} />
        <StatCard num={stats.viewsHoje} label="Vídeos acessados hoje" color={C.blue} sub={`Total: ${stats.viewsTotal}`} />
        <StatCard num={stats.plugins} label="Plugins disponíveis" color={C.amber} />
        <StatCard num={stats.videos} label="Vídeos disponíveis" color={C.purple} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`, margin: "8px 0 24px" }} />

      {/* Resumo */}
      <div style={{ ...S.card, display: "flex", gap: 32, alignItems: "center" }}>
        <WaveBar />
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.cyan, letterSpacing: 2, marginBottom: 4 }}>STATUS DA PLATAFORMA</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            <StatusDot active={stats.ativos > 0} /> {stats.ativos} membros com acesso ativo
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: 1 }}>
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Members ──────────────────────────────────────────────────────────────────
function MembersTab({ serviceKey }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", plan: "pack" });
  const [msg, setMsg] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editPlan, setEditPlan] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await supaFetch("/members?order=created_at.desc", {}, serviceKey);
      setMembers(data);
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.email || !form.password) return setMsg({ type: "error", text: "Preencha todos os campos" });
    if (form.password.length < 6) return setMsg({ type: "error", text: "A senha precisa ter pelo menos 6 caracteres" });

    setCreating(true); setMsg(null);
    let authUserId = null;

    try {
      // Passo 1: criar usuário no Supabase Auth
      let authUser;
      try {
        authUser = await supaAuthCreate(form.email, form.password, serviceKey);
      } catch (authErr) {
        // Erros comuns do Supabase Auth
        const msg = authErr.message || "";
        if (msg.includes("already been registered") || msg.includes("already exists")) {
          throw new Error("Este email já está cadastrado no sistema de autenticação. Use outro email ou delete o usuário existente.");
        }
        if (msg.includes("invalid") && msg.includes("key")) {
          throw new Error("Chave de serviço inválida. Certifique-se de usar a 'service_role key' do Supabase (não a anon key).");
        }
        if (msg.includes("weak_password") || msg.includes("Password")) {
          throw new Error("Senha muito fraca. Use pelo menos 6 caracteres com letras e números.");
        }
        throw new Error("Erro ao criar autenticação: " + msg);
      }

      if (!authUser?.id) {
        throw new Error("Supabase Auth não retornou um ID de usuário. Verifique a service_role key.");
      }

      authUserId = authUser.id;

      // Passo 2: inserir na tabela members com o auth_id correto
      try {
        await supaFetch("/members", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            plan: form.plan,
            auth_id: authUserId,
            active: true,
          }),
        }, serviceKey);
      } catch (dbErr) {
        // Se falhou ao inserir na tabela, tenta desfazer a criação no Auth
        // para não deixar usuário órfão
        try {
          await supaAuthDelete(authUserId, serviceKey);
        } catch (_) {}
        const msg = dbErr.message || "";
        if (msg.includes("duplicate") || msg.includes("unique")) {
          throw new Error("Este email já existe na tabela de membros.");
        }
        if (msg.includes("auth_id")) {
          throw new Error("Erro ao salvar auth_id na tabela members. Verifique se a coluna auth_id existe e aceita texto.");
        }
        throw new Error("Erro ao salvar membro no banco: " + msg);
      }

      setForm({ name: "", email: "", password: "", plan: "pack" });
      setMsg({ type: "success", text: `✓ Membro "${form.name}" criado com sucesso! auth_id: ${authUserId}` });
      load();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
    setCreating(false);
  };

  const toggleActive = async (m) => {
    try {
      await supaFetch(`/members?id=eq.${m.id}`, { method: "PATCH", body: JSON.stringify({ active: !m.active }) }, serviceKey);
      load();
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };

  const savePlan = async (id) => {
    try {
      await supaFetch(`/members?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ plan: editPlan }) }, serviceKey);
      setEditId(null); load();
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };

  const deleteMember = async (m) => {
    if (!confirm(`Deletar ${m.name}?`)) return;
    try {
      await supaFetch(`/members?id=eq.${m.id}`, { method: "DELETE" }, serviceKey);
      if (m.auth_id) await supaAuthDelete(m.auth_id, serviceKey).catch(() => {});
      load();
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };

  return (
    <div>
      <div style={S.pageTitle}>Membros</div>
      <div style={S.subtitle}>// gerencie os membros da plataforma</div>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}

      <div style={S.card}>
        <div style={S.cardTitle}>⚡ Novo Membro</div>
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Nome</label>
            <input style={S.input} placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>Email</label>
            <input style={S.input} placeholder="email@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>Senha</label>
            <input style={S.input} type="password" placeholder="Senha de acesso" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>Plano</label>
            <select style={S.select} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              <option value="pack">Pack</option>
              <option value="curso">Curso</option>
              <option value="ambos">Pack + Curso</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button style={S.btn("primary")} onClick={create} disabled={creating}>
            {creating ? "CRIANDO..." : "+ CRIAR MEMBRO"}
          </button>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>◎ Todos os Membros ({members.length})</div>
        {loading ? (
          <div style={{ color: C.muted, fontSize: 13 }}>Carregando...</div>
        ) : members.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 13 }}>Nenhum membro ainda.</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Nome</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Plano</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Auth ID</th>
                <th style={S.th}>Criado em</th>
                <th style={S.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td style={S.td}>{m.name}</td>
                  <td style={S.td}>{m.email}</td>
                  <td style={S.td}>
                    {editId === m.id ? (
                      <select style={{ ...S.select, width: "auto" }} value={editPlan} onChange={(e) => setEditPlan(e.target.value)}>
                        <option value="pack">Pack</option>
                        <option value="curso">Curso</option>
                        <option value="ambos">Pack + Curso</option>
                      </select>
                    ) : <Badge plan={m.plan} />}
                  </td>
                  <td style={S.td}><StatusDot active={m.active} />{m.active ? "Ativo" : "Inativo"}</td>
                  <td style={S.td}>
                    {m.auth_id ? (
                      <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(0,245,255,0.6)" }} title={m.auth_id}>
                        {"✓ " + m.auth_id.slice(0, 8) + "…"}
                      </span>
                    ) : (
                      <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 700 }} title="auth_id ausente — este membro não conseguirá fazer login">
                        ✗ AUSENTE
                      </span>
                    )}
                  </td>
                  <td style={S.td}>{new Date(m.created_at).toLocaleDateString("pt-BR")}</td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {editId === m.id ? (
                        <>
                          <button style={S.btn("primary")} onClick={() => savePlan(m.id)}>✓</button>
                          <button style={S.btn()} onClick={() => setEditId(null)}>✕</button>
                        </>
                      ) : (
                        <>
                          <button style={S.btn()} onClick={() => { setEditId(m.id); setEditPlan(m.plan); }}>Plano</button>
                          <button style={S.btn()} onClick={() => toggleActive(m)}>{m.active ? "Desativar" : "Ativar"}</button>
                          <button style={S.btn("danger")} onClick={() => deleteMember(m)}>Deletar</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Plugins ──────────────────────────────────────────────────────────────────
function PluginsTab({ serviceKey }) {
  const [plugins, setPlugins] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", file_url: "", plan: "pack" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await supaFetch("/plugins?order=created_at.desc", {}, serviceKey);
      setPlugins(data);
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.file_url) return setMsg({ type: "error", text: "Nome e URL são obrigatórios" });
    try {
      await supaFetch("/plugins", { method: "POST", body: JSON.stringify(form) }, serviceKey);
      setForm({ name: "", description: "", file_url: "", plan: "pack" });
      setMsg({ type: "success", text: "Plugin adicionado!" });
      load();
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };

  const del = async (id) => {
    if (!confirm("Deletar plugin?")) return;
    try {
      await supaFetch(`/plugins?id=eq.${id}`, { method: "DELETE" }, serviceKey);
      load();
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };

  return (
    <div>
      <div style={S.pageTitle}>Plugins</div>
      <div style={S.subtitle}>// gerencie os plugins disponíveis para download</div>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}

      <div style={S.card}>
        <div style={S.cardTitle}>⬡ Novo Plugin</div>
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Nome do Plugin</label>
            <input style={S.input} placeholder="Ex: Pack Samples Vol.1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>Plano</label>
            <select style={S.select} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              <option value="pack">Pack</option>
              <option value="ambos">Pack + Curso</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={S.label}>URL do arquivo</label>
            <input style={S.input} placeholder="https://..." value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={S.label}>Descrição (opcional)</label>
            <input style={S.input} placeholder="Breve descrição do plugin" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button style={S.btn("primary")} onClick={create}>+ ADICIONAR PLUGIN</button>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>⬡ Plugins ({plugins.length})</div>
        {loading ? <div style={{ color: C.muted, fontSize: 13 }}>Carregando...</div> :
         plugins.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>Nenhum plugin ainda.</div> : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Nome</th>
                <th style={S.th}>Descrição</th>
                <th style={S.th}>Plano</th>
                <th style={S.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {plugins.map((p) => (
                <tr key={p.id}>
                  <td style={S.td}><a href={p.file_url} target="_blank" rel="noreferrer" style={{ color: C.cyan, textDecoration: "none" }}>{p.name}</a></td>
                  <td style={S.td}>{p.description || "—"}</td>
                  <td style={S.td}><Badge plan={p.plan} /></td>
                  <td style={S.td}><button style={S.btn("danger")} onClick={() => del(p.id)}>Deletar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Videos ───────────────────────────────────────────────────────────────────
function VideosTab({ serviceKey }) {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ title: "", youtube_url: "", plan: "curso" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await supaFetch("/videos?order=created_at.desc", {}, serviceKey);
      setVideos(data);
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getYTId = (url) => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? m[1] : null;
  };

  const create = async () => {
    if (!form.title || !form.youtube_url) return setMsg({ type: "error", text: "Título e URL são obrigatórios" });
    if (!getYTId(form.youtube_url)) return setMsg({ type: "error", text: "URL do YouTube inválida" });
    try {
      await supaFetch("/videos", { method: "POST", body: JSON.stringify(form) }, serviceKey);
      setForm({ title: "", youtube_url: "", plan: "curso" });
      setMsg({ type: "success", text: "Vídeo adicionado!" });
      load();
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };

  const del = async (id) => {
    if (!confirm("Deletar vídeo?")) return;
    try {
      await supaFetch(`/videos?id=eq.${id}`, { method: "DELETE" }, serviceKey);
      load();
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };

  return (
    <div>
      <div style={S.pageTitle}>Vídeos</div>
      <div style={S.subtitle}>// gerencie os vídeos do curso (YouTube)</div>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}

      <div style={S.card}>
        <div style={S.cardTitle}>▷ Novo Vídeo</div>
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Título da Aula</label>
            <input style={S.input} placeholder="Ex: Aula 01 - Introdução" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>Plano</label>
            <select style={S.select} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              <option value="curso">Curso</option>
              <option value="ambos">Pack + Curso</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={S.label}>URL do YouTube</label>
            <input style={S.input} placeholder="https://youtube.com/watch?v=..." value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button style={S.btn("primary")} onClick={create}>+ ADICIONAR VÍDEO</button>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>▷ Vídeos ({videos.length})</div>
        {loading ? <div style={{ color: C.muted, fontSize: 13 }}>Carregando...</div> :
         videos.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>Nenhum vídeo ainda.</div> : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {videos.map((v) => {
              const ytId = getYTId(v.youtube_url);
              return (
                <div key={v.id} style={{ background: C.dark2, border: `1px solid rgba(0,245,255,0.15)`, overflow: "hidden" }}>
                  {ytId && <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={v.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />}
                  <div style={{ padding: 16 }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: C.white, letterSpacing: 2, marginBottom: 10 }}>{v.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Badge plan={v.plan} />
                      <button style={S.btn("danger")} onClick={() => del(v.id)}>Deletar</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "members", label: "Membros", icon: "◎" },
  { id: "plugins", label: "Plugins", icon: "⬡" },
  { id: "videos", label: "Vídeos", icon: "▷" },
];

export default function AdminPanel() {
  const [serviceKey, setServiceKey] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("sk") || "" : "";
    setServiceKey(saved);
    setReady(true);
  }, []);

  const handleLogin = (key) => {
    if (typeof window !== "undefined") sessionStorage.setItem("sk", key);
    setServiceKey(key);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("sk");
    setServiceKey("");
  };

  if (!ready) return null;
  if (!serviceKey) return <LoginScreen onLogin={handleLogin} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #020408; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus, select:focus { border-color: #00f5ff !important; outline: none; }
        tr:hover td { background: rgba(0,245,255,0.03); }
        @keyframes wave { 0%,100%{height:4px;opacity:.4} 50%{height:16px;opacity:1} }
      `}</style>
      <div style={S.root}>
        <div style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <WaveBar />
            <div style={S.logo}>DJ <span style={S.accent}>SIMON</span> <span style={{ fontSize: 12, color: C.muted, fontFamily: "'Space Mono', monospace", fontWeight: 400 }}>/ admin</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={S.tag}>PAINEL ADMIN</span>
            <button style={{ ...S.btn("danger"), fontSize: 11 }} onClick={handleLogout}>SAIR</button>
          </div>
        </div>
        <div style={S.body}>
          <div style={S.sidebar}>
            {TABS.map((t) => (
              <div key={t.id} style={S.navItem(tab === t.id)} onClick={() => setTab(t.id)}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </div>
            ))}
            <div style={{ marginTop: "auto", padding: "24px 24px 0", borderTop: `1px solid rgba(0,245,255,0.08)` }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.muted2, letterSpacing: 1 }}>
                DJ SIMON TELINI<br />© 2025
              </div>
            </div>
          </div>
          <div style={S.main}>
            {tab === "dashboard" && <DashboardTab serviceKey={serviceKey} />}
            {tab === "members" && <MembersTab serviceKey={serviceKey} />}
            {tab === "plugins" && <PluginsTab serviceKey={serviceKey} />}
            {tab === "videos" && <VideosTab serviceKey={serviceKey} />}
          </div>
        </div>
      </div>
    </>
  );
}
