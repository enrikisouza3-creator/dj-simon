import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, interest } = await req.json();

    // Validação
    if (!name || !email || !phone || !interest) {
      return NextResponse.json(
        { error: "Dados incompletos. Preencha todos os campos." },
        { status: 400 }
      );
    }

    // Validação de email
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "E-mail inválido." },
        { status: 400 }
      );
    }

    // Validação de plano
    if (!["pack", "curso", "ambos"].includes(interest)) {
      return NextResponse.json(
        { error: "Plano inválido." },
        { status: 400 }
      );
    }

    // Capturar UTM params se existirem
    const referer = req.headers.get("referer") || "";
    const url = new URL(referer);
    const utm_source = url.searchParams.get("utm_source") || null;
    const utm_medium = url.searchParams.get("utm_medium") || null;
    const utm_campaign = url.searchParams.get("utm_campaign") || null;
    const ref_afiliado = typeof window !== "undefined" ? localStorage.getItem("ref_afiliado") : null;

    // Inserir no Supabase
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          name,
          email,
          phone,
          interest,
          source: "landing_page",
          utm_source,
          utm_medium,
          utm_campaign,
        },
      ])
      .select();

    if (error) {
      console.error("[Lead API] Erro ao inserir:", error);
      return NextResponse.json(
        { error: "Erro ao capturar lead. Tente novamente." },
        { status: 500 }
      );
    }

    console.log("[Lead API] Lead capturado:", { name, email, interest });

    return NextResponse.json(
      {
        success: true,
        message: "Lead capturado com sucesso!",
        data,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("[Lead API] Erro inesperado:", e);
    return NextResponse.json(
      { error: "Erro inesperado. Tente novamente." },
      { status: 500 }
    );
  }
}
