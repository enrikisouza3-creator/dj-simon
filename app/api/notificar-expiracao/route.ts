import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = process.env.FROM_EMAIL || "DJ Simon <onboarding@resend.dev>";

// Esta rota deve ser chamada por um cron job (ex: Vercel Cron) 1x por dia
// Adicione no vercel.json: { "crons": [{ "path": "/api/notificar-expiracao", "schedule": "0 10 * * *" }] }
export async function GET(req: NextRequest) {
  // Verifica secret para segurança
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const em7dias = new Date();
  em7dias.setDate(em7dias.getDate() + 7);
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);

  // Busca membros que expiram em exatamente 7 dias ou 1 dia
  const { data: membros, error } = await supabase
    .from("members")
    .select("name, email, plan, expires_at")
    .eq("active", true)
    .not("expires_at", "is", null)
    .gte("expires_at", amanha.toISOString())
    .lte("expires_at", em7dias.toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!membros?.length) return NextResponse.json({ sent: 0 });

  const PLANO_LABEL: Record<string, string> = {
    pack: "Pack Pro", curso: "Curso Completo", ambos: "Combo Completo",
  };

  let sent = 0;
  for (const m of membros) {
    const expDate = new Date(m.expires_at);
    const diasRestantes = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#020408;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020408;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#060d14;border:1px solid rgba(0,245,255,0.15);border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#060d14;padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(245,158,11,0.2);">
            <div style="font-size:11px;color:rgba(245,158,11,0.8);letter-spacing:6px;font-family:monospace;margin-bottom:8px;">// AVISO DE EXPIRAÇÃO</div>
            <div style="font-size:42px;font-weight:900;letter-spacing:8px;color:#ffffff;">DJ <span style="color:#00f5ff;">SIMON</span></div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:rgba(255,255,255,0.8);font-size:16px;margin:0 0 8px;">Olá, <strong style="color:#fff;">${m.name}</strong></p>
            <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7;margin:0 0 24px;">
              Seu acesso ao <strong style="color:#f59e0b;">${PLANO_LABEL[m.plan] || m.plan}</strong> expira em 
              <strong style="color:#f59e0b;">${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}</strong> 
              (${expDate.toLocaleDateString("pt-BR")}).
            </p>
            <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="color:#f59e0b;font-size:13px;margin:0;">
                Para não perder o acesso, entre em contato pelo WhatsApp para renovar seu plano.
              </p>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://dj-simon.vercel.app/membro/login" style="display:inline-block;background:#00f5ff;color:#000;font-weight:800;font-size:14px;letter-spacing:3px;padding:14px 36px;border-radius:6px;text-decoration:none;font-family:monospace;">
                  ACESSAR PLATAFORMA
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;font-family:monospace;margin:0;">© 2025 DJ Simon Telini</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: m.email,
        subject: `Seu acesso DJ Simon expira em ${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}`,
        html,
      }),
    });

    if (res.ok) sent++;
  }

  return NextResponse.json({ sent, total: membros.length });
}
