import type { Problem } from "@/data/problems";
import type { JudgeIssue, JudgeResult, OutputCheck, Verdict } from "@/lib/judge-types";
import { JUDGE_MODELS, type JudgeModel } from "@/lib/models";

const DEFAULT_ENDPOINT = "https://api.sarashina.ai/v1/chat/completions";

export { JUDGE_MODELS, isJudgeModel } from "@/lib/models";

export class SarashinaError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = "SarashinaError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["correct", "mostly_correct", "incorrect"] },
    score: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    good_points: { type: "array", items: { type: "string" } },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["error", "warning", "nit"] },
          line: { type: "integer", minimum: 0 },
          code: { type: "string" },
          message: { type: "string" },
          fix_hint: { type: "string" },
        },
        required: ["severity", "line", "code", "message", "fix_hint"],
        additionalProperties: false,
      },
    },
    output_check: {
      type: "object",
      properties: {
        actual: { type: "string" },
        match: { type: "boolean" },
      },
      required: ["actual", "match"],
      additionalProperties: false,
    },
    hint: { type: "string" },
    model_answer_note: { type: "string" },
  },
  required: [
    "verdict",
    "score",
    "summary",
    "good_points",
    "issues",
    "output_check",
    "hint",
    "model_answer_note",
  ],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `あなたは大学1年生向け「C言語プログラミング入門」の採点者です。学生が書いたCプログラムを読み、問題の要件を満たしているかを判定して、日本語で解説します。

# 判定の基本方針（最重要）
- この演習の解答は1つではありません。模範解答と書き方が違っても、問題文の要件を満たしていれば「正解」です。
- 変数名、printf の文言や順番、桁指定（%4d など）、計算の順序、printf を分けるかまとめるか等は、問題文で指定されていない限り減点しません。
- 次の場合は減点・不正解の対象です。
  1. 計算式が違う（単価・公式・係数の誤り）
  2. 入力の読み取り方が違う（scanf の個数・順番・& 忘れ）
  3. 必要な値が表示されない、または値が大きく違う
  4. 型の誤りで結果が変わる（整数除算、scanf の %lf と %f の取り違え、%d で実数を表示 等）
  5. コード部分に全角文字（全角スペース・全角記号）が混入している
  6. コンパイルできない明確な文法エラー（セミコロン漏れ、波カッコの不一致、宣言していない変数）
- 実行環境はありません。コードを1行ずつ手で追い、与えられた入力例での出力を求めてください。計算は正確に。
- 指摘は人格ではなくコードに向け、初心者が次に何をすればよいかが分かる言葉で書いてください。good_points には必ず1つ以上、できていることを書いてください。
- 問題文に「自由課題」とある場合、内容の良し悪しは問わず、printf で意図したものが表示できていれば正解です。

# 出力
指定されたJSONスキーマのみを出力してください。前後に説明文やMarkdownのコードフェンスを付けないでください。
issues が無い場合は空配列にしてください。line は該当する行番号（1始まり、特定できない場合は0）です。
score は verdict と必ず整合させてください（correct: 90〜100、mostly_correct: 50〜89、incorrect: 0〜49）。
output_check.actual には、入力例を入力したときに学生のコードが表示する内容を、1つの文字列として書いてください。複数行になる場合は改行（\\n）で区切り、空白だけの行を繰り返さないでください。期待される出力をそのまま書き写す必要はありません（expected は不要です）。

# 長さ
- 全体を簡潔にまとめてください（応答が長いと時間切れになります）。
- good_points は最大3件、各1文。
- issues は重要なもの最大3件。code は該当行の抜粋のみ（1行）、message と fix_hint はそれぞれ1〜2文（おおむね120文字以内）。
- summary と hint はそれぞれ2〜3文。model_answer_note は1文。`;

function expectedBlock(problem: Problem): string {
  if (problem.expected.length === 0) {
    return "（決まった正解出力はありません。自由な表現を許容してください）";
  }
  return ["```text", ...problem.expected, "```"].join("\n");
}

function referenceBlock(problem: Problem): string {
  if (problem.references.length === 0) {
    return "（この課題には模範解答ファイルがありません。自由課題として判定してください）";
  }
  return problem.references
    .map((ref) => `### ${ref.filename}\n\`\`\`c\n${ref.code}\n\`\`\``)
    .join("\n\n");
}

function buildUserPrompt(problem: Problem, code: string): string {
  return `## 問題
${problem.label}：${problem.title}

${problem.statement}

## 入力
${problem.inputSpec ?? "入力なし（プログラム内で値を決める）"}
${problem.sampleInput ? `\n入力例: \`${problem.sampleInput}\`` : ""}

## 期待される出力（入力例に対する値）
${expectedBlock(problem)}

※表示の文言・桁指定・並び順は自由です。値と意味が合っていれば正解です。
※上のブロックは、画面に表示される文字そのものです（行頭の記号や引用符は含みません）。

## 採点チェックリスト
${problem.checkpoints.map((c) => `- ${c}`).join("\n")}

## よくある間違い
${problem.commonMistakes.map((c) => `- ${c}`).join("\n")}

## 関連する授業ノートの要点
- コード部分に全角文字を書かない（文字列リテラル・コメントの中は可）
- 文末にはセミコロン ;
- 波カッコ { } は必ず対にする
- 実数は double 型。scanf は %lf、printf は %f
- 整数同士の割り算は切り捨てになる（必要なら (double) でキャスト、または 2.0 で割る）
- 数学関数を使うときは #include <math.h>

## 解答例（参考。これと同じでなくてもよい）
${referenceBlock(problem)}

## 学生のコード（${code.split("\n").length}行）
\`\`\`c
${code}
\`\`\`

この学生のコードを判定し、指定のJSONスキーマで返してください。`;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function normalizeIssue(value: unknown): JudgeIssue | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const severity =
    v.severity === "error" || v.severity === "warning" || v.severity === "nit"
      ? v.severity
      : "warning";
  const message = typeof v.message === "string" ? v.message : "";
  if (!message) return null;
  return {
    severity,
    line: typeof v.line === "number" && v.line > 0 ? Math.round(v.line) : null,
    code: typeof v.code === "string" ? v.code : "",
    message,
    fix_hint: typeof v.fix_hint === "string" ? v.fix_hint : "",
  };
}

export function normalizeJudgeResult(value: unknown): JudgeResult {
  const v = (value ?? {}) as Record<string, unknown>;
  const verdict: Verdict =
    v.verdict === "correct" || v.verdict === "mostly_correct" || v.verdict === "incorrect"
      ? v.verdict
      : "incorrect";
  const rawScore =
    typeof v.score === "number" && Number.isFinite(v.score)
      ? Math.max(0, Math.min(100, Math.round(v.score)))
      : null;
  // モデルが verdict と矛盾する点数を返すことがあるため、判定に合わせて補正する
  const score =
    verdict === "correct"
      ? Math.max(rawScore ?? 100, 90)
      : verdict === "mostly_correct"
        ? Math.min(Math.max(rawScore ?? 70, 50), 89)
        : Math.min(rawScore ?? 30, 49);

  const issues = Array.isArray(v.issues)
    ? v.issues.map(normalizeIssue).filter((i): i is JudgeIssue => i !== null)
    : [];

  const oc = (v.output_check ?? {}) as Record<string, unknown>;
  const actualText =
    typeof oc.actual === "string" ? oc.actual.replace(/\\n/g, "\n") : "";
  const actual = actualText.split(/\r?\n/).map((line) => line.replace(/\s+$/, ""));
  while (actual.length > 0 && actual[actual.length - 1] === "") actual.pop();
  const output_check: OutputCheck | null =
    actual.length === 0 ? null : { expected: [], actual, match: Boolean(oc.match) };

  return {
    verdict,
    score,
    summary: typeof v.summary === "string" ? v.summary : "",
    good_points: asStringArray(v.good_points),
    issues,
    output_check,
    hint: typeof v.hint === "string" ? v.hint : "",
    model_answer_note: typeof v.model_answer_note === "string" ? v.model_answer_note : "",
  };
}

/**
 * モデルが JSON の文字列の中に生の改行・タブをそのまま書いてしまうことがあるため、
 * 文字列リテラル内の制御文字だけをエスケープして修復する。
 */
function escapeControlCharsInStrings(text: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (const ch of text) {
    if (!inString) {
      if (ch === '"') inString = true;
      out += ch;
      continue;
    }
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      out += ch;
      escaped = true;
    } else if (ch === '"') {
      out += ch;
      inString = false;
    } else if (ch === "\n") {
      out += "\\n";
    } else if (ch === "\r") {
      out += "\\r";
    } else if (ch === "\t") {
      out += "\\t";
    } else {
      out += ch;
    }
  }
  return out;
}

function stripCodeFence(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const candidates: string[] = [];
  const push = (value: string) => {
    const v = value.trim();
    if (v && !candidates.includes(v)) candidates.push(v);
  };

  push(trimmed);
  push(stripCodeFence(trimmed));
  for (const base of [trimmed, stripCodeFence(trimmed)]) {
    const start = base.indexOf("{");
    const end = base.lastIndexOf("}");
    if (start >= 0 && end > start) push(base.slice(start, end + 1));
  }
  // 文字列内の生の改行などをエスケープした版も試す
  for (const base of [...candidates]) {
    push(escapeControlCharsInStrings(base));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // 末尾カンマだけなら除去して再挑戦
      try {
        return JSON.parse(candidate.replace(/,\s*([}\]])/g, "$1"));
      } catch {
        // 次の候補へ
      }
    }
  }

  throw new Error("判定結果をJSONとして読み取れませんでした");
}

interface ChatResponse {
  choices?: {
    message?: { content?: string | null };
    finish_reason?: string | null;
  }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

async function callChat(body: unknown, attempt = 0, timeoutMs = 45_000): Promise<ChatResponse> {
  const apiKey = process.env.SARASHINA_API_KEY;
  if (!apiKey) {
    throw new SarashinaError(
      "SARASHINA_API_KEY が設定されていません。.env.local（公開時はホスティングの環境変数）に設定してください。",
      503,
    );
  }
  const endpoint = process.env.SARASHINA_ENDPOINT ?? DEFAULT_ENDPOINT;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    // Vercel の関数上限（60秒）より内側で打ち切る
    signal: AbortSignal.timeout(timeoutMs),
  }).catch((error: unknown) => {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new SarashinaError(
        "判定に時間がかかりすぎました。通信状況を確認して、もう一度お試しください。",
        504,
      );
    }
    throw new SarashinaError(
      "Sarashina API に接続できませんでした。ネットワーク接続を確認してください。",
      502,
    );
  });

  if (res.status === 429) {
    if (attempt < 1) {
      await new Promise((r) => setTimeout(r, 3000));
      return callChat(body, attempt + 1, timeoutMs);
    }
    throw new SarashinaError(
      "APIのレート制限（1分あたりの回数）に達しました。少し待ってからもう一度お試しください。",
      429,
      30,
    );
  }

  if (res.status === 403) {
    throw new SarashinaError(
      "Sarashina API がアクセスを拒否しました（日本国外からのアクセスは403になります）",
      403,
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new SarashinaError(
      `Sarashina API エラー（HTTP ${res.status}）`,
      res.status === 503 ? 503 : 502,
      0,
    );
  }

  return (await res.json()) as ChatResponse;
}

export interface JudgeOptions {
  model?: JudgeModel;
}

/** 判定結果のパースに失敗したときの手がかりをログに残す（開発時のみ）。 */
function logParseFailure(params: {
  attempt: number;
  model: string;
  finishReason: string | null;
  content: string;
}): void {
  if (process.env.NODE_ENV === "production") return;
  const { attempt, model, finishReason, content } = params;
  console.error("[judge] JSON parse failed", {
    attempt,
    model,
    finishReason,
    length: content.length,
    head: content.slice(0, 300),
    tail: content.slice(-300),
  });
}

function buildJudgeBody(
  problem: Problem,
  code: string,
  model: JudgeModel,
  maxCompletionTokens: number,
  temperature: number,
) {
  return {
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(problem, code) },
    ],
    temperature,
    top_p: 1,
    frequency_penalty: 0.3,
    max_completion_tokens: maxCompletionTokens,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "c_judgement",
        schema: SCHEMA,
        strict: true,
      },
    },
  };
}

export async function judgeCode(
  problem: Problem,
  code: string,
  options: JudgeOptions = {},
): Promise<{ result: JudgeResult; model: string; usage?: ChatResponse["usage"] }> {
  const model: JudgeModel = options.model ?? "sarashina3-mini";
  const baseTokens = JUDGE_MODELS[model].maxCompletionTokens;

  // Vercel の関数上限（60秒）を超えないよう、残り時間を見てリトライ可否を決める
  const budgetMs = 52_000;
  const started = Date.now();
  let lastError: SarashinaError | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const remaining = budgetMs - (Date.now() - started);
    if (remaining < 15_000) break;

    // 2回目は出力上限を増やし、温度も上げて同じ崩れ方を繰り返さないようにする
    const maxCompletionTokens = baseTokens + attempt * 1200;
    const body = buildJudgeBody(
      problem,
      code,
      model,
      maxCompletionTokens,
      attempt === 0 ? 0.2 : 0.6,
    );
    const data = await callChat(body, 0, Math.min(45_000, remaining));
    const content = data.choices?.[0]?.message?.content ?? "";
    const finishReason = data.choices?.[0]?.finish_reason ?? null;

    if (!content.trim()) {
      throw new SarashinaError("Sarashina API から空の応答が返りました", 502);
    }

    try {
      const parsed = extractJson(content);
      const result = normalizeJudgeResult(parsed);
      // 期待される出力は教材データが正なので、モデルの文字起こしは使わない
      if (problem.expected.length === 0) {
        result.output_check = null;
      } else if (result.output_check) {
        result.output_check.expected = problem.expected;
      }
      return { result, model, usage: data.usage };
    } catch {
      logParseFailure({ attempt, model, finishReason, content });
      lastError = new SarashinaError("判定結果の形式が不正でした。もう一度お試しください。", 502);
    }
  }

  throw lastError ?? new SarashinaError("判定結果の形式が不正でした。もう一度お試しください。", 502);
}
