/**
 * 判定に使えるモデルの一覧（クライアント・サーバー共用）。
 * ここには API キーやプロンプトなど、公開したくない情報を置かないこと。
 */

export const JUDGE_MODELS = {
  "sarashina3-mini": { label: "sarashina3-mini（推奨）", maxCompletionTokens: 4000 },
  "sarashina3-nano": { label: "sarashina3-nano（高速）", maxCompletionTokens: 3000 },
} as const;

export type JudgeModel = keyof typeof JUDGE_MODELS;

export const DEFAULT_JUDGE_MODEL: JudgeModel = "sarashina3-mini";

export function isJudgeModel(value: unknown): value is JudgeModel {
  return typeof value === "string" && value in JUDGE_MODELS;
}
