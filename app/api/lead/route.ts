import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = process.env.FROM_EMAIL || "DJ Simon <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, plano } = await req.json();

    if (!nome || !email || !senha || !plano) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const planoLabel: Record<string, string> = {
      pack: "Pack Pro",
      curso: "Curso Completo",
      ambos: "Combo Completo (Pack + Curso)",
    };

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#020408;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020408;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#060d14;border:1px solid rgba(0,245,255,0.15);border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#060d14;padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(0,245,255,0.1);">
            <div style="font-size:11px;color:rgba(0,245,255,0.6);letter-spacing:6px;font-family:monospace;margin-bottom:8px;">// ACESSO LIBERADO</div>
            <div style="font-size:42px;font-weight:900;letter-spacing:8px;color:#ffffff;">DJ <span style="color:#00f5ff;">SIMON</span></div>
            <div style="margin-top:16px;height:1px;background:linear-gradient(90deg,transparent,#00f5ff,transparent);"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:rgba(255,255,255,0.8);font-size:16px;margin:0 0 8px;">Olá, <strong style="color:#fff;">${nome}</strong></p>
            <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7;margin:0 0 28px;">Seu acesso à plataforma foi criado com sucesso. Abaixo estão seus dados de login:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,245,255,0.04);border:1px solid rgba(0,245,255,0.15);border-radius:8px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <div style="margin-bottom:16px;">
                  <div style="font-size:10px;color:rgba(0,245,255,0.5);letter-spacing:2px;font-family:monospace;margin-bottom:4px;">PLANO</div>
                  <div style="font-size:14px;color:#00f5ff;font-weight:700;">${planoLabel[plano] || plano}</div>
                </div>
                <div style="margin-bottom:16px;">
                  <div style="font-size:10px;color:rgba(0,245,255,0.5);letter-spacing:2px;font-family:monospace;margin-bottom:4px;">EMAIL</div>
                  <div style="font-size:14px;color:#fff;font-family:monospace;">${email}</div>
                </div>
                <div>
                  <div style="font-size:10px;color:rgba(0,245,255,0.5);letter-spacing:2px;font-family:monospace;margin-bottom:4px;">SENHA</div>
                  <div style="font-size:14px;color:#fff;font-family:monospace;">${senha}</div>
                </div>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td align="center">
                <a href="https://dj-simon.vercel.app/membro/login" style="display:inline-block;background:#00f5ff;color:#000;font-weight:800;font-size:14px;letter-spacing:3px;padding:14px 36px;border-radius:6px;text-decoration:none;font-family:monospace;">ACESSAR PLATAFORMA</a>
              </td></tr>
            </table>
            <p style="color:rgba(255,255,255,0.35);font-size:12px;line-height:1.7;margin:0;">Guarde seus dados em local seguro. Dúvidas? Fale pelo WhatsApp.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;font-family:monospace;margin:0;">© 2025 DJ Simon Telini — Todos os direitos reservados</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: "Seu acesso a plataforma DJ Simon esta pronto",
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message || "Erro ao enviar email" }, { status: 500 });
    return NextResponse.json({ success: true, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
