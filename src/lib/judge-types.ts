export type Verdict = "correct" | "mostly_correct" | "incorrect";

export type IssueSeverity = "error" | "warning" | "nit";

export interface JudgeIssue {
  severity: IssueSeverity;
  line: number | null;
  code: string;
  message: string;
  fix_hint: string;
}

export interface OutputCheck {
  expected: string[];
  actual: string[];
  match: boolean;
}

export interface JudgeResult {
  verdict: Verdict;
  score: number;
  summary: string;
  good_points: string[];
  issues: JudgeIssue[];
  output_check: OutputCheck | null;
  hint: string;
  model_answer_note: string;
}

export interface JudgeResponse {
  result: JudgeResult;
  model: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

export interface JudgeErrorResponse {
  error: string;
  detail?: string;
  retryAfterSeconds?: number;
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  correct: "正解",
  mostly_correct: "あと少し",
  incorrect: "不正解",
};

export function isJudgeResult(value: unknown): value is JudgeResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    (v.verdict === "correct" ||
      v.verdict === "mostly_correct" ||
      v.verdict === "incorrect") &&
    typeof v.score === "number" &&
    typeof v.summary === "string" &&
    Array.isArray(v.good_points) &&
    Array.isArray(v.issues)
  );
}
