"use client";

import { useState, useEffect, useRef } from "react";
import PagamentoModal from "@/components/PagamentoModal";
import { PlanoKey } from "@/lib/pagamento";
import {
  Play,
  CheckCircle2,
  Star,
  Zap,
  Music,
  Headphones,
  TrendingUp,
  Shield,
  ChevronDown,
  Instagram,
  Youtube,
  ArrowRight,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function WaveForm({ bars = 20 }: { bars?: number }) {
  return (
    <div className="flex items-center gap-[3px] h-10">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="wave-bar"
          style={{ animationDelay: `${(i * 0.06).toFixed(2)}s` }}
        />
      ))}
    </div>
  );
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const step = target / (duration / 16);
          let cur = 0;
          const timer = setInterval(() => {
            cur = Math.min(cur + step, target);
            setCount(Math.floor(cur));
            if (cur >= target) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="stat-number">
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

// ── Lead Form ─────────────────────────────────────────────────────────────────

function LeadForm({ plan }: { plan: "pack" | "curso" | "ambos" }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, interest: plan }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok")
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <CheckCircle2 className="text-cyan-400 w-14 h-14" />
        <p className="font-display text-2xl text-cyan-400 glow-cyan">
          INSCRIÇÃO CONFIRMADA!
        </p>
        <p className="text-white/60 text-center">
          Em breve você receberá o acesso no e-mail cadastrado.
        </p>
      </div>
    );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 w-full">
      <input
        className="input-dark"
        placeholder="Seu nome completo"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="input-dark"
        placeholder="Seu melhor e-mail"
        type="email"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="input-dark"
        placeholder="WhatsApp (com DDD)"
        type="tel"
        required
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-cta w-full mt-2 flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          "PROCESSANDO..."
        ) : (
          <>
            QUERO MEU ACESSO AGORA <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-sm text-center">
          Algo deu errado. Tente novamente.
        </p>
      )}
      <p className="text-white/30 text-xs text-center font-mono">
         Seus dados estão 100% seguros. Sem spam.
      </p>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

// ─── Nomes e cidades para notificações fake ───────────────────────────────────
const COMPRADORES = [
  { nome: "Lucas M.", cidade: "São Paulo" },
  { nome: "Rafaela S.", cidade: "Curitiba" },
  { nome: "Pedro H.", cidade: "Rio de Janeiro" },
  { nome: "Thiago B.", cidade: "Belo Horizonte" },
  { nome: "Amanda C.", cidade: "Fortaleza" },
  { nome: "Gabriel R.", cidade: "Porto Alegre" },
  { nome: "Fernanda L.", cidade: "Recife" },
  { nome: "Diego A.", cidade: "Salvador" },
  { nome: "Mariana T.", cidade: "Brasília" },
  { nome: "Bruno K.", cidade: "Florianópolis" },
  { nome: "Juliana P.", cidade: "Goiânia" },
  { nome: "Rodrigo N.", cidade: "Manaus" },
];
const PLANOS_FAKE = ["Pack Completo", "Curso DJ", "Combo Pack + Curso"];

export default function Home() {
  const [activePlan, setActivePlan] = useState<"pack" | "curso" | "ambos">("ambos");
  const [modalPlano, setModalPlano] = useState<PlanoKey | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // ── Urgência: contador regressivo 24h por sessão ──────────────────────────
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const KEY = "djs_deadline";
    let deadline = parseInt(sessionStorage.getItem(KEY) || "0");
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + 24 * 60 * 60 * 1000;
      sessionStorage.setItem(KEY, String(deadline));
    }
    const tick = () => setTimeLeft(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return { h, m, sec };
  };
  const { h, m, sec } = fmtTime(timeLeft);

  // ── Urgência: vagas restantes (diminui com o tempo) ───────────────────────
  const [vagas, setVagas] = useState(7);
  useEffect(() => {
    const KEY = "djs_vagas";
    let v = parseInt(localStorage.getItem(KEY) || "0");
    if (!v || v > 7) { v = Math.floor(Math.random() * 3) + 5; } // 5-7
    setVagas(v);
    // Diminui 1 vaga aleatoriamente entre 8-20 min
    const delay = (Math.floor(Math.random() * 12) + 8) * 60 * 1000;
    const id = setTimeout(() => {
      const novo = Math.max(1, v - 1);
      localStorage.setItem(KEY, String(novo));
      setVagas(novo);
    }, delay);
    return () => clearTimeout(id);
  }, []);

  // ── Urgência: notificações de compra ─────────────────────────────────────
  const [notif, setNotif] = useState<{ nome: string; cidade: string; plano: string } | null>(null);
  useEffect(() => {
    let idx = 0;
    const mostrar = () => {
      const c = COMPRADORES[idx % COMPRADORES.length];
      const p = PLANOS_FAKE[Math.floor(Math.random() * PLANOS_FAKE.length)];
      setNotif({ nome: c.nome, cidade: c.cidade, plano: p });
      idx++;
      setTimeout(() => setNotif(null), 4000);
    };
    // Primeira notificação após 8s
    const first = setTimeout(mostrar, 8000);
    // Depois a cada 25-45s
    const loop = setInterval(mostrar, (Math.floor(Math.random() * 20) + 25) * 1000);
    return () => { clearTimeout(first); clearInterval(loop); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Captura o ?ref= da URL e salva no localStorage para rastrear afiliados
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("ref_afiliado", ref);
    }
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const testimonials = [
    {
      name: "Lucas M.",
      city: "São Paulo",
      stars: 5,
      text: "Comecei do zero e em 3 meses já estava tocando em festas. O pack é sensacional, economizei horas de busca.",
    },
    {
      name: "Rafaela S.",
      city: "Curitiba",
      stars: 5,
      text: "O curso do Simon é diferente de tudo que já vi. Ele explica a técnica e a mentalidade de um DJ profissional.",
    },
    {
      name: "Pedro H.",
      city: "Rio de Janeiro",
      stars: 5,
      text: "Pack atualizado toda semana, suporte incrível. Vale 10x o preço. Recomendo sem hesitar.",
    },
    {
      name: "Thiago B.",
      city: "Belo Horizonte",
      stars: 5,
      text: "Fiz outros cursos e nenhum chegou perto. A qualidade de produção e a didática do Simon são incomparáveis.",
    },
  ];

  const packItems = [
    "500+ sets prontos para tocar",
    "Intros e Outros exclusivos",
    "Acapellas e stems originais",
    "Samples de efeito profissional",
    "Atualizações semanais",
    "Suporte direto no grupo VIP",
  ];

  const courseModules = [
    { num: "01", title: "Fundamentos & Equipamento", desc: "Do zero ao primeiro mix" },
    { num: "02", title: "Técnicas de Mixagem", desc: "BPM, tom e harmonia" },
    { num: "03", title: "Performance ao Vivo", desc: "Leitura de pista e crowd control" },
    { num: "04", title: "DJ Set Completo", desc: "Monte seu repertório profissional" },
    { num: "05", title: "Marketing & Shows", desc: "Como conseguir seus primeiros bookings" },
    { num: "06", title: "Produção & Software", desc: "Serato, Rekordbox e Pioneer" },
  ];

  return (
    <main className="min-h-screen bg-[#020408]">

      {/* ── BARRA DE URGÊNCIA NO TOPO ────────────────────────────────────── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        background: "linear-gradient(90deg, #dc2626, #b91c1c)",
        padding: "8px 16px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, flexWrap: "wrap",
        boxShadow: "0 2px 20px rgba(220,38,38,0.5)",
      }}>
        <span style={{ color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2 }}>
          🔥 OFERTA ESPECIAL TERMINA EM:
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[h, m, sec].map((v, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{
                background: "#000", color: "#ef4444", fontFamily: "'Bebas Neue', cursive",
                fontSize: 22, padding: "2px 8px", borderRadius: 4, minWidth: 36, textAlign: "center",
                boxShadow: "0 0 8px rgba(239,68,68,0.6)",
              }}>{v}</span>
              {i < 2 && <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>:</span>}
            </span>
          ))}
        </div>
        <span style={{ color: "#fca5a5", fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1 }}>
          · APENAS {vagas} VAGAS RESTANTES
        </span>
      </div>

      {/* ── NOTIFICAÇÃO DE COMPRA (canto inferior esquerdo) ─────────────── */}
      <div style={{
        position: "fixed", bottom: 24, left: 20, zIndex: 9998,
        transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        transform: notif ? "translateX(0) scale(1)" : "translateX(-140%) scale(0.8)",
        opacity: notif ? 1 : 0,
        pointerEvents: "none",
      }}>
        <div style={{
          background: "#0d1117", border: "1px solid rgba(0,245,255,0.25)",
          borderRadius: 12, padding: "12px 16px", maxWidth: 280,
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,245,255,0.1)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #00f5ff, #0066ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🎧</div>
          <div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
              {notif?.nome} de {notif?.cidade}
            </div>
            <div style={{ color: "rgba(0,245,255,0.8)", fontSize: 11, fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
              acabou de comprar o {notif?.plano}
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 2 }}>
              agora mesmo · via PIX
            </div>
          </div>
        </div>
      </div>
      {/* NAV */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#020408]/95 backdrop-blur-md border-b border-cyan-400/10"
            : "bg-transparent"
        }`}
        style={{ top: 42 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-2xl tracking-widest text-white">
            DJ <span className="text-cyan-400 glow-cyan">SIMON</span> TELINI
          </span>
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollTo("pack")}
              className="text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
            >
              PACK
            </button>
            <button
              onClick={() => scrollTo("curso")}
              className="text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
            >
              CURSO
            </button>
            <button
              onClick={() => scrollTo("depoimentos")}
              className="text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
            >
              DEPOIMENTOS
            </button>
            <button
              onClick={() => scrollTo("inscricao")}
              className="btn-cta text-sm px-4 py-2"
              style={{ fontSize: "0.9rem" }}
            >
              GARANTIR VAGA
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center grid-bg overflow-hidden px-6">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-400/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-400/8 blur-[100px] animate-pulse" style={{ animationDelay: "1.5s" }} />

        {/* Scanline */}
        <div
          className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none"
          style={{ animation: "scan 6s linear infinite" }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="tag-cyan inline-block mb-6">
           ACESSO EXCLUSIVO — VAGAS LIMITADAS
          </div>

          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-none mb-4">
            <span className="block text-white">TORNE-SE UM</span>
            <span className="block text-cyan-400 glow-cyan animate-[glow_3s_ease-in-out_infinite_alternate]">
              DJ PROFISSIONAL
            </span>
          </h1>

          <WaveForm bars={30} />

          <p className="mt-6 text-white/70 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Com o{" "}
            <span className="text-cyan-400 font-semibold">Pack de Músicas</span>{" "}
            mais completo do Brasil e o{" "}
            <span className="text-cyan-400 font-semibold">Curso de DJ</span>{" "}
            com Simon Telini — do zero ao palco profissional.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollTo("inscricao")}
              className="btn-cta text-xl px-8 py-4"
            >
              QUERO COMEÇAR AGORA
            </button>
            <button
              onClick={() => scrollTo("pack")}
              className="btn-secondary flex items-center gap-2 justify-center"
            >
              <Play className="w-4 h-4" /> VER CONTEÚDO
            </button>
          </div>

          {/* Social proof mini */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            ))}
            <span className="text-white/50 text-sm ml-2">
              +10.000 alunos satisfeitos
            </span>
          </div>
        </div>

        <button
          onClick={() => scrollTo("stats")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cyan-400/50 hover:text-cyan-400 transition-colors animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* STATS */}
      <section id="stats" className="py-20 border-y border-cyan-400/10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { n: 10000, s: "+", label: "Alunos Formados" },
            { n: 500, s: "+", label: "Músicas no Pack" },
            { n: 6, s: "", label: "Módulos do Curso" },
            { n: 98, s: "%", label: "Aprovação" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <CountUp target={stat.n} suffix={stat.s} />
              <span className="text-white/50 font-mono text-sm uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* PACK */}
      <section id="pack" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag-cyan inline-block mb-4"> PACK DE MÚSICAS</div>
            <h2 className="font-display text-5xl md:text-7xl text-white">
              O ARSENAL DO{" "}
              <span className="text-cyan-400 glow-cyan">DJ PROFISSIONAL</span>
            </h2>
            <p className="mt-4 text-white/60 max-w-xl mx-auto">
              Mais de 500 sets, samples, intros e acapellas curados por Simon
              Telini para você arrasar em qualquer pista.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Visual */}
            <div className="relative">
              <div className="card-dark rounded-none p-8 glow-box relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-6">
                  <Music className="text-cyan-400 w-6 h-6" />
                  <span className="font-mono text-cyan-400 text-sm">PACK_PRO_V7.ZIP</span>
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Sets Prontos", pct: 95 },
                    { label: "Qualidade 320kbps", pct: 100 },
                    { label: "Atualização Semanal", pct: 100 },
                    { label: "Exclusividade", pct: 88 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">{item.label}</span>
                        <span className="text-cyan-400 font-mono">{item.pct}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${item.pct}%`, boxShadow: "0 0 8px #00f5ff" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <WaveForm bars={24} />
              </div>
            </div>

            {/* List */}
            <div>
              <ul className="space-y-4 mb-8">
                {packItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="text-cyan-400 w-5 h-5 mt-0.5 shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => scrollTo("inscricao")}
                className="btn-cta"
              >
                QUERO O PACK COMPLETO
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-cyan" />

      {/* CURSO */}
      <section id="curso" className="py-24 px-6 grid-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag-cyan inline-block mb-4"> CURSO DE DJ</div>
            <h2 className="font-display text-5xl md:text-7xl text-white">
              DO ZERO AO{" "}
              <span className="text-cyan-400 glow-cyan">PALCO</span>
            </h2>
            <p className="mt-4 text-white/60 max-w-xl mx-auto">
              6 módulos densos com Simon Telini cobrindo tudo: técnica,
              performance, marketing e equipamento.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseModules.map((mod) => (
              <div key={mod.num} className="card-dark p-6 rounded-none relative overflow-hidden group">
                <div className="absolute top-4 right-4 font-display text-6xl text-cyan-400/5 group-hover:text-cyan-400/10 transition-colors">
                  {mod.num}
                </div>
                <span className="font-mono text-cyan-400 text-xs mb-3 block">
                  MÓDULO {mod.num}
                </span>
                <h3 className="font-display text-2xl text-white mb-2">
                  {mod.title}
                </h3>
                <p className="text-white/50 text-sm">{mod.desc}</p>
              </div>
            ))}
          </div>

          {/* Bonus */}
          <div className="mt-12 card-dark p-8 rounded-none border-cyan-400/30">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-cyan-400 w-6 h-6" />
              <span className="font-display text-2xl text-cyan-400">
                BÔNUS EXCLUSIVOS
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: <Headphones className="w-5 h-5" />, title: "Grupo VIP WhatsApp", desc: "Suporte direto com Simon" },
                { icon: <TrendingUp className="w-5 h-5" />, title: "Mentoria em Grupo", desc: "Sessões ao vivo mensais" },
                { icon: <Shield className="w-5 h-5" />, title: "7 Dias de Garantia", desc: "Reembolso sem burocracia" },
              ].map((b) => (
                <div key={b.title} className="flex gap-3">
                  <div className="text-cyan-400 mt-0.5 shrink-0">{b.icon}</div>
                  <div>
                    <p className="font-semibold text-white">{b.title}</p>
                    <p className="text-white/50 text-sm">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag-cyan inline-block mb-4"> DEPOIMENTOS</div>
            <h2 className="font-display text-5xl md:text-7xl text-white">
              QUEM JÁ{" "}
              <span className="text-cyan-400 glow-cyan">TRANSFORMOU</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card-dark p-6 rounded-none">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                  ))}
                </div>
                <p className="text-white/80 mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-white/40 text-sm font-mono">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING / INSCRIPTION */}
      <section id="inscricao" className="py-24 px-6 grid-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag-cyan inline-block mb-4"> ESCOLHA SEU PLANO</div>
            <h2 className="font-display text-5xl md:text-7xl text-white">
              INVISTA NO SEU{" "}
              <span className="text-cyan-400 glow-cyan">FUTURO</span>
            </h2>
            <p className="mt-4 text-white/60">
              Escolha o plano ideal e garanta sua vaga agora.
            </p>
            {/* Barra de escassez */}
            <div className="mt-6 inline-flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-sm font-mono text-red-400">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Apenas <strong>{vagas} vagas</strong> disponíveis neste preço
              </div>
              <div style={{ width: 240, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99 }}>
                <div style={{
                  width: `${((7 - vagas) / 7) * 100 + 14}%`,
                  height: "100%", borderRadius: 99,
                  background: "linear-gradient(90deg, #ef4444, #dc2626)",
                  boxShadow: "0 0 8px rgba(239,68,68,0.6)",
                  transition: "width 1s ease",
                }} />
              </div>
              <div className="text-xs text-white/30 font-mono">{100 - Math.round(((7 - vagas) / 7) * 100 + 14)}% das vagas já foram preenchidas</div>
            </div>
          </div>

          {/* Plan selector */}
          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {(["pack", "curso", "ambos"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePlan(p)}
                className={`font-display text-lg px-6 py-2 tracking-widest transition-all clip-path-[polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)] ${
                  activePlan === p
                    ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,245,255,0.5)]"
                    : "border border-cyan-400/30 text-cyan-400 hover:border-cyan-400/70"
                }`}
                style={{
                  clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                }}
              >
                {p === "pack" ? "PACK" : p === "curso" ? "CURSO" : "COMBO"}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Price card */}
            <div className="card-dark p-8 rounded-none glow-box text-center">
              {activePlan === "pack" && (
                <>
                  <div className="tag-cyan inline-block mb-4"> PACK PRO</div>
                  <div className="font-display text-7xl text-white mb-1">R$97</div>
                  <p className="text-white/40 text-sm mb-6 font-mono">acesso vitalício</p>
                  <ul className="text-left space-y-3 mb-8">
                    {packItems.map((i) => (
                      <li key={i} className="flex gap-2 text-white/70 text-sm">
                        <CheckCircle2 className="text-cyan-400 w-4 h-4 mt-0.5 shrink-0" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {activePlan === "curso" && (
                <>
                  <div className="tag-cyan inline-block mb-4">🎧 CURSO COMPLETO</div>
                  <div className="font-display text-7xl text-white mb-1">R$197</div>
                  <p className="text-white/40 text-sm mb-6 font-mono">acesso por 1 ano</p>
                  <ul className="text-left space-y-3 mb-8">
                    {courseModules.map((m) => (
                      <li key={m.num} className="flex gap-2 text-white/70 text-sm">
                        <CheckCircle2 className="text-cyan-400 w-4 h-4 mt-0.5 shrink-0" />
                        Módulo {m.num}: {m.title}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {activePlan === "ambos" && (
                <>
                  <div className="tag-cyan inline-block mb-4"> COMBO COMPLETO</div>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <span className="font-display text-3xl text-white/30 line-through">R$294</span>
                    <div className="font-display text-7xl text-cyan-400 glow-cyan">R$247</div>
                  </div>
                  <p className="text-cyan-400 text-sm mb-2 font-mono">você economiza R$47</p>
                  <p className="text-white/40 text-sm mb-6 font-mono">pack vitalício + curso 1 ano</p>
                  <ul className="text-left space-y-3 mb-8">
                    {[...packItems.slice(0, 3), ...courseModules.slice(0, 3).map(m => `Módulo ${m.num}: ${m.title}`), "Grupo VIP", "7 dias de garantia"].map((i) => (
                      <li key={i} className="flex gap-2 text-white/70 text-sm">
                        <CheckCircle2 className="text-cyan-400 w-4 h-4 mt-0.5 shrink-0" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="flex items-center justify-center gap-2 text-white/30 text-xs font-mono">
                <Shield className="w-3 h-3" />
                7 dias de garantia incondicional
              </div>
            </div>

            {/* Buy */}
            <div className="card-dark p-8 rounded-none flex flex-col justify-between">
              <div>
                <h3 className="font-display text-3xl text-white mb-2">
                  GARANTA SUA VAGA
                </h3>
                <p className="text-white/50 text-sm mb-6">
                  Pagamento 100% seguro via PIX ou cartão. Acesso liberado em minutos.
                </p>
                <ul className="space-y-3 mb-8">
                  {["Acesso imediato após pagamento", "7 dias de garantia incondicional", "Suporte direto no WhatsApp", "Pagamento via PIX ou cartão"].map(item => (
                    <li key={item} className="flex gap-2 text-white/70 text-sm">
                      <CheckCircle2 className="text-cyan-400 w-4 h-4 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setModalPlano(activePlan)}
                  className="btn-cta w-full text-lg py-4"
                >
                   QUERO GARANTIR AGORA
                </button>
                <p className="text-center text-white/30 text-xs font-mono">
                  7 dias de garantia incondicional
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-white">
              DÚVIDAS <span className="text-cyan-400">FREQUENTES</span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Preciso de equipamento para começar?", a: "Não! O curso começa do zero e você aprende com o software no computador antes de investir em hardware." },
              { q: "O pack funciona em quais softwares?", a: "Compatível com Serato, Rekordbox, VirtualDJ e qualquer player que suporte MP3/WAV." },
              { q: "Como recebo o acesso após o pagamento?", a: "O acesso é liberado automaticamente em até 5 minutos após a confirmação do pagamento." },
              { q: "E se eu não gostar?", a: "Você tem 7 dias corridos para solicitar reembolso total sem precisar dar nenhuma explicação." },
            ].map((faq) => (
              <details key={faq.q} className="card-dark p-6 rounded-none group">
                <summary className="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-cyan-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-white/60 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 text-center grid-bg border-t border-cyan-400/10">
        <div className="max-w-2xl mx-auto">
          <WaveForm bars={20} />
          <h2 className="font-display text-6xl md:text-8xl text-white mt-6 mb-4">
            SUA HORA É{" "}
            <span className="text-cyan-400 glow-cyan">AGORA</span>
          </h2>
          <p className="text-white/60 mb-8">
            Vagas limitadas. Junte-se a mais de 10.000 DJs que já transformaram suas carreiras.
          </p>
          <button onClick={() => scrollTo("inscricao")} className="btn-cta text-xl px-10 py-5">
            GARANTIR MINHA VAGA
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-cyan-400/10 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-display text-xl tracking-widest text-white/50">
            DJ <span className="text-cyan-400/70">SIMON TELINI</span>
          </span>
          <div className="flex gap-4">
            <a href="#" className="text-white/30 hover:text-cyan-400 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/30 hover:text-cyan-400 transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
          <p className="text-white/20 text-xs font-mono text-center">
            © 2025 DJ Simon Telini. Todos os direitos reservados.
          </p>
        </div>
      </footer>
      {modalPlano && (
        <PagamentoModal
          plano={modalPlano}
          onClose={() => setModalPlano(null)}
        />
      )}
    </main>
  );
}
