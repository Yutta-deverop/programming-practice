import { NextResponse } from "next/server";

import { JUDGE_MODELS } from "@/lib/sarashina";

export const runtime = "nodejs";
export const preferredRegion = "hnd1";

export async function GET() {
  const configured = Boolean(process.env.SARASHINA_API_KEY);
  return NextResponse.json(
    {
      ok: configured,
      apiKeyConfigured: configured,
      endpoint: process.env.SARASHINA_ENDPOINT ?? "https://api.sarashina.ai/v1/chat/completions",
      models: Object.entries(JUDGE_MODELS).map(([id, meta]) => ({ id, label: meta.label })),
      message: configured
        ? "Sarashina API キーは設定されています"
        : "SARASHINA_API_KEY が未設定です。.env.local に設定してください。",
    },
    { status: configured ? 200 : 503 },
  );
}
