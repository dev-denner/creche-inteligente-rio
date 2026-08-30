import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

import { analyzeUnitPressure } from "@/lib/anthropic";

// Needs the Node.js SDK, not Edge.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let context: unknown;
  try {
    context = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  try {
    const analise = await analyzeUnitPressure(context);
    return NextResponse.json({ analise });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Análise com Claude indisponível no momento (chave não configurada neste ambiente)." },
        { status: 503 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Muitas solicitações agora. Tente novamente em instantes." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "Não foi possível gerar a análise agora. Tente novamente mais tarde." },
        { status: 502 },
      );
    }
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "Análise com Claude indisponível no momento (chave não configurada neste ambiente)." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Não foi possível gerar a análise agora. Tente novamente mais tarde." },
      { status: 500 },
    );
  }
}
