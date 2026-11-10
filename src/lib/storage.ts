"use client";

import { useEffect, useState } from "react";

import type { JudgeResult, Verdict } from "@/lib/judge-types";

const STORAGE_KEY = "programming-practice:v1";

export interface Attempt {
  code: string;
  result: JudgeResult;
  model: string;
  at: string;
}

export interface ProgressState {
  version: 1;
  attempts: Record<string, Attempt>;
  tries: Record<string, number>;
  lastProblemId: string | null;
}

const EMPTY: ProgressState = { version: 1, attempts: {}, tries: {}, lastProblemId: null };

let cache: ProgressState | null = null;
const listeners = new Set<() => void>();

function read(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      version: 1,
      attempts: parsed.attempts ?? {},
      tries: parsed.tries ?? {},
      lastProblemId: parsed.lastProblemId ?? null,
    };
  } catch {
    return EMPTY;
  }
}

function write(state: ProgressState) {
  cache = state;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 容量オーバー等は無視 */
    }
  }
  listeners.forEach((fn) => fn());
}

export function getProgress(): ProgressState {
  if (!cache) cache = read();
  return cache;
}

export function subscribeProgress(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function recordAttempt(
  problemId: string,
  code: string,
  result: JudgeResult,
  model: string,
): ProgressState {
  const current = getProgress();
  const next: ProgressState = {
    version: 1,
    attempts: {
      ...current.attempts,
      [problemId]: { code, result, model, at: new Date().toISOString() },
    },
    tries: { ...current.tries, [problemId]: (current.tries[problemId] ?? 0) + 1 },
    lastProblemId: problemId,
  };
  write(next);
  return next;
}

export function setLastProblem(problemId: string) {
  const current = getProgress();
  if (current.lastProblemId === problemId) return;
  write({ ...current, lastProblemId: problemId });
}

export function clearProgress() {
  write({ ...EMPTY, attempts: {}, tries: {} });
}

export function importProgress(json: string): { ok: boolean; message: string } {
  try {
    const parsed = JSON.parse(json) as Partial<ProgressState>;
    if (!parsed || typeof parsed !== "object" || !parsed.attempts) {
      return { ok: false, message: "エクスポートしたJSONの形式ではありません" };
    }
    write({
      version: 1,
      attempts: parsed.attempts,
      tries: parsed.tries ?? {},
      lastProblemId: parsed.lastProblemId ?? null,
    });
    return { ok: true, message: "進捗を読み込みました" };
  } catch {
    return { ok: false, message: "JSONを読み取れませんでした" };
  }
}

export function exportProgress(): string {
  return JSON.stringify(getProgress(), null, 2);
}

/* ------------------------------------------------------------------ *
 * 下書き（問題ごとの編集中コード）
 * ------------------------------------------------------------------ */

const DRAFT_PREFIX = "programming-practice:draft:";

export function getDraft(problemId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(DRAFT_PREFIX + problemId);
  } catch {
    return null;
  }
}

export function saveDraft(problemId: string, code: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_PREFIX + problemId, code);
  } catch {
    /* 容量オーバー等は無視 */
  }
}

export function clearDraft(problemId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_PREFIX + problemId);
  } catch {
    /* noop */
  }
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(EMPTY);

  useEffect(() => {
    setState(getProgress());
    return subscribeProgress(() => setState(getProgress()));
  }, []);

  return state;
}

export type ProblemStatus = "untouched" | "trying" | "correct" | "review";

export function statusOf(state: ProgressState, problemId: string): ProblemStatus {
  const attempt = state.attempts[problemId];
  if (!attempt) return state.tries[problemId] ? "trying" : "untouched";
  if (attempt.result.verdict === "correct") return "correct";
  if (attempt.result.verdict === "mostly_correct") return "review";
  return state.tries[problemId] > 1 ? "review" : "trying";
}

export const STATUS_LABEL: Record<ProblemStatus, string> = {
  untouched: "未挑戦",
  trying: "挑戦中",
  correct: "正解",
  review: "要復習",
};

export const STATUS_STYLE: Record<ProblemStatus, string> = {
  untouched: "border-border text-muted-foreground",
  trying: "border-primary/30 bg-primary-soft text-primary",
  correct: "border-success/30 bg-success-soft text-success",
  review: "border-warning/30 bg-warning-soft text-warning",
};

export function verdictOf(state: ProgressState, problemId: string): Verdict | null {
  return state.attempts[problemId]?.result.verdict ?? null;
}
