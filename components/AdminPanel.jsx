import { useState, useEffect } from "react";

const SUPABASE_URL = "https://maljtjznorewdntctaub.supabase.co";

// ─── API helpers ────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const PLAN_LABEL = { pack: "Pack", curso: "Curso", ambos: "Pack + Curso" };
const PLAN_COLOR = {
  pack: "#f59e0b",
  curso: "#3b82f6",
  ambos: "#8b5cf6",
};

function Badge({ plan }) {
  return (
    <span
      style={{
        background: PLAN_COLOR[plan] + "22",
        color: PLAN_COLOR[plan],
        border: `1px solid ${PLAN_COLOR[plan]}55`,
        borderRadius: 6,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
      }}
    >
      {PLAN_LABEL[plan]}
    </span>
  );
}

function StatusDot({ active }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: active ? "#22c55e" : "#ef4444",
        marginRight: 6,
        boxShadow: active ? "0 0 6px #22c55e" : "0 0 6px #ef4444",
      }}
    />
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#e2e8f0",
    fontFamily: "'DM Mono', 'Fira Code', monospace",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#0f0f1a",
    borderBottom: "1px solid #1e1e30",
    padding: "0 32px",
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  accent: { color: "#f59e0b" },
  tag: {
    fontSize: 10,
    background: "#f59e0b22",
    color: "#f59e0b",
    border: "1px solid #f59e0b44",
    borderRadius: 4,
    padding: "2px 8px",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  body: { display: "flex", flex: 1 },
  sidebar: {
    width: 220,
    background: "#0f0f1a",
    borderRight: "1px solid #1e1e30",
    padding: "24px 0",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 24px",
    cursor: "pointer",
    borderLeft: active ? "2px solid #f59e0b" : "2px solid transparent",
    background: active ? "#f59e0b11" : "transparent",
    color: active ? "#f59e0b" : "#64748b",
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    letterSpacing: 1,
    transition: "all .15s",
  }),
  main: { flex: 1, padding: 32, overflowY: "auto" },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 1,
  },
  subtitle: { fontSize: 13, color: "#475569", marginBottom: 28 },
  card: {
    background: "#0f0f1a",
    border: "1px solid #1e1e30",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: { fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, display: "block" },
  input: {
    width: "100%",
    background: "#0a0a0f",
    border: "1px solid #1e1e30",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    background: "#0a0a0f",
    border: "1px solid #1e1e30",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  btn: (variant = "primary") => ({
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1,
    fontFamily: "inherit",
    background: variant === "primary" ? "#f59e0b" : variant === "danger" ? "#ef444422" : "#1e1e30",
    color: variant === "primary" ? "#000" : variant === "danger" ? "#ef4444" : "#94a3b8",
    transition: "opacity .15s",
  }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 11,
    color: "#475569",
    letterSpacing: 1,
    textTransform: "uppercase",
    padding: "10px 16px",
    borderBottom: "1px solid #1e1e30",
  },
  td: {
    padding: "14px 16px",
    fontSize: 13,
    borderBottom: "1px solid #0f0f1a",
    color: "#cbd5e1",
  },
  stat: {
    background: "#0f0f1a",
    border: "1px solid #1e1e30",
    borderRadius: 12,
    padding: "20px 24px",
    flex: 1,
  },
  statNum: { fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1 },
  statLabel: { fontSize: 11, color: "#475569", letterSpacing: 2, textTransform: "uppercase", marginTop: 6 },
  alert: (type) => ({
    padding: "12px 16px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
    background: type === "error" ? "#ef444422" : "#22c55e22",
    color: type === "error" ? "#ef4444" : "#22c55e",
    border: `1px solid ${type === "error" ? "#ef444444" : "#22c55e44"}`,
  }),
};

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");

  const handle = () => {
    if (!key.trim()) return setErr("Insira a service role key");
    // Quick validation: supabase service keys start with "eyJ"
    if (!key.startsWith("eyJ")) return setErr("Key inválida");
    onLogin(key.trim());
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 400, ...S.card }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: 3 }}>
            DJ <span style={S.accent}>SIMON</span>
          </div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, marginTop: 4 }}>PAINEL ADMIN</div>
        </div>
        {err && <div style={S.alert("error")}>{err}</div>}
        <label style={S.label}>Service Role Key (Supabase)</label>
        <input
          style={{ ...S.input, marginBottom: 16 }}
          type="password"
          placeholder="eyJhb..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
        />
        <button style={{ ...S.btn("primary"), width: "100%" }} onClick={handle}>
          ENTRAR
        </button>
        <div style={{ fontSize: 11, color: "#334155", marginTop: 12, textAlign: "center" }}>
          Use a service_role key do Supabase → Settings → API
        </div>
      </div>
    </div>
  );
}

// ─── Members Tab ─────────────────────────────────────────────────────────────
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
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.email || !form.password) return setMsg({ type: "error", text: "Preencha todos os campos" });
    setCreating(true);
    setMsg(null);
    try {
      const authUser = await supaAuthCreate(form.email, form.password, serviceKey);
      await supaFetch("/members", {
        method: "POST",
        body: JSON.stringify({ name: form.name, email: form.email, plan: form.plan, auth_id: authUser.id }),
      }, serviceKey);
      setForm({ name: "", email: "", password: "", plan: "pack" });
      setMsg({ type: "success", text: "Membro criado com sucesso!" });
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
      setEditId(null);
      load();
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
      <div style={S.subtitle}>Gerencie os membros da plataforma</div>

      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}

      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 16, letterSpacing: 1 }}>NOVO MEMBRO</div>
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
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button style={S.btn("primary")} onClick={create} disabled={creating}>
            {creating ? "CRIANDO..." : "+ CRIAR MEMBRO"}
          </button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 16, letterSpacing: 1 }}>
          TODOS OS MEMBROS ({members.length})
        </div>
        {loading ? (
          <div style={{ color: "#475569", fontSize: 13 }}>Carregando...</div>
        ) : members.length === 0 ? (
          <div style={{ color: "#475569", fontSize: 13 }}>Nenhum membro ainda.</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Nome</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Plano</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Criado em</th>
                <th style={S.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} style={{ background: m.id === editId ? "#1e1e3022" : "transparent" }}>
                  <td style={S.td}>{m.name}</td>
                  <td style={S.td}>{m.email}</td>
                  <td style={S.td}>
                    {editId === m.id ? (
                      <select style={{ ...S.select, width: "auto" }} value={editPlan} onChange={(e) => setEditPlan(e.target.value)}>
                        <option value="pack">Pack</option>
                        <option value="curso">Curso</option>
                        <option value="ambos">Pack + Curso</option>
                      </select>
                    ) : (
                      <Badge plan={m.plan} />
                    )}
                  </td>
                  <td style={S.td}>
                    <StatusDot active={m.active} />
                    {m.active ? "Ativo" : "Inativo"}
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

// ─── Plugins Tab ─────────────────────────────────────────────────────────────
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
      <div style={S.subtitle}>Gerencie os plugins disponíveis para download</div>

      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}

      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 16, letterSpacing: 1 }}>NOVO PLUGIN</div>
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
            <label style={S.label}>URL do arquivo (Supabase Storage ou link direto)</label>
            <input style={S.input} placeholder="https://..." value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={S.label}>Descrição (opcional)</label>
            <input style={S.input} placeholder="Breve descrição do plugin" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button style={S.btn("primary")} onClick={create}>+ ADICIONAR PLUGIN</button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 16, letterSpacing: 1 }}>PLUGINS ({plugins.length})</div>
        {loading ? <div style={{ color: "#475569", fontSize: 13 }}>Carregando...</div> :
         plugins.length === 0 ? <div style={{ color: "#475569", fontSize: 13 }}>Nenhum plugin ainda.</div> : (
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
                  <td style={S.td}><a href={p.file_url} target="_blank" rel="noreferrer" style={{ color: "#f59e0b", textDecoration: "none" }}>{p.name}</a></td>
                  <td style={S.td}>{p.description || "—"}</td>
                  <td style={S.td}><Badge plan={p.plan} /></td>
                  <td style={S.td}>
                    <button style={S.btn("danger")} onClick={() => del(p.id)}>Deletar</button>
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

// ─── Videos Tab ──────────────────────────────────────────────────────────────
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
      <div style={S.subtitle}>Gerencie os vídeos do curso (YouTube)</div>

      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}

      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 16, letterSpacing: 1 }}>NOVO VÍDEO</div>
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
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button style={S.btn("primary")} onClick={create}>+ ADICIONAR VÍDEO</button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 16, letterSpacing: 1 }}>VÍDEOS ({videos.length})</div>
        {loading ? <div style={{ color: "#475569", fontSize: 13 }}>Carregando...</div> :
         videos.length === 0 ? <div style={{ color: "#475569", fontSize: 13 }}>Nenhum vídeo ainda.</div> : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {videos.map((v) => {
              const ytId = getYTId(v.youtube_url);
              return (
                <div key={v.id} style={{ background: "#0a0a0f", border: "1px solid #1e1e30", borderRadius: 10, overflow: "hidden" }}>
                  {ytId && (
                    <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={v.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                  )}
                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{v.title}</div>
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

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ serviceKey }) {
  const [stats, setStats] = useState({ total: 0, ativos: 0, pack: 0, curso: 0, ambos: 0, plugins: 0, videos: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [members, plugins, videos] = await Promise.all([
          supaFetch("/members", {}, serviceKey),
          supaFetch("/plugins", {}, serviceKey),
          supaFetch("/videos", {}, serviceKey),
        ]);
        setStats({
          total: members.length,
          ativos: members.filter((m) => m.active).length,
          pack: members.filter((m) => m.plan === "pack").length,
          curso: members.filter((m) => m.plan === "curso").length,
          ambos: members.filter((m) => m.plan === "ambos").length,
          plugins: plugins.length,
          videos: videos.length,
        });
      } catch (e) {}
    };
    load();
  }, []);

  const StatCard = ({ num, label, color = "#f59e0b" }) => (
    <div style={{ ...S.stat, borderTop: `2px solid ${color}` }}>
      <div style={{ ...S.statNum, color }}>{num}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={S.pageTitle}>Dashboard</div>
      <div style={S.subtitle}>Visão geral da plataforma</div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard num={stats.total} label="Total de membros" color="#f59e0b" />
        <StatCard num={stats.ativos} label="Membros ativos" color="#22c55e" />
        <StatCard num={stats.plugins} label="Plugins" color="#3b82f6" />
        <StatCard num={stats.videos} label="Vídeos" color="#8b5cf6" />
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <StatCard num={stats.pack} label="Plano Pack" color="#f59e0b" />
        <StatCard num={stats.curso} label="Plano Curso" color="#3b82f6" />
        <StatCard num={stats.ambos} label="Plano Pack + Curso" color="#8b5cf6" />
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
  const [serviceKey, setServiceKey] = useState(() => sessionStorage.getItem("sk") || "");
  const [tab, setTab] = useState("dashboard");

  const handleLogin = (key) => {
    sessionStorage.setItem("sk", key);
    setServiceKey(key);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("sk");
    setServiceKey("");
  };

  if (!serviceKey) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={S.root}>
      <div style={S.header}>
        <div style={S.logo}>DJ <span style={S.accent}>SIMON</span> <span style={{ fontSize: 12, color: "#334155", fontWeight: 400 }}>/ admin</span></div>
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
        </div>
        <div style={S.main}>
          {tab === "dashboard" && <DashboardTab serviceKey={serviceKey} />}
          {tab === "members" && <MembersTab serviceKey={serviceKey} />}
          {tab === "plugins" && <PluginsTab serviceKey={serviceKey} />}
          {tab === "videos" && <VideosTab serviceKey={serviceKey} />}
        </div>
      </div>
    </div>
  );
}
