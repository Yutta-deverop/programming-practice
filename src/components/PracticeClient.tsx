"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CodeEditor } from "@/components/CodeEditor";
import { JudgeResultPanel } from "@/components/JudgeResultPanel";
import { ProblemFigure } from "@/components/ProblemFigure";
import type { Problem, Reference } from "@/data/problems";
import type { JudgeResponse, JudgeResult } from "@/lib/judge-types";
import { LINT_SEVERITY_LABEL, STARTER_CODE, lintCode } from "@/lib/lint";
import { DEFAULT_JUDGE_MODEL, JUDGE_MODELS, isJudgeModel, type JudgeModel } from "@/lib/models";
import {
  STATUS_LABEL,
  STATUS_STYLE,
  clearDraft,
  getDraft,
  getProgress,
  recordAttempt,
  saveDraft,
  setLastProblem,
  statusOf,
  useProgress,
} from "@/lib/storage";

export type PublicProblem = Omit<Problem, "references">;

interface PracticeClientProps {
  problem: PublicProblem;
  hasReferences: boolean;
  usesRealNumbers: boolean;
  nextProblemId: string | null;
}

const LINT_STYLE = {
  error: "border-danger/30 bg-danger-soft text-danger",
  warning: "border-warning/30 bg-warning-soft text-warning",
  info: "border-border bg-surface-2 text-muted-foreground",
} as const;

export function PracticeClient({
  problem,
  hasReferences,
  usesRealNumbers,
  nextProblemId,
}: PracticeClientProps) {
  const progress = useProgress();
  const [code, setCode] = useState(STARTER_CODE);
  const [model, setModel] = useState<JudgeModel>(DEFAULT_JUDGE_MODEL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [judgedModel, setJudgedModel] = useState<string | null>(null);
  const [judgedCode, setJudgedCode] = useState<string | null>(null);
  const [references, setReferences] = useState<Reference[] | null>(null);
  const [loadingSolution, setLoadingSolution] = useState(false);
  const [focusLine, setFocusLine] = useState<number | null>(null);
  const [showLint, setShowLint] = useState(true);

  const status = statusOf(progress, problem.id);

  const loadSolution = useCallback(async () => {
    if (!hasReferences) {
      setReferences([]);
      return;
    }
    setLoadingSolution(true);
    try {
      const res = await fetch(`/api/solution?problemId=${encodeURIComponent(problem.id)}`);
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { references?: Reference[] };
      setReferences(data.references ?? []);
    } catch {
      setReferences(null);
    } finally {
      setLoadingSolution(false);
    }
  }, [hasReferences, problem.id]);

  // 下書きと前回の判定を復元
  useEffect(() => {
    const draft = getDraft(problem.id);
    if (draft) setCode(draft);

    const attempt = getProgress().attempts[problem.id];
    if (attempt) {
      setResult(attempt.result);
      setJudgedModel(attempt.model);
      setJudgedCode(attempt.code);
      void loadSolution();
    }
    setLastProblem(problem.id);
  }, [problem.id, loadSolution]);

  // 下書き保存（入力が落ち着いてから）
  useEffect(() => {
    const timer = window.setTimeout(() => saveDraft(problem.id, code), 500);
    return () => window.clearTimeout(timer);
  }, [code, problem.id]);

  const issues = useMemo(
    () => lintCode(code, { usesRealNumbers }),
    [code, usesRealNumbers],
  );

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warnCount = issues.filter((issue) => issue.severity === "warning").length;

  const highlight = useMemo(() => {
    const errors = new Set<number>();
    const warns = new Set<number>();
    for (const issue of result?.issues ?? []) {
      if (!issue.line) continue;
      if (issue.severity === "error") errors.add(issue.line);
      else warns.add(issue.line);
    }
    for (const issue of issues) {
      if (issue.severity === "error") errors.add(issue.line);
      else if (issue.severity === "warning") warns.add(issue.line);
    }
    if (focusLine) warns.add(focusLine);
    return { errorLines: [...errors], warnLines: [...warns] };
  }, [result, issues, focusLine]);

  async function submit() {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, code, model }),
      });
      const data = (await res.json()) as JudgeResponse & { error?: string; detail?: string };

      if (!res.ok) {
        setError(data.error ?? `判定に失敗しました（HTTP ${res.status}）`);
        return;
      }

      setResult(data.result);
      setJudgedModel(data.model);
      setJudgedCode(code);
      recordAttempt(problem.id, code, data.result, data.model);
      void loadSolution();
      requestAnimationFrame(() => {
        document.getElementById("judge-result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch {
      setError("通信に失敗しました。ネットワークを確認してもう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetCode() {
    if (!window.confirm("エディタの内容をひな形に戻します。よろしいですか？")) return;
    setCode(STARTER_CODE);
    clearDraft(problem.id);
    setResult(null);
    setJudgedCode(null);
    setJudgedModel(null);
    setFocusLine(null);
    setError(null);
  }

  const edited = judgedCode !== null && judgedCode !== code;

  return (
    <div className="container-page py-6 lg:py-8">
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/problems" className="hover:text-foreground">
          問題一覧
        </Link>
        <span aria-hidden>/</span>
        <span className="font-mono">{problem.label}</span>
      </nav>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip border-primary/30 bg-primary-soft text-primary">
              {problem.section} {problem.kind === "example" ? "例題" : "課題"}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
            {progress.tries[problem.id] ? (
              <span className="text-[11px] text-muted-foreground">
                これまで {progress.tries[problem.id]} 回提出
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="mr-2 font-mono text-base font-semibold text-muted-foreground">
              {problem.label}
            </span>
            {problem.title}
          </h1>
        </div>
        {nextProblemId && (
          <Link href={`/problems/${nextProblemId}`} className="btn-secondary shrink-0">
            次の問題へ →
          </Link>
        )}
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 問題文 */}
        <div className="min-w-0 space-y-5">
          <section className="card p-5">
            <h2 className="section-title">問題</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-7">{problem.statement}</p>

            {problem.inputSpec && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-border bg-surface-2 p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground">入力</p>
                  <p className="mt-1 text-xs leading-6">{problem.inputSpec}</p>
                  {problem.sampleInput && (
                    <p className="mt-2 font-mono text-xs">
                      <span className="text-muted-foreground">入力例: </span>
                      {problem.sampleInput}
                    </p>
                  )}
                </div>
                <div className="rounded-md border border-border bg-surface-2 p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    期待される出力（入力例のとき）
                  </p>
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-5">
                    {problem.expected.join("\n") || "（自由）"}
                  </pre>
                </div>
              </div>
            )}

            {!problem.inputSpec && problem.expected.length > 0 && (
              <div className="mt-4 rounded-md border border-border bg-surface-2 p-3">
                <p className="text-[11px] font-semibold text-muted-foreground">表示例</p>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-5">
                  {problem.expected.join("\n")}
                </pre>
              </div>
            )}

            {problem.figure && (
              <div className="mt-4">
                <ProblemFigure problem={problem} />
              </div>
            )}

            {problem.notes.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">関連ノート:</span>
                {problem.notes.map((note) => (
                  <Link key={note} href="/notes" className="chip hover:text-foreground">
                    {note}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <details className="card group p-0" open={false}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 text-sm font-semibold">
              <span>ヒント（{problem.hints.length}）</span>
              <span className="text-xs font-normal text-muted-foreground group-open:hidden">
                開く
              </span>
              <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">
                閉じる
              </span>
            </summary>
            <ul className="space-y-2 border-t border-border px-5 py-4">
              {problem.hints.map((hint, index) => (
                <li key={index} className="flex gap-2 text-sm leading-7">
                  <span className="mt-0.5 shrink-0 font-mono text-xs text-primary">
                    {index + 1}.
                  </span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </details>

          <details className="card group p-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 text-sm font-semibold">
              <span>採点チェックリスト・よくある間違い</span>
              <span className="text-xs font-normal text-muted-foreground group-open:hidden">
                開く
              </span>
              <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">
                閉じる
              </span>
            </summary>
            <div className="grid gap-4 border-t border-border px-5 py-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  できていれば正解
                </p>
                <ul className="mt-1.5 space-y-1 text-xs leading-6">
                  {problem.checkpoints.map((point) => (
                    <li key={point} className="flex gap-1.5">
                      <span className="text-success">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  よくある間違い
                </p>
                <ul className="mt-1.5 space-y-1 text-xs leading-6">
                  {problem.commonMistakes.map((mistake) => (
                    <li key={mistake} className="flex gap-1.5">
                      <span className="text-warning">△</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </div>

        {/* エディタ */}
        <div className="min-w-0 self-start lg:sticky lg:top-20">
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
              <span className="font-mono text-[11px] text-muted-foreground">
                main.c
              </span>
              <div className="flex items-center gap-1.5">
                <label className="sr-only" htmlFor="judge-model">
                  判定モデル
                </label>
                <select
                  id="judge-model"
                  value={model}
                  onChange={(event) => {
                    if (isJudgeModel(event.target.value)) setModel(event.target.value);
                  }}
                  className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground"
                >
                  {(Object.keys(JUDGE_MODELS) as JudgeModel[]).map((id) => (
                    <option key={id} value={id}>
                      {JUDGE_MODELS[id].label}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={resetCode} className="btn-ghost px-2 py-1 text-[11px]">
                  ひな形に戻す
                </button>
              </div>
            </div>

            <div className="h-[380px] sm:h-[440px]">
              <CodeEditor
                value={code}
                onChange={setCode}
                errorLines={highlight.errorLines}
                warnLines={highlight.warnLines}
              />
            </div>

            <div className="border-t border-border px-3 py-2">
              <button
                type="button"
                onClick={() => setShowLint((value) => !value)}
                className="flex w-full items-center justify-between gap-2 text-left"
                aria-expanded={showLint}
              >
                <span className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                  提出前チェック
                  {errorCount > 0 && (
                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-danger">
                      エラー {errorCount}
                    </span>
                  )}
                  {warnCount > 0 && (
                    <span className="rounded-full bg-warning-soft px-2 py-0.5 text-warning">
                      注意 {warnCount}
                    </span>
                  )}
                  {errorCount === 0 && warnCount === 0 && code.trim() && (
                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-success">
                      指摘なし
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {showLint ? "隠す" : "表示"}
                </span>
              </button>

              {showLint && (
                <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
                  {issues.length === 0 ? (
                    <li className="text-[11px] text-muted-foreground">
                      静的チェックの指摘はありません。提出して AI の判定を受けましょう。
                    </li>
                  ) : (
                    issues.map((issue, index) => (
                      <li
                        key={`${issue.id}-${index}`}
                        className={`rounded border px-2 py-1 text-[11px] leading-5 ${LINT_STYLE[issue.severity]}`}
                      >
                        <span className="mr-1 font-semibold">
                          {LINT_SEVERITY_LABEL[issue.severity]}
                        </span>
                        <span className="text-foreground">{issue.message}</span>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            <div className="border-t border-border bg-surface-2 px-3 py-3">
              <button
                type="button"
                onClick={submit}
                disabled={isSubmitting || !code.trim()}
                className="btn-primary w-full"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3 w-3 animate-pulse-soft rounded-full bg-primary-foreground" />
                    判定中…（10〜30秒ほど）
                  </>
                ) : (
                  "判定する"
                )}
              </button>
              <p className="mt-2 text-center text-[10px] leading-5 text-muted-foreground">
                AI がコードを読んで判定します（実行はしません）。1分あたり10回まで。
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-3 rounded-md border border-danger/40 bg-danger-soft px-3 py-2.5 text-xs leading-6 text-danger"
            >
              {error}
            </div>
          )}
        </div>
      </div>

      {result && (
        <section id="judge-result" className="mt-10 scroll-mt-20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
            <h2 className="text-lg font-bold">判定結果</h2>
            {edited && (
              <p className="rounded-full border border-warning/30 bg-warning-soft px-2.5 py-0.5 text-[11px] font-semibold text-warning">
                コードを編集しました。再判定してください
              </p>
            )}
          </div>
          <div className="mt-4">
            <JudgeResultPanel
              result={result}
              model={judgedModel ?? model}
              references={references}
              loadingSolution={loadingSolution}
              onSelectLine={(line) => setFocusLine(line)}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={submit} disabled={isSubmitting} className="btn-secondary">
              もう一度判定する
            </button>
            {nextProblemId && (
              <Link href={`/problems/${nextProblemId}`} className="btn-primary">
                次の問題へ →
              </Link>
            )}
            <Link href="/problems" className="btn-ghost">
              問題一覧に戻る
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
