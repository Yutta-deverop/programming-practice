import { NextResponse } from "next/server";

import { getProblem } from "@/data/problems";
import { SarashinaError, isJudgeModel, judgeCode } from "@/lib/sarashina";
import type { JudgeErrorResponse, JudgeResponse } from "@/lib/judge-types";

export const runtime = "nodejs";
// Sarashina は日本国外からのアクセスを拒否するため、東京リージョンで実行する
export const preferredRegion = "hnd1";
export const maxDuration = 60;

const MAX_CODE_LENGTH = 20_000;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

/** 同一インスタンス内での簡易レート制限（サーバレスでは完璧ではないが連打対策） */
const hits = new Map<string, number[]>();

function rateLimited(key: string): number {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    const oldest = recent[0];
    return Math.ceil((RATE_WINDOW_MS - (now - oldest)) / 1000);
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t > RATE_WINDOW_MS)) hits.delete(k);
    }
  }
  return 0;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || request.headers.get("x-real-ip") || "local";
}

function errorResponse(status: number, error: string, detail?: string, retryAfterSeconds?: number) {
  return NextResponse.json<JudgeErrorResponse>(
    { error, detail, retryAfterSeconds },
    {
      status,
      headers: retryAfterSeconds
        ? { "Retry-After": String(retryAfterSeconds) }
        : undefined,
    },
  );
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(400, "リクエストの形式が不正です");
  }

  const { problemId, code, model } = (payload ?? {}) as {
    problemId?: string;
    code?: string;
    model?: string;
  };

  if (typeof problemId !== "string" || typeof code !== "string") {
    return errorResponse(400, "problemId と code を指定してください");
  }
  if (code.length > MAX_CODE_LENGTH) {
    return errorResponse(400, `コードが長すぎます（${MAX_CODE_LENGTH}文字まで）`);
  }
  if (!code.trim()) {
    return errorResponse(400, "コードが空です");
  }

  const problem = getProblem(problemId);
  if (!problem) {
    return errorResponse(404, "指定された問題が見つかりません");
  }

  if (model !== undefined && !isJudgeModel(model)) {
    return errorResponse(400, "利用できないモデルが指定されました");
  }

  const wait = rateLimited(clientKey(request));
  if (wait > 0) {
    return errorResponse(
      429,
      `短時間に送信しすぎです。${wait}秒ほど待ってからお試しください。`,
      undefined,
      wait,
    );
  }

  try {
    const { result, model: usedModel, usage } = await judgeCode(problem, code, {
      model: isJudgeModel(model) ? model : undefined,
    });
    return NextResponse.json<JudgeResponse>({ result, model: usedModel, usage });
  } catch (error) {
    if (error instanceof SarashinaError) {
      return errorResponse(
        error.status >= 400 && error.status < 600 ? error.status : 502,
        error.message,
        undefined,
        error.retryAfterSeconds,
      );
    }
    console.error("[judge] unexpected error", error);
    return errorResponse(500, "判定中に予期しないエラーが発生しました");
  }
}
