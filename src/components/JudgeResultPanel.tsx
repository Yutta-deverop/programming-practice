"use client";

import { useState } from "react";

import type { Reference } from "@/data/problems";
import type { JudgeIssue, JudgeResult, Verdict } from "@/lib/judge-types";
import { VERDICT_LABEL } from "@/lib/judge-types";
import { yenText } from "@/lib/yen";

const VERDICT_STYLE: Record<Verdict, { box: string; badge: string; mark: string }> = {
  correct: {
    box: "border-success/40 bg-success-soft",
    badge: "bg-success text-success-foreground",
    mark: "正解",
  },
  mostly_correct: {
    box: "border-warning/40 bg-warning-soft",
    badge: "bg-warning text-warning-foreground",
    mark: "あと少し",
  },
  incorrect: {
    box: "border-danger/40 bg-danger-soft",
    badge: "bg-danger text-danger-foreground",
    mark: "不正解",
  },
};

const SEVERITY_META: Record<JudgeIssue["severity"], { label: string; className: string; glyph: string }> = {
  error: { label: "エラー", className: "border-danger/30 bg-danger-soft text-danger", glyph: "!" },
  warning: { label: "注意", className: "border-warning/30 bg-warning-soft text-warning", glyph: "△" },
  nit: { label: "提案", className: "border-border bg-surface-2 text-muted-foreground", glyph: "・" },
};

function CopyButton({ text, label = "コピー" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* クリップボードが使えない環境では何もしない */
    }
  }

  return (
    <button type="button" onClick={copy} className="btn-ghost px-2 py-1 text-[11px]">
      {copied ? "コピーしました" : label}
    </button>
  );
}

function SolutionBlock({ references }: { references: Reference[] }) {
  const [active, setActive] = useState(0);

  if (references.length === 0) {
    return (
      <p className="text-xs leading-6 text-muted-foreground">
        この課題は自由課題のため、模範解答ファイルはありません。自分が表現したいものが
        画面に出ていれば正解です。
      </p>
    );
  }

  const current = references[Math.min(active, references.length - 1)];

  return (
    <div>
      <p className="mb-2 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-[11px] leading-5 text-warning">
        このソースコードが最善手とは限りません。あくまで一例です。書き方が違っても、
        問題の条件を満たしていれば正解です。
      </p>
      {references.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {references.map((reference, index) => (
            <button
              key={reference.filename}
              type="button"
              onClick={() => setActive(index)}
              className={
                index === active
                  ? "rounded-md border border-primary bg-primary-soft px-2.5 py-1 font-mono text-[11px] font-semibold text-primary"
                  : "rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
              }
            >
              {reference.filename}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-hidden rounded-md border border-border">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-2 px-3 py-1.5">
          <span className="font-mono text-[11px] text-muted-foreground">
            {current.filename}
          </span>
          <CopyButton text={current.code} />
        </div>
        <pre className="max-h-96 overflow-auto bg-[var(--code-background)] p-3 font-mono text-xs leading-6 text-[var(--code-text)]">
          {yenText(current.code)}
        </pre>
      </div>
    </div>
  );
}

export function JudgeResultPanel({
  result,
  model,
  references,
  loadingSolution,
  onSelectLine,
}: {
  result: JudgeResult;
  model: string;
  references: Reference[] | null;
  loadingSolution: boolean;
  onSelectLine: (line: number) => void;
}) {
  const style = VERDICT_STYLE[result.verdict];

  return (
    <div className="animate-fade-in space-y-5">
      <div className={`rounded-lg border p-5 ${style.box}`}>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
          >
            {VERDICT_LABEL[result.verdict]}（{result.score} 点）
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            判定: {model}
          </span>
        </div>
        {result.summary && (
          <p className="mt-3 text-sm leading-7 text-foreground">{yenText(result.summary)}</p>
        )}
      </div>

      {result.good_points.length > 0 && (
        <section>
          <h3 className="section-title">できていること</h3>
          <ul className="mt-2 space-y-1.5">
            {result.good_points.map((point, index) => (
              <li key={index} className="flex gap-2 text-sm leading-6">
                <span className="mt-0.5 shrink-0 font-bold text-success">✓</span>
                <span>{yenText(point)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.issues.length > 0 && (
        <section>
          <h3 className="section-title">直すとよいところ（{result.issues.length}件）</h3>
          <ul className="mt-2 space-y-2">
            {result.issues.map((issue, index) => {
              const meta = SEVERITY_META[issue.severity] ?? SEVERITY_META.warning;
              return (
                <li
                  key={index}
                  className="rounded-md border border-border bg-surface p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${meta.className}`}
                    >
                      {meta.glyph} {meta.label}
                    </span>
                    {issue.line ? (
                      <button
                        type="button"
                        onClick={() => onSelectLine(issue.line as number)}
                        className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:border-primary hover:text-primary"
                        title="この行を強調表示する"
                      >
                        {issue.line} 行目
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-1.5 leading-6">{yenText(issue.message)}</p>
                  {issue.code && (
                    <pre className="mt-1.5 overflow-x-auto rounded bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                      {yenText(issue.code)}
                    </pre>
                  )}
                  {issue.fix_hint && (
                    <p className="mt-1.5 text-xs leading-6 text-primary">
                      → {yenText(issue.fix_hint)}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {result.output_check && (
        <section>
          <div className="flex items-center gap-2">
            <h3 className="section-title">入力例での出力</h3>
            <span
              className={
                result.output_check.match
                  ? "rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success"
                  : "rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning"
              }
            >
              {result.output_check.match ? "一致" : "不一致"}
            </span>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-surface">
              <p className="border-b border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                期待される出力
              </p>
              <pre className="overflow-x-auto px-3 py-2 font-mono text-[11px] leading-6">
                {yenText(result.output_check.expected.join("\n")) || "（なし）"}
              </pre>
            </div>
            <div className="rounded-md border border-border bg-surface">
              <p className="border-b border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                あなたのコードの出力（AIの予測）
              </p>
              <pre className="overflow-x-auto px-3 py-2 font-mono text-[11px] leading-6">
                {yenText(result.output_check.actual.join("\n")) || "（出力なし）"}
              </pre>
            </div>
          </div>
        </section>
      )}

      {result.hint && (
        <section className="rounded-md border border-primary/25 bg-primary-soft p-4">
          <h3 className="text-xs font-bold text-primary">次の一歩</h3>
          <p className="mt-1 text-sm leading-7">{yenText(result.hint)}</p>
        </section>
      )}

      {result.model_answer_note && (
        <section className="text-xs leading-6 text-muted-foreground">
          <h3 className="section-title">模範解答との違い</h3>
          <p className="mt-1">{yenText(result.model_answer_note)}</p>
        </section>
      )}

      <section>
        <h3 className="section-title">解答例（判定後のみ表示）</h3>
        <div className="mt-2">
          {loadingSolution ? (
            <p className="text-xs text-muted-foreground">読み込み中…</p>
          ) : references ? (
            <SolutionBlock references={references} />
          ) : (
            <p className="text-xs text-muted-foreground">解答例を取得できませんでした。</p>
          )}
        </div>
      </section>
    </div>
  );
}
