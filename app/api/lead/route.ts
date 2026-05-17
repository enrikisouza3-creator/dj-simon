import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side key for writes
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, interest } = body;

    if (!name || !email || !phone || !interest) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
    }

    // Validate interest
    if (!["pack", "curso", "ambos"].includes(interest)) {
      return NextResponse.json({ error: "Interesse inválido." }, { status: 400 });
    }

    const { error } = await supabase.from("leads").insert([
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        interest,
        source: req.headers.get("referer") || "direct",
        utm_source: req.nextUrl.searchParams.get("utm_source"),
        utm_medium: req.nextUrl.searchParams.get("utm_medium"),
        utm_campaign: req.nextUrl.searchParams.get("utm_campaign"),
      },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Erro ao salvar lead." }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
